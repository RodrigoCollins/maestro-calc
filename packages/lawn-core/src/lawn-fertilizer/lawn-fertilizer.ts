import {
  ceilToPurchaseUnits,
  decimalInput,
  defineCalculator,
  lb,
  quantity,
  Rational,
} from '@maestro-calc/core';

const HUNDRED = Rational.of(100);
const THOUSAND = Rational.of(1000);
/**
 * Purdue AY-22-W, "Fertilizing Established Cool-season Lawns": "Do not apply more than 1.0 pound
 * of actual water-soluble N per 1,000 square feet in any single application."
 */
const ONE_APPLICATION_LIMIT = Rational.of(1);

const percent = <K extends string>(key: K, urlKey: string, value: number, min = Rational.ZERO) =>
  decimalInput({ key, urlKey, default: Rational.of(value), min, max: HUNDRED });

/**
 * Granular lawn fertilizer: pounds of product per 1,000 sq ft = target pounds of N per 1,000 sq ft
 * over the N share of the bag (Purdue, Penn State Extension), times the area over 1,000. The P and
 * K that come with it are the same weight times the P2O5 and K2O shares the label states. A target
 * above the limit of one application is worked out and says so; it is never suggested.
 */
export const lawnFertilizer = defineCalculator({
  id: 'lawn-fertilizer',
  inputs: [
    decimalInput({
      key: 'area',
      urlKey: 'a',
      default: Rational.of(5000),
      max: Rational.of(10_000_000),
    }),
    percent('nitrogen', 'n', 24, Rational.of(1, 10)),
    percent('phosphate', 'p', 0),
    percent('potash', 'k', 6),
    decimalInput({
      key: 'target',
      urlKey: 't',
      default: Rational.of(1),
      max: Rational.of(5),
    }),
    decimalInput({
      key: 'bag',
      urlKey: 'b',
      default: Rational.of(15),
      min: Rational.of(1, 10),
      max: Rational.of(2000),
    }),
  ],
  outputs: [
    {
      key: 'pounds',
      measure: 'mass',
      role: 'primary',
      display: { unit: 'lb', format: 'decimal', places: 1 },
    },
    {
      key: 'perThousand',
      measure: 'mass',
      role: 'secondary',
      display: { unit: 'lb', format: 'decimal', places: 1 },
    },
    { key: 'bagCoverage', measure: 'number', role: 'secondary' },
    {
      key: 'nitrogenPounds',
      measure: 'mass',
      role: 'secondary',
      display: { unit: 'lb', format: 'decimal', places: 1 },
    },
    {
      key: 'phosphatePounds',
      measure: 'mass',
      role: 'secondary',
      display: { unit: 'lb', format: 'decimal', places: 1 },
    },
    {
      key: 'potashPounds',
      measure: 'mass',
      role: 'secondary',
      display: { unit: 'lb', format: 'decimal', places: 1 },
    },
  ],
  warnings: ['overLimit'],
  compute: ({ area, nitrogen, phosphate, potash, target, bag }) => {
    const perThousand = target.div(nitrogen.div(HUNDRED));
    const total = perThousand.mul(area).div(THOUSAND);
    const share = (percentage: Rational): Rational => total.mul(percentage.div(HUNDRED));
    return {
      outputs: {
        pounds: quantity(total, lb),
        perThousand: quantity(perThousand, lb),
        // a zero rate spreads over any area: the coverage is then the area it was asked for
        bagCoverage: perThousand.isZero() ? area : bag.div(perThousand).mul(THOUSAND),
        nitrogenPounds: quantity(share(nitrogen), lb),
        phosphatePounds: quantity(share(phosphate), lb),
        potashPounds: quantity(share(potash), lb),
      },
      shopping: [
        {
          materialId: 'lawn-fertilizer',
          purchaseUnit: 'bag',
          qty: ceilToPurchaseUnits(total.div(bag)),
        },
      ],
      warnings:
        target.compare(ONE_APPLICATION_LIMIT) === 1
          ? [{ code: 'overLimit' as const, params: {} }]
          : [],
    };
  },
});
