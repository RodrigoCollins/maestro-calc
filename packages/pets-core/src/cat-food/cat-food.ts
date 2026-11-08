import {
  decimalInput,
  defineCalculator,
  percentInput,
  Rational,
  selectInput,
} from '@maestro-calc/core';
import { CAT_STATUSES, catEnergy, kilogramsOf } from '../energy/index.ts';

const HUNDRED = Rational.of(100);
/** Complete and balanced food is at least 90% of the day; treats and the rest at most 10% (AAHA 2021). */
const TREAT_SHARE = Rational.of(1, 10);
const FOOD_SHARE = Rational.of(9, 10);

/**
 * Cat food: the calories a day of a cat (`catEnergy`, Merck and AAHA), split between dry food by
 * the cup and wet food by the can from the share of the calories that comes from the wet food
 * (0 for dry only, 100 for wet only): cups a day = MER x dry share / kcal per cup, cans a day =
 * MER x wet share / kcal per can. Both come from the calorie lines of the labels (AAFCO,
 * "Calorie Content"). The `WithTreats` amounts are 90% of them, for a day that spends the 10%
 * treat allowance. For a cat on a weight-loss plan the weight is the ideal weight.
 */
export const catFood = defineCalculator({
  id: 'cat-food',
  inputs: [
    decimalInput({
      key: 'weight',
      urlKey: 'w',
      default: Rational.of(10),
      min: Rational.of(1, 10),
      max: Rational.of(100),
    }),
    selectInput({ key: 'unit', urlKey: 'wu', options: ['lb', 'kg'], default: 'lb' }),
    selectInput({ key: 'status', urlKey: 's', options: CAT_STATUSES, default: 'neutered' }),
    decimalInput({
      key: 'dryKcal',
      urlKey: 'd',
      default: Rational.of(350),
      min: Rational.ONE,
      max: Rational.of(100_000),
    }),
    decimalInput({
      key: 'wetKcal',
      urlKey: 'c',
      default: Rational.of(80),
      min: Rational.ONE,
      max: Rational.of(100_000),
    }),
    percentInput({ key: 'wetShare', urlKey: 'ws', default: Rational.ZERO }),
  ],
  outputs: [
    { key: 'cups', measure: 'number', role: 'primary' },
    { key: 'cans', measure: 'number', role: 'secondary' },
    { key: 'cupsWithTreats', measure: 'number', role: 'secondary' },
    { key: 'cansWithTreats', measure: 'number', role: 'secondary' },
    { key: 'mer', measure: 'number', role: 'secondary' },
    { key: 'rer', measure: 'number', role: 'secondary' },
    { key: 'low', measure: 'number', role: 'secondary' },
    { key: 'high', measure: 'number', role: 'secondary' },
    { key: 'treats', measure: 'number', role: 'secondary' },
  ],
  warnings: [],
  compute: ({ weight, unit, status, dryKcal, wetKcal, wetShare }) => {
    const { rer, mer, low, high } = catEnergy(status, kilogramsOf(weight, unit));
    const wet = wetShare.div(HUNDRED);
    const cups = mer.mul(Rational.ONE.sub(wet)).div(dryKcal);
    const cans = mer.mul(wet).div(wetKcal);
    return {
      outputs: {
        cups,
        cans,
        cupsWithTreats: cups.mul(FOOD_SHARE),
        cansWithTreats: cans.mul(FOOD_SHARE),
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
