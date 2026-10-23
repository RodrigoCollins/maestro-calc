import type { FieldErrorCode } from '../error-codes.ts';
import { err, ok, type Result } from '../result.ts';
import type { InputDescriptor, InputsOf } from './descriptors.ts';

/** One failed field: its key, one code, and the violated bound for `BELOW_MIN`/`ABOVE_MAX`. */
export interface FieldError {
  readonly field: string;
  readonly code: FieldErrorCode;
  readonly params?: { readonly min: string } | { readonly max: string };
}

type Descriptors = readonly InputDescriptor[];
type Value = InputsOf<Descriptors>[string];
type FieldFailure = Omit<FieldError, 'field'>;

/**
 * The value of one field. Kinds are parsed one at a time (tasks 9.7 and 9.8); until a kind is
 * parsed a given value is refused as `MALFORMED`, never accepted unchecked.
 */
const readField = (input: InputDescriptor, raw: unknown): Result<Value, FieldFailure> =>
  raw === undefined ? ok(input.default) : err({ code: 'MALFORMED' });

/**
 * Validates `raw` against `inputs`. Every declared field is read (no short-circuit) in declaration
 * order; a key that is absent from `raw`, or present as `undefined`, takes the default, and an
 * undeclared key is ignored. An inherited property is not a value the caller gave.
 */
export const validateRecord = (
  inputs: Descriptors,
  raw: Readonly<Record<string, unknown>>,
): Result<InputsOf<Descriptors>, FieldError> => {
  const values: [string, Value][] = [];
  const errors: FieldError[] = [];
  for (const input of inputs) {
    const field = readField(input, Object.hasOwn(raw, input.key) ? raw[input.key] : undefined);
    if (field.ok) values.push([input.key, field.value]);
    else errors.push({ field: input.key, ...field.errors[0] });
  }
  const [first, ...rest] = errors;
  return first === undefined
    ? ok(Object.fromEntries(values))
    : { ok: false, errors: [first, ...rest] };
};
