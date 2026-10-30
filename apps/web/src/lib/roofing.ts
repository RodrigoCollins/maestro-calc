import { createRoofing } from '@maestro-calc/core/calculators/roofing';
import { ROOFING_COVERAGE } from '@maestro-calc/data/yields/roofing';

/**
 * The roofing calculator of the site: core's factory with the coverage of the data package's
 * numbers-only module, so a client bundle that imports this module carries no source metadata.
 */
export const roofing = createRoofing(ROOFING_COVERAGE);
