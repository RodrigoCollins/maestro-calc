import { Rational } from '@maestro-calc/core';

/** A pound is exactly 0.45359237 kg (NIST SP 811). */
export const KG_PER_LB = Rational.of(45_359_237, 100_000_000);

/** A weight in pounds or kilograms, in kilograms. */
export const kilogramsOf = (weight: Rational, unit: 'lb' | 'kg'): Rational =>
  unit === 'lb' ? weight.mul(KG_PER_LB) : weight;

const MILLION = 1_000_000;

/**
 * Resting energy requirement (RER), 70 x kg^0.75 kcal a day, at any body weight: Merck Veterinary
 * Manual, "Nutritional Requirements of Small Animals", and the 2021 AAHA Nutrition and Weight
 * Management Guidelines, Box 1. A fractional power has no exact rational value, so the figure is
 * rounded to a millionth of a kilocalorie, far below what a bowl can tell.
 */
export const restingKcal = (kg: Rational): Rational =>
  Rational.of(BigInt(Math.round(70 * Math.pow(kg.toNumber(), 0.75) * MILLION)), MILLION);

/** A factor in tenths: `tenths(16)` is 1.6. */
const tenths = (value: number): Rational => Rational.of(value, 10);

/**
 * What a status multiplies the RER by: Merck's point value (`factor`, the default), and the lowest
 * and highest figure of Merck and the 2021 AAHA Box 1 together (`low`, `high`), since the two
 * sources disagree. Merck gives no weight-loss factor, so that row is AAHA's 1.0 (dog) and 0.8
 * (cat), on the ideal weight.
 */
interface Factors {
  readonly factor: Rational;
  readonly low: Rational;
  readonly high: Rational;
}

const factors = (merck: number, low: number, high: number): Factors => ({
  factor: tenths(merck),
  low: tenths(low),
  high: tenths(high),
});

export const DOG_STATUSES = [
  'neutered',
  'intact',
  'inactive',
  'weight-loss',
  'puppy-young',
  'puppy-older',
] as const;
export const CAT_STATUSES = ['neutered', 'intact', 'inactive', 'weight-loss', 'kitten'] as const;

export type DogStatus = (typeof DOG_STATUSES)[number];
export type CatStatus = (typeof CAT_STATUSES)[number];

/**
 * Merck, "Daily maintenance energy requirements for dogs and cats", against AAHA 2021 Box 1:
 * neutered adult 1.6 / 1.4 to 1.6 (dog) and 1.2 / 1.2 to 1.4 (cat); intact 1.8 / 1.6 to 1.8 and
 * 1.4 / 1.4 to 1.6; inactive or obesity prone 1.4 / 1.0 to 1.2 and 1.0 / 1.0; weight loss 1.0 and
 * 0.8; a puppy under 4 months 3.0 and from 4 months 2.0; a kitten 2.5.
 */
const DOGS: Readonly<Record<DogStatus, Factors>> = {
  neutered: factors(16, 14, 16),
  intact: factors(18, 16, 18),
  inactive: factors(14, 10, 14),
  'weight-loss': factors(10, 10, 10),
  'puppy-young': factors(30, 30, 30),
  'puppy-older': factors(20, 20, 20),
};

const CATS: Readonly<Record<CatStatus, Factors>> = {
  neutered: factors(12, 12, 14),
  intact: factors(14, 14, 16),
  inactive: factors(10, 10, 10),
  'weight-loss': factors(8, 8, 8),
  kitten: factors(25, 25, 25),
};

/** The energy of a pet in kilocalories a day: the resting need, the maintenance need and its range. */
export interface Energy {
  readonly rer: Rational;
  readonly mer: Rational;
  readonly low: Rational;
  readonly high: Rational;
}

const energyFrom = ({ factor, low, high }: Factors, kg: Rational): Energy => {
  const rer = restingKcal(kg);
  return { rer, mer: rer.mul(factor), low: rer.mul(low), high: rer.mul(high) };
};

/** The RER of a dog of `kg` and the MER of its status: Merck's point value and the range of both sources. */
export const dogEnergy = (status: DogStatus, kg: Rational): Energy => energyFrom(DOGS[status], kg);

/** The RER of a cat of `kg` and the MER of its status: Merck's point value and the range of both sources. */
export const catEnergy = (status: CatStatus, kg: Rational): Energy => energyFrom(CATS[status], kg);
