import { createDrywall } from '@maestro-calc/core/calculators/drywall';
import { DRYWALL_FINISHING } from '@maestro-calc/data/yields/drywall';

/**
 * The drywall calculator of the site: core's factory with the finishing rates of the data
 * package's numbers-only module, so a client bundle that imports this module carries no source
 * metadata.
 */
export const drywall = createDrywall(DRYWALL_FINISHING);
