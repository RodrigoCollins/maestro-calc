import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { numRuns } from '../../__testing__/property-runs.ts';
import { Rational } from '../../rational/rational.ts';
import { ft2, inch, m2, yd2 } from '../../units/catalog.ts';
import { type Quantity, quantity, valueIn } from '../../units/quantity.ts';
import { rectangleArea } from './index.ts';

/** A length in inches between 0 and the 100000 ft maximum, with a small denominator (thirds, 127ths). */
const inches = fc
  .integer({ min: 1, max: 1000 })
  .chain((den) =>
    fc
      .bigInt({ min: 0n, max: 1_200_000n * BigInt(den) })
      .map((num) => quantity(Rational.of(num, BigInt(den)), inch)),
  );

const compute = (length: Quantity<'length'>, width: Quantity<'length'>) =>
  rectangleArea.compute({ length, width }).outputs;

describe('rectangle-area properties (calc-rectangle-area › Consistency properties)', () => {
  // spec: Properties hold [RA11]
  it('does not depend on the order of the sides', () => {
    fc.assert(
      fc.property(inches, inches, (length, width) => {
        expect(compute(length, width)).toEqual(compute(width, length));
      }),
      { numRuns },
    );
  });

  it('has 9 square feet to the square yard, exactly', () => {
    fc.assert(
      fc.property(inches, inches, (length, width) => {
        const { areaYd2, areaFt2 } = compute(length, width);
        expect(valueIn(areaYd2, yd2).mul(Rational.of(9))).toEqual(valueIn(areaFt2, ft2));
      }),
      { numRuns },
    );
  });

  it('has 381/1250 m per foot, so m2 is ft2 times (381/1250) squared', () => {
    fc.assert(
      fc.property(inches, inches, (length, width) => {
        const { areaM2, areaFt2 } = compute(length, width);
        const foot = Rational.of(381, 1250);
        expect(valueIn(areaM2, m2)).toEqual(valueIn(areaFt2, ft2).mul(foot).mul(foot));
      }),
      { numRuns },
    );
  });

  it('is never negative', () => {
    fc.assert(
      fc.property(inches, inches, (length, width) => {
        const { areaFt2 } = compute(length, width);
        expect(valueIn(areaFt2, ft2).sign()).toBeGreaterThanOrEqual(0);
      }),
      { numRuns },
    );
  });
});
