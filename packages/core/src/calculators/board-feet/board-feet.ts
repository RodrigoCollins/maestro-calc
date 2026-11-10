import { defineCalculator } from '../../calculator/define.ts';
import { countInput } from '../../calculator/kinds/count.ts';
import { lengthInput } from '../../calculator/kinds/length.ts';
import { moneyInput } from '../../calculator/kinds/money.ts';
import { usd } from '../../money/money.ts';
import { costOf, unitPrice } from '../../money/unit-price.ts';
import { Rational } from '../../rational/rational.ts';
import { bdft, ft, inch } from '../../units/catalog.ts';
import { multiply, scale } from '../../units/ops.ts';
import { quantity } from '../../units/quantity.ts';

/**
 * The board feet calculator (calc-board-feet): the board measure of a piece of lumber,
 * `thickness (in) × width (in) × length (ft) ÷ 12` (DOC PS 20-20, 2.2 Board measure, which takes the
 * nominal sizes), times the pieces, and an optional cost at a price per board foot. A board foot is
 * 144 in³, so the board measure is the exact volume of the sizes typed, shown in board feet, cubic
 * feet and cubic meters; core never turns a nominal size into a dressed one, the page explains it.
 */
export const boardFeet = defineCalculator({
  id: 'board-feet',
  inputs: [
    lengthInput({
      key: 'thickness',
      urlKey: 't',
      default: quantity(2, inch),
      defaultUnit: 'in',
      metricDefaultUnit: 'cm',
      min: quantity(0, inch),
      max: quantity(24, inch),
    }),
    lengthInput({
      key: 'width',
      urlKey: 'w',
      default: quantity(4, inch),
      defaultUnit: 'in',
      metricDefaultUnit: 'cm',
      min: quantity(0, inch),
      max: quantity(48, inch),
    }),
    lengthInput({
      key: 'length',
      urlKey: 'l',
      default: quantity(96, inch),
      defaultUnit: 'ft',
      metricDefaultUnit: 'm',
      min: quantity(0, inch),
      max: quantity(100, ft),
    }),
    countInput({ key: 'pieces', urlKey: 'n', default: 1, min: 1, max: 10000 }),
    moneyInput({ key: 'price', urlKey: 'pp', default: usd(0), max: usd(10000) }),
  ],
  outputs: [
    {
      key: 'boardFeet',
      measure: 'volume',
      role: 'primary',
      display: { unit: 'bdft', format: 'decimal', places: 2 },
    },
    {
      key: 'boardFeetEach',
      measure: 'volume',
      role: 'secondary',
      display: { unit: 'bdft', format: 'decimal', places: 2 },
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
      display: { unit: 'm3', format: 'decimal', places: 3 },
    },
    { key: 'cost', measure: 'money', role: 'secondary' },
  ],
  compute: ({ thickness, width, length, pieces, price }) => {
    const each = multiply(multiply(thickness, width), length);
    const total = scale(each, Rational.of(pieces));
    return {
      outputs: {
        boardFeet: total,
        boardFeetEach: each,
        volumeFt3: total,
        volumeM3: total,
        cost: costOf(unitPrice(price, bdft), total),
      },
      shopping: [],
      warnings: [],
    };
  },
});
