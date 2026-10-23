/** Shared messages, English: the source of truth for the `errors.<CODE>` keys (i18n-catalog). */
export const enCommon = {
  'errors.EMPTY': 'Enter a value.',
  'errors.MALFORMED': 'This value is not valid.',
  'errors.DECIMAL_COMMA':
    'Use a period for decimals and no thousands separator (for example 1250.5).',
  'errors.ZERO_DENOMINATOR': 'A fraction cannot have zero as its denominator.',
  'errors.UNKNOWN_UNIT': 'Unit not recognized. Use ft, in, yd, m, cm, or mm.',
  'errors.TOO_LONG': 'The value is too long.',
  'errors.TOO_LARGE': 'The number is too large.',
  'errors.BELOW_MIN': 'The value must be at least {min}.',
  'errors.ABOVE_MAX': 'The value must be at most {max}.',
  'errors.UNKNOWN_OPTION': 'Choose one of the available options.',
  'errors.INVALID_VALUE': 'A value in the link was not valid and was replaced by the default.',
  'errors.UNSUPPORTED_VERSION':
    'This link uses an unsupported version, so default values were used.',
} as const;
