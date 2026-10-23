import { findOption } from '../calculator/constraints.ts';
import type {
  AnyCalculator,
  InputDescriptor,
  InputsOf,
  UnitSystem,
} from '../calculator/descriptors.ts';
import { CoreError } from '../errors.ts';
import { isMoney } from '../money/money.ts';
import { Rational } from '../rational/rational.ts';
import { isQuantityOf } from '../units/quantity.ts';
import { WHOLE_NUMBER } from './url-values.ts';

/** The parts of a calculator that the codec reads. */
export type UrlCodable = Pick<AnyCalculator, 'id' | 'inputs'>;

export interface EncodeOptions {
  /** `metric` adds `u=m`; `imperial` (the default) is expressed by omitting `u`. */
  readonly unitSystem?: UnitSystem;
}

/**
 * Where an untyped state is faulty, carried as the `cause` of the `INVALID_STATE` error: the
 * calculator `id` and the `field` key. Identifiers only, never prose.
 */
export interface StateLocus {
  readonly id: string;
  readonly field: string;
}

/** An object (a list included) can hold fields; null, a primitive and a function cannot. */
const isContainer = (value: unknown): value is object =>
  typeof value === 'object' && value !== null;

/**
 * The canonical URL text of one value, or `undefined` when `value` is not a value of the kind of
 * `input`: inches for a length, percent points, dollars for money, an integer, an option id, and
 * `1` or `0`. One value has one text, so comparing texts is comparing exact values.
 */
const textOf = (input: InputDescriptor, value: unknown): string | undefined => {
  switch (input.kind) {
    case 'length':
      return isQuantityOf(value, 'length') ? value.canonical.toString() : undefined;
    case 'percent':
      return value instanceof Rational ? value.toString() : undefined;
    case 'money':
      return isMoney(value) ? value.amount.toString() : undefined;
    case 'count':
      // `Number.isSafeInteger` does not coerce, so `String` only ever sees a number here
      return Number.isSafeInteger(value) && WHOLE_NUMBER.test(String(value))
        ? String(value)
        : undefined;
    case 'select':
      return findOption(input, value);
    case 'boolean':
      return typeof value === 'boolean' ? (value ? '1' : '0') : undefined;
  }
};

/**
 * Encodes a calculator state as a query string without a leading `?`: `v=1`, then `u=m` for
 * metric, then one `urlKey=value` pair per field that differs from its default, in declaration
 * order. Every canonical value uses only `[0-9a-z/-]`, so nothing is percent-encoded and `/` stays
 * literal (RFC 3986 §3.4).
 *
 * `encode` expects a validated state: a value of the wrong kind throws `CoreError('INVALID_STATE')`
 * with the reason `FIELD_VALUE` and the cause `{ id, field }`, and a state that is not an object
 * throws `CoreError('NOT_AN_OBJECT')`. A value of the right kind outside its bounds is not checked
 * (the output decodes to the default for that field with `INVALID_VALUE`); `validate` is where
 * bounds are enforced, and `decode` always yields a state that passes them.
 */
export function encode<const I extends readonly InputDescriptor[]>(
  calculator: { readonly id: string; readonly inputs: I },
  state: InputsOf<I>,
  options?: EncodeOptions,
): string;
export function encode(
  calculator: UrlCodable,
  state: Readonly<Record<string, unknown>>,
  { unitSystem }: EncodeOptions = {},
): string {
  if (!isContainer(state)) throw new CoreError('NOT_AN_OBJECT');
  const pairs = unitSystem === 'metric' ? ['v=1', 'u=m'] : ['v=1'];
  for (const input of calculator.inputs) {
    const text = textOf(input, state[input.key]);
    if (text === undefined) {
      const locus: StateLocus = { id: calculator.id, field: input.key };
      throw new CoreError('INVALID_STATE', 'FIELD_VALUE', { cause: locus });
    }
    if (text !== textOf(input, input.default)) pairs.push(`${input.urlKey}=${text}`);
  }
  return pairs.join('&');
}
