import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { rationalArb } from '../__testing__/arbitraries.ts';
import { numRuns } from '../__testing__/property-runs.ts';
import { thrownCode } from '../__testing__/thrown-code.ts';
import { Rational } from '../rational/rational.ts';
import { ceilToPurchaseUnits } from './purchase.ts';

describe('ceilToPurchaseUnits (fraction-format › Purchase ceiling)', () => {
  // spec: Exact integers do not overshoot [FF9]
  it('maps exact integers to themselves', () => {
    expect(ceilToPurchaseUnits(Rational.of(18000, 144))).toBe(125n);
    expect(ceilToPurchaseUnits(Rational.of(7, 10).mul(Rational.of(10, 7)))).toBe(1n);
    expect(ceilToPurchaseUnits(Rational.of(10n ** 30n))).toBe(10n ** 30n);
  });

  // spec: Fractions round up [FF10]
  it('rounds fractions up', () => {
    expect(ceilToPurchaseUnits(Rational.of(7, 2))).toBe(4n);
    expect(ceilToPurchaseUnits(Rational.of(1n, 10n ** 30n))).toBe(1n);
    expect(ceilToPurchaseUnits(Rational.of(10n ** 30n + 1n, 3n))).toBe(
      333333333333333333333333333334n,
    );
  });

  // spec: Fractions round up [FF10]
  it('returns zero for zero', () => {
    expect(ceilToPurchaseUnits(Rational.ZERO)).toBe(0n);
  });

  // spec: Negative rejected [FF11]
  it('rejects negative quantities with NEGATIVE_QUANTITY', () => {
    expect(thrownCode(() => ceilToPurchaseUnits(Rational.of(-1, 2)))).toBe('NEGATIVE_QUANTITY');
    expect(thrownCode(() => ceilToPurchaseUnits(Rational.of(-1n, 10n ** 30n)))).toBe(
      'NEGATIVE_QUANTITY',
    );
    expect(thrownCode(() => ceilToPurchaseUnits(Rational.of(-3)))).toBe('NEGATIVE_QUANTITY');
  });

  // spec: Purchase ceiling — the smallest n with n >= x (property)
  it('returns the smallest integer n with n >= x > n - 1 for non-negative x', () => {
    fc.assert(
      fc.property(rationalArb, (x) => {
        const quantity = x.abs();
        const n = ceilToPurchaseUnits(quantity);
        return (
          n >= 0n &&
          Rational.of(n).compare(quantity) >= 0 &&
          (n === 0n || quantity.compare(Rational.of(n - 1n)) > 0)
        );
      }),
      { numRuns },
    );
  });
});
