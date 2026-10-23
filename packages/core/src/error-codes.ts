/**
 * Every code a calculator reports for a field (`FieldError.code`), in the order of the spec: the
 * codes of the length, money and decimal parsers, the length limit, and the constraint checks.
 */
export const FIELD_ERROR_CODES = Object.freeze([
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
] as const);

export type FieldErrorCode = (typeof FIELD_ERROR_CODES)[number];

/** The two diagnostics `decode` reports for a URL, in the order of the spec. */
export const URL_ISSUE_CODES = Object.freeze(['INVALID_VALUE', 'UNSUPPORTED_VERSION'] as const);

export type UrlIssueCode = (typeof URL_ISSUE_CODES)[number];

/**
 * Every user-facing code, the ten field codes then the two URL codes, so the web layer can prove
 * that each one has an `errors.<CODE>` message. Thrown codes are programming errors, not listed.
 */
export const ALL_ERROR_CODES = Object.freeze([...FIELD_ERROR_CODES, ...URL_ISSUE_CODES] as const);

export type AllErrorCode = (typeof ALL_ERROR_CODES)[number];
