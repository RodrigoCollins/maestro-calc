import { Rational } from '../rational/rational.ts';
import { err, ok, type Result } from '../result.ts';
import { usd, type Money } from './money.ts';

/** The failure codes of `parseMoney`, in precedence order. */
export const MONEY_PARSE_CODES = ['EMPTY', 'DECIMAL_COMMA', 'TOO_LARGE', 'MALFORMED'] as const;

export type MoneyParseCode = (typeof MONEY_PARSE_CODES)[number];

export interface MoneyParseError {
  readonly code: MoneyParseCode;
}

/** The longest run of digits accepted, integer or fractional (the same cap as `parseLength`). */
const MAX_DIGITS = 18;

const TOO_LONG_RUN = new RegExp(`[0-9]{${String(MAX_DIGITS + 1)},}`);

// `"$"? ( digits ("." digits)? | "." digits )`, ASCII digits, no whitespace and no sign.
const MONEY = /^\$?([0-9]*)(?:\.([0-9]+))?$/;

/**
 * Converts the text of a non-negative dollar amount to exact `Money` without passing through
 * `number`, or fails with exactly one code. Precedence: `EMPTY`, `DECIMAL_COMMA`, `TOO_LARGE`,
 * `MALFORMED`. The caller trims the surrounding whitespace.
 */
export const parseMoney = (text: string): Result<Money, MoneyParseError> => {
  if (text === '') return err({ code: 'EMPTY' });
  if (text.includes(',')) return err({ code: 'DECIMAL_COMMA' });
  if (TOO_LONG_RUN.test(text)) return err({ code: 'TOO_LARGE' });
  const match = MONEY.exec(text);
  const integer = match?.[1];
  const fraction = match?.[2] ?? '';
  // A bare `$` (or nothing before the point) has no digit at all.
  if (integer === undefined || integer + fraction === '') return err({ code: 'MALFORMED' });
  return ok(usd(Rational.of(BigInt(integer + fraction), 10n ** BigInt(fraction.length))));
};
