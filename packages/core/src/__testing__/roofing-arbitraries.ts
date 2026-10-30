import * as fc from 'fast-check';
import { Rational } from '../rational/rational.ts';
import { cents, inches } from './concrete-arbitraries.ts';

/** A validated state of the roofing calculator: the 6 inputs, each inside its range. */
export const roofingStateArb = fc.record({
  length: inches(12000),
  width: inches(12000),
  pitch: fc.integer({ min: 0, max: 24 }),
  waste: fc.integer({ min: 0, max: 500 }).map((tenths) => Rational.of(tenths, 10)),
  bundlePrice: cents,
  rollPrice: cents,
});
