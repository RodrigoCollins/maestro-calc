import { ft2, quantity, type Quantity } from '@maestro-calc/core';

/**
 * The area one gallon of interior latex paint covers in one coat, as an exact area: the low end of
 * the 350 to 400 square feet per gallon of a manufacturer's data sheet, so an estimate does not
 * come up short. This module is the only one a client bundle needs, so it holds numbers and nothing
 * else: no text, no source, no link (the page and the methodology cite the source).
 */
export const PAINT_COVERAGE: Readonly<{ perGallon: Quantity<'area'> }> = Object.freeze({
  perGallon: quantity(350, ft2),
});
