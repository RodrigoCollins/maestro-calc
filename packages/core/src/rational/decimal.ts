import { err, ok, type Result } from '../result.ts';
import { MAX_PARSE_LENGTH } from './limits.ts';
import { Rational } from './rational.ts';

export const DECIMAL_PARSE_CODES = ['MALFORMED', 'DECIMAL_COMMA'] as const;

export type DecimalParseCode = (typeof DECIMAL_PARSE_CODES)[number];

export interface DecimalParseError {
  readonly code: DecimalParseCode;
}

const DECIMAL = /^[+-]?(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)$/;

/**
 * Converts decimal text to an exact Rational without passing through `number`.
 * Grammar: `sign? ( digits ("." digits)? | "." digits )`, ASCII digits, no whitespace.
 *
 * Precondition: callers bound the length (128 characters for form input, 256 for URL input).
 * As a safety net, text longer than `MAX_PARSE_LENGTH` is rejected as MALFORMED.
 */
export const parseDecimal = (text: string): Result<Rational, DecimalParseError> => {
  if (text.includes(',')) return err({ code: 'DECIMAL_COMMA' });
  if (text.length > MAX_PARSE_LENGTH || !DECIMAL.test(text)) return err({ code: 'MALFORMED' });
  // BigInt accepts a leading sign and leading zeros, so only the decimal point is removed.
  const dot = text.indexOf('.');
  const fractionDigits = dot === -1 ? 0 : text.length - dot - 1;
  return ok(Rational.of(BigInt(text.replace('.', '')), 10n ** BigInt(fractionDigits)));
};
