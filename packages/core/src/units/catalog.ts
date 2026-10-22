import { Rational } from '../rational/rational.ts';
import type { DimensionName } from './dimension.ts';
import type { Unit, UnitIdOf } from './unit.ts';

const defineUnit = <D extends DimensionName>(
  dimension: D,
  id: UnitIdOf<D>,
  factor: Rational,
): Unit<D> => Object.freeze({ id, dimension, factor });

const squared = (length: Unit<'length'>, id: UnitIdOf<'area'>): Unit<'area'> =>
  defineUnit('area', id, length.factor.mul(length.factor));

const cubed = (length: Unit<'length'>, id: UnitIdOf<'volume'>): Unit<'volume'> =>
  defineUnit('volume', id, length.factor.mul(length.factor).mul(length.factor));

// Canonical unit: the international inch, exactly 25.4 mm (1959 agreement; NIST SP 811).
/** The inch (`in` is a reserved word). */
export const inch = defineUnit('length', 'in', Rational.ONE);
export const ft = defineUnit('length', 'ft', Rational.of(12));
export const yd = defineUnit('length', 'yd', Rational.of(36));
export const mm = defineUnit('length', 'mm', Rational.of(5, 127));
export const cm = defineUnit('length', 'cm', Rational.of(50, 127));
export const m = defineUnit('length', 'm', Rational.of(5000, 127));

// Area and volume factors are the square and the cube of the length factor.
export const in2 = squared(inch, 'in2');
export const ft2 = squared(ft, 'ft2');
export const yd2 = squared(yd, 'yd2');
export const mm2 = squared(mm, 'mm2');
export const cm2 = squared(cm, 'cm2');
export const m2 = squared(m, 'm2');

export const in3 = cubed(inch, 'in3');
export const ft3 = cubed(ft, 'ft3');
export const yd3 = cubed(yd, 'yd3');
export const mm3 = cubed(mm, 'mm3');
export const cm3 = cubed(cm, 'cm3');
export const m3 = cubed(m, 'm3');

// Canonical mass unit: the avoirdupois pound, exactly 45359237/10^8 kg (1959 agreement; NIST SP 811).
// An ounce is 1/16 lb and a US short ton is 2000 lb; a tonne is 1000 kg. Written as fractions of
// integers: 1 kg = 10^8 / 45359237 lb.
export const lb = defineUnit('mass', 'lb', Rational.ONE);
export const oz = defineUnit('mass', 'oz', Rational.of(1, 16));
export const ton = defineUnit('mass', 'ton', Rational.of(2000));
export const kg = defineUnit('mass', 'kg', Rational.of(100000000, 45359237));
export const tonne = defineUnit('mass', 'tonne', Rational.of(100000000000, 45359237));

// A density factor is the mass factor over the volume factor of its pair.
const densityOf = (
  mass: Unit<'mass'>,
  volume: Unit<'volume'>,
  id: UnitIdOf<'density'>,
): Unit<'density'> => defineUnit('density', id, mass.factor.div(volume.factor));

export const lbIn3 = densityOf(lb, in3, 'lb/in3');
export const lbFt3 = densityOf(lb, ft3, 'lb/ft3');
export const lbYd3 = densityOf(lb, yd3, 'lb/yd3');
export const tonYd3 = densityOf(ton, yd3, 'ton/yd3');
export const kgM3 = densityOf(kg, m3, 'kg/m3');

/** Every unit, grouped by dimension. */
export const UNITS: { readonly [D in DimensionName]: readonly Unit<D>[] } = {
  length: [inch, ft, yd, mm, cm, m],
  area: [in2, ft2, yd2, mm2, cm2, m2],
  volume: [in3, ft3, yd3, mm3, cm3, m3],
  mass: [lb, oz, ton, kg, tonne],
  density: [lbIn3, lbFt3, lbYd3, tonYd3, kgM3],
};

/**
 * Looks up a unit by its exact, case-sensitive id within one dimension; an unknown id (or the id
 * of another dimension) answers `undefined`, never a default.
 */
export const findUnit = <D extends DimensionName>(
  dimension: D,
  id: string,
): Unit<D> | undefined => {
  const units: readonly Unit<D>[] = UNITS[dimension];
  return units.find((unit) => unit.id === id);
};
