import { defineCalculator } from '../../calculator/define.ts';
import { ceilToPurchaseUnits } from '../../format/purchase.ts';
import { multiplyCount, usd } from '../../money/money.ts';
import { costOf, unitPrice } from '../../money/unit-price.ts';
import { Rational } from '../../rational/rational.ts';
import { ft, ft3, inch, yd3 } from '../../units/catalog.ts';
import { multiply, ratio, scale } from '../../units/ops.ts';
import { quantity } from '../../units/quantity.ts';
import { lengthInput } from '../../calculator/kinds/length.ts';
import { moneyInput } from '../../calculator/kinds/money.ts';
import { percentInput } from '../../calculator/kinds/percent.ts';
import { selectInput } from '../../calculator/kinds/select.ts';

const HUNDRED = Rational.of(100);

/** The bag sizes in cubic feet, in the order the select offers them (`1-5` is 1.5 cu ft). */
const BAG_SIZES = ['1-5', '2', '3'] as const;

type BagSize = (typeof BAG_SIZES)[number];

/** A bag holds what its label says: a `2` bag is 2 cubic feet. No material data is involved. */
const BAG_VOLUME = {
  '1-5': quantity(Rational.of(3, 2), ft3),
  '2': quantity(2, ft3),
  '3': quantity(3, ft3),
} as const satisfies Record<BagSize, unknown>;

/**
 * The mulch calculator (calc-mulch): the volume of a bed at a depth with an extra allowance, the
 * whole bags it takes and optional costs by the bag and in bulk. Exact arithmetic throughout; the
 * bag count is the only rounding.
 */
export const mulch = defineCalculator({
  id: 'mulch',
  inputs: [
    lengthInput({
      key: 'length',
      urlKey: 'l',
      default: quantity(240, inch),
      defaultUnit: 'ft',
      metricDefaultUnit: 'm',
      min: quantity(0, inch),
      max: quantity(1000, ft),
    }),
    lengthInput({
      key: 'width',
      urlKey: 'w',
      default: quantity(48, inch),
      defaultUnit: 'ft',
      metricDefaultUnit: 'm',
      min: quantity(0, inch),
      max: quantity(1000, ft),
    }),
    lengthInput({
      key: 'depth',
      urlKey: 'd',
      default: quantity(3, inch),
      defaultUnit: 'in',
      metricDefaultUnit: 'cm',
      min: quantity(0, inch),
      max: quantity(2, ft),
    }),
    percentInput({
      key: 'waste',
      urlKey: 'ws',
      default: Rational.of(5),
      min: Rational.ZERO,
      max: Rational.of(50),
    }),
    selectInput({ key: 'bag', urlKey: 'bg', default: '2', options: BAG_SIZES }),
    moneyInput({ key: 'bagPrice', urlKey: 'bp', default: usd(0), max: usd(10000) }),
    moneyInput({ key: 'yardPrice', urlKey: 'yp', default: usd(0), max: usd(10000) }),
  ],
  outputs: [
    {
      key: 'volumeYd3',
      measure: 'volume',
      role: 'primary',
      display: { unit: 'yd3', format: 'decimal', places: 2 },
    },
    {
      key: 'volumeFt3',
      measure: 'volume',
      role: 'secondary',
      display: { unit: 'ft3', format: 'decimal', places: 2 },
    },
    {
      key: 'volumeM3',
      measure: 'volume',
      role: 'secondary',
      display: { unit: 'm3', format: 'decimal', places: 2 },
    },
    {
      key: 'netVolume',
      measure: 'volume',
      role: 'intermediate',
      display: { unit: 'ft3', format: 'decimal', places: 2 },
    },
    { key: 'bagCost', measure: 'money', role: 'secondary' },
    { key: 'bulkCost', measure: 'money', role: 'secondary' },
  ],
  compute: ({ length, width, depth, waste, bag, bagPrice, yardPrice }) => {
    const net = multiply(multiply(length, width), depth);
    const total = scale(net, Rational.ONE.add(waste.div(HUNDRED)));
    // whole bags only: the ceiling of the total over the bag volume is the only rounding
    const qty = ceilToPurchaseUnits(ratio(total, BAG_VOLUME[bag]));
    return {
      outputs: {
        volumeYd3: total,
        volumeFt3: total,
        volumeM3: total,
        netVolume: net,
        bagCost: multiplyCount(bagPrice, qty),
        bulkCost: costOf(unitPrice(yardPrice, yd3), total),
      },
      shopping: [{ materialId: 'mulch', purchaseUnit: `bag-${bag}`, qty }],
      warnings: [],
    };
  },
});
