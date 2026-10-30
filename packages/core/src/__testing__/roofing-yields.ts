import { Rational } from '../rational/rational.ts';
import { ft, ft2, inch } from '../units/catalog.ts';
import { quantity, type Quantity } from '../units/quantity.ts';

/**
 * The coverage the core tests inject into `createRoofing`: a bundle of shingles covers a third of a
 * square (100/3 ft²), and a roll of underlayment is 48 in wide and 250 ft long. Core owns no
 * material constant; these are fixtures, and a web contract test keeps them equal to the data
 * package's module.
 */
export const ROOFING_COVERAGE: Readonly<{
  bundle: Quantity<'area'>;
  rollWidth: Quantity<'length'>;
  rollLength: Quantity<'length'>;
}> = {
  bundle: quantity(Rational.of(100, 3), ft2),
  rollWidth: quantity(48, inch),
  rollLength: quantity(250, ft),
};
