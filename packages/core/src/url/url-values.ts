import { checkAmount, findOption } from '../calculator/constraints.ts';
import type { BoundedDescriptor, InputDescriptor, InputsOf } from '../calculator/descriptors.ts';
import { usd } from '../money/money.ts';
import { Rational } from '../rational/rational.ts';
import { inch } from '../units/catalog.ts';
import { quantity } from '../units/quantity.ts';

/** The decoded value of one field: any of the value types of the kinds. */
export type UrlValue = InputsOf<readonly InputDescriptor[]>[string];

/** A raw value (still percent-encoded) longer than this is invalid, whatever it decodes to. */
const MAX_URL_VALUE_LENGTH = 256;

/**
 * `text` with its percent escapes decoded, or `null` for a malformed escape (a lone `%`, a
 * non-hex digit or bytes that are not UTF-8). `+` is an ordinary character, never a space.
 */
export const percentDecode = (text: string): string | null => {
  try {
    return decodeURIComponent(text);
  } catch {
    return null;
  }
};

/** The exact amount, kept only when it is inside the bounds of its descriptor. */
const withinUrlBounds = (descriptor: BoundedDescriptor, amount: Rational): Rational | undefined =>
  checkAmount(descriptor, amount) === undefined ? amount : undefined;

/** Canonical Rational text (`-?digits(/digits)?`) inside the bounds, or `undefined`. */
const readUrlAmount = (descriptor: BoundedDescriptor, text: string): Rational | undefined => {
  const parsed = Rational.fromString(text);
  return parsed.ok ? withinUrlBounds(descriptor, parsed.value) : undefined;
};

const WHOLE = /^[0-9]+$/;

const readUrlCount = (descriptor: BoundedDescriptor, text: string): number | undefined => {
  if (!WHOLE.test(text)) return undefined;
  // compared as a Rational, so a value beyond the safe integers is out of range with no precision loss
  const amount = withinUrlBounds(descriptor, Rational.of(BigInt(text)));
  return amount === undefined ? undefined : Number(amount.num);
};

const readUrlDecoded = (descriptor: InputDescriptor, text: string): UrlValue | undefined => {
  switch (descriptor.kind) {
    case 'length': {
      const amount = readUrlAmount(descriptor, text);
      return amount === undefined ? undefined : quantity(amount, inch);
    }
    case 'percent':
      return readUrlAmount(descriptor, text);
    case 'money': {
      const amount = readUrlAmount(descriptor, text);
      return amount === undefined ? undefined : usd(amount);
    }
    case 'count':
      return readUrlCount(descriptor, text);
    case 'select':
      return findOption(descriptor, text);
    case 'boolean':
      return text === '1' ? true : text === '0' ? false : undefined;
  }
};

/**
 * Reads the raw value of a URL pair (still percent-encoded) with the strict parser of the kind of
 * `descriptor`: canonical Rational text for a length (inches), a percent (points) and money
 * (dollars), digits for a count, an exact option id, `1` or `0` for a boolean. No default unit is
 * ever applied, so `5'` and `4.98` are invalid. Bounds and options are then checked with the same
 * functions `validate` uses. `undefined` means invalid: the caller takes the default.
 */
export const readUrlValue = (descriptor: InputDescriptor, raw: string): UrlValue | undefined => {
  if (raw.length > MAX_URL_VALUE_LENGTH) return undefined;
  const text = percentDecode(raw);
  return text === null ? undefined : readUrlDecoded(descriptor, text);
};
