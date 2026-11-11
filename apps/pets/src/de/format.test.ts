import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { amountDe, countDe, gramsDe, kgDe, percentDe, rawDecimal } from './format.ts';

describe('German figures', () => {
  it('writes a decimal comma and a point between thousands', () => {
    expect(amountDe(Rational.of(1235), 0)).toBe('1.235');
    expect(amountDe(Rational.of(27, 10), 1)).toBe('2,7');
    expect(amountDe(Rational.of(123456, 100), 2)).toBe('1.234,56');
  });

  it('counts to the tenth below 10 and whole above, without a trailing ,0', () => {
    expect(countDe(Rational.of(11, 10))).toBe('1,1');
    expect(countDe(Rational.of(2))).toBe('2');
    expect(countDe(Rational.of(164, 10))).toBe('16');
  });

  it('writes grams, kilograms and shares with a space before the unit', () => {
    expect(gramsDe(Rational.of(54, 10))).toBe('5,4 g');
    expect(gramsDe(Rational.of(1968, 10))).toBe('197 g');
    expect(kgDe(35)).toBe('35 kg');
    expect(percentDe(Rational.of(22, 1000))).toBe('2,2 %');
    expect(percentDe(Rational.of(64, 100))).toBe('64 %');
  });
});

describe('rawDecimal', () => {
  it('reads a German decimal comma as the point the engine reads', () => {
    expect(rawDecimal('3,5')).toBe('3.5');
    expect(rawDecimal(' 12 ')).toBe('12');
    expect(rawDecimal('3.5')).toBe('3.5');
  });
});
