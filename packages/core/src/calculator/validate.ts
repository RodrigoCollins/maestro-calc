import type { FieldErrorCode } from '../error-codes.ts';
import { parseLength } from '../format/length-parser/parser.ts';
import { isMoney } from '../money/money.ts';
import { parseMoney } from '../money/parse.ts';
import { parseDecimal } from '../rational/decimal.ts';
import { Rational } from '../rational/rational.ts';
import { err, ok, type Result } from '../result.ts';
import { cm, ft, inch, m, mm, yd } from '../units/catalog.ts';
import { isQuantityOf } from '../units/quantity.ts';
import type { Unit } from '../units/unit.ts';
import { checkAmount, findOption } from './constraints.ts';
import type {
  BoundedDescriptor,
  CountDescriptor,
  InputDescriptor,
  InputsOf,
  LengthDescriptor,
  MoneyDescriptor,
  PercentDescriptor,
  SelectDescriptor,
  UnitSystem,
} from './descriptors.ts';

/** One failed field: its key, one code, and the violated bound for `BELOW_MIN`/`ABOVE_MAX`. */
export interface FieldError {
  readonly field: string;
  readonly code: FieldErrorCode;
  readonly params?: { readonly min: string } | { readonly max: string };
}

export interface ValidateOptions {
  /** Picks the unit of a bare number in a length field. Default `imperial`. */
  readonly unitSystem?: UnitSystem;
}

type Descriptors = readonly InputDescriptor[];
type Value = InputsOf<Descriptors>[string];
type FieldFailure = Omit<FieldError, 'field'>;

const LENGTH_UNITS: Readonly<
  Record<LengthDescriptor['defaultUnit' | 'metricDefaultUnit'], Unit<'length'>>
> = {
  in: inch,
  ft,
  yd,
  mm,
  cm,
  m,
};

interface Failure {
  readonly code: FieldErrorCode;
}

/** Raw strings longer than this, before trimming, are `TOO_LONG`. */
export const MAX_TEXT_LENGTH = 128;

/** The whitespace of the text grammars: space, tab and no-break space (not every Unicode blank). */
const SURROUNDING_WS = /^[ \t\u00A0]+|[ \t\u00A0]+$/g;

/**
 * Runs a text parser on a raw string trimmed of whitespace, and fails `EMPTY` when nothing is left;
 * any other raw value is `MALFORMED`.
 */
const parseText = <T>(
  raw: unknown,
  parse: (text: string) => Result<T, Failure>,
): Result<T, FieldFailure> => {
  if (typeof raw !== 'string') return err({ code: 'MALFORMED' });
  const text = raw.replace(SURROUNDING_WS, '');
  if (text === '') return err({ code: 'EMPTY' });
  const parsed = parse(text);
  return parsed.ok ? parsed : err({ code: parsed.errors[0].code });
};

/** Passes `value` through when its exact `amount` is within the bounds of `input`. */
const withinBounds = <T extends Value>(
  input: BoundedDescriptor,
  amount: Rational,
  value: T,
): Result<T, FieldFailure> => {
  const violation = checkAmount(input, amount);
  return violation === undefined ? ok(value) : err(violation);
};

const readLength = (
  input: LengthDescriptor,
  raw: unknown,
  unitSystem: UnitSystem | undefined,
): Result<Value, FieldFailure> => {
  const unit = LENGTH_UNITS[unitSystem === 'metric' ? input.metricDefaultUnit : input.defaultUnit];
  const length = isQuantityOf(raw, 'length')
    ? ok(raw)
    : parseText(raw, (text) => parseLength(text, { defaultUnit: unit }));
  return length.ok ? withinBounds(input, length.value.canonical, length.value) : length;
};

/** A whole number: digits only, so no sign, point or exponent; a comma is a decimal comma. */
const parseWhole = (text: string): Result<bigint, Failure> => {
  if (text.includes(',')) return err({ code: 'DECIMAL_COMMA' });
  return /^[0-9]+$/.test(text) ? ok(BigInt(text)) : err({ code: 'MALFORMED' });
};

