import { lbYd3, quantity, type Quantity } from '@maestro-calc/core';

/**
 * The weight of a cubic yard of gravel, by how it is placed, as exact densities: compacted in place
 * (a driveway or a base) and loose (a landscape layer, and how the yard measures what it sells by
 * volume). This module is the only one a client bundle needs, so it holds numbers and nothing else:
 * no text, no source, no link (the page and the methodology cite the source).
 */
export const GRAVEL_DENSITIES: Readonly<Record<'compacted' | 'loose', Quantity<'density'>>> =
  Object.freeze({
    compacted: quantity(3660, lbYd3),
    loose: quantity(2580, lbYd3),
  });
