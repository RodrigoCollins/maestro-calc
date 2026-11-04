import type { FieldValue, InputDescriptor } from '../calculator/descriptors.ts';

/** The decoded value of one field: any of the value types of the kinds. */
export type UrlValue = FieldValue;

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

/**
 * Reads the raw value of a URL pair (still percent-encoded) with the strict URL reader of the codec
 * of `descriptor`: canonical Rational text for a length (inches), a percent (points) and money
 * (dollars), digits for a count, an exact option id, `1` or `0` for a boolean. No default unit is
 * ever applied, so `5'` and `4.98` are invalid. Bounds and options are then checked with the same
 * functions `validate` uses. `undefined` means invalid: the caller takes the default.
 */
export const readUrlValue = (descriptor: InputDescriptor, raw: string): UrlValue | undefined => {
  if (raw.length > MAX_URL_VALUE_LENGTH) return undefined;
  const text = percentDecode(raw);
  return text === null ? undefined : descriptor.codec.fromUrl(descriptor, text);
};
