import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import {
  doseGramsOf,
  FOOD_POUNDS,
  gramsForKcal,
  isVerdict,
  TREAT_SHARE,
  treatKcalOf,
  unitsOf,
  VERDICTS,
} from './food-safety.ts';

// Worked by hand: a 10 lb dog is 4.5359237 kg; 4.5359237^0.75 = e^(0.75 × 1.51204) = 3.10812, so
// its resting need is 70 × 3.10812 = 217.57 kcal, its neutered maintenance 1.6 × 217.57 = 348.11
// (Merck) and a tenth of it 34.81 kcal: the treat budget of the 10% rule.
const near = (value: Rational, expected: number, digits = 2): void => {
  expect(value.toNumber()).toBeCloseTo(expected, digits);
};

describe('the treat budget', () => {
  it('is a tenth of the day', () => {
    expect(TREAT_SHARE.equals(Rational.of(1, 10))).toBe(true);
  });

  it('is a tenth of the neutered maintenance need, by the dog’s weight in pounds', () => {
    near(treatKcalOf(Rational.of(10)), 34.811);
    near(treatKcalOf(Rational.of(25)), 69.211);
    near(treatKcalOf(Rational.of(50)), 116.398);
    near(treatKcalOf(Rational.of(80)), 165.59);
  });

  it('grows with the dog, but slower than its weight (the 0.75 power)', () => {
    const ten = treatKcalOf(Rational.of(10));
    const forty = treatKcalOf(Rational.of(40));
    expect(forty.compare(ten)).toBe(1);
    expect(forty.compare(ten.mul(Rational.of(4)))).toBe(-1);
    // 4^0.75 = 2.828...
    near(forty.div(ten), 2.828, 3);
  });

  it('is worked at four dogs, small to large', () => {
    expect(FOOD_POUNDS).toEqual([10, 25, 50, 80]);
  });
});

describe('grams and pieces', () => {
  it('turns kilocalories into grams of a food of so many kcal per 100 g', () => {
    // 34.811 kcal of a food of 32 kcal per 100 g: 34.811 × 100 / 32 = 108.78 g
    near(gramsForKcal(treatKcalOf(Rational.of(10)), Rational.of(32)), 108.78);
    expect(gramsForKcal(Rational.of(50), Rational.of(200)).equals(Rational.of(25))).toBe(true);
  });

  it('turns grams into pieces of a given weight', () => {
    expect(unitsOf(Rational.of(36), Rational.of(12)).equals(Rational.of(3))).toBe(true);
    expect(unitsOf(Rational.of(5), Rational.of(2)).equals(Rational.of(5, 2))).toBe(true);
  });

  it('refuses a food or a piece of no weight or no energy', () => {
    expect(() => gramsForKcal(Rational.of(10), Rational.of(0))).toThrow('kcal per 100 g');
    expect(() => unitsOf(Rational.of(10), Rational.of(0))).toThrow('piece');
    expect(() => gramsForKcal(Rational.of(10), Rational.of(-1))).toThrow('kcal per 100 g');
    expect(() => unitsOf(Rational.of(10), Rational.of(-2))).toThrow('piece');
  });
});

describe('the dose of a source, in grams of food', () => {
  it('is the dose per kilogram times the dog’s weight in kilograms', () => {
    // 2.4 g/kg for a 10 lb dog: 2.4 × 4.5359237 = 10.886 g
    near(doseGramsOf(Rational.of(10), Rational.of(24, 10)), 10.886, 3);
    // 0.1 g/kg for a 50 lb dog: 0.1 × 22.6796185 = 2.268 g
    near(doseGramsOf(Rational.of(50), Rational.of(1, 10)), 2.268, 3);
  });

  it('refuses a dose that is not above zero', () => {
    expect(() => doseGramsOf(Rational.of(10), Rational.of(0))).toThrow('dose');
  });
});

describe('the verdicts', () => {
  it('run from safe to toxic', () => {
    expect(VERDICTS).toEqual(['safe', 'moderation', 'avoid', 'toxic']);
  });

  it('recognise only their own names', () => {
    expect(isVerdict('toxic')).toBe(true);
    expect(isVerdict('safe')).toBe(true);
    expect(isVerdict('poison')).toBe(false);
  });
});
