import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { amountText, cupsText, dateText, kcalText, quarterCups, weightText } from './format.ts';

describe('amountText', () => {
  it('writes an exact amount to the places asked, grouped by thousands', () => {
    expect(amountText(Rational.of(1_234_567, 100), 2)).toBe('12,345.67');
    expect(amountText(Rational.of(5, 2), 0)).toBe('3');
    expect(amountText(Rational.of(2735, 1000), 2)).toBe('2.74');
    expect(amountText(Rational.of(-5, 2), 1)).toBe('-2.5');
    expect(amountText(Rational.of(1000), 0)).toBe('1,000');
  });
});

describe('kcalText', () => {
  it('rounds to a whole kilocalorie, grouped', () => {
    expect(kcalText(Rational.of(98_461, 100))).toBe('985');
    expect(kcalText(Rational.of(1_234_5, 10))).toBe('1,235');
    expect(kcalText(Rational.ZERO)).toBe('0');
  });
});

describe('quarterCups', () => {
  it('rounds to the nearest quarter cup, halves going up', () => {
    expect(quarterCups(2.735)).toBe(2.75);
    expect(quarterCups(0.746)).toBe(0.75);
    expect(quarterCups(1.124)).toBe(1);
    expect(quarterCups(1.125)).toBe(1.25);
    expect(quarterCups(0.2)).toBe(0.25);
  });

  it('never rounds an amount to nothing: the least a quarter cup', () => {
    expect(quarterCups(0.05)).toBe(0.25);
    expect(quarterCups(0)).toBe(0);
  });
});

describe('cupsText', () => {
  it('writes whole cups and the fraction with the symbols of Latin-1', () => {
    expect(cupsText(2.75)).toBe('2 ¾');
    expect(cupsText(0.75)).toBe('¾');
    expect(cupsText(1)).toBe('1');
    expect(cupsText(1.25)).toBe('1 ¼');
    expect(cupsText(0.5)).toBe('½');
    expect(cupsText(0.25)).toBe('¼');
    expect(cupsText(0)).toBe('0');
    expect(cupsText(12.5)).toBe('12 ½');
  });
});

describe('weightText', () => {
  it('writes a weight with its unit, trailing zeros left out', () => {
    expect(weightText(Rational.of(40), 'lb')).toBe('40 lb');
    expect(weightText(Rational.of(45, 10), 'kg')).toBe('4.5 kg');
    expect(weightText(Rational.of(12_345, 100), 'lb')).toBe('123.45 lb');
  });
});

describe('dateText', () => {
  it('writes a date as month, day and year in English', () => {
    expect(dateText({ year: 2026, month: 4, day: 28 })).toBe('Apr 28, 2026');
    expect(dateText({ year: 2027, month: 1, day: 1 })).toBe('Jan 1, 2027');
    expect(dateText({ year: 2026, month: 12, day: 31 })).toBe('Dec 31, 2026');
  });
});
