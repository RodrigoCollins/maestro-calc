import * as fc from 'fast-check';
import { Rational } from '../rational/rational.ts';

const HUGE = 2n ** 64n;
const LIMIT = 2n ** 80n;

const signed = (magnitude: fc.Arbitrary<bigint>): fc.Arbitrary<bigint> =>
  fc.tuple(fc.boolean(), magnitude).map(([negative, value]) => (negative ? -value : value));

// Weighted mixes: small parts hit the edge cases, huge parts (above 2^64) defeat any double.
const numeratorArb = fc.oneof(
  { weight: 1, arbitrary: fc.constant(0n) },
  { weight: 2, arbitrary: fc.bigInt({ min: -16n, max: 16n }) },
  { weight: 7, arbitrary: signed(fc.bigInt({ min: HUGE, max: LIMIT })) },
);

const denominatorArb = fc.oneof(
  { weight: 3, arbitrary: fc.bigInt({ min: 1n, max: 16n }) },
  { weight: 7, arbitrary: fc.bigInt({ min: HUGE, max: LIMIT }) },
);

/** Rationals of either sign (and zero) with parts up to 2^80, mixing zero, small and huge parts. */
export const rationalArb: fc.Arbitrary<Rational> = fc
  .tuple(numeratorArb, denominatorArb)
  .map(([numerator, denominator]) => Rational.of(numerator, denominator));

export const nonZeroRationalArb: fc.Arbitrary<Rational> = rationalArb.filter(
  (value) => !value.isZero(),
);
