import { describe, expect, it } from 'vitest';
import { thrownCode } from '../__testing__/thrown-code.ts';
import { Rational } from '../rational/rational.ts';
import { cm2, cm3, ft, ft2, ft3, inch, in2, in3, m, m2, mm, yd, yd3 } from './catalog.ts';
import { quantity, valueIn } from './quantity.ts';
import type { Unit } from './unit.ts';

const r = (n: bigint | number, d: bigint | number = 1): Rational => Rational.of(n, d);

describe('quantity construction (units-quantities › Dimension model)', () => {
  // spec: units-quantities › Runtime exponent vector [UQ2]
  it('carries the exponent vector of its unit for untyped callers', () => {
    expect(quantity(2, ft).exponents).toEqual({ length: 1, mass: 0 });
    expect(quantity(1, ft2).exponents).toEqual({ length: 2, mass: 0 });
    expect(quantity(1, yd3).exponents).toEqual({ length: 3, mass: 0 });
  });

  // spec: units-quantities › Construction and conversion — stored as canonical = value × factor
  it('stores the value in the canonical unit of its dimension', () => {
    expect(quantity(2, ft).canonical).toEqual(r(24));
    expect(quantity(r(1, 3), ft2).canonical).toEqual(r(48));
    expect(quantity(r(127, 5), mm).canonical).toEqual(r(127, 5).mul(r(5, 127)));
  });

  // spec: units-quantities › Construction and conversion — a Rational or a safe integer
  it('accepts a Rational or a safe integer number, and rejects other numbers', () => {
    expect(quantity(r(7, 2), inch).canonical).toEqual(r(7, 2));
    expect(quantity(3, inch).canonical).toEqual(r(3));
    expect(quantity(-4, inch).canonical).toEqual(r(-4));
    expect(thrownCode(() => quantity(1.5, inch))).toBe('NOT_AN_INTEGER');
  });

  // spec: units-quantities › Dimension model — quantities are immutable
  it('freezes quantities and their exponent vectors', () => {
    const value = quantity(1, ft);
    expect(Object.isFrozen(value)).toBe(true);
    expect(Object.isFrozen(value.exponents)).toBe(true);
  });
});

describe('conversion (units-quantities › Exact unit factors)', () => {
  // spec: units-quantities › Millimetre definition of the inch [UQ3]
  it('converts 25.4 mm to exactly 1 in', () => {
    expect(valueIn(quantity(r(127, 5), mm), inch)).toEqual(r(1));
  });

  // spec: units-quantities › Metre to feet [UQ4]
  it('converts 1 m to 1250/381 ft', () => {
    expect(valueIn(quantity(1, m), ft)).toEqual(r(1250, 381));
  });

  // spec: units-quantities › Foot to metre [UQ5]
  it('converts 1 ft to 381/1250 m', () => {
    expect(valueIn(quantity(1, ft), m)).toEqual(r(381, 1250));
  });

  // spec: units-quantities › Yard to metre [UQ6]
  it('converts 1 yd to 1143/1250 m', () => {
    expect(valueIn(quantity(1, yd), m)).toEqual(r(1143, 1250));
  });

  // spec: units-quantities › Cubic yard and cubic foot [UQ7]
  it('converts 1 yd3 to 27 ft3 and 1 ft3 to 1/27 yd3', () => {
    expect(valueIn(quantity(1, yd3), ft3)).toEqual(r(27));
    expect(valueIn(quantity(1, ft3), yd3)).toEqual(r(1, 27));
  });

  // spec: units-quantities › Square metre to square feet [UQ8]
  it('converts 1 m2 to 1562500/145161 ft2', () => {
    expect(valueIn(quantity(1, m2), ft2)).toEqual(r(1562500, 145161));
  });

  // spec: units-quantities › Round trip across yd3 and ft3 [UQ13]
  it('round trips 7/3 yd3 through 63 ft3', () => {
    const start = quantity(r(7, 3), yd3);
    const feet = valueIn(start, ft3);
    expect(feet).toEqual(r(63));
    expect(valueIn(quantity(feet, ft3), yd3)).toEqual(r(7, 3));
  });

  // spec: units-quantities › Exact thirds of a foot [UQ15] (the scale half arrives with ops)
  it('expresses 1/3 ft as exactly 4 in', () => {
    expect(valueIn(quantity(r(1, 3), ft), inch)).toEqual(r(4));
  });

  // spec: units-quantities › Round trip property, examples with negatives and zero [UQ14a]
  it('returns negatives and zero unchanged through their own unit', () => {
    expect(valueIn(quantity(r(-5, 3), cm3), cm3)).toEqual(r(-5, 3));
    expect(valueIn(quantity(0, cm2), cm2)).toEqual(r(0));
    expect(valueIn(quantity(0, cm2), in2)).toEqual(r(0));
  });

  // spec: units-quantities › Runtime dimension guard [UQ18] for valueIn
  it('throws DIMENSION_MISMATCH when the unit belongs to another dimension', () => {
    const lengthQuantity = quantity(1, ft);
    const areaUnitAsLength = ft2 as unknown as Unit<'length'>;
    expect(thrownCode(() => valueIn(lengthQuantity, areaUnitAsLength))).toBe('DIMENSION_MISMATCH');
    const volumeUnitAsArea = in3 as unknown as Unit<'area'>;
    expect(thrownCode(() => valueIn(quantity(1, ft2), volumeUnitAsArea))).toBe(
      'DIMENSION_MISMATCH',
    );
  });
});
