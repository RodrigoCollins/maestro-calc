import { Rational, usd } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { dateText, dollarsFieldText, fieldText, moneyText, numberText } from './format.ts';

describe('moneyText', () => {
  it('writes dollars and cents with commas, US style', () => {
    expect(moneyText(usd(Rational.of(119350, 100)))).toBe('$1,193.50');
    expect(moneyText(usd(0))).toBe('$0.00');
    expect(moneyText(usd(1234567))).toBe('$1,234,567.00');
  });

  it('rounds half a cent up and keeps the sign of a difference', () => {
    expect(moneyText(usd(Rational.of(2005, 1000)))).toBe('$2.01');
    expect(moneyText(usd(Rational.of(-5, 2)))).toBe('-$2.50');
  });
});

describe('numberText', () => {
  it('drops trailing zeros and groups the thousands', () => {
    expect(numberText(Rational.of(8))).toBe('8');
    expect(numberText(Rational.of(7, 2))).toBe('3.5');
    expect(numberText(Rational.of(1500))).toBe('1,500');
    expect(numberText(Rational.of(1, 3), 2)).toBe('0.33');
  });
});

describe('dateText', () => {
  it('writes a day in each language', () => {
    expect(dateText('2026-11-08', 'es')).toBe('8 de noviembre de 2026');
    expect(dateText('2026-11-08', 'en')).toBe('November 8, 2026');
  });

  it('refuses a month that does not exist', () => {
    expect(() => dateText('2026-13-01', 'en')).toThrow('not a day');
  });
});

describe('field texts', () => {
  it('writes a number a field reads back, with no grouping', () => {
    expect(fieldText(Rational.of(1500))).toBe('1500');
    expect(fieldText(Rational.of(1, 8))).toBe('0.125');
    expect(dollarsFieldText(usd(25))).toBe('25');
    expect(dollarsFieldText(usd(Rational.of(77, 2)))).toBe('38.5');
  });
});
