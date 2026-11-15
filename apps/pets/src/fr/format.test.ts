import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { amountFr, countFr, gramsFr, kgFr, percentFr, THOUSANDS_FR } from './format.ts';

describe('French figures', () => {
  it('writes a decimal comma and a narrow no-break space between thousands', () => {
    expect(amountFr(Rational.of(1235), 0)).toBe(`1${THOUSANDS_FR}235`);
    expect(amountFr(Rational.of(27, 10), 1)).toBe('2,7');
    expect(amountFr(Rational.of(123456, 100), 2)).toBe(`1${THOUSANDS_FR}234,56`);
    expect(THOUSANDS_FR).toBe('\u202f');
  });

  it('counts to the tenth below 10 and whole above, without a trailing ,0', () => {
    expect(countFr(Rational.of(11, 10))).toBe('1,1');
    expect(countFr(Rational.of(2))).toBe('2');
    expect(countFr(Rational.of(164, 10))).toBe('16');
  });

  it('writes grams, kilograms and shares with a space before the unit', () => {
    expect(gramsFr(Rational.of(54, 10))).toBe('5,4 g');
    expect(gramsFr(Rational.of(1968, 10))).toBe('197 g');
    expect(kgFr(35)).toBe('35 kg');
    expect(percentFr(Rational.of(22, 1000))).toBe('2,2 %');
    expect(percentFr(Rational.of(64, 100))).toBe('64 %');
  });
});
