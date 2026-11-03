import { cm3, defineCalculator, kg, quantity, Rational } from '@maestro-calc/core';

/** The products, each with the available chlorine its label states. */
const PRODUCTS = ['liquid-12-5', 'liquid-10', 'cal-hypo-65', 'dichlor-56'] as const;

type Product = (typeof PRODUCTS)[number];

/**
 * Liquid chlorine is labeled in trade percent (grams of available chlorine per 100 mL); granular
 * products by weight: calcium hypochlorite, minimum 65% (EPA Reg. 1258-1232), and dichlor, 56%
 * (EPA Reg. 7124-31).
 */
const STRENGTH = {
  'liquid-12-5': { form: 'liquid', percent: Rational.of(25, 2) },
  'liquid-10': { form: 'liquid', percent: Rational.of(10) },
  'cal-hypo-65': { form: 'dry', percent: Rational.of(65) },
  'dichlor-56': { form: 'dry', percent: Rational.of(56) },
} as const satisfies Record<Product, unknown>;

/** A US gallon is exactly 3.785411784 L (NIST SP 811), and 1 ppm is 1 mg/L. */
const LITERS_PER_GALLON = Rational.of(3_785_411_784, 1_000_000_000);
const THOUSAND = Rational.of(1000);
const HUNDRED = Rational.of(100);

const reading = <K extends string>(key: K, urlKey: string, value: number) =>
  ({ kind: 'decimal', key, urlKey, default: Rational.of(value), max: Rational.of(100) }) as const;

/**
 * Pool chlorine: the grams of available chlorine that raise free chlorine from the current
 * reading to the target, gallons x 3.785411784 x (target - current) / 1000, then the amount of the
 * chosen product: milliliters of liquid (grams / trade percent x 100) or the weight of a granular
 * product (grams / percent x 100). The other form is zero, so a page shows the one that applies.
 */
export const poolChlorine = defineCalculator({
  id: 'pool-chlorine',
  inputs: [
    {
      kind: 'decimal',
      key: 'gallons',
      urlKey: 'g',
      default: Rational.of(20_000),
      max: Rational.of(1_000_000),
    },
    reading('current', 'c', 1),
    reading('target', 't', 3),
    { kind: 'select', key: 'product', urlKey: 'p', options: PRODUCTS, default: 'liquid-12-5' },
  ],
  outputs: [
    {
      key: 'liquid',
      measure: 'volume',
      role: 'primary',
      display: { unit: 'L', format: 'decimal', places: 2 },
    },
    {
      key: 'dry',
      measure: 'mass',
      role: 'secondary',
      display: { unit: 'oz', format: 'decimal', places: 1 },
    },
  ],
  warnings: [],
  compute: ({ gallons, current, target, product }) => {
    const raise = target.compare(current) > 0 ? target.sub(current) : Rational.ZERO;
    const grams = gallons.mul(LITERS_PER_GALLON).mul(raise).div(THOUSAND);
    const { form, percent } = STRENGTH[product];
    const amount = grams.mul(HUNDRED).div(percent);
    return {
      outputs: {
        liquid: quantity(form === 'liquid' ? amount : Rational.ZERO, cm3),
        dry: quantity(form === 'dry' ? amount.div(THOUSAND) : Rational.ZERO, kg),
      },
      shopping: [],
      warnings: [],
    };
  },
});
