import { describe, expectTypeOf, it } from 'vitest';
import type { Rational } from '../rational/rational.ts';
import { ft2 } from './catalog.ts';
import { add, divide, multiply, ratio } from './ops.ts';
import { valueIn, type Quantity } from './quantity.ts';

declare const length: Quantity<'length'>;
declare const area: Quantity<'area'>;
declare const volume: Quantity<'volume'>;

const needsArea = (value: Quantity<'area'>): Quantity<'area'> => value;

describe('quantity types (units-quantities › Dimension model, Same-dimension arithmetic)', () => {
  // spec: units-quantities › Dimension in the type [UQ1]
  it('rejects a length where an area is expected', () => {
    needsArea(area);
    // @ts-expect-error a Quantity<'length'> is not a Quantity<'area'>
    needsArea(length);
  });

  // spec: units-quantities › Runtime dimension guard — a compile-time error for typed callers
  it('rejects mixed dimensions in add, ratio and valueIn', () => {
    expectTypeOf(add(length, length)).toEqualTypeOf<Quantity<'length'>>();
    // @ts-expect-error add(length, area)
    add(length, area);
    // @ts-expect-error ratio(length, area)
    ratio(length, area);
    expectTypeOf(ratio(area, area)).toEqualTypeOf<Rational>();
    // @ts-expect-error valueIn(length, ft2)
    valueIn(length, ft2);
  });

  // spec: units-quantities › Construction and conversion — the brand forbids literals
  it('does not accept an object literal as a quantity', () => {
    // @ts-expect-error the unique-symbol brand cannot be forged
    const forged: Quantity<'length'> = { exponents: { length: 1, mass: 0 }, canonical: undefined };
    expectTypeOf(forged).toEqualTypeOf<Quantity<'length'>>();
  });
});

describe('derived dimension types (units-quantities › Derived products and quotients)', () => {
  // spec: units-quantities › Length times length / Area times length
  it('derives products by adding exponent vectors', () => {
    expectTypeOf(multiply(length, length)).toEqualTypeOf<Quantity<'area'>>();
    expectTypeOf(multiply(area, length)).toEqualTypeOf<Quantity<'volume'>>();
    expectTypeOf(multiply(length, area)).toEqualTypeOf<Quantity<'volume'>>();
  });

  // spec: units-quantities › Inverse operation
  it('derives quotients by subtracting exponent vectors', () => {
    expectTypeOf(divide(volume, area)).toEqualTypeOf<Quantity<'length'>>();
    expectTypeOf(divide(area, length)).toEqualTypeOf<Quantity<'length'>>();
    expectTypeOf(divide(volume, length)).toEqualTypeOf<Quantity<'area'>>();
  });

  // spec: units-quantities › Unnamed product rejected [UQ24b]
  it('rejects products and quotients that name no dimension', () => {
    // @ts-expect-error area × area is length^4
    multiply(area, area);
    // @ts-expect-error length ÷ length is dimensionless
    divide(length, length);
    // @ts-expect-error volume × length is length^4
    multiply(volume, length);
  });
});
