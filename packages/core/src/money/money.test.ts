import { describe, expect, it } from 'vitest';
import { thrownCode } from '../__testing__/thrown-code.ts';
import { ceilToPurchaseUnits } from '../format/purchase.ts';
import { Rational } from '../rational/rational.ts';
import { ft, inch } from '../units/catalog.ts';
import { add, compare, equals, sub } from '../units/ops.ts';
import { quantity, type Quantity } from '../units/quantity.ts';
import {
  addMoney,
  compareMoney,
  equalsMoney,
  multiplyCount,
  scaleMoney,
  subMoney,
  toCents,
  usd,
  type Money,
} from './money.ts';

const r = (n: number, d = 1): Rational => Rational.of(n, d);

// Every expected value below was recomputed with Python `fractions.Fraction` before it was written.
describe('Money (money › Exact money value)', () => {
  // spec: money › Price times count [MN1]
  it('multiplies a price by a count exactly: 3 x $4.98 = 747/50', () => {
    const total = multiplyCount(usd(r(498, 100)), 3);
    expect(total.amount.toString()).toBe('747/50');
    expect(total.currency).toBe('USD');
  });

  // spec: money › Sub-cent amounts stay exact [MN2]
  it('keeps sub-cent amounts: 3 x $0.333 = 999/1000, shown as 1.00', () => {
    const total = multiplyCount(usd(r(333, 1000)), 3);
    expect(total.amount.toString()).toBe('999/1000');
    expect(toCents(total)).toEqual({ negative: false, integer: 1n, fraction: '00' });
  });

  // spec: money › Count from the purchase ceiling [MN3]
  it('multiplies by the purchase ceiling: 4 x $4.98 = 498/25', () => {
    const count = ceilToPurchaseUnits(r(7, 2));
    expect(count).toBe(4n);
    expect(multiplyCount(usd(r(249, 50)), count).amount.toString()).toBe('498/25');
  });

  it('accepts a safe integer, a Rational and a bigint count', () => {
    expect(usd(5).amount.toString()).toBe('5');
    expect(usd(r(1, 3)).amount.toString()).toBe('1/3');
    expect(multiplyCount(usd(2), 5n).amount.toString()).toBe('10');
    expect(multiplyCount(usd(2), 0).amount.isZero()).toBe(true);
  });

  it('freezes the value so it cannot be changed after construction', () => {
    expect(Object.isFrozen(usd(1))).toBe(true);
  });

  it('adds, subtracts, compares and scales exactly', () => {
    expect(addMoney(usd(r(1, 3)), usd(r(1, 6))).amount.toString()).toBe('1/2');
    expect(subMoney(usd(1), usd(3)).amount.toString()).toBe('-2');
    expect(compareMoney(usd(1), usd(2))).toBe(-1);
    expect(compareMoney(usd(2), usd(2))).toBe(0);
    expect(compareMoney(usd(3), usd(2))).toBe(1);
    expect(equalsMoney(usd(r(2, 4)), usd(r(1, 2)))).toBe(true);
    expect(equalsMoney(usd(1), usd(2))).toBe(false);
    expect(scaleMoney(usd(r(1, 3)), r(3)).amount.toString()).toBe('1');
  });

  it('rejects a negative count and a non-integer count', () => {
    expect(thrownCode(() => multiplyCount(usd(1), -1))).toBe('NEGATIVE_QUANTITY');
    expect(thrownCode(() => multiplyCount(usd(1), -1n))).toBe('NEGATIVE_QUANTITY');
    expect(thrownCode(() => multiplyCount(usd(1), 1.5))).toBe('NOT_AN_INTEGER');
    expect(thrownCode(() => usd(0.5))).toBe('NOT_AN_INTEGER');
  });

  // spec: money › Exact money value: money is not mixable with quantities [MN-mix]
  it('throws DIMENSION_MISMATCH when an untyped caller mixes money and a quantity', () => {
    const money = usd(1);
    const length = quantity(1, inch);
    const asMoney = length as unknown as Money;
    const asLength = money as unknown as Quantity<'length'>;
    expect(thrownCode(() => addMoney(money, asMoney))).toBe('DIMENSION_MISMATCH');
    expect(thrownCode(() => subMoney(asMoney, money))).toBe('DIMENSION_MISMATCH');
    expect(thrownCode(() => compareMoney(money, asMoney))).toBe('DIMENSION_MISMATCH');
    expect(thrownCode(() => equalsMoney(asMoney, money))).toBe('DIMENSION_MISMATCH');
    expect(thrownCode(() => scaleMoney(asMoney, r(2)))).toBe('DIMENSION_MISMATCH');
    expect(thrownCode(() => multiplyCount(asMoney, 2))).toBe('DIMENSION_MISMATCH');
    expect(thrownCode(() => toCents(asMoney))).toBe('DIMENSION_MISMATCH');
    expect(thrownCode(() => add(length, asLength))).toBe('DIMENSION_MISMATCH');
    expect(thrownCode(() => sub(asLength, length))).toBe('DIMENSION_MISMATCH');
    expect(thrownCode(() => compare(length, asLength))).toBe('DIMENSION_MISMATCH');
    expect(thrownCode(() => equals(asLength, quantity(1, ft)))).toBe('DIMENSION_MISMATCH');
  });
});

describe('toCents (money › Display rounding to cents)', () => {
  // spec: money › Cents table [MN7], every row hand-verified
  it.each([
    ['747/50', false, 14n, '94'],
    ['185/4', false, 46n, '25'],
    ['37/8', false, 4n, '63'],
    ['999/1000', false, 1n, '00'],
    ['-1/200', true, 0n, '01'],
  ] as const)('shows %s as the cents parts', (amount, negative, integer, fraction) => {
    const parsed = Rational.fromString(amount);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(toCents(usd(parsed.value))).toEqual({ negative, integer, fraction });
  });

  it('never changes the stored amount and shows zero without a sign', () => {
    const money = usd(r(1, 1000));
    expect(toCents(money)).toEqual({ negative: false, integer: 0n, fraction: '00' });
    expect(money.amount.toString()).toBe('1/1000');
    expect(toCents(usd(r(-1, 1000)))).toEqual({ negative: false, integer: 0n, fraction: '00' });
  });
});
