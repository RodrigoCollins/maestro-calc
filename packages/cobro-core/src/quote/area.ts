import { ft2, valueIn, type Quantity, type Rational } from '@maestro-calc/core';

/** An area as a plain number of square feet, the unit the price per area is written in. */
export const areaInFt2 = (area: Quantity<'area'>): Rational => valueIn(area, ft2);
