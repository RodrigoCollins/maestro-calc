import { describe, expect, it } from 'vitest';
import { Rational } from '../rational/rational.ts';
import {
  cm,
  cm2,
  cm3,
  findUnit,
  ft,
  ft2,
  ft3,
  gal,
  in2,
  in3,
  inch,
  kg,
  kgM3,
  lb,
  lbFt3,
  lbIn3,
  lbYd3,
  liter,
  m,
  m2,
  m3,
  mm,
  mm2,
  mm3,
  oz,
  ton,
  tonne,
  tonYd3,
  UNITS,
  yd,
  yd2,
  yd3,
} from './catalog.ts';
import type { DimensionName } from './dimension.ts';
import type { Unit } from './unit.ts';

// Literal factor table copied from the spec (units-quantities › Exact unit factors); the
// arithmetic is re-checked with bigint fractions, not derived from the catalog under test.
const TABLE = [
  ['length', inch, 'in', 1n, 1n],
  ['length', ft, 'ft', 12n, 1n],
  ['length', yd, 'yd', 36n, 1n],
  ['length', mm, 'mm', 5n, 127n],
  ['length', cm, 'cm', 50n, 127n],
  ['length', m, 'm', 5000n, 127n],
  ['area', in2, 'in2', 1n, 1n],
  ['area', ft2, 'ft2', 144n, 1n],
  ['area', yd2, 'yd2', 1296n, 1n],
  ['area', mm2, 'mm2', 25n, 16129n],
  ['area', cm2, 'cm2', 2500n, 16129n],
  ['area', m2, 'm2', 25000000n, 16129n],
  ['volume', in3, 'in3', 1n, 1n],
  ['volume', ft3, 'ft3', 1728n, 1n],
  ['volume', yd3, 'yd3', 46656n, 1n],
  ['volume', mm3, 'mm3', 125n, 2048383n],
  ['volume', cm3, 'cm3', 125000n, 2048383n],
  ['volume', m3, 'm3', 125000000000n, 2048383n],
  ['volume', gal, 'gal', 231n, 1n],
  ['volume', liter, 'L', 125000000n, 2048383n],
  ['mass', lb, 'lb', 1n, 1n],
  ['mass', oz, 'oz', 1n, 16n],
  ['mass', ton, 'ton', 2000n, 1n],
  ['mass', kg, 'kg', 100000000n, 45359237n],
  ['mass', tonne, 'tonne', 100000000000n, 45359237n],
  ['density', lbIn3, 'lb/in3', 1n, 1n],
  ['density', lbFt3, 'lb/ft3', 1n, 1728n],
  ['density', lbYd3, 'lb/yd3', 1n, 46656n],
  ['density', tonYd3, 'ton/yd3', 125n, 2916n],
  ['density', kgM3, 'kg/m3', 2048383n, 56699046250n],
] as const;

