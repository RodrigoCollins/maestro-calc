import { describe, expect, it } from 'vitest';
import { thrownCode } from '../__testing__/thrown-code.ts';
import { Rational } from '../rational/rational.ts';
import { ft, ft2, m, yd2 } from '../units/catalog.ts';
import { quantity, type Quantity } from '../units/quantity.ts';
import { usd, type Money } from './money.ts';
import { costOf, unitPrice } from './unit-price.ts';

const r = (n: number, d = 1): Rational => Rational.of(n, d);

// Every expected value below was recomputed with Python `fractions.Fraction` before it was written.
describe('unit prices (money › Unit prices)', () => {
  // spec: money › Price per square foot times area [MN4]
  it('prices 125 ft2 at $0.37/ft2: 37/100 x 125 = 185/4', () => {
    const cost = costOf(unitPrice(usd(r(37, 100)), ft2), quantity(125, ft2));
    expect(cost.amount.toString()).toBe('185/4');
    expect(cost.currency).toBe('USD');
  });

  // spec: money › Price applies across units of the same dimension [MN5]
  it('applies the price to another unit of the dimension: 1 yd2 = 9 ft2 = 333/100', () => {
    expect(costOf(unitPrice(usd(r(37, 100)), ft2), quantity(1, yd2)).amount.toString()).toBe(
      '333/100',
    );
  });

  it('is exact with a non-binary unit factor: $1/m x 1 ft = 381/1250', () => {
    expect(costOf(unitPrice(usd(1), m), quantity(1, ft)).amount.toString()).toBe('381/1250');
  });

  it('prices a fractional area to a tie: $0.37/ft2 x 12.5 ft2 = 37/8', () => {
    expect(costOf(unitPrice(usd(r(37, 100)), ft2), quantity(r(25, 2), ft2)).amount.toString()).toBe(
      '37/8',
    );
  });

  it('prices zero quantity as zero dollars', () => {
    expect(costOf(unitPrice(usd(r(37, 100)), ft2), quantity(0, ft2)).amount.isZero()).toBe(true);
  });

  it('stores the price per canonical unit in US dollars, frozen', () => {
    const price = unitPrice(usd(r(37, 100)), ft2);
    expect(price.currency).toBe('USD');
    expect(price.perCanonical.toString()).toBe('37/14400');
    expect(Object.isFrozen(price)).toBe(true);
  });

  // spec: money › Mismatched dimension [MN6a]
  it('throws DIMENSION_MISMATCH when an untyped caller prices a length with an area price', () => {
    const price = unitPrice(usd(r(37, 100)), ft2);
    const length = quantity(1, ft) as unknown as Quantity<'area'>;
    expect(thrownCode(() => costOf(price, length))).toBe('DIMENSION_MISMATCH');
  });

  it('rejects a quantity in place of the money of a price', () => {
    const notMoney = quantity(1, ft) as unknown as Money;
    expect(thrownCode(() => unitPrice(notMoney, ft2))).toBe('DIMENSION_MISMATCH');
  });
});
