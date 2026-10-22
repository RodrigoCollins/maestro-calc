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
  inch,
  in2,
  in3,
  m,
  m2,
  m3,
  mm,
  mm2,
  mm3,
  UNITS,
  yd,
  yd2,
  yd3,
} from './catalog.ts';
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
] as const;

describe('length, area and volume units (units-quantities › Exact unit factors)', () => {
  it.each(TABLE)('%s unit %#: id, dimension and exact factor', (dimension, unit, id, num, den) => {
    expect(unit.id).toBe(id);
    expect(unit.dimension).toBe(dimension);
    expect(unit.factor).toEqual(Rational.of(num, den));
  });

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

  // spec: units-quantities › Dimension model — units are immutable
  it('freezes every unit', () => {
    const all: readonly Unit<'length' | 'area' | 'volume'>[] = [
      ...UNITS.length,
      ...UNITS.area,
      ...UNITS.volume,
    ];
    expect(all).toHaveLength(18);
    for (const unit of all) {
      expect(Object.isFrozen(unit), unit.id).toBe(true);
    }
  });
});

// Interim: mass and density rows arrive with the slice that adds them (tasks 5.2 and 5.3).
describe('catalog scope', () => {
  it('lists no mass or density unit yet', () => {
    expect(UNITS.mass).toEqual([]);
    expect(UNITS.density).toEqual([]);
  });
});

describe('findUnit (units-quantities › Unit lookup by id)', () => {
  // spec: units-quantities › Known and unknown ids [UQ25a]
  it('resolves the exact id within its dimension', () => {
    expect(findUnit('length', 'ft')).toBe(ft);
    expect(findUnit('area', 'ft2')).toBe(ft2);
    expect(findUnit('volume', 'm3')).toBe(m3);
    expect(findUnit('length', 'in')).toBe(inch);
  });

  it('answers undefined for other cases, unknown ids and ids of another dimension', () => {
    expect(findUnit('length', 'FT')).toBeUndefined();
    expect(findUnit('length', 'furlong')).toBeUndefined();
    expect(findUnit('length', 'ft2')).toBeUndefined();
    expect(findUnit('area', 'ft')).toBeUndefined();
    expect(findUnit('length', '')).toBeUndefined();
  });

  // spec: units-quantities › Known and unknown ids — every table id resolves to its constant
  it('resolves every table row to its constant', () => {
    for (const [dimension, unit, id] of TABLE) {
      expect(findUnit(dimension, id), id).toBe(unit);
    }
  });
});
