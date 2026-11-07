import { defineCalculator, moneyInput, multiply, usd } from '@maestro-calc/core';
import type { createConcrete } from '@maestro-calc/core/calculators/concrete';
import { laborInputs, laborOutputs, markupInputs, quoteOutputs } from '../quote/fields.ts';
import { areaInFt2 } from '../quote/area.ts';
import { laborOf, quoteFigures, quoteOf } from '../quote/quote.ts';
import { unitsOf } from '../quote/units.ts';

/** The concrete calculator of Maestro Calc, built by the composition root with its bag yields. */
export type Concrete = ReturnType<typeof createConcrete>;

/**
 * The concrete quote: a slab worked out by the Maestro Calc concrete calculator (its waste
 * allowance, its whole bags), priced at the user's price per bag, plus labor by the hour or by the
 * square foot poured, overhead and profit. Footings, columns and steps stay on the Maestro Calc
 * page.
 */
export const createConcreteQuote = (concrete: Concrete) => {
  const slab = concrete.validate({ shape: 'slab' });
  if (!slab.ok) throw new Error('the concrete calculator must read its slab defaults');
  const { 1: length, 2: width, 3: thickness, 13: waste, 14: bag } = concrete.inputs;
  return defineCalculator({
    id: 'concrete-quote',
    inputs: [
      length,
      width,
      thickness,
      waste,
      bag,
      moneyInput({ key: 'bagPrice', urlKey: 'bp', default: usd(6), max: usd(10_000) }),
      ...laborInputs,
      ...markupInputs,
    ],
    outputs: [...quoteOutputs, ...laborOutputs],
    warnings: [],
    compute: (inputs) => {
      const job = concrete.compute({ ...slab.value, ...inputs, shape: 'slab' });
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
          units: unitsOf(job.shopping, 'concrete-mix'),
          area,
        },
        shopping: job.shopping,
        warnings: [],
      };
    },
  });
};
