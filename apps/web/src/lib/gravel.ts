import { createGravel } from '@maestro-calc/core/calculators/gravel';
import { GRAVEL_DENSITIES } from '@maestro-calc/data/yields/gravel';

/**
 * The gravel calculator of the site: core's factory with the densities of the data package's
 * numbers-only module, so a client bundle that imports this module carries no source metadata.
 */
export const gravel = createGravel(GRAVEL_DENSITIES);
