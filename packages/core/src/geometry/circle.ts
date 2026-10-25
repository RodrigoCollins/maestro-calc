import { CoreError } from '../errors.ts';
import { multiply, scale } from '../units/ops.ts';
import type { Quantity } from '../units/quantity.ts';
import { PI } from './pi.ts';

/**
 * The area of a circle, `PI x radius x radius`, exact in canonical square inches with no
 * rounding. A negative radius fails `NEGATIVE_QUANTITY`; a zero radius gives a zero area.
 */
export const circleArea = (radius: Quantity<'length'>): Quantity<'area'> => {
  if (radius.canonical.sign() === -1) throw new CoreError('NEGATIVE_QUANTITY');
  return scale(multiply(radius, radius), PI);
};
