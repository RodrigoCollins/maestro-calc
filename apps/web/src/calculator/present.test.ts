import { ft3, quantity, Rational, usd, yd3 } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { fillMessage, groupedInteger, moneyText, percentText, volumeText } from './present.ts';

describe('numbers (calculator-page › Display conventions)', () => {
  // spec: calculator-page › [CP15] `,` groups thousands and `.` marks decimals, in both locales
  it.each([
    [0n, '0'],
    [999n, '999'],
    [1000n, '1,000'],
    [1234567n, '1,234,567'],
  ])('groups %s as %s', (value, text) => {
    expect(groupedInteger(value)).toBe(text);
  });

  // spec: calculator-page › [CP1] volumes have two places, [CP12 of calc-concrete] the maximum slab
  it.each([
    [quantity(Rational.of(44, 1), ft3), yd3, '1.63'],
    [quantity(10_000_000, ft3), yd3, '370,370.37'],
    [quantity(10_000_000, ft3), ft3, '10,000,000.00'],
    [quantity(Rational.of(1, 200), ft3), ft3, '0.01'],
    [quantity(0, ft3), ft3, '0.00'],
    [quantity(-1, ft3), ft3, '-1.00'],
  ])('shows volume %# as %s', (volume, unit, text) => {
    expect(volumeText(volume, unit)).toBe(text);
  });

  // spec: calculator-page › [CP16] money is rounded to the cent for display only
  it.each([
    [usd(Rational.of(481)), '$481.00'],
    [usd(Rational.of(2200, 9)), '$244.44'],
    [usd(Rational.of(33000, 81)), '$407.41'],
    [usd(Rational.of(1, 200)), '$0.01'],
    [usd(Rational.of(1994, 1000)), '$1.99'],
    [usd(Rational.of(2469, 2)), '$1,234.50'],
    [usd(Rational.of(-5)), '-$5.00'],
  ])('shows amount %# as %s', (money, text) => {
    expect(moneyText(money)).toBe(text);
  });

  // spec: calculator-page › Display conventions: percent as the canonical decimal
  it.each([
    [Rational.of(10), '10'],
    [Rational.of(25, 2), '12.5'],
    [Rational.of(0), '0'],
    [Rational.of(3, 10), '0.3'],
    [Rational.of(1, 3), '0.33'],
  ])('shows percent %# as %s', (percent, text) => {
    expect(percentText(percent)).toBe(text);
  });

  it('fills the placeholders of a message and leaves the others', () => {
    expect(fillMessage('Max {max} of {max} and {min}', { max: '5' })).toBe('Max 5 of 5 and {min}');
  });
});
