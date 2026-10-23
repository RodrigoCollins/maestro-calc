import type { FieldErrorCode } from '../error-codes.ts';
import { parseLength } from '../format/length-parser/parser.ts';
import type { Rational } from '../rational/rational.ts';
import { err, ok, type Result } from '../result.ts';
import { cm, ft, inch, m, mm, yd } from '../units/catalog.ts';
import { isQuantityOf } from '../units/quantity.ts';
import type { Unit } from '../units/unit.ts';
import { checkAmount } from './constraints.ts';
import type {
  BoundedDescriptor,
  InputDescriptor,
  InputsOf,
  LengthDescriptor,
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

/** Runs a text parser on a raw string; any other raw value is `MALFORMED`. */
const parseText = <T>(
  raw: unknown,
  parse: (text: string) => Result<T, Failure>,
): Result<T, FieldFailure> => {
  if (typeof raw !== 'string') return err({ code: 'MALFORMED' });
  const parsed = parse(raw);
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

/**
 * The value of one field. Kinds are parsed one at a time (tasks 9.7 and 9.8); until a kind is
 * parsed a given value is refused as `MALFORMED`, never accepted unchecked.
 */
const readField = (
  input: InputDescriptor,
  raw: unknown,
  unitSystem: UnitSystem | undefined,
): Result<Value, FieldFailure> => {
  if (raw === undefined) return ok(input.default);
  return input.kind === 'length' ? readLength(input, raw, unitSystem) : err({ code: 'MALFORMED' });
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
