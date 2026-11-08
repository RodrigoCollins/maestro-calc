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
 * Lawn lime: the soil test recommends pounds of calcium carbonate equivalent (CCE) per 1,000 sq ft
 * (Penn State Agricultural Analytical Services Lab); a product whose label CCE is not 100 percent
 * takes recommendation x 100 / CCE pounds per 1,000 sq ft, times the area over 1,000. The
 * calculator never guesses a rate: without a soil test result there is nothing to enter.
 */
export const lawnLime = defineCalculator({
  id: 'lawn-lime',
  inputs: [
    decimalInput({
      key: 'area',
      urlKey: 'a',
      default: Rational.of(5000),
      max: Rational.of(10_000_000),
    }),
    decimalInput({
      key: 'rate',
      urlKey: 'r',
      default: Rational.of(30),
      max: Rational.of(10_000),
    }),
    decimalInput({
      key: 'cce',
      urlKey: 'c',
      default: HUNDRED,
      min: Rational.of(1),
      max: Rational.of(200),
    }),
    decimalInput({
      key: 'bag',
      urlKey: 'b',
      default: Rational.of(40),
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
  ],
  warnings: [],
  compute: ({ area, rate, cce, bag }) => {
    const perThousand = rate.mul(HUNDRED).div(cce);
    const total = perThousand.mul(area).div(THOUSAND);
    return {
      outputs: { pounds: quantity(total, lb), perThousand: quantity(perThousand, lb) },
      shopping: [
        {
          materialId: 'lawn-lime',
          purchaseUnit: 'bag',
          qty: ceilToPurchaseUnits(total.div(bag)),
        },
      ],
      warnings: [],
    };
  },
});
