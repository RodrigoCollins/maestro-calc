import { ft3, inch, quantity, Rational, usd, yd3, type OutputDescriptor } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { concrete } from '../lib/concrete.ts';
import {
  DASH,
  fillMessage,
  groupedInteger,
  moneyText,
  outputText,
  percentText,
  priceText,
  volumeText,
} from './present.ts';

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

describe('prices and output figures (calculator-web-core › [CWC5], K5)', () => {
  it('shows a figure that is not there as a dash', () => {
    expect(DASH).toBe('—');
  });

  // spec: calculator-page › [CP12] a price is dollars and cents as a person types it; zero is empty
  it.each([
    [usd(0), ''],
    [usd(Rational.of(13, 2)), '6.50'],
    [usd(150), '150.00'],
    [usd(Rational.of(1, 200)), '0.01'],
  ])('writes price #%# as its text', (money, text) => {
    expect(priceText(money)).toBe(text);
  });

  const output = (key: string): OutputDescriptor => {
    const found = concrete.outputs.find((candidate) => candidate.key === key);
    if (found === undefined) throw new Error(`no output ${key}`);
    return found;
  };

  // spec: calculator-web-core › [CWC5] the figures come from the display hints
  it.each([
    ['volumeYd3', quantity(44, ft3), '1.63'],
    ['volumeFt3', quantity(44, ft3), '44.00'],
    ['volumeM3', quantity(44, ft3), '1.25'],
    ['netVolume', quantity(40, ft3), '40.00'],
    ['volumeYd3', quantity(10_000_000, ft3), '370,370.37'],
  ])('shows %s as %s', (key, value, text) => {
    expect(outputText(output(key), value)).toBe(text);
  });

  it('shows a money output through moneyText', () => {
    expect(outputText(output('bagCost'), usd(481))).toBe('$481.00');
  });

  it('fails loudly for a fraction hint, which no calculator asks for yet', () => {
    const hinted: OutputDescriptor = {
      key: 'len',
      measure: 'length',
      role: 'secondary',
      display: { unit: 'in', format: 'fraction', denominator: 8 },
    };
    expect(() => outputText(hinted, quantity(Rational.of(25, 2), inch))).toThrow(
      'len has no decimal hint',
    );
  });

  it('throws for a quantity with no display hint and for an unknown unit', () => {
    const bare: OutputDescriptor = { key: 'len', measure: 'length', role: 'secondary' };
    expect(() => outputText(bare, quantity(1, inch))).toThrow('len has no decimal hint');
    const unknown: OutputDescriptor = {
      key: 'len',
      measure: 'length',
      role: 'secondary',
      display: { unit: 'ft2', format: 'decimal', places: 2 },
    };
    expect(() => outputText(unknown, quantity(1, inch))).toThrow('len has no unit ft2');
  });
});