describe('the 30 units (units-quantities › Exact unit factors)', () => {
  it.each(TABLE.map(([dimension, unit, id, num, den]) => ({ id, dimension, unit, num, den })))(
    '$id ($dimension): id, dimension and exact factor',
    ({ dimension, unit, id, num, den }) => {
      expect(unit.id).toBe(id);
      expect(unit.dimension).toBe(dimension);
      expect(unit.factor).toEqual(Rational.of(num, den));
    },
  );

  // spec: units-quantities › Exact unit factors — 127^2 = 16129 and 127^3 = 2,048,383
  it('reduces every metric factor fully (127 is prime)', () => {
    expect([mm2.factor.den, mm3.factor.den]).toEqual([127n ** 2n, 127n ** 3n]);
    expect([m2.factor.num, m3.factor.num]).toEqual([5000n ** 2n, 5000n ** 3n]);
  });

  // spec: units-quantities › Table factor audit [UQ12a]
  it('has area factors equal to the square and volume factors to the cube of the length factor', () => {
    const lengths = [inch, ft, yd, mm, cm, m];
    const areas = [in2, ft2, yd2, mm2, cm2, m2];
    const volumes = [in3, ft3, yd3, mm3, cm3, m3];
    for (const [index, length] of lengths.entries()) {
      expect(areas[index]?.factor, areas[index]?.id).toEqual(length.factor.mul(length.factor));
      expect(volumes[index]?.factor, volumes[index]?.id).toEqual(
        length.factor.mul(length.factor).mul(length.factor),
      );
    }
  });

  // spec: units-quantities › Table factor audit [UQ12]: each density factor is the mass factor
  // divided by the volume factor of its pair
  it('has density factors equal to the mass factor over the volume factor', () => {
    const pairs = [
      [lbIn3, lb, in3],
      [lbFt3, lb, ft3],
      [lbYd3, lb, yd3],
      [tonYd3, ton, yd3],
      [kgM3, kg, m3],
    ] as const;
    for (const [density, mass, volume] of pairs) {
      expect(density.factor, density.id).toEqual(mass.factor.div(volume.factor));
    }
  });

  // spec: units-quantities › Exact unit factors — the US liquid gallon is exactly 231 in3 and the
  // liter exactly 1000 cm3 (NIST SP 811, Appendix B)
  it('defines the gallon as 231 cubic inches and the liter as 1000 cubic centimeters', () => {
    expect(gal.factor).toEqual(Rational.of(231));
    expect(liter.factor).toEqual(cm3.factor.mul(Rational.of(1000)));
    // a gallon is exactly 3.785411784 liters
    expect(gal.factor.div(liter.factor)).toEqual(Rational.of(3785411784n, 1000000000n));
  });

  // spec: units-quantities › Exact unit factors — 45,359,237 is coprime with 10^8 (reduced)
  it('keeps the kilogram exact through the 1959 pound (1 lb = 45359237/10^8 kg)', () => {
    expect(kg.factor.num * 45359237n).toBe(100000000n * kg.factor.den);
    expect(tonne.factor).toEqual(kg.factor.mul(Rational.of(1000)));
  });

  // spec: units-quantities › Dimension model — units are immutable; Table: 30 units
  it('freezes every unit', () => {
    const all: readonly Unit<DimensionName>[] = [
      ...UNITS.length,
      ...UNITS.area,
      ...UNITS.volume,
      ...UNITS.mass,
      ...UNITS.density,
    ];
    expect(all).toHaveLength(30);
    for (const unit of all) {
      expect(Object.isFrozen(unit), unit.id).toBe(true);
    }
  });
});

describe('the catalog is immutable (units-quantities › Dimension model)', () => {
  it('freezes the catalog and every list in it', () => {
    expect(Object.isFrozen(UNITS)).toBe(true);
    for (const [dimension, units] of Object.entries(UNITS)) {
      expect(Object.isFrozen(units), dimension).toBe(true);
    }
  });
});

describe('findUnit (units-quantities › Unit lookup by id)', () => {
  // spec: units-quantities › Known and unknown ids [UQ25a]
  it('resolves the exact id within its dimension', () => {
    expect(findUnit('length', 'ft')).toBe(ft);
    expect(findUnit('area', 'ft2')).toBe(ft2);
    expect(findUnit('volume', 'm3')).toBe(m3);
    expect(findUnit('length', 'in')).toBe(inch);
    expect(findUnit('mass', 'kg')).toBe(kg);
    expect(findUnit('density', 'lb/ft3')).toBe(lbFt3);
  });

  it('answers undefined for other cases, unknown ids and ids of another dimension', () => {
    expect(findUnit('length', 'FT')).toBeUndefined();
    expect(findUnit('length', 'furlong')).toBeUndefined();
    expect(findUnit('length', 'ft2')).toBeUndefined();
    expect(findUnit('area', 'ft')).toBeUndefined();
    expect(findUnit('length', '')).toBeUndefined();
    expect(findUnit('length', 'kg')).toBeUndefined();
  });

  // untyped input must not reach inherited properties such as `__proto__` or `constructor`
  it('answers undefined for a dimension that is not one of the five', () => {
    for (const name of ['__proto__', 'constructor', 'toString', 'hasOwnProperty', 'volumes']) {
      expect(findUnit(name as never, 'in'), name).toBeUndefined();
    }
  });

  // spec: units-quantities › Known and unknown ids — every table id resolves to its constant
  it('resolves every table row to its constant', () => {
    for (const [dimension, unit, id] of TABLE) {
      expect(findUnit(dimension, id), id).toBe(unit);
    }
  });
});
