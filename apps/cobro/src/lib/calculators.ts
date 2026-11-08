import type { TradeId } from '../routes.ts';
import { cleaningQuote } from './cleaning.ts';
import { concreteQuote } from './concrete.ts';
import { drywallQuote } from './drywall.ts';
import { landscapingQuote } from './landscaping.ts';
import { paintingQuote } from './painting.ts';

/** The quote calculator of each trade: the build-time registry (a page script imports its own trade only). */
export const CALCULATORS = {
  cleaning: cleaningQuote,
  painting: paintingQuote,
  drywall: drywallQuote,
  concrete: concreteQuote,
  landscaping: landscapingQuote,
} as const satisfies Record<TradeId, unknown>;
