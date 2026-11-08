import {
  ceilToPurchaseUnits,
  decimalInput,
  defineCalculator,
  lb,
  quantity,
  Rational,
  selectInput,
} from '@maestro-calc/core';
import { SEED_SOURCES, SEED_SPECIES, seedRateOf } from './rates.ts';

const THOUSAND = Rational.of(1000);
const HALF = Rational.of(1, 2);

/**
 * Grass seed for a new lawn: the pounds at the low and the high end of the extension rate for the
 * species (pounds of seed per 1,000 sq ft, `rates.ts`), times the area over 1,000, half of it for
 * each of the two crosswise passes (Virginia Cooperative Extension 426-718), and the bags that hold
 * each end. Zoysiagrass has one source, so it ignores the source choice and says so.
 */
export const grassSeed = defineCalculator({
  id: 'grass-seed',
  inputs: [
    decimalInput({
      key: 'area',
      urlKey: 'a',
      default: Rational.of(5000),
      max: Rational.of(10_000_000),
    }),
    selectInput({
      key: 'species',
      urlKey: 's',
      options: SEED_SPECIES,
      default: 'kentucky-bluegrass',
    }),
    selectInput({ key: 'source', urlKey: 'r', options: SEED_SOURCES, default: 'virginia-tech' }),
    decimalInput({
      key: 'bag',
      urlKey: 'b',
      default: Rational.of(5),
      min: Rational.of(1, 10),
      max: Rational.of(2000),
    }),
  ],
  outputs: [
    {
      key: 'lowPounds',
      measure: 'mass',
      role: 'primary',
      display: { unit: 'lb', format: 'decimal', places: 1 },
    },
    {
      key: 'highPounds',
      measure: 'mass',
      role: 'secondary',
      display: { unit: 'lb', format: 'decimal', places: 1 },
    },
    {
      key: 'lowPerPass',
      measure: 'mass',
      role: 'secondary',
      display: { unit: 'lb', format: 'decimal', places: 1 },
    },
    {
      key: 'highPerPass',
      measure: 'mass',
      role: 'secondary',
      display: { unit: 'lb', format: 'decimal', places: 1 },
    },
    { key: 'lowBags', measure: 'number', role: 'secondary' },
    { key: 'highBags', measure: 'number', role: 'secondary' },
  ],
  warnings: ['zoysiaSource'],
  compute: ({ area, species, source, bag }) => {
    const [low, high] = seedRateOf(species, source);
    const lowTotal = low.mul(area).div(THOUSAND);
    const highTotal = high.mul(area).div(THOUSAND);
    const highBags = ceilToPurchaseUnits(highTotal.div(bag));
    return {
      outputs: {
        lowPounds: quantity(lowTotal, lb),
        highPounds: quantity(highTotal, lb),
        lowPerPass: quantity(lowTotal.mul(HALF), lb),
        highPerPass: quantity(highTotal.mul(HALF), lb),
        lowBags: Rational.of(ceilToPurchaseUnits(lowTotal.div(bag))),
        highBags: Rational.of(highBags),
      },
      shopping: [{ materialId: 'grass-seed', purchaseUnit: 'bag', qty: highBags }],
      warnings: species === 'zoysiagrass' ? [{ code: 'zoysiaSource' as const, params: {} }] : [],
    };
  },
});
