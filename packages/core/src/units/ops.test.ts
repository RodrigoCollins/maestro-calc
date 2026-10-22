import { describe, expect, it } from 'vitest';
import { thrownCode } from '../__testing__/thrown-code.ts';
import { Rational } from '../rational/rational.ts';
import {
  ft,
  ft2,
  ft3,
  inch,
  in2,
  in3,
  kgM3,
  lb,
  lbFt3,
  m,
  ton,
  tonYd3,
  yd2,
  yd3,
  kg,
} from './catalog.ts';
import {
  abs,
  add,
  compare,
  divide,
  divideScalar,
  equals,
  isZero,
  multiply,
  negate,
  ratio,
  scale,
  sign,
  sub,
} from './ops.ts';
import { quantity, valueIn, type Quantity } from './quantity.ts';

const r = (n: bigint | number, d: bigint | number = 1): Rational => Rational.of(n, d);

// Untyped callers: quantities of one dimension presented as another.
const asLength = (value: Quantity<'area'>): Quantity<'length'> =>
  value as unknown as Quantity<'length'>;
const length = quantity(1, ft);
const area = quantity(1, ft2);

describe('same-dimension arithmetic (units-quantities › Same-dimension arithmetic)', () => {
  // spec: units-quantities › Addition across units [UQ16]
  it('adds 1 ft and 6 in to 18 in, and subtracts them to 6 in', () => {
    expect(add(quantity(1, ft), quantity(6, inch))).toEqual(quantity(18, inch));
    expect(sub(quantity(1, ft), quantity(6, inch))).toEqual(quantity(6, inch));
    expect(sub(quantity(6, inch), quantity(1, ft))).toEqual(quantity(-6, inch));
  });

  // spec: units-quantities › Negative and zero [UQ17]
  it('takes the absolute value and the negation of -5/2 in', () => {
    const negative = quantity(r(-5, 2), inch);
    expect(abs(negative)).toEqual(quantity(r(5, 2), inch));
    expect(negate(negative)).toEqual(quantity(r(5, 2), inch));
    expect(abs(quantity(r(5, 2), inch))).toEqual(quantity(r(5, 2), inch));
    expect(negate(quantity(r(5, 2), inch))).toEqual(negative);
  });

  // spec: units-quantities › Negative and zero [UQ17]
  it('reports sign and zero, and equates zeros of different units', () => {
    expect([sign(quantity(r(-5, 2), inch)), sign(quantity(0, m)), sign(quantity(3, ft))]).toEqual([
      -1, 0, 1,
    ]);
    expect(isZero(quantity(0, m))).toBe(true);
    expect(isZero(quantity(r(1, 100), m))).toBe(false);
    expect(equals(quantity(0, m), quantity(0, ft))).toBe(true);
    expect(equals(quantity(1, ft), quantity(12, inch))).toBe(true);
    expect(equals(quantity(1, ft), quantity(11, inch))).toBe(false);
  });

  // spec: units-quantities › Same-dimension arithmetic — compare orders across units
  it('orders quantities across units', () => {
    expect(compare(quantity(1, ft), quantity(11, inch))).toBe(1);
    expect(compare(quantity(1, ft), quantity(12, inch))).toBe(0);
    expect(compare(quantity(1, ft), quantity(13, inch))).toBe(-1);
    expect(compare(quantity(-1, m), quantity(1, inch))).toBe(-1);
  });

  // spec: units-quantities › Exact thirds of a foot [UQ15]
  it('scales 1/3 ft by 3 to exactly 1 ft, and divides it back', () => {
    expect(scale(quantity(r(1, 3), ft), r(3))).toEqual(quantity(1, ft));
    expect(scale(quantity(1, ft), r(-1, 2))).toEqual(quantity(-6, inch));
    expect(divideScalar(quantity(1, ft), r(3))).toEqual(quantity(r(1, 3), ft));
    expect(divideScalar(quantity(2, ft), r(-4))).toEqual(quantity(-6, inch));
  });

  // spec: units-quantities › Same-dimension arithmetic — division by zero fails DIVISION_BY_ZERO
  it('fails DIVISION_BY_ZERO for a zero scalar divisor or a zero ratio divisor', () => {
    expect(thrownCode(() => divideScalar(quantity(1, ft), Rational.ZERO))).toBe('DIVISION_BY_ZERO');
    expect(thrownCode(() => ratio(quantity(1, ft), quantity(0, m)))).toBe('DIVISION_BY_ZERO');
  });

  // spec: units-quantities › Same-dimension arithmetic — ratio is a plain Rational
  it('returns the same-dimension quotient as a plain Rational', () => {
    expect(ratio(quantity(1, ft), quantity(6, inch))).toEqual(r(2));
    expect(ratio(quantity(6, inch), quantity(1, ft))).toEqual(r(1, 2));
    expect(ratio(quantity(1, m), quantity(1, ft))).toEqual(r(1250, 381));
    expect(ratio(quantity(0, m), quantity(1, ft))).toEqual(Rational.ZERO);
  });

  // spec: units-quantities › Runtime dimension guard [UQ18]
  it('throws DIMENSION_MISMATCH when an untyped caller mixes a length and an area', () => {
    const mixed = asLength(area);
    expect(thrownCode(() => add(length, mixed))).toBe('DIMENSION_MISMATCH');
    expect(thrownCode(() => sub(length, mixed))).toBe('DIMENSION_MISMATCH');
    expect(thrownCode(() => compare(length, mixed))).toBe('DIMENSION_MISMATCH');
    expect(thrownCode(() => equals(length, mixed))).toBe('DIMENSION_MISMATCH');
    expect(thrownCode(() => ratio(length, mixed))).toBe('DIMENSION_MISMATCH');
  });

  it('keeps the dimension of a result', () => {
    expect(add(area, area).exponents).toEqual({ length: 2, mass: 0 });
    expect(scale(area, r(2)).exponents).toEqual({ length: 2, mass: 0 });
  });
});

