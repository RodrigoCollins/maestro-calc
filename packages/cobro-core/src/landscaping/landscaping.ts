import { defineCalculator, moneyInput, multiply, usd } from '@maestro-calc/core';
import type { mulch } from '@maestro-calc/core/calculators/mulch';
import { laborInputs, laborOutputs, markupInputs, quoteOutputs } from '../quote/fields.ts';
import { areaInFt2 } from '../quote/area.ts';
import { laborOf, quoteFigures, quoteOf } from '../quote/quote.ts';
import { unitsOf } from '../quote/units.ts';

/** The mulch calculator of Maestro Calc (it holds no injected data: a bag is the size on its label). */
export type Mulch = typeof mulch;

/**
 * The landscaping quote: a mulch bed worked out by the Maestro Calc mulch calculator (its depth, its
 * waste allowance, its whole bags), priced at the user's price per bag, plus labor by the hour or by
 * the square foot of bed, overhead and profit.
 */
export const createLandscapingQuote = (bed: Mulch) => {
  const [length, width, depth, waste, bag] = bed.inputs;
  return defineCalculator({
    id: 'landscaping-quote',
    inputs: [
      length,
      width,
      depth,
      waste,
      bag,
      moneyInput({ key: 'bagPrice', urlKey: 'bp', default: usd(5), max: usd(10_000) }),
      ...laborInputs,
      ...markupInputs,
    ],
    outputs: [...quoteOutputs, ...laborOutputs],
    warnings: [],
    compute: (inputs) => {
      const job = bed.compute({ ...inputs, yardPrice: usd(0) });
      const area = multiply(inputs.length, inputs.width);
      const quote = quoteOf({
        labor: laborOf({
          by: inputs.laborBy,
          hours: inputs.hours,
          crew: inputs.crew,
          rate: inputs.rate,
          area: areaInFt2(area),
          areaRate: inputs.areaRate,
        }),
        materials: job.outputs.bagCost,
        overheadPercent: inputs.overhead,
        profitPercent: inputs.profit,
      });
      return {
        outputs: {
          ...quoteFigures(quote),
          units: unitsOf(job.shopping, 'mulch'),
          area,
        },
        shopping: job.shopping,
        warnings: [],
      };
    },
  });
};
