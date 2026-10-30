import { defineCalculator } from '../../calculator/define.ts';
import { Rational } from '../../rational/rational.ts';
import { ft, inch } from '../../units/catalog.ts';
import { add, scale, sign, sub } from '../../units/ops.ts';
import { quantity } from '../../units/quantity.ts';

/** The operations, in the order the select offers them. */
const OPERATIONS = ['add', 'subtract', 'multiply', 'divide'] as const;

/**
 * The feet and inches calculator (calc-feet-inches): two tape measurements added or subtracted, or
 * one multiplied or divided by a whole number, as a contractor's calculator does it. Exact
 * arithmetic; the page rounds the feet-and-inches figure to the nearest 1/16 in. A subtraction
 * whose second length is the longer gives the difference and warns `secondLonger`.
 */
export const feetInches = defineCalculator({
  id: 'feet-inches',
  inputs: [
    {
      kind: 'length',
      key: 'first',
      urlKey: 'a',
      default: quantity(150, inch),
      defaultUnit: 'ft',
      metricDefaultUnit: 'm',
      min: quantity(0, inch),
      max: quantity(1000, ft),
    },
    { kind: 'select', key: 'operation', urlKey: 'o', default: 'add', options: OPERATIONS },
    {
      kind: 'length',
      key: 'second',
      urlKey: 'b',
      default: quantity(Rational.of(177, 4), inch),
      defaultUnit: 'ft',
      metricDefaultUnit: 'm',
      min: quantity(0, inch),
      max: quantity(1000, ft),
    },
    { kind: 'count', key: 'factor', urlKey: 'n', default: 2, min: 1, max: 1000 },
  ],
  outputs: [
    {
      key: 'result',
      measure: 'length',
      role: 'primary',
      display: { unit: 'ft', format: 'fraction', denominator: 16 },
    },
    {
      key: 'resultIn',
      measure: 'length',
      role: 'secondary',
      display: { unit: 'in', format: 'decimal', places: 2 },
    },
    {
      key: 'resultM',
      measure: 'length',
      role: 'secondary',
      display: { unit: 'm', format: 'decimal', places: 3 },
    },
  ],
  warnings: ['secondLonger'],
  compute: ({ first, operation, second, factor }) => {
    const n = Rational.of(factor);
    const difference = sub(first, second);
    const longer = operation === 'subtract' && sign(difference) === -1;
    const result = {
      add: add(first, second),
      subtract: longer ? sub(second, first) : difference,
      multiply: scale(first, n),
      divide: scale(first, n.inv()),
    }[operation];
    return {
      outputs: { result, resultIn: result, resultM: result },
      shopping: [],
      warnings: longer ? [{ code: 'secondLonger' as const, params: {} }] : [],
    };
  },
});
