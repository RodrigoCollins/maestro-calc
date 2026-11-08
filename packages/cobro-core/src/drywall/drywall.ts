import { defineCalculator, moneyInput, usd } from '@maestro-calc/core';
import type { createDrywall } from '@maestro-calc/core/calculators/drywall';
import { laborInputs, laborOutputs, markupInputs, quoteOutputs } from '../quote/fields.ts';
import { areaInFt2 } from '../quote/area.ts';
import { laborOf, quoteFigures, quoteOf } from '../quote/quote.ts';
import { unitsOf } from '../quote/units.ts';

/** The drywall calculator of Maestro Calc, built by the composition root with its sourced rates. */
export type Drywall = ReturnType<typeof createDrywall>;

/**
 * The drywall quote: the panels of a room worked out by the Maestro Calc drywall calculator (its
 * doors and windows, its waste, its whole sheets), priced at the user's price per sheet, plus labor
 * by the hour or by the square foot hung, overhead and profit. Joint compound and tape stay on the
 * Maestro Calc page: their price is the user's to add under the supplies.
 */
export const createDrywallQuote = (drywall: Drywall) => {
  const [length, width, height, doors, windows, surfaces, sheet, waste] = drywall.inputs;
  return defineCalculator({
    id: 'drywall-quote',
    inputs: [
      length,
      width,
      height,
      doors,
      windows,
      surfaces,
      sheet,
      waste,
      moneyInput({ key: 'sheetPrice', urlKey: 'sp', default: usd(15), max: usd(10_000) }),
      ...laborInputs,
      ...markupInputs,
    ],
    outputs: [...quoteOutputs, ...laborOutputs],
    warnings: [],
    compute: (inputs) => {
      const job = drywall.compute(inputs);
      const area = job.outputs.areaFt2;
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
          units: unitsOf(job.shopping, 'drywall'),
          area,
        },
        shopping: job.shopping,
        warnings: [],
      };
    },
  });
};
