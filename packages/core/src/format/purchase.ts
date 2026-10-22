import { CoreError } from '../errors.ts';
import type { Rational } from '../rational/rational.ts';

/**
 * The smallest whole number of purchase units that covers `quantity`. Exact integers map to
 * themselves; a negative quantity throws `NEGATIVE_QUANTITY`. This is the only rounding allowed
 * on a purchase quantity.
 */
export const ceilToPurchaseUnits = (quantity: Rational): bigint => {
  if (quantity.sign() === -1) throw new CoreError('NEGATIVE_QUANTITY');
  return quantity.ceil();
};
