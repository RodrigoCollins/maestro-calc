import { Rational } from '../rational/rational.ts';
import { ft3 } from '../units/catalog.ts';
import { quantity, type Quantity } from '../units/quantity.ts';

/**
 * The bag yields the core tests inject into `createConcrete`: 0.30, 0.45 and 0.60 cubic feet for
 * the 40, 60 and 80 lb bag. Core owns no yield constant; these are fixtures, and a web contract
 * test (CC6) keeps them equal to the data package's record.
 */
export const CONCRETE_YIELDS: Readonly<Record<'40' | '60' | '80', Quantity<'volume'>>> = {
  '40': quantity(Rational.of(3, 10), ft3),
  '60': quantity(Rational.of(9, 20), ft3),
  '80': quantity(Rational.of(3, 5), ft3),
};
