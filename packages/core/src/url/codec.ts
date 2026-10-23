import { findOption } from '../calculator/constraints.ts';
import { UNIT_KEY, VERSION_KEY } from '../calculator/reserved-keys.ts';
import type { UrlIssueCode } from '../error-codes.ts';
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
import { percentDecode, readUrlValue, WHOLE_NUMBER, type UrlValue } from './url-values.ts';

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
export const urlTextOf = (input: InputDescriptor, value: unknown): string | undefined => {
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
  const version = `${VERSION_KEY}=${FIRST_VERSION}`;
  const pairs = unitSystem === 'metric' ? [version, `${UNIT_KEY}=m`] : [version];
  for (const input of calculator.inputs) {
    const text = urlTextOf(input, state[input.key]);
    if (text === undefined) {
      const locus: StateLocus = { id: calculator.id, field: input.key };
      throw new CoreError('INVALID_STATE', 'FIELD_VALUE', { cause: locus });
    }
    if (text !== urlTextOf(input, input.default)) pairs.push(`${input.urlKey}=${text}`);
  }
  return pairs.join('&');
}

/** One diagnostic of `decode`: what went wrong and the URL key it concerns. */
export interface UrlIssue {
  readonly code: UrlIssueCode;
  readonly key: string;
}

export interface DecodeResult<I extends readonly InputDescriptor[]> {
  /** A complete valid state: every field is the value of the URL or its default. */
  readonly state: InputsOf<I>;
  readonly unitSystem: UnitSystem;
  /** In query order; empty when every present value was valid. */
  readonly issues: readonly UrlIssue[];
}

/**
 * One pair of the query: the decoded key and the raw value, still percent-encoded. A key with a
 * malformed escape is `null`, which names no field, so such a pair is ignored like any unknown key.
 */
interface Pair {
  readonly key: string | null;
  readonly raw: string;
}

/** Splits a pair at its first `=`; a pair with no `=` has an empty value. */
const pairOf = (segment: string): Pair => {
  const padded = segment.includes('=') ? segment : `${segment}=`;
  const equals = padded.indexOf('=');
  return { key: percentDecode(padded.slice(0, equals)), raw: padded.slice(equals + 1) };
};

/** The pairs of a query in order, each key once: the first occurrence wins, later ones vanish. */
const pairsOf = (query: string): readonly Pair[] => {
  const seen = new Set<string | null>();
  const body = query.startsWith('?') ? query.slice(1) : query;
  return body
    .split('&')
    .map(pairOf)
    .filter(({ key }) => {
      const first = !seen.has(key);
      seen.add(key);
      return first;
    });
};

/** The unit system a `u` value names: only `m` is metric, and `undefined` marks any other value. */
const unitSystemOf = (raw: string): UnitSystem | undefined =>
  percentDecode(raw) === 'm' ? 'metric' : undefined;

/** The result for a state: frozen, with the issues in the order they were found. */
const resultOf = (
  inputs: readonly InputDescriptor[],
  values: ReadonlyMap<string, UrlValue>,
  unitSystem: UnitSystem,
  issues: readonly UrlIssue[],
): DecodeResult<readonly InputDescriptor[]> => {
  const state = Object.fromEntries(
    inputs.map((input) => [input.key, values.get(input.key) ?? input.default]),
  );
  return Object.freeze({
    state: Object.freeze(state),
    unitSystem,
    issues: Object.freeze(issues),
  });
};

const issue = (code: UrlIssueCode, key: string): UrlIssue => Object.freeze({ code, key });

/** Reads the pairs of a version 1 query against the inputs of a calculator. */
const decodeV1 = (
  inputs: readonly InputDescriptor[],
  pairs: readonly Pair[],
): DecodeResult<readonly InputDescriptor[]> => {
  // keyed by `string | null` so that the `null` key of a malformed escape simply finds nothing
  const byUrlKey = new Map<string | null, InputDescriptor>(
    inputs.map((input) => [input.urlKey, input]),
  );
  const values = new Map<string, UrlValue>();
  const issues: UrlIssue[] = [];
  let unitSystem: UnitSystem = 'imperial';
  for (const { key, raw } of pairs) {
    if (key === UNIT_KEY) {
      const preference = unitSystemOf(raw);
      if (preference === undefined) issues.push(issue('INVALID_VALUE', key));
      else unitSystem = preference;
      continue;
    }
    // unknown, retired, `v` and differently cased keys name no field and are ignored
    const input = byUrlKey.get(key);
    if (input === undefined) continue;
    const value = readUrlValue(input, raw);
    if (value === undefined) issues.push(issue('INVALID_VALUE', input.urlKey));
    else values.set(input.key, value);
  }
  return resultOf(inputs, values, unitSystem, issues);
};

type Decoder = typeof decodeV1;

/** The version of a query without a `v` pair. */
const FIRST_VERSION = '1';

/**
 * The decoders by version. `v` names the codec format, not the calculator: a future version adds
 * its decoder here and keeps `decodeV1`, so every released link keeps its meaning. Keyed by
 * `string | null` so that the `null` of a malformed escape simply finds no decoder.
 */
const DECODERS: ReadonlyMap<string | null, Decoder> = new Map([[FIRST_VERSION, decodeV1]]);

/** The version a query declares (the first `v` pair wins), or `null` for a malformed escape. */
const versionOf = (pairs: readonly Pair[]): string | null => {
  const declared = pairs.find(({ key }) => key === VERSION_KEY);
  return declared === undefined ? FIRST_VERSION : percentDecode(declared.raw);
};

/**
 * Decodes a query string, with or without a leading `?`, into a complete valid state. It never
 * throws: a value that is not valid for its field is replaced by the default of the field and
 * reported as `INVALID_VALUE` for its key; unknown keys are ignored. `u=m` selects metric and
 * never changes the meaning of a value (lengths in a URL are always inches). A version that has no
 * decoder yields all defaults, `imperial` and one `UNSUPPORTED_VERSION` issue.
 */
export function decode<const I extends readonly InputDescriptor[]>(
  calculator: { readonly inputs: I },
  query: string,
): DecodeResult<I>;
export function decode(
  calculator: Pick<UrlCodable, 'inputs'>,
  query: string,
): DecodeResult<readonly InputDescriptor[]> {
  const pairs = pairsOf(query);
  const version = versionOf(pairs);
  const decoder = DECODERS.get(version);
  return decoder === undefined
    ? resultOf(calculator.inputs, new Map(), 'imperial', [
        issue('UNSUPPORTED_VERSION', VERSION_KEY),
      ])
    : decoder(calculator.inputs, pairs);
}
