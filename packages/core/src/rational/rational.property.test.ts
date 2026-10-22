import * as fc from 'fast-check';
import { describe, it } from 'vitest';
import { nonZeroRationalArb, rationalArb } from '../__testing__/arbitraries.ts';
import { numRuns } from '../__testing__/property-runs.ts';
import { Rational } from './rational.ts';

// Independent oracle: deliberately not imported from the implementation under test.
const gcd = (a: bigint, b: bigint): bigint => {
  let [x, y] = [a < 0n ? -a : a, b < 0n ? -b : b];
  while (y !== 0n) [x, y] = [y, x % y];
  return x;
};

const isCanonical = (value: Rational): boolean =>
  value.den > 0n && gcd(value.num, value.den) === 1n && (value.num !== 0n || value.den === 1n);

const forAll = (...arbitraries: fc.Arbitrary<Rational>[]) => {
  return (predicate: (...values: Rational[]) => boolean): void => {
    // fast-check prints the seed and the counterexample path when a property fails.
    fc.assert(
      fc.property(fc.tuple(...arbitraries), (values) => predicate(...values)),
      {
        numRuns,
      },
    );
  };
};

describe('Rational algebraic properties (exact-rational › Algebraic properties)', () => {
  // spec: exact-rational › Properties hold [ER15]
  it('addition and multiplication commute', () => {
    forAll(
      rationalArb,
      rationalArb,
    )((a, b) => a.add(b).equals(b.add(a)) && a.mul(b).equals(b.mul(a)));
  });

  // spec: exact-rational › Properties hold [ER15]
  it('addition associates', () => {
    forAll(
      rationalArb,
      rationalArb,
      rationalArb,
    )((a, b, c) =>
      a
        .add(b)
        .add(c)
        .equals(a.add(b.add(c))),
    );
  });

  // spec: exact-rational › Properties hold [ER15]
  it('multiplication distributes over addition', () => {
    forAll(
      rationalArb,
      rationalArb,
      rationalArb,
    )((a, b, c) => a.mul(b.add(c)).equals(a.mul(b).add(a.mul(c))));
  });

  // spec: exact-rational › Properties hold [ER15]
  it('subtraction and division invert addition and multiplication', () => {
    forAll(rationalArb, rationalArb)((a, b) => a.add(b).sub(b).equals(a));
    forAll(rationalArb, nonZeroRationalArb)((a, b) => a.div(b).mul(b).equals(a));
  });

  // spec: exact-rational › Properties hold [ER15]
  it('keeps every result in canonical form', () => {
    forAll(
      rationalArb,
      nonZeroRationalArb,
    )((a, b) =>
      [a, a.add(b), a.sub(b), a.mul(b), a.div(b), a.neg(), a.abs(), b.inv()].every(isCanonical),
    );
  });

  // spec: exact-rational › Canonical string codec — round trip
  it('round trips through toString and fromString', () => {
    forAll(rationalArb)((value) => {
      const parsed = Rational.fromString(value.toString());
      return parsed.ok && parsed.value.equals(value);
    });
  });

  // spec: exact-rational › Properties hold [ER15]; Integer rounding primitives
  it('floor and ceil bracket the value within one unit', () => {
    forAll(rationalArb)((value) => {
      const floor = Rational.of(value.floor());
      const ceil = Rational.of(value.ceil());
      return (
        floor.compare(value) <= 0 &&
        value.compare(floor.add(Rational.ONE)) < 0 &&
        ceil.compare(value) >= 0 &&
        ceil.sub(Rational.ONE).compare(value) < 0
      );
    });
  });
});
