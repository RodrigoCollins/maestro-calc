import { ft, ft2, gal } from '../units/catalog.ts';
import { quantity, type Quantity } from '../units/quantity.ts';

/**
 * The finishing rates the core tests inject into `createDrywall`: 9 gallons of joint compound and
 * 370 feet of joint tape per 1,000 square feet of panels. Core owns no material constant; these are
 * fixtures, and a web contract test keeps them equal to the data package's module.
 */
export const DRYWALL_FINISHING: Readonly<{
  per: Quantity<'area'>;
  compound: Quantity<'volume'>;
  tape: Quantity<'length'>;
}> = {
  per: quantity(1000, ft2),
  compound: quantity(9, gal),
  tape: quantity(370, ft),
};
