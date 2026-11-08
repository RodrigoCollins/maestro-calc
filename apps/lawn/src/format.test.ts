import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { amountText, fieldText, pluralOf, rangeText } from './format.ts';

describe('amountText', () => {
  it('rounds to the places and groups thousands', () => {
    expect(amountText(Rational.of(125, 6), 1)).toBe('20.8');
    expect(amountText(Rational.of(13_000))).toBe('13,000');
    expect(amountText(Rational.of(2_500_000, 3), 2)).toBe('833,333.33');
    expect(amountText(Rational.of(-1, 2), 1)).toBe('-0.5');
  });
});

describe('fieldText', () => {
  it('keeps what a field needs: no grouping, no trailing zeros', () => {
    expect(fieldText(Rational.of(5000))).toBe('5000');
    expect(fieldText(Rational.of(1))).toBe('1');
    expect(fieldText(Rational.of(3, 4))).toBe('0.75');
    expect(fieldText(Rational.ZERO)).toBe('0');
    expect(fieldText(Rational.of(100))).toBe('100');
  });
});

describe('rangeText', () => {
  it('joins the two ends with an en dash, or shows one figure', () => {
    expect(rangeText('10.0', '15.0')).toBe('10.0–15.0');
    expect(rangeText('0', '0')).toBe('0');
  });
});

describe('pluralOf', () => {
  it('uses the singular for one only', () => {
    expect(pluralOf(1n, 'bag', 'bags')).toBe('bag');
    expect(pluralOf(0n, 'bag', 'bags')).toBe('bags');
    expect(pluralOf(2n, 'bag', 'bags')).toBe('bags');
  });
});
