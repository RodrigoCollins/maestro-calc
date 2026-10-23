/**
 * Every code a calculator reports for a field (`FieldError.code`), in the order of the spec: the
 * codes of the length, money and decimal parsers, the length limit, and the constraint checks.
 */
export const FIELD_ERROR_CODES = [
  'EMPTY',
  'MALFORMED',
  'DECIMAL_COMMA',
  'ZERO_DENOMINATOR',
  'UNKNOWN_UNIT',
  'TOO_LONG',
  'TOO_LARGE',
  'BELOW_MIN',
  'ABOVE_MAX',
  'UNKNOWN_OPTION',
] as const;

export type FieldErrorCode = (typeof FIELD_ERROR_CODES)[number];
