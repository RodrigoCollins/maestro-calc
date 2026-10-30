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

  // a length over a length is a plain ratio; only the angle base names an angle
  it('names the angle by its own base', () => {
    expectTypeOf<NameOf<{ length: 0; mass: 0; angle: 1 }>>().toEqualTypeOf<'angle'>();
    expectTypeOf<NameOf<SubVec<Dimensions['angle'], Dimensions['angle']>>>().toBeNever();
  });

  // Exponents are tracked within -6..6; beyond that the result is the wide `number`, which can
  // never be mistaken for a named dimension.
  it('turns an exponent outside -6..6 into number, which names nothing', () => {
    interface Six {
      length: 6;
      mass: 0;
      angle: 0;
    }
    interface MinusSix {
      length: -6;
      mass: 0;
      angle: 0;
    }
    type One = Dimensions['length'];
    expectTypeOf<AddVec<Six, One>['length']>().toEqualTypeOf<number>();
    expectTypeOf<NameOf<AddVec<Six, One>>>().toBeNever();
    expectTypeOf<SubVec<MinusSix, One>['length']>().toEqualTypeOf<number>();
    expectTypeOf<NameOf<SubVec<MinusSix, One>>>().toBeNever();
    expectTypeOf<AddVec<{ length: 5; mass: 0; angle: 0 }, One>['length']>().toEqualTypeOf<6>();
    expectTypeOf<
      AddVec<{ length: 0; mass: 0; angle: 0 }, MinusSix>['length']
    >().toEqualTypeOf<-6>();
  });
});
