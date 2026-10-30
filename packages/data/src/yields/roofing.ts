import { ft, ft2, inch, quantity, Rational, type Quantity } from '@maestro-calc/core';

/**
 * What a bundle of architectural asphalt shingles covers, a third of a 100 ft² square (three bundles
 * a square), and the size of a roll of synthetic underlayment, 48 in by 250 ft (1,000 ft² before
 * laps), as the manufacturer states them. This module is the only one a client bundle needs, so it
 * holds numbers and nothing else: no text, no source, no link (the page and the methodology cite
 * the sources).
 */
export const ROOFING_COVERAGE: Readonly<{
  bundle: Quantity<'area'>;
  rollWidth: Quantity<'length'>;
  rollLength: Quantity<'length'>;
}> = Object.freeze({
  bundle: quantity(Rational.of(100, 3), ft2),
  rollWidth: quantity(48, inch),
  rollLength: quantity(250, ft),
});
