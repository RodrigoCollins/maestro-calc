import { createPaintingQuote } from '@maestro-calc/cobro-core/painting';
import { createPaint } from '@maestro-calc/core/calculators/paint';
import { PAINT_COVERAGE } from '@maestro-calc/data/yields/paint';

/**
 * The painting quote of the site: the Maestro Calc paint calculator with the coverage of the data
 * package's numbers-only module, so a client bundle that imports this module carries no source
 * metadata.
 */
export const paintingQuote = createPaintingQuote(createPaint(PAINT_COVERAGE));