describe('derived products and quotients (units-quantities › Derived products and quotients)', () => {
  // spec: units-quantities › Length times length [UQ19]
  it('multiplies 120 in by 150 in into 18000 in2 = 125 ft2 = 125/9 yd2', () => {
    const product = multiply(quantity(120, inch), quantity(150, inch));
    expect(product).toEqual(quantity(18000, in2));
    expect(valueIn(product, ft2)).toEqual(r(125));
    expect(valueIn(product, yd2)).toEqual(r(125, 9));
  });

  // spec: units-quantities › Length times length [UQ19], from 10 ft and 12 ft 6 in
  it('multiplies 10 ft by 12 ft 6 in', () => {
    const width = add(quantity(12, ft), quantity(6, inch));
    expect(multiply(quantity(10, ft), width)).toEqual(quantity(18000, in2));
  });

  // spec: units-quantities › Area times length [UQ20]
  it('multiplies 18000 in2 by 24 in into 432000 in3 = 250 ft3, in either order', () => {
    const base = quantity(18000, in2);
    const volume = multiply(base, quantity(2, ft));
    expect(volume).toEqual(quantity(432000, in3));
    expect(valueIn(volume, ft3)).toEqual(r(250));
    expect(multiply(quantity(2, ft), base)).toEqual(volume);
  });

  // spec: units-quantities › Inverse operation [UQ21]
  it('divides 432000 in3 by 18000 in2 into 24 in, and by 24 in into 18000 in2', () => {
    const volume = quantity(432000, in3);
    expect(divide(volume, quantity(18000, in2))).toEqual(quantity(24, inch));
    expect(divide(volume, quantity(24, inch))).toEqual(quantity(18000, in2));
    expect(divide(quantity(18000, in2), quantity(120, inch))).toEqual(quantity(150, inch));
  });

  // spec: units-quantities › Division by zero quantity [UQ23]
  it('fails DIVISION_BY_ZERO when dividing by a zero quantity', () => {
    expect(thrownCode(() => divide(quantity(1, ft2), quantity(0, inch)))).toBe('DIVISION_BY_ZERO');
  });

  // spec: units-quantities › Unnamed product rejected [UQ24a]
  it('throws DIMENSION_MISMATCH for an unnamed product or quotient at runtime', () => {
    // @ts-expect-error area × area has no named dimension (length 4)
    expect(thrownCode(() => multiply(area, area))).toBe('DIMENSION_MISMATCH');
    // @ts-expect-error length ÷ length is dimensionless; use ratio
    expect(thrownCode(() => divide(length, length))).toBe('DIMENSION_MISMATCH');
  });

  // spec: units-quantities › Unnamed product rejected [UQ24c] and Runtime dimension guard [UQ18b]
  it('throws DIMENSION_MISMATCH for mass against length at runtime', () => {
    const mass = quantity(1, lb);
    // @ts-expect-error mass × length has no named dimension
    expect(thrownCode(() => multiply(mass, length))).toBe('DIMENSION_MISMATCH');
    // @ts-expect-error a mass is not a length
    expect(thrownCode(() => compare(mass, length))).toBe('DIMENSION_MISMATCH');
  });

  // spec: units-quantities › Density as a derived dimension [UQ10]
  it('turns 1.4 ton/yd3 into 2800/27 lb/ft3 and, times 3 yd3, into 8400 lb = 21/5 ton', () => {
    const density = quantity(r(7, 5), tonYd3);
    expect(valueIn(density, lbFt3)).toEqual(r(2800, 27));
    const volume = quantity(3, yd3);
    const mass = multiply(density, volume);
    expect(mass).toEqual(quantity(8400, lb));
    expect(valueIn(mass, ton)).toEqual(r(21, 5));
    expect(multiply(volume, density)).toEqual(mass);
  });

  // spec: units-quantities › Metric density [UQ11]
  it('converts 1000 kg/m3 to 14158423296/226796185 lb/ft3', () => {
    expect(valueIn(quantity(1000, kgM3), lbFt3)).toEqual(r(14158423296, 226796185));
  });

  // spec: units-quantities › Mass over volume [UQ22]
  it('divides 8400 lb by 3 yd3 into 2800/27 lb/ft3, and a mass by a density into 3 yd3', () => {
    const mass = quantity(8400, lb);
    const volume = quantity(3, yd3);
    const density = divide(mass, volume);
    expect(density.exponents).toEqual({ length: -3, mass: 1 });
    expect(valueIn(density, lbFt3)).toEqual(r(2800, 27));
    expect(equals(density, quantity(r(2800, 27), lbFt3))).toBe(true);
    expect(divide(mass, density)).toEqual(volume);
  });

  it('compares masses across units', () => {
    expect(compare(quantity(1, kg), quantity(2, lb))).toBe(1);
    expect(compare(quantity(1, kg), quantity(r(23, 10), lb))).toBe(-1);
    expect(compare(quantity(1, lb), quantity(r(45359237, 100000000), kg))).toBe(0);
  });

  it('checks the dimension before the zero divisor', () => {
    // @ts-expect-error unnamed quotient with a zero divisor
    expect(thrownCode(() => divide(area, quantity(0, in2)))).toBe('DIMENSION_MISMATCH');
  });
});
