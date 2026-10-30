import { ft, ft2, gal, quantity, type Quantity } from '@maestro-calc/core';

/**
 * The joint compound and the paper tape a finished area of gypsum panels takes, per 1,000 square
 * feet: 9 gallons of ready-mixed compound (two 4.5-gallon pails) and 370 feet of tape, as the
 * manufacturer states them. This module is the only one a client bundle needs, so it holds numbers
 * and nothing else: no text, no source, no link (the page and the methodology cite the sources).
 */
export const DRYWALL_FINISHING: Readonly<{
  per: Quantity<'area'>;
  compound: Quantity<'volume'>;
  tape: Quantity<'length'>;
}> = Object.freeze({
  per: quantity(1000, ft2),
  compound: quantity(9, gal),
  tape: quantity(370, ft),
});
