import { describe, expectTypeOf, it } from 'vitest';
import type { AddVec, Dimensions, NameOf, SubVec } from './dimension.ts';

describe('dimension type helpers (units-quantities › Derived products and quotients)', () => {
  // spec: units-quantities › Length times length / Area times length
  it('adds exponent vectors and maps the sum back to a name', () => {
    expectTypeOf<
      NameOf<AddVec<Dimensions['length'], Dimensions['length']>>
    >().toEqualTypeOf<'area'>();
    expectTypeOf<
      NameOf<AddVec<Dimensions['area'], Dimensions['length']>>
    >().toEqualTypeOf<'volume'>();
    expectTypeOf<
      NameOf<AddVec<Dimensions['volume'], Dimensions['density']>>
    >().toEqualTypeOf<'mass'>();
  });

  // spec: units-quantities › Inverse operation / Mass over volume
  it('subtracts exponent vectors and maps the difference back to a name', () => {
    expectTypeOf<
      NameOf<SubVec<Dimensions['volume'], Dimensions['area']>>
    >().toEqualTypeOf<'length'>();
    expectTypeOf<
      NameOf<SubVec<Dimensions['mass'], Dimensions['volume']>>
    >().toEqualTypeOf<'density'>();
    expectTypeOf<
      NameOf<SubVec<Dimensions['volume'], Dimensions['length']>>
    >().toEqualTypeOf<'area'>();
  });

  // spec: units-quantities › Unnamed product rejected — no name means never
  it('maps an unnamed vector to never', () => {
    expectTypeOf<NameOf<AddVec<Dimensions['area'], Dimensions['area']>>>().toBeNever();
    expectTypeOf<NameOf<AddVec<Dimensions['mass'], Dimensions['length']>>>().toBeNever();
    expectTypeOf<NameOf<AddVec<Dimensions['volume'], Dimensions['volume']>>>().toBeNever();
    expectTypeOf<NameOf<SubVec<Dimensions['length'], Dimensions['length']>>>().toBeNever();
  });
});
