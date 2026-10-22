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

const inchesText = (whole: bigint, numerator: bigint, denominator: bigint): string => {
  if (numerator === 0n) return String(whole);
  const fraction = `${String(numerator)}/${String(denominator)}`;
  return whole === 0n ? fraction : `${String(whole)} ${fraction}`;
};

/**
 * Rounds the signed inch value to the nearest `1/denominator` (per `mode`, default `nearest`),
 * then splits the rounded total into feet, inches and a reduced fraction. Rounding comes first,
 * so a carry across an inch or a foot is correct by construction. Throws `INVALID_DENOMINATOR`
 * for a denominator outside 2..64, `INVALID_MODE` for an unknown `mode` and `DIMENSION_MISMATCH`
 * for a quantity that is not a length (untyped callers).
 */
export const formatFeetInches = (
  length: Quantity<'length'>,
  { denominator, mode = 'nearest' }: FeetInchesOptions,
): FeetInches => {
  const ticks = roundToFraction(valueIn(length, inch), denominator, mode);
  const negative = ticks < 0n;
  const magnitude = negative ? -ticks : ticks;
  const perInch = BigInt(denominator);
  const wholeInches = magnitude / perInch;
  // Rational reduces the leftover ticks, and a zero fraction comes out as 0/1.
  const fraction = Rational.of(magnitude % perInch, perInch);
  const parts: FeetInchesParts = {
    negative,
    feet: wholeInches / INCHES_PER_FOOT,
    inches: wholeInches % INCHES_PER_FOOT,
    fraction: { numerator: fraction.num, denominator: fraction.den },
  };
  const body = inchesText(parts.inches, fraction.num, fraction.den);
  return { parts, text: `${negative ? '-' : ''}${String(parts.feet)}' ${body}"` };
};
