import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { amountEs, countEs, gramsEs, kgEs, percentEs, THOUSANDS_ES } from './format.ts';

describe('Spanish figures', () => {
  it('writes a decimal comma, four digits together and a narrow space from five (RAE)', () => {
    expect(amountEs(Rational.of(1235), 0)).toBe('1235');
    expect(amountEs(Rational.of(27, 10), 1)).toBe('2,7');
    expect(amountEs(Rational.of(123456, 100), 2)).toBe('1234,56');
    expect(amountEs(Rational.of(12345), 0)).toBe(`12${THOUSANDS_ES}345`);
    expect(amountEs(Rational.of(1234567), 0)).toBe(`1${THOUSANDS_ES}234${THOUSANDS_ES}567`);
    expect(THOUSANDS_ES).toBe('\u202f');
  });

  it('counts to the tenth below 10 and whole above, without a trailing ,0', () => {
    expect(countEs(Rational.of(11, 10))).toBe('1,1');
    expect(countEs(Rational.of(2))).toBe('2');
    expect(countEs(Rational.of(164, 10))).toBe('16');
  });

  it('writes grams, kilograms and shares with a space before the unit', () => {
    expect(gramsEs(Rational.of(54, 10))).toBe('5,4 g');
    expect(gramsEs(Rational.of(1968, 10))).toBe('197 g');
    expect(kgEs(35)).toBe('35 kg');
    expect(percentEs(Rational.of(22, 1000))).toBe('2,2 %');
    expect(percentEs(Rational.of(64, 100))).toBe('64 %');
  });
});
