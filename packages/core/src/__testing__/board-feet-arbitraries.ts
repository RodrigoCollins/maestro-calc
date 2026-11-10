import * as fc from 'fast-check';
import { cents, inches } from './concrete-arbitraries.ts';

/** A validated state of the board feet calculator: the 5 inputs, each inside its range. */
export const boardFeetStateArb = fc.record({
  thickness: inches(24),
  width: inches(48),
  length: inches(1200),
  pieces: fc.integer({ min: 1, max: 10000 }),
  price: cents,
});
