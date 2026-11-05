import {
  countInput,
  decimalInput,
  defineCalculator,
  gal,
  oz,
  quantity,
  Rational,
  selectInput,
} from '@maestro-calc/core';

/** Muriatic acid (20° Baumé, 31.45% HCl) lowers pH; soda ash (sodium carbonate, 100%) raises it. */
const PRODUCTS = ['muriatic-31-45', 'soda-ash'] as const;

/**
 * Taylor Technologies, K-1003 instructions (Instr. #5816), pH dosage charts, per drop of the
 * demand reagent in 10,000 gallons: 9.16 fl oz of muriatic acid a drop of acid demand reagent
 * (R-0015) and 5.13 oz of soda ash a drop of base demand reagent (R-0016). A fluid ounce is 1/128
 * US gallon.
 */
const ACID_GALLONS_PER_DROP = Rational.of(916, 100 * 128 * 10_000);
const SODA_OUNCES_PER_DROP = Rational.of(513, 100 * 10_000);
/** The chart lists 1, 2 and 3 drops. */
const CHART_DROPS = 3;

/**
 * Pool pH: the dose of Taylor's pH dosage chart for the drops the acid demand or base demand test
 * took, gallons x drops x 9.16 fl oz of muriatic acid, or x 5.13 oz of soda ash, per 10,000
 * gallons. The test titrates the pool's own water, so its alkalinity is in the count. The other
 * product is zero, so a page shows the one that applies; past the chart's 3 drops each drop still
 * adds the same amount, and the run says the chart stops there.
 */
export const poolPh = defineCalculator({
  id: 'pool-ph',
  inputs: [
    decimalInput({
      key: 'gallons',
      urlKey: 'g',
      default: Rational.of(20_000),
      max: Rational.of(1_000_000),
    }),
    selectInput({ key: 'product', urlKey: 'p', options: PRODUCTS, default: 'muriatic-31-45' }),
    countInput({ key: 'drops', urlKey: 'd', default: 2, max: 10 }),
  ],
  outputs: [
    {
      key: 'liquid',
      measure: 'volume',
      role: 'primary',
      display: { unit: 'gal', format: 'decimal', places: 2 },
    },
    {
      key: 'dry',
      measure: 'mass',
      role: 'secondary',
      display: { unit: 'oz', format: 'decimal', places: 1 },
    },
  ],
  warnings: ['pastChart'],
  compute: ({ gallons, product, drops }) => {
    const dose = gallons.mul(Rational.of(drops));
    const acid = product === 'muriatic-31-45';
    return {
      outputs: {
        liquid: quantity(acid ? dose.mul(ACID_GALLONS_PER_DROP) : Rational.ZERO, gal),
        dry: quantity(acid ? Rational.ZERO : dose.mul(SODA_OUNCES_PER_DROP), oz),
      },
      shopping: [],
      warnings: drops > CHART_DROPS ? [{ code: 'pastChart' as const, params: {} }] : [],
    };
  },
});
