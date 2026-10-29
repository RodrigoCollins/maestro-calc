import { lbYd3 } from '../units/catalog.ts';
import { quantity, type Quantity } from '../units/quantity.ts';

/**
 * The densities the core tests inject into `createGravel`: 3,660 and 2,580 pounds per cubic yard
 * (1.83 and 1.29 short tons) for compacted and loose gravel. Core owns no density constant; these
 * are fixtures, and a web contract test keeps them equal to the data package's module.
 */
export const GRAVEL_DENSITIES: Readonly<Record<'compacted' | 'loose', Quantity<'density'>>> = {
  compacted: quantity(3660, lbYd3),
  loose: quantity(2580, lbYd3),
};
