import * as fc from 'fast-check';
import { Rational } from '../rational/rational.ts';
import { cents, inches } from './concrete-arbitraries.ts';

/** A validated state of the drywall calculator: the 9 inputs, each inside its range. */
export const drywallStateArb = fc.record({
  length: inches(12000),
  width: inches(12000),
  height: inches(600),
  doors: fc.integer({ min: 0, max: 50 }),
  windows: fc.integer({ min: 0, max: 100 }),
  surfaces: fc.constantFrom('walls-ceiling', 'walls'),
  sheet: fc.constantFrom('4x8', '4x12'),
  waste: fc.integer({ min: 0, max: 500 }).map((tenths) => Rational.of(tenths, 10)),
  sheetPrice: cents,
});
