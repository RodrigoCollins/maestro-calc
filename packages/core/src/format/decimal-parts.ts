import { CoreError } from '../errors.ts';
import type { Rational } from '../rational/rational.ts';
import { roundScaled, type RoundingMode } from './rounding.ts';

const MAX_PLACES = 12;

/**
 * A decimal number as parts, with no separator (the web localizes it). `fraction` holds exactly
 * `places` ASCII digits, and `negative` is true only for a value strictly below zero.
 */
export interface DecimalParts {
  readonly negative: boolean;
  readonly integer: bigint;
  readonly fraction: string;
}

/**
 * Rounds `value` to `places` decimal places per `mode` (default `nearest`) and splits it into
 * parts, without ever passing through `number`. Throws `INVALID_PLACES` unless `places` is an
 * integer in 0..12, and `INVALID_MODE` for an unknown `mode`.
 */
export const toDecimalParts = (
  value: Rational,
  places: number,
  mode: RoundingMode = 'nearest',
): DecimalParts => {
  if (!Number.isInteger(places) || places < 0 || places > MAX_PLACES) {
    throw new CoreError('INVALID_PLACES');
  }
  const ticks = roundScaled(value, 10n ** BigInt(places), mode);
  const negative = ticks < 0n;
  // Pad so there is always an integer digit, then cut the last `places` digits off as the fraction.
  const digits = String(negative ? -ticks : ticks).padStart(places + 1, '0');
  const split = digits.length - places;
  return { negative, integer: BigInt(digits.slice(0, split)), fraction: digits.slice(split) };
};
