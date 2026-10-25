import { Rational } from '../rational/rational.ts';

/**
 * Pi truncated to its first 35 decimals, as an exact Rational: the digits of OEIS A000796
 * (3.14159265358979323846264338327950288419716939937510...). The next digits are `4197...`, so
 * truncation and rounding agree and the error is `0 < pi - PI < 10^-35`. Never a float and never
 * a short fraction (core-geometry › Rational pi).
 */
export const PI: Rational = Rational.of(314159265358979323846264338327950288n, 10n ** 35n);
