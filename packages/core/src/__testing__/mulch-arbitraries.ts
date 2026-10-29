import * as fc from 'fast-check';
import { Rational } from '../rational/rational.ts';
import { cents, inches } from './concrete-arbitraries.ts';

/** A validated state of the mulch calculator: the 7 inputs, each inside its range. */
export const mulchStateArb = fc.record({
  length: inches(12000),
  width: inches(12000),
  depth: inches(24),
  waste: fc.integer({ min: 0, max: 500 }).map((tenths) => Rational.of(tenths, 10)),
  bag: fc.constantFrom('2', '3'),
  bagPrice: cents,
  yardPrice: cents,
});
