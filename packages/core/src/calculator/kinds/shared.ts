/*
 * The helpers that several kinds share: the trimming of form text, the bound check of a validated
 * amount and the canonical amount of a URL. A kind module imports what it needs, so a bundle
 * carries a helper only when one of its kinds uses it.
 */
import type { FieldErrorCode } from '../../error-codes.ts';
import { Rational } from '../../rational/rational.ts';
import { err, ok, type Result } from '../../result.ts';
import { checkAmount } from '../constraints.ts';
import type {
  BoundedDescriptor,
  FieldFailure,
  FieldValue,
  InputDescriptor,
  InputKind,
  InputSpec,
} from '../descriptors.ts';

/** What a field reads from a parser failure: its code (the offsets and params stay in the parser). */
export interface ParseFailure {
  readonly code: FieldErrorCode;
}

/** The whitespace of the text grammars: space, tab and no-break space (not every Unicode blank). */
export const SURROUNDING_WS = /^[ \t\u00A0]+|[ \t\u00A0]+$/g;

/**
 * Runs a text parser on a raw string trimmed of whitespace, and fails `EMPTY` when nothing is left;
 * any other raw value is `MALFORMED`.
 */
export const parseText = <T>(
  raw: unknown,
  parse: (text: string) => Result<T, ParseFailure>,
): Result<T, FieldFailure> => {
  if (typeof raw !== 'string') return err({ code: 'MALFORMED' });
  const text = raw.replace(SURROUNDING_WS, '');
  if (text === '') return err({ code: 'EMPTY' });
  const parsed = parse(text);
  return parsed.ok ? parsed : err({ code: parsed.errors[0].code });
};

/** Passes `value` through when its exact `amount` is within the bounds of `input`. */
export const withinBounds = <T extends FieldValue>(
  input: BoundedDescriptor,
  amount: Rational,
  value: T,
): Result<T, FieldFailure> => {
  const violation = checkAmount(input, amount);
  return violation === undefined ? ok(value) : err(violation);
};

/** The exact amount, kept only when it is inside the bounds of its descriptor. */
export const withinUrlBounds = (
  descriptor: BoundedDescriptor,
  amount: Rational,
): Rational | undefined => (checkAmount(descriptor, amount) === undefined ? amount : undefined);

/** Canonical Rational text (`-?digits(/digits)?`) inside the bounds, or `undefined`. */
export const readUrlAmount = (
  descriptor: BoundedDescriptor,
  text: string,
): Rational | undefined => {
  const parsed = Rational.fromString(text);
  return parsed.ok ? withinUrlBounds(descriptor, parsed.value) : undefined;
};

/** The URL text of an exact amount (percent points, a decimal), or `undefined` for any other value. */
export const rationalText = (_input: unknown, value: unknown): string | undefined =>
  value instanceof Rational ? value.toString() : undefined;

/** A descriptor built from `S`: the spec plus the `kind` and the `codec` of its kind. */
export type Built<D extends InputDescriptor, S> = S & {
  readonly kind: D['kind'];
  readonly codec: InputKind;
};

/**
 * The builder of one kind: a descriptor is the spec the calculator writes plus the `kind` and the
 * shared `codec`, which a spec cannot set. `const` keeps every key and option id a literal.
 */
export const builderOf =
  <D extends InputDescriptor>(kind: D['kind'], codec: InputKind<D>) =>
  <const S extends InputSpec<D>>(spec: S): Built<D, S> => ({ ...spec, kind, codec });
