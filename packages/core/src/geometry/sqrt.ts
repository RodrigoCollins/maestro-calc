import { CoreError } from '../errors.ts';
import { Rational } from '../rational/rational.ts';

/** The decimals a square root keeps: the root is truncated, never rounded up. */
export const SQRT_PLACES = 20;

const SCALE = 10n ** BigInt(SQRT_PLACES);

/** The integer square root: the largest `r` with `r² ≤ n`, by Newton's method on integers. */
const isqrt = (n: bigint): bigint => {
  if (n < 2n) return n;
  // start above the root and step down; the sequence decreases until it reaches the floor
  let x = 1n << BigInt((n.toString(2).length >> 1) + 1);
  for (;;) {
    const next = (x + n / x) >> 1n;
    if (next >= x) return x;
    x = next;
  }
};

/**
 * The square root of `x`, truncated to `SQRT_PLACES` decimals: `0 ≤ √x − r < 10^-20`, and exact
 * when √x has at most twenty decimals (a perfect square of such a number). Exact integer
 * arithmetic, never a float. A negative `x` fails `NEGATIVE_QUANTITY` (core-geometry › Square root).
 */
export const squareRoot = (x: Rational): Rational => {
  if (x.sign() === -1) throw new CoreError('NEGATIVE_QUANTITY');
  // floor(√(x · 10^40)) = floor(√x · 10^20): the root of the floor of x · 10^40 has the same floor
  return Rational.of(isqrt((x.num * SCALE * SCALE) / x.den), SCALE);
};
