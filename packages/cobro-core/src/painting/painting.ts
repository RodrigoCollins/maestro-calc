import { defineCalculator, moneyInput, usd } from '@maestro-calc/core';
import type { createPaint } from '@maestro-calc/core/calculators/paint';
import { laborInputs, laborOutputs, markupInputs, quoteOutputs } from '../quote/fields.ts';
import { laborOf, quoteFigures, quoteOf } from '../quote/quote.ts';
import { unitsOf } from '../quote/units.ts';
import { areaInFt2 } from '../quote/area.ts';

/** The paint calculator of Maestro Calc, built by the composition root with its sourced coverage. */
export type Paint = ReturnType<typeof createPaint>;

/**
 * The painting quote: the walls of a room worked out by the Maestro Calc paint calculator (its
 * coverage, its doors and windows, its whole cans), priced at the user's gallon price, plus labor
 * by the hour or by the square foot of wall, overhead and profit.
 */
export const createPaintingQuote = (paint: Paint) => {
  const [length, width, height, doors, windows, coats] = paint.inputs;
  return defineCalculator({
    id: 'painting-quote',
    inputs: [
      length,
      width,
      height,
      doors,
      windows,
      coats,
      moneyInput({ key: 'gallonPrice', urlKey: 'gp', default: usd(40), max: usd(10_000) }),
      ...laborInputs,
      ...markupInputs,
    ],
    outputs: [...quoteOutputs, ...laborOutputs],
    warnings: [],
    compute: (inputs) => {
      const job = paint.compute(inputs);
      const area = job.outputs.paintArea;
      const quote = quoteOf({
        labor: laborOf({
          by: inputs.laborBy,
          hours: inputs.hours,
          crew: inputs.crew,
          rate: inputs.rate,
          area: areaInFt2(area),
          areaRate: inputs.areaRate,
        }),
        materials: job.outputs.cost,
        overheadPercent: inputs.overhead,
        profitPercent: inputs.profit,
      });
      return {
        outputs: {
          ...quoteFigures(quote),
          units: unitsOf(job.shopping, 'paint'),
          area,
        },
        shopping: job.shopping,
        warnings: [],
      };
    },
  });
};
