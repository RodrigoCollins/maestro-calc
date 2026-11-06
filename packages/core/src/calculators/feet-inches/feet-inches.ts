import { defineCalculator } from '../../calculator/define.ts';
import { Rational } from '../../rational/rational.ts';
import { ft, inch } from '../../units/catalog.ts';
import { add, isZero, ratio, scale, sign, sub } from '../../units/ops.ts';
import { quantity } from '../../units/quantity.ts';
import { countInput } from '../../calculator/kinds/count.ts';
import { lengthInput } from '../../calculator/kinds/length.ts';
import { selectInput } from '../../calculator/kinds/select.ts';

/** The operations, in the order the select offers them; a new one is appended (the public URL contract). */
const OPERATIONS = ['add', 'subtract', 'multiply', 'divide', 'fit'] as const;

/**
 * The feet and inches calculator (calc-feet-inches): two tape measurements added or subtracted, or
 * one multiplied or divided by a whole number, as a contractor's calculator does it, or one length
 * divided by the other (`fit`: how many whole pieces of the second fit in the first, the length
 * left over as the result, and the exact quotient). Exact arithmetic; the page rounds the
 * feet-and-inches figure to the nearest 1/16 in. A subtraction whose second length is the longer
 * gives the difference and warns `secondLonger`; a fit of a zero length fits nothing, leaves the
 * whole first length and warns `zeroPiece`. `pieces` and `ratio` (the whole and the exact quotient
 * of the first by the second, zero for a zero second) are intermediate: the page writes them in
 * its answer, not as figures.
 */
export const feetInches = defineCalculator({
  id: 'feet-inches',
  inputs: [
    lengthInput({
      key: 'first',
      urlKey: 'a',
      default: quantity(150, inch),
      defaultUnit: 'ft',
      metricDefaultUnit: 'm',
      min: quantity(0, inch),
      max: quantity(1000, ft),
    }),
    selectInput({ key: 'operation', urlKey: 'o', default: 'add', options: OPERATIONS }),
    lengthInput({
      key: 'second',
      urlKey: 'b',
      default: quantity(Rational.of(177, 4), inch),
      defaultUnit: 'ft',
      metricDefaultUnit: 'm',
      min: quantity(0, inch),
      max: quantity(1000, ft),
    }),
    countInput({ key: 'factor', urlKey: 'n', default: 2, min: 1, max: 1000 }),
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
    { key: 'pieces', measure: 'number', role: 'intermediate' },
    { key: 'ratio', measure: 'number', role: 'intermediate' },
  ],
  warnings: ['secondLonger', 'zeroPiece'],
  compute: ({ first, operation, second, factor }) => {
    const n = Rational.of(factor);
    const difference = sub(first, second);
    const longer = operation === 'subtract' && sign(difference) === -1;
    const zero = isZero(second);
    const quotient = zero ? Rational.ZERO : ratio(first, second);
    const pieces = Rational.of(quotient.floor());
    const result = {
      add: add(first, second),
      subtract: longer ? sub(second, first) : difference,
      multiply: scale(first, n),
      divide: scale(first, n.inv()),
      fit: sub(first, scale(second, pieces)),
    }[operation];
    const code = longer ? 'secondLonger' : operation === 'fit' && zero ? 'zeroPiece' : undefined;
    return {
      outputs: { result, resultIn: result, resultM: result, pieces, ratio: quotient },
      shopping: [],
      warnings: code === undefined ? [] : [{ code, params: {} }],
    };
  },
});
