import * as fc from 'fast-check';
import { cents, inches } from './concrete-arbitraries.ts';

/** A validated state of the paint calculator: the 7 inputs, each inside its range. */
export const paintStateArb = fc.record({
  length: inches(12000),
  width: inches(12000),
  height: inches(600),
  doors: fc.integer({ min: 0, max: 50 }),
  windows: fc.integer({ min: 0, max: 100 }),
  coats: fc.integer({ min: 1, max: 5 }),
  gallonPrice: cents,
});
