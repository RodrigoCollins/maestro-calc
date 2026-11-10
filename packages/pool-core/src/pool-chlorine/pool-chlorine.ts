import {
  cm3,
  decimalInput,
  defineCalculator,
  kg,
  quantity,
  Rational,
  selectInput,
} from '@maestro-calc/core';
import { litersOf, unitsInput } from '../units.ts';

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

/**
 * What a ppm of free chlorine brings with it, by the molar masses of PubChem (cyanuric acid 129.07
 * g/mol, chlorine 70.90, calcium carbonate 100.09): available chlorine is counted as Cl2, one 70.90 g
 * for each HOCl a molecule releases. Dichlor releases 2 HOCl and 1 cyanuric acid: 129.07 / 141.80 ppm
 * of CYA a ppm. Cal-hypo, Ca(OCl)2, releases 2 HOCl and 1 calcium, read as calcium carbonate:
 * 100.09 / 141.80 ppm of calcium hardness a ppm. Liquid chlorine brings neither.
 */
const CYA_PER_PPM = Rational.of(12907, 14180);
const HARDNESS_PER_PPM = Rational.of(10009, 14180);

const THOUSAND = Rational.of(1000);
const HUNDRED = Rational.of(100);

const reading = <K extends string>(key: K, urlKey: string, value: number) =>
  decimalInput({ key, urlKey, default: Rational.of(value), max: Rational.of(100) });

/**
 * Pool chlorine: the grams of available chlorine that raise free chlorine from the current
 * reading to the target, gallons x 3.785411784 x (target - current) / 1000, then the amount of the
 * chosen product: milliliters of liquid (grams / trade percent x 100) or the weight of a granular
 * product (grams / percent x 100). The other form is zero, so a page shows the one that applies.
 */
export const poolChlorine = defineCalculator({
  id: 'pool-chlorine',
  inputs: [
    decimalInput({
      key: 'gallons',
      urlKey: 'g',
      default: Rational.of(20_000),
      max: Rational.of(1_000_000),
    }),
    reading('current', 'c', 1),
    reading('target', 't', 3),
    selectInput({ key: 'product', urlKey: 'p', options: PRODUCTS, default: 'liquid-12-5' }),
    unitsInput(),
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
    { key: 'cya', measure: 'number', role: 'secondary' },
    { key: 'hardness', measure: 'number', role: 'secondary' },
  ],
  warnings: [],
  compute: ({ gallons, current, target, product, units }) => {
    // a reading at or over the target adds nothing
    const difference = target.sub(current);
    const raise = difference.sign() === -1 ? Rational.ZERO : difference;
    const grams = litersOf(gallons, units).mul(raise).div(THOUSAND);
    const { form, percent } = STRENGTH[product];
    const amount = grams.mul(HUNDRED).div(percent);
    return {
      outputs: {
        liquid: quantity(form === 'liquid' ? amount : Rational.ZERO, cm3),
        dry: quantity(form === 'dry' ? amount.div(THOUSAND) : Rational.ZERO, kg),
        cya: product === 'dichlor-56' ? raise.mul(CYA_PER_PPM) : Rational.ZERO,
        hardness: product === 'cal-hypo-65' ? raise.mul(HARDNESS_PER_PPM) : Rational.ZERO,
      },
      shopping: [],
      warnings: [],
    };
  },
});
