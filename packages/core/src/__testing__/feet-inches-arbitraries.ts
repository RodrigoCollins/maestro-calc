import * as fc from 'fast-check';
import { inches } from './concrete-arbitraries.ts';

/** A validated state of the feet and inches calculator: the 4 inputs, each inside its range. */
export const feetInchesStateArb = fc.record({
  first: inches(12000),
  operation: fc.constantFrom('add', 'subtract', 'multiply', 'divide'),
  second: inches(12000),
  factor: fc.integer({ min: 1, max: 1000 }),
});
