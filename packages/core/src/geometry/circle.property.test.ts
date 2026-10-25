import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { numRuns } from '../__testing__/property-runs.ts';
import { Rational } from '../rational/rational.ts';
import { in2, inch } from '../units/catalog.ts';
import { quantity, valueIn } from '../units/quantity.ts';
import { circleArea } from './circle.ts';
import { PI } from './pi.ts';

const radiusArb = fc
  .tuple(fc.bigInt({ min: 0n, max: 10n ** 9n }), fc.bigInt({ min: 1n, max: 10n ** 6n }))
  .map(([n, d]) => Rational.of(n, d));

const areaOf = (radius: Rational): Rational => valueIn(circleArea(quantity(radius, inch)), in2);

describe('circleArea properties (core-geometry)', () => {
  // spec: core-geometry › [GEO5] Scaling and ratio properties
  it('scales with the square of the radius, exactly', () => {
    fc.assert(
      fc.property(radiusArb, (r) => {
        expect(areaOf(r.mul(Rational.of(2)))).toEqual(areaOf(r).mul(Rational.of(4)));
      }),
      { numRuns },
    );
  });

  // spec: core-geometry › [GEO5] Scaling and ratio properties
  it('has an area over r squared that is PI, between 3.1415 and 3.1416', () => {
    fc.assert(
      fc.property(radiusArb, (r) => {
        fc.pre(r.sign() === 1);
        const quotient = areaOf(r).div(r.mul(r));
        expect(quotient).toEqual(PI);
        expect(quotient.compare(Rational.of(31415, 10000))).toBe(1);
        expect(quotient.compare(Rational.of(31416, 10000))).toBe(-1);
      }),
      { numRuns },
    );
  });

  it('has a zero area only for a zero radius', () => {
    expect(areaOf(Rational.ZERO).isZero()).toBe(true);
    expect(areaOf(Rational.of(1, 10 ** 6)).isZero()).toBe(false);
  });
});
