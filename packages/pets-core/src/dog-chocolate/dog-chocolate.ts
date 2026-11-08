import { decimalInput, defineCalculator, Rational, selectInput } from '@maestro-calc/core';
import { kilogramsOf } from '../energy/index.ts';

/** The kinds of chocolate of the Merck table. */
const TYPES = ['white', 'milk', 'dark', 'baking', 'cocoa-powder', 'hulls'] as const;

type Type = (typeof TYPES)[number];

/**
 * Milligrams of theobromine and caffeine together per gram, Merck Veterinary Manual, "Chocolate
 * Toxicosis in Animals" (Hayes, full review September 2024): cocoa powder 28.5, unsweetened baking
 * chocolate 15.5, semisweet and sweet dark chocolate 5.3 to 5.6 (the top of the range, as Merck
 * advises for dark chocolate), cocoa bean hulls 9, milk chocolate 2.3, white chocolate 0.04.
 */
const MG_PER_GRAM = {
  white: Rational.of(4, 100),
  milk: Rational.of(23, 10),
  dark: Rational.of(56, 10),
  baking: Rational.of(155, 10),
  'cocoa-powder': Rational.of(285, 10),
  hulls: Rational.of(9),
} as const satisfies Record<Type, Rational>;

/** An ounce is exactly 28.349523125 g (NIST SP 811: 1 lb = 453.59237 g, 16 oz to the pound). */
const GRAMS_PER_OUNCE = Rational.of(28_349_523_125, 1_000_000_000);

/**
 * The doses in mg/kg of Merck: mild signs (vomiting, diarrhea, thirst) from 20, heart effects from
 * 40 to 50, seizures from 60. Merck gives no figure between 50 and 60, so the heart-effects band
 * runs from 40 to the seizures at 60.
 */
const LIMITS = [Rational.of(20), Rational.of(40), Rational.of(60)] as const;

/**
 * Dog chocolate: the milligrams of methylxanthines the dog ate (grams x mg per gram) over its
 * weight in kilograms, the band that dose falls in (0 below 20 mg/kg, 1 from 20, 2 from 40, 3 from
 * 60) and the grams of this chocolate that would reach each limit. Every result is a reason to call
 * a veterinarian or a poison line, whatever the band: the page says so.
 */
export const dogChocolate = defineCalculator({
  id: 'dog-chocolate',
  inputs: [
    decimalInput({
      key: 'weight',
      urlKey: 'w',
      default: Rational.of(20),
      min: Rational.of(1, 10),
      max: Rational.of(500),
    }),
    selectInput({ key: 'weightUnit', urlKey: 'wu', options: ['lb', 'kg'], default: 'lb' }),
    selectInput({ key: 'type', urlKey: 't', options: TYPES, default: 'milk' }),
    decimalInput({ key: 'amount', urlKey: 'a', default: Rational.ONE, max: Rational.of(100_000) }),
    selectInput({ key: 'amountUnit', urlKey: 'au', options: ['oz', 'g'], default: 'oz' }),
  ],
  outputs: [
    { key: 'dose', measure: 'number', role: 'primary' },
    { key: 'totalMg', measure: 'number', role: 'secondary' },
    { key: 'band', measure: 'number', role: 'secondary' },
    { key: 'reach20', measure: 'number', role: 'secondary' },
    { key: 'reach40', measure: 'number', role: 'secondary' },
    { key: 'reach60', measure: 'number', role: 'secondary' },
  ],
  warnings: [],
  compute: ({ weight, weightUnit, type, amount, amountUnit }) => {
    const kg = kilogramsOf(weight, weightUnit);
    const mgPerGram = MG_PER_GRAM[type];
    const grams = amountUnit === 'oz' ? amount.mul(GRAMS_PER_OUNCE) : amount;
    const totalMg = grams.mul(mgPerGram);
    const dose = totalMg.div(kg);
    const reach = (limit: Rational): Rational => limit.mul(kg).div(mgPerGram);
    return {
      outputs: {
        dose,
        totalMg,
        band: Rational.of(LIMITS.filter((limit) => dose.compare(limit) !== -1).length),
        reach20: reach(LIMITS[0]),
        reach40: reach(LIMITS[1]),
        reach60: reach(LIMITS[2]),
      },
      shopping: [],
      warnings: [],
    };
  },
});
