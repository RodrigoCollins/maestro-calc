import { decimalInput, defineCalculator, Rational, selectInput } from '@maestro-calc/core';
import { DOG_STATUSES, dogEnergy, kilogramsOf } from '../energy/index.ts';

/** How the label states the calories: per cup, per kilogram, or per can (AAFCO, "Calorie Content"). */
const BASES = ['cup', 'kg', 'can'] as const;

const THOUSAND = Rational.of(1000);
/** Complete and balanced food is at least 90% of the day; treats and the rest at most 10% (AAHA 2021). */
const TREAT_SHARE = Rational.of(1, 10);
const FOOD_SHARE = Rational.of(9, 10);

/**
 * Dog food: the calories a day of a dog (`dogEnergy`, Merck and AAHA) and the amount of the owner's
 * own food that gives them, from the calorie line of its label: cups a day = MER / kcal per cup,
 * grams a day = MER / (kcal per kg) x 1,000, cans a day = MER / kcal per can. The amount is the
 * whole day's food; `portionWithTreats` is 90% of it, for a day that spends the 10% treat
 * allowance. For a dog on a weight-loss plan the weight is the ideal weight.
 */
export const dogFood = defineCalculator({
  id: 'dog-food',
  inputs: [
    decimalInput({
      key: 'weight',
      urlKey: 'w',
      default: Rational.of(40),
      min: Rational.of(1, 10),
      max: Rational.of(500),
    }),
    selectInput({ key: 'unit', urlKey: 'wu', options: ['lb', 'kg'], default: 'lb' }),
    selectInput({ key: 'status', urlKey: 's', options: DOG_STATUSES, default: 'neutered' }),
    selectInput({ key: 'basis', urlKey: 'b', options: BASES, default: 'cup' }),
    decimalInput({
      key: 'kcal',
      urlKey: 'k',
      default: Rational.of(360),
      min: Rational.ONE,
      max: Rational.of(100_000),
    }),
  ],
  outputs: [
    { key: 'portion', measure: 'number', role: 'primary' },
    { key: 'portionWithTreats', measure: 'number', role: 'secondary' },
    { key: 'mer', measure: 'number', role: 'secondary' },
    { key: 'rer', measure: 'number', role: 'secondary' },
    { key: 'low', measure: 'number', role: 'secondary' },
    { key: 'high', measure: 'number', role: 'secondary' },
    { key: 'treats', measure: 'number', role: 'secondary' },
  ],
  warnings: [],
  compute: ({ weight, unit, status, basis, kcal }) => {
    const { rer, mer, low, high } = dogEnergy(status, kilogramsOf(weight, unit));
    const portion = basis === 'kg' ? mer.div(kcal).mul(THOUSAND) : mer.div(kcal);
    return {
      outputs: {
        portion,
        portionWithTreats: portion.mul(FOOD_SHARE),
        mer,
        rer,
        low,
        high,
        treats: mer.mul(TREAT_SHARE),
      },
      shopping: [],
      warnings: [],
    };
  },
});
