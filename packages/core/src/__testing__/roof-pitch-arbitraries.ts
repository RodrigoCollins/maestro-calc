import * as fc from 'fast-check';
import { Rational } from '../rational/rational.ts';
import { inch } from '../units/catalog.ts';
import { quantity } from '../units/quantity.ts';
import { inches } from './concrete-arbitraries.ts';

/** A validated state of the roof pitch calculator: the 5 inputs, each inside its range. */
export const roofPitchStateArb = fc.record({
  rise: inches(1200),
  run: fc
    .integer({ min: 1, max: 19_200 })
    .map((sixteenths) => quantity(Rational.of(sixteenths, 16), inch)),
  rafterRun: inches(1200),
  overhang: inches(120),
  covering: fc.constantFrom('asphalt', 'tile', 'metal', 'roll', 'slate', 'wood'),
});
