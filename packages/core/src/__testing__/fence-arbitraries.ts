import * as fc from 'fast-check';
import { Rational } from '../rational/rational.ts';
import { inch } from '../units/catalog.ts';
import { quantity, type Quantity } from '../units/quantity.ts';
import { cents, inches } from './concrete-arbitraries.ts';

/** A length in inches between `min` and `max`, with a small denominator (halves up to eighths). */
const between = (min: number, max: number): fc.Arbitrary<Quantity<'length'>> =>
  fc
    .integer({ min: 1, max: 8 })
    .chain((den) =>
      fc
        .bigInt({ min: BigInt(min) * BigInt(den), max: BigInt(max) * BigInt(den) })
        .map((num) => quantity(Rational.of(num, BigInt(den)), inch)),
    );

/** A validated state of the fence calculator: the 15 inputs, each inside its range. */
export const fenceStateArb = fc.record({
  length: between(12, 60000),
  height: between(12, 144),
  spacing: between(12, 144),
  style: fc.constantFrom('privacy', 'picket', 'rail'),
  boardWidth: between(1, 12),
  gap: inches(12),
  boardSpace: inches(12),
  rails: fc.integer({ min: 1, max: 6 }),
  gates: fc.integer({ min: 0, max: 50 }),
  postWidth: between(1, 12),
  bag: fc.constantFrom('40', '60', '80'),
  postPrice: cents,
  railPrice: cents,
  boardPrice: cents,
  bagPrice: cents,
});
