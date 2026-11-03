import { cm3, ft, ft3, gal, inch, liter, quantity, Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { lengthFieldText, volumeText } from './format.ts';

describe('volumeText', () => {
  it('groups whole gallons and rounds half up', () => {
    expect(volumeText(quantity(Rational.of(1_695_744, 77), gal), gal)).toBe('22,023');
    expect(volumeText(quantity(2944, ft3), ft3, 1)).toBe('2,944.0');
    expect(volumeText(quantity(0, liter), liter)).toBe('0');
    expect(volumeText(quantity(1500, cm3), liter, 1)).toBe('1.5');
  });
});

describe('lengthFieldText', () => {
  it('writes feet and inches the way a tape reads', () => {
    expect(lengthFieldText(quantity(32, ft))).toBe('32 ft');
    expect(lengthFieldText(quantity(42, inch))).toBe('3 ft 6 in');
    expect(lengthFieldText(quantity(Rational.of(19, 2), inch))).toBe('9 1/2 in');
    expect(lengthFieldText(quantity(Rational.of(1, 2), inch))).toBe('1/2 in');
    expect(lengthFieldText(quantity(0, inch))).toBe('0 ft');
  });
});
