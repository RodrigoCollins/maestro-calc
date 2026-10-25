import { ft3, quantity, Rational, type Quantity } from '@maestro-calc/core';

/**
 * The yield of one bag of concrete mix, as exact volumes keyed by purchase unit. This module is
 * the only one a client bundle needs, so it holds numbers and nothing else: no text, no source,
 * no link. The material record builds its purchase unit sizes from these same objects.
 */
export const CONCRETE_MIX_YIELDS: Readonly<
  Record<'bag-40' | 'bag-60' | 'bag-80', Quantity<'volume'>>
> = Object.freeze({
  'bag-40': quantity(Rational.of(3, 10), ft3),
  'bag-60': quantity(Rational.of(9, 20), ft3),
  'bag-80': quantity(Rational.of(3, 5), ft3),
});
