/** Every failure code of `parseLength`; each failure carries exactly one. */
export const LENGTH_PARSE_CODES = [
  'EMPTY',
  'TOO_LONG',
  'TOO_LARGE',
  'ZERO_DENOMINATOR',
  'UNKNOWN_UNIT',
  'DECIMAL_COMMA',
  'MALFORMED',
] as const;

export type LengthParseCode = (typeof LENGTH_PARSE_CODES)[number];

/**
 * A single `parseLength` failure.
 *
 * `offset` is the zero-based index, in the ORIGINAL text (before any trimming), of the first
 * character of the offending token: the digit run that is too large, the denominator `0`, the
 * unknown unit word, the first comma, or the first token the parser could not use (the end of the
 * last token, which excludes trailing whitespace, when the input ended too early). `EMPTY` and
 * `TOO_LONG` have no offending token and carry none. Offsets are UTF-16 code units, like
 * `String.length`. It is additive and meant for UI highlighting; consumers must not depend on it.
 *
 * Code precedence: `TOO_LONG`, `EMPTY`, `DECIMAL_COMMA`, then the first lexical fault in text
 * order (`TOO_LARGE`, `UNKNOWN_UNIT`, `MALFORMED`); a parse then reports `ZERO_DENOMINATOR` before
 * any `MALFORMED`.
 */
export interface LengthParseError {
  readonly code: LengthParseCode;
  readonly offset?: number;
}
