import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import {
  CAT_STATUSES,
  DOG_STATUSES,
  catEnergy,
  dogEnergy,
  KG_PER_LB,
  kilogramsOf,
  restingKcal,
} from './energy.ts';

// RER = 70 x kg^0.75 (Merck Veterinary Manual, "Nutritional Requirements of Small Animals", and the
// 2021 AAHA Nutrition and Weight Management Guidelines, Box 1: 4.5^0.75 x 70 = 216 kcal a day for a
// 10 lb dog, MER = 216 x 1.4 = 302 kcal a day).
const near = (value: Rational, expected: number, places = 0): void => {
  expect(value.toNumber()).toBeCloseTo(expected, places);
};

describe('kilograms', () => {
  it('has 0.45359237 kg to the pound, exactly', () => {
    expect(KG_PER_LB).toEqual(Rational.of(45_359_237, 100_000_000));
  });

  it('reads a weight in pounds or in kilograms', () => {
    expect(kilogramsOf(Rational.of(100), 'lb')).toEqual(Rational.of(45_359_237, 1_000_000));
    expect(kilogramsOf(Rational.of(7, 2), 'kg')).toEqual(Rational.of(7, 2));
  });
});

describe('resting energy requirement', () => {
  it('is 70 for 1 kg, and 216 for the 4.5 kg of AAHA Box 1', () => {
    expect(restingKcal(Rational.ONE)).toEqual(Rational.of(70));
    near(restingKcal(Rational.of(9, 2)), 216);
  });

  it('is 70 x 16^0.75 = 560 for 16 kg and 70 x 81^0.75 = 1,890 for 81 kg', () => {
    expect(restingKcal(Rational.of(16))).toEqual(Rational.of(560));
    expect(restingKcal(Rational.of(81))).toEqual(Rational.of(1890));
  });

  it('rounds to a millionth of a kilocalorie, so it is an exact figure the page can format', () => {
    // 2^0.75 = 1.681792830507429, so 70 x 2^0.75 = 117.72549813552
    expect(restingKcal(Rational.of(2))).toEqual(Rational.of(117_725_498, 1_000_000));
  });

  it('is zero for no weight', () => {
    expect(restingKcal(Rational.ZERO)).toEqual(Rational.ZERO);
  });
});

describe('maintenance energy requirement', () => {
  const kg = Rational.of(9, 2);

  it('lists the dog and cat statuses of Merck and AAHA', () => {
    expect(DOG_STATUSES).toEqual([
      'neutered',
      'intact',
      'inactive',
      'weight-loss',
      'puppy-young',
      'puppy-older',
    ]);
    expect(CAT_STATUSES).toEqual(['neutered', 'intact', 'inactive', 'weight-loss', 'kitten']);
  });

  it('gives a neutered dog Merck 1.6 and the range 1.4 to 1.6 (AAHA 1.4 to 1.6)', () => {
    const energy = dogEnergy('neutered', kg);
    // AAHA rounds the RER to 216 before the factor (302); unrounded it is 216.2756 x 1.4 = 302.79
    near(energy.mer, 346.04, 1);
    near(energy.low, 302.79, 1);
    near(energy.high, 346.04, 1);
  });

  it('gives an intact dog 1.8 within 1.6 to 1.8', () => {
    const energy = dogEnergy('intact', Rational.ONE);
    expect(energy.mer).toEqual(Rational.of(126));
    expect(energy.low).toEqual(Rational.of(112));
    expect(energy.high).toEqual(Rational.of(126));
  });

  it('spans Merck 1.4 and AAHA 1.0 to 1.2 for an inactive dog', () => {
    const energy = dogEnergy('inactive', Rational.ONE);
    expect(energy.mer).toEqual(Rational.of(98));
    expect(energy.low).toEqual(Rational.of(70));
    expect(energy.high).toEqual(Rational.of(98));
  });

  it('feeds a dog on a weight-loss plan 1.0 of its ideal weight (AAHA only)', () => {
    const energy = dogEnergy('weight-loss', Rational.ONE);
    expect([energy.mer, energy.low, energy.high]).toEqual([
      Rational.of(70),
      Rational.of(70),
      Rational.of(70),
    ]);
  });

  it('feeds a puppy 3.0 under 4 months and 2.0 from 4 months', () => {
    expect(dogEnergy('puppy-young', Rational.ONE).mer).toEqual(Rational.of(210));
    expect(dogEnergy('puppy-older', Rational.ONE).mer).toEqual(Rational.of(140));
  });

  it('gives a cat Merck 1.2 neutered and 1.4 intact, with the AAHA ranges above', () => {
    const neutered = catEnergy('neutered', Rational.ONE);
    expect([neutered.mer, neutered.low, neutered.high]).toEqual([
      Rational.of(84),
      Rational.of(84),
      Rational.of(98),
    ]);
    const intact = catEnergy('intact', Rational.ONE);
    expect([intact.mer, intact.low, intact.high]).toEqual([
      Rational.of(98),
      Rational.of(98),
      Rational.of(112),
    ]);
  });

  it('gives a cat 1.0 inactive, 0.8 on a weight-loss plan and a kitten 2.5', () => {
    expect(catEnergy('inactive', Rational.ONE).mer).toEqual(Rational.of(70));
    expect(catEnergy('weight-loss', Rational.ONE).mer).toEqual(Rational.of(56));
    expect(catEnergy('kitten', Rational.ONE).mer).toEqual(Rational.of(175));
  });

  it('keeps the resting figure beside the maintenance one', () => {
    expect(catEnergy('kitten', Rational.of(16)).rer).toEqual(Rational.of(560));
  });
});
