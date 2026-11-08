import { createLandscapingQuote } from '@maestro-calc/cobro-core/landscaping';
import { mulch } from '@maestro-calc/core/calculators/mulch';

/** The landscaping quote of the site: the Maestro Calc mulch calculator. */
export const landscapingQuote = createLandscapingQuote(mulch);
