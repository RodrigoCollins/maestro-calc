import * as fc from 'fast-check';
import { usd } from '../money/money.ts';
import { Rational } from '../rational/rational.ts';
import { inch } from '../units/catalog.ts';
import { quantity, type Quantity } from '../units/quantity.ts';

/** A length in inches between 0 and `max`, with a small denominator (halves up to eighths). */
export const inches = (max: number): fc.Arbitrary<Quantity<'length'>> =>
  fc
    .integer({ min: 1, max: 8 })
    .chain((den) =>
      fc
        .bigInt({ min: 0n, max: BigInt(max) * BigInt(den) })
        .map((num) => quantity(Rational.of(num, BigInt(den)), inch)),
    );

/** A price in whole cents up to $10,000. */
export const cents = fc
  .integer({ min: 0, max: 1_000_000 })
  .map((value) => usd(Rational.of(value, 100)));

/** A validated state of the concrete calculator: the 17 inputs, each inside its range. */
export const concreteStateArb = fc.record({
  shape: fc.constantFrom('slab', 'footing', 'column', 'steps'),
  length: inches(12000),
  width: inches(12000),
  thickness: inches(120),
  footingWidth: inches(120),
  footingDepth: inches(120),
  diameter: inches(240),
  height: inches(1200),
  stepWidth: inches(1200),
  rise: inches(60),
  run: inches(60),
  stepCount: fc.integer({ min: 0, max: 50 }),
  count: fc.integer({ min: 1, max: 1000 }),
  waste: fc.integer({ min: 0, max: 500 }).map((tenths) => Rational.of(tenths, 10)),
  bag: fc.constantFrom('40', '60', '80'),
  bagPrice: cents,
  readyMixPrice: cents,
});
