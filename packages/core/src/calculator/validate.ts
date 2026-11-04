import { CoreError } from '../errors.ts';
import { err, ok, type Result } from '../result.ts';
import type {
  FieldError,
  FieldFailure,
  FieldValue,
  InputDescriptor,
  InputsOf,
  UnitSystem,
  ValidateOptions,
} from './descriptors.ts';

type Descriptors = readonly InputDescriptor[];

/** Raw strings longer than this, before trimming, are `TOO_LONG`. */
export const MAX_TEXT_LENGTH = 128;

/**
 * The value of one field: absent or `undefined` is the default, a long string is `TOO_LONG`, and
 * otherwise the codec of its kind decides. Nothing is coerced.
 */
const readField = (
  input: InputDescriptor,
  raw: unknown,
  unitSystem: UnitSystem | undefined,
): Result<FieldValue, FieldFailure> => {
  if (raw === undefined) return ok(input.default);
  if (typeof raw === 'string' && raw.length > MAX_TEXT_LENGTH) return err({ code: 'TOO_LONG' });
  return input.codec.read(input, raw, unitSystem);
};

/** An object (an array included) can hold fields; null, a primitive and a function cannot. */
const isContainer = (raw: unknown): raw is object => typeof raw === 'object' && raw !== null;

/**
 * Validates `raw` against `inputs`. Every declared field is read (no short-circuit) in declaration
 * order; a key that is absent from `raw`, or present as `undefined`, takes the default, and an
 * undeclared key is ignored. An inherited property is not a value the caller gave. `raw` must be an
 * object: a non-object container (a function included), or a getter that throws, is a programmer
 * error and throws `CoreError('NOT_AN_OBJECT')` or the getter's own error (D5).
 */
export const validateRecord = (
  inputs: Descriptors,
  raw: Readonly<Record<string, unknown>>,
  { unitSystem }: ValidateOptions = {},
): Result<InputsOf<Descriptors>, FieldError> => {
  if (!isContainer(raw)) throw new CoreError('NOT_AN_OBJECT');
  const values: [string, FieldValue][] = [];
  const errors: FieldError[] = [];
  for (const input of inputs) {
    const given = Object.hasOwn(raw, input.key) ? raw[input.key] : undefined;
    const field = readField(input, given, unitSystem);
    if (field.ok) values.push([input.key, field.value]);
    else errors.push({ field: input.key, ...field.errors[0] });
  }
  // Head and tail, not a length check: a failed Result needs the non-empty tuple
  // `[FieldError, ...FieldError[]]`, and only destructuring builds it without a type assertion.
  const [first, ...rest] = errors;
  return first === undefined
    ? ok(Object.fromEntries(values))
    : { ok: false, errors: [first, ...rest] };
};
