import { cm3, ft, ft3, gal, inch, liter, quantity, Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { durationText, lengthFieldText, outputText, volumeText } from './format.ts';

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

describe('durationText', () => {
  it('writes hours as whole hours and the nearest minute', () => {
    expect(durationText(Rational.of(100, 3))).toBe('33 h 20 min');
    expect(durationText(Rational.of(125, 6))).toBe('20 h 50 min');
    expect(durationText(Rational.of(2))).toBe('2 h 0 min');
    expect(durationText(Rational.of(1, 4))).toBe('0 h 15 min');
    // 59.5 minutes round up to the next hour, 1,000 hours are grouped
    expect(durationText(Rational.of(119, 120))).toBe('1 h 0 min');
    expect(durationText(Rational.of(1000))).toBe('1,000 h 0 min');
  });
});

describe('outputText of a plain number', () => {
  it('writes the time as hours and minutes, any other number whole and grouped', () => {
    expect(outputText('time', Rational.of(100, 3))).toBe('33 h 20 min');
    expect(outputText('btuPerHour', Rational.of(69_500))).toBe('69,500');
    expect(outputText('minutes', Rational.of(4_001, 2))).toBe('2,001');
  });
});
