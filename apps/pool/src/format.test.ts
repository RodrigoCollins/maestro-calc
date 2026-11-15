import { cm3, ft, ft3, gal, inch, kg, lb, liter, oz, quantity, Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { durationText, lengthFieldText, outputText, volumeText } from './format.ts';

describe('outputText in the larger unit of a dose', () => {
  it('writes a granular dose in pounds and a liquid one in gallons, to two places', () => {
    // 49.28 oz of dry acid is 3.08 lb; 36.64 fl oz of muriatic acid is 0.29 gal (36.64 / 128)
    expect(outputText('dry', quantity(Rational.of(4928, 100), oz), 'us', 'large')).toBe('3.08');
    expect(outputText('liquid', quantity(Rational.of(3664, 100 * 128), gal), 'us', 'large')).toBe(
      '0.29',
    );
  });

  it('writes the same doses in kilograms and millilitres in metric', () => {
    expect(outputText('dry', quantity(Rational.of(3, 2), kg), 'metric', 'large')).toBe('1.50');
    expect(outputText('liquid', quantity(Rational.of(3, 4), liter), 'metric', 'large')).toBe('750');
  });

  it('writes what the chlorine brings with it to a tenth of a ppm', () => {
    expect(outputText('cya', Rational.of(2 * 12907, 14180))).toBe('1.8');
    expect(outputText('hardness', Rational.of(10 * 10009, 14180), 'metric')).toBe('7.1');
  });
});

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

describe('outputText in metric', () => {
  it('writes salt and chemical masses in kilograms, the small rows in grams', () => {
    expect(outputText('pounds', quantity(200, kg), 'metric')).toBe('200.0');
    expect(outputText('firstAddition', quantity(150, kg), 'metric')).toBe('150.0');
    expect(outputText('ounces', quantity(Rational.of(3, 2), kg), 'metric')).toBe('1,500');
    expect(outputText('dry', quantity(Rational.of(1200, 650), kg), 'metric')).toBe('1,846');
    expect(outputText('dryPerAddition', quantity(1, lb), 'metric')).toBe('454');
  });

  it('turns the kilograms row of the salt page into pounds, the figure above being kilograms', () => {
    expect(outputText('kilograms', quantity(200, kg), 'metric')).toBe('440.9');
    expect(outputText('kilograms', quantity(200, kg))).toBe('200.0');
  });

  it('writes liquid doses in litres to two places', () => {
    expect(outputText('liquid', quantity(800, cm3), 'metric')).toBe('0.80');
    expect(outputText('liquidPerDay', quantity(Rational.of(1, 4), gal), 'metric')).toBe('0.95');
  });

  it('keeps the US units when the system is us or not given', () => {
    expect(outputText('pounds', quantity(Rational.of(13_344, 100), lb), 'us')).toBe('133.4');
    expect(outputText('liquid', quantity(Rational.of(1, 2), gal))).toBe('64.0');
  });
});
