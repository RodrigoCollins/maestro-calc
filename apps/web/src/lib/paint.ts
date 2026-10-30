import { createPaint } from '@maestro-calc/core/calculators/paint';
import { PAINT_COVERAGE } from '@maestro-calc/data/yields/paint';

/**
 * The paint calculator of the site: core's factory with the coverage of the data package's
 * numbers-only module, so a client bundle that imports this module carries no source metadata.
 */
export const paint = createPaint(PAINT_COVERAGE);
