import { describe, expect, it } from 'vitest';
import { thrownCode } from '../__testing__/thrown-code.ts';
import { Rational } from '../rational/rational.ts';
import { ft, ft2, ft3, in2, in3, inch } from '../units/catalog.ts';
import { multiply } from '../units/ops.ts';
import { quantity, valueIn } from '../units/quantity.ts';
import { circleArea } from './circle.ts';
import { PI } from './pi.ts';

const times = (k: bigint | number, d: bigint | number = 1n): Rational => PI.mul(Rational.of(k, d));

describe('circleArea (core-geometry › Circle area)', () => {
  // spec: core-geometry › [GEO4] Table values
  it.each([
    ['0 in', quantity(0, inch), Rational.ZERO, Rational.ZERO],
    ['1 in', quantity(1, inch), PI, times(1, 144)],
    ['6 in', quantity(6, inch), times(36), times(1, 4)],
    ['1 ft', quantity(1, ft), times(144), PI],
    ['1/2 in', quantity(Rational.of(1, 2), inch), times(1, 4), times(1, 576)],
  ])('radius %s', (_name, radius, inSquareInches, inSquareFeet) => {
    const area = circleArea(radius);
    expect(valueIn(area, in2)).toEqual(inSquareInches);
    expect(valueIn(area, ft2)).toEqual(inSquareFeet);
  });

  // spec: core-geometry › [GEO6] Negative radius
  it('throws NEGATIVE_QUANTITY for a negative radius', () => {
    expect(thrownCode(() => circleArea(quantity(-1, inch)))).toBe('NEGATIVE_QUANTITY');
    expect(thrownCode(() => circleArea(quantity(Rational.of(-1, 1000), inch)))).toBe(
      'NEGATIVE_QUANTITY',
    );
  });

  // spec: core-geometry › [GEO7] Cylinder volume composes with the unit algebra
  it('composes with multiply into an exact cylinder volume', () => {
    const volume = multiply(circleArea(quantity(6, inch)), quantity(96, inch));
    expect(valueIn(volume, in3)).toEqual(times(3456));
    expect(valueIn(volume, ft3)).toEqual(times(2));
  });
});
