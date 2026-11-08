import {
  decimalInput,
  defineCalculator,
  ft2,
  moneyInput,
  quantity,
  Rational,
  usd,
} from '@maestro-calc/core';
import { laborInputs, laborOutputs, markupInputs, quoteOutputs } from '../quote/fields.ts';
import { laborOf, quoteFigures, quoteOf } from '../quote/quote.ts';

/**
 * The cleaning quote: the labor of the crew (hours of each cleaner, or the square feet of the
 * home at the user's own price), the supplies, and the overhead and profit on top. No quantity
 * of material is worked out: cleaning has none, so the supplies are the user's figure.
 */
export const cleaningQuote = defineCalculator({
  id: 'cleaning-quote',
  inputs: [
    decimalInput({
      key: 'area',
      urlKey: 'a',
      default: Rational.of(1500),
      max: Rational.of(1_000_000),
    }),
    ...laborInputs,
    moneyInput({ key: 'supplies', urlKey: 's', default: usd(20), max: usd(100_000) }),
    ...markupInputs,
  ],
  outputs: [...quoteOutputs, ...laborOutputs],
  warnings: [],
  compute: ({ area, laborBy, hours, crew, rate, areaRate, supplies, overhead, profit }) => {
    const labor = laborOf({ by: laborBy, hours, crew, rate, area, areaRate });
    const quote = quoteOf({
      labor,
      materials: supplies,
      overheadPercent: overhead,
      profitPercent: profit,
    });
    return {
      outputs: { ...quoteFigures(quote), units: Rational.ZERO, area: quantity(area, ft2) },
      shopping: [],
      warnings: [],
    };
  },
});
