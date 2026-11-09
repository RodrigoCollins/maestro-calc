import { Rational } from '@maestro-calc/core';
import { dogEnergy, kilogramsOf } from '../energy/energy.ts';

/**
 * The verdicts of the food safety pages, from least to most worry: safe as an occasional plain
 * treat, safe in small amounts with a caveat (fat, sugar, lactose), best avoided though not
 * poisonous (salt, fat, a choking or blockage risk), and toxic to dogs.
 */
export const VERDICTS = ['safe', 'moderation', 'avoid', 'toxic'] as const;

export type Verdict = (typeof VERDICTS)[number];

/** Whether `name` is one of the four verdicts. */
export const isVerdict = (name: string): name is Verdict =>
  (VERDICTS as readonly string[]).includes(name);

/**
 * The share of a dog's day that treats may take: no more than 10% of its calories, the rule the
 * AKC, PetMD and VCA give for every treat, people food included.
 */
export const TREAT_SHARE = Rational.of(1, 10);

/** The dog weights, in pounds, every food page is worked at: a small, two medium and a large dog. */
export const FOOD_POUNDS = [10, 25, 50, 80] as const;

/**
 * The treat budget of a dog of `pounds`: a tenth of its maintenance need as a neutered adult, the
 * Merck factor of 1.6 times the resting need (70 × kg^0.75).
 */
export const treatKcalOf = (pounds: Rational): Rational =>
  dogEnergy('neutered', kilogramsOf(pounds, 'lb')).mer.mul(TREAT_SHARE);

/** The grams of a food of `kcalPer100g` that hold `kcal`. */
export const gramsForKcal = (kcal: Rational, kcalPer100g: Rational): Rational => {
  if (kcalPer100g.sign() !== 1) throw new Error('a food needs kcal per 100 g above zero');
  return kcal.mul(Rational.of(100)).div(kcalPer100g);
};

/** How many pieces of `unitGrams` make `grams`. */
export const unitsOf = (grams: Rational, unitGrams: Rational): Rational => {
  if (unitGrams.sign() !== 1) throw new Error('a piece needs a weight above zero');
  return grams.div(unitGrams);
};

/** The grams that reach a dose of `gramsPerKg` (of body weight) in a dog of `pounds`. */
export const doseGramsOf = (pounds: Rational, gramsPerKg: Rational): Rational => {
  if (gramsPerKg.sign() !== 1) throw new Error('a dose needs grams per kg above zero');
  return kilogramsOf(pounds, 'lb').mul(gramsPerKg);
};
