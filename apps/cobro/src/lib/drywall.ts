import { createDrywallQuote } from '@maestro-calc/cobro-core/drywall';
import { createDrywall } from '@maestro-calc/core/calculators/drywall';
import { DRYWALL_FINISHING } from '@maestro-calc/data/yields/drywall';

/** The drywall quote of the site: the Maestro Calc drywall calculator with its sourced rates. */
export const drywallQuote = createDrywallQuote(createDrywall(DRYWALL_FINISHING));
