import { ft2 } from '../units/catalog.ts';
import { quantity, type Quantity } from '../units/quantity.ts';

/**
 * The coverage the core tests inject into `createPaint`: 350 square feet per gallon per coat.
 * Core owns no coverage constant; this is a fixture, and a web contract test keeps it equal to the
 * data package's module.
 */
export const PAINT_COVERAGE: Readonly<{ perGallon: Quantity<'area'> }> = {
  perGallon: quantity(350, ft2),
};
