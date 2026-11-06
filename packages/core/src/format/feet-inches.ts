import { Rational } from '../rational/rational.ts';
import { inch } from '../units/catalog.ts';
import { valueIn, type Quantity } from '../units/quantity.ts';
import { roundToFraction, type RoundingMode } from './rounding.ts';

const INCHES_PER_FOOT = 12n;

/** A length split the way a tape measure reads: `0 <= inches <= 11`, a reduced fraction of an inch. */
export interface FeetInchesParts {
  readonly negative: boolean;
  readonly feet: bigint;
  readonly inches: bigint;
  readonly fraction: { readonly numerator: bigint; readonly denominator: bigint };
}

/** Options for `formatFeetInches`. */
export interface FeetInchesOptions {
  /** Ticks per inch, an integer in 2..64 (not only powers of two). */
  readonly denominator: number;
  /** How a value between two ticks is resolved. Default `nearest`. */
  readonly mode?: RoundingMode;
}

export interface FeetInches {
  readonly parts: FeetInchesParts;
  /** Canonical ASCII text, for example `5' 3 1/2"`, `1' 0"` or `-0' 1/64"`. */
  readonly text: string;
}

/** Whole inches and a reduced fraction of an inch: `3 1/2`, `1/2` or `3`. */
export const inchesText = (whole: bigint, numerator: bigint, denominator: bigint): string => {
  if (numerator === 0n) return String(whole);
  const fraction = `${String(numerator)}/${String(denominator)}`;
  return whole === 0n ? fraction : `${String(whole)} ${fraction}`;
};

/**
 * Rounds the signed inch value to the nearest `1/denominator` (per `mode`, default `nearest`),
 * then splits the rounded total into feet, inches and a reduced fraction. Rounding comes first,
 * so a carry across an inch or a foot is correct by construction. Throws `INVALID_DENOMINATOR`
 * for a denominator outside 2..64, `INVALID_MODE` for an unknown `mode` and `DIMENSION_MISMATCH`
 * for a quantity that is not a length (untyped callers). The parts alone, for a caller that writes
 * its own text (a page script then carries no canonical text it never shows).
 */
export const feetInchesParts = (
  length: Quantity<'length'>,
  { denominator, mode = 'nearest' }: FeetInchesOptions,
): FeetInchesParts => {
  const ticks = roundToFraction(valueIn(length, inch), denominator, mode);
  const negative = ticks < 0n;
  const magnitude = negative ? -ticks : ticks;
  const perInch = BigInt(denominator);
  const wholeInches = magnitude / perInch;
  // Rational reduces the leftover ticks, and a zero fraction comes out as 0/1.
  const fraction = Rational.of(magnitude % perInch, perInch);
  return {
    negative,
    feet: wholeInches / INCHES_PER_FOOT,
    inches: wholeInches % INCHES_PER_FOOT,
    fraction: { numerator: fraction.num, denominator: fraction.den },
  };
};

/** `feetInchesParts` with the canonical text, for example `5' 3 1/2"`. */
export const formatFeetInches = (
  length: Quantity<'length'>,
  options: FeetInchesOptions,
): FeetInches => {
  const parts = feetInchesParts(length, options);
  const { numerator, denominator } = parts.fraction;
  const body = inchesText(parts.inches, numerator, denominator);
  return { parts, text: `${parts.negative ? '-' : ''}${String(parts.feet)}' ${body}"` };
};