/** A number is a count only when it is already a non-negative safe integer. */
const wholeNumber = (value: number): Result<bigint, Failure> =>
  Number.isSafeInteger(value) && value >= 0 ? ok(BigInt(value)) : err({ code: 'MALFORMED' });

const readCount = (input: CountDescriptor, raw: unknown): Result<Value, FieldFailure> => {
  // A string is compared as a bigint, so a value beyond the safe integers is ABOVE_MAX with no
  // precision loss.
  const whole = typeof raw === 'number' ? wholeNumber(raw) : parseText(raw, parseWhole);
  return whole.ok ? withinBounds(input, Rational.of(whole.value), Number(whole.value)) : whole;
};

/** Percent points as a decimal with one optional trailing `%` and no blank before it. */
const parsePercent = (text: string): Result<Rational, Failure> =>
  parseDecimal(text.endsWith('%') ? text.slice(0, -1) : text);

const readPercent = (input: PercentDescriptor, raw: unknown): Result<Value, FieldFailure> => {
  const percent = parseText(raw, parsePercent);
  return percent.ok ? withinBounds(input, percent.value, percent.value) : percent;
};

const readMoney = (input: MoneyDescriptor, raw: unknown): Result<Value, FieldFailure> => {
  const money = isMoney(raw) ? ok(raw) : parseText(raw, parseMoney);
  return money.ok ? withinBounds(input, money.value.amount, money.value) : money;
};

/** An exact, case-sensitive option id; anything else, a non-string included, is `UNKNOWN_OPTION`. */
const readSelect = (input: SelectDescriptor, raw: unknown): Result<Value, FieldFailure> => {
  const option = findOption(input, raw);
  return option === undefined ? err({ code: 'UNKNOWN_OPTION' }) : ok(option);
};

/**
 * The value of one field: absent or `undefined` is the default, a long string is `TOO_LONG`, and
 * otherwise the parser of its kind decides. Nothing is coerced.
 */
const readField = (
  input: InputDescriptor,
  raw: unknown,
  unitSystem: UnitSystem | undefined,
): Result<Value, FieldFailure> => {
  if (raw === undefined) return ok(input.default);
  if (typeof raw === 'string' && raw.length > MAX_TEXT_LENGTH) return err({ code: 'TOO_LONG' });
  switch (input.kind) {
    case 'length':
      return readLength(input, raw, unitSystem);
    case 'count':
      return readCount(input, raw);
    case 'percent':
      return readPercent(input, raw);
    case 'select':
      return readSelect(input, raw);
    case 'boolean':
      return typeof raw === 'boolean' ? ok(raw) : err({ code: 'MALFORMED' });
    case 'money':
      return readMoney(input, raw);
  }
};

/**
 * Validates `raw` against `inputs`. Every declared field is read (no short-circuit) in declaration
 * order; a key that is absent from `raw`, or present as `undefined`, takes the default, and an
 * undeclared key is ignored. An inherited property is not a value the caller gave.
 */
export const validateRecord = (
  inputs: Descriptors,
  raw: Readonly<Record<string, unknown>>,
  { unitSystem }: ValidateOptions = {},
): Result<InputsOf<Descriptors>, FieldError> => {
  const values: [string, Value][] = [];
  const errors: FieldError[] = [];
  for (const input of inputs) {
    const given = Object.hasOwn(raw, input.key) ? raw[input.key] : undefined;
    const field = readField(input, given, unitSystem);
    if (field.ok) values.push([input.key, field.value]);
    else errors.push({ field: input.key, ...field.errors[0] });
  }
  const [first, ...rest] = errors;
  return first === undefined
    ? ok(Object.fromEntries(values))
    : { ok: false, errors: [first, ...rest] };
};
