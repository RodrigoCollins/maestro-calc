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
// Every definition is annotated as pure, so a bundler can drop the units an app never imports.
/** The inch, the canonical length unit (`in` is a reserved word). */
export const inch = /* @__PURE__ */ defineUnit('length', 'in', /* @__PURE__ */ Rational.of(1));
/** The international foot, exactly 12 in. */
export const ft = /* @__PURE__ */ defineUnit('length', 'ft', /* @__PURE__ */ Rational.of(12));
/** The international yard, exactly 36 in. */
export const yd = /* @__PURE__ */ defineUnit('length', 'yd', /* @__PURE__ */ Rational.of(36));
/** The millimetre, exactly 5/127 in. */
export const mm = /* @__PURE__ */ defineUnit('length', 'mm', /* @__PURE__ */ Rational.of(5, 127));
/** The centimetre, exactly 50/127 in. */
export const cm = /* @__PURE__ */ defineUnit('length', 'cm', /* @__PURE__ */ Rational.of(50, 127));
/** The metre, exactly 5000/127 in. */
export const m = /* @__PURE__ */ defineUnit('length', 'm', /* @__PURE__ */ Rational.of(5000, 127));

// Area and volume factors are the square and the cube of the length factor.
/** The square inch, the canonical area unit. */
export const in2 = /* @__PURE__ */ squared(inch, 'in2');
/** The square foot, exactly 144 in2. */
export const ft2 = /* @__PURE__ */ squared(ft, 'ft2');
/** The square yard, exactly 1296 in2. */
export const yd2 = /* @__PURE__ */ squared(yd, 'yd2');
/** The square millimetre. */
export const mm2 = /* @__PURE__ */ squared(mm, 'mm2');
/** The square centimetre. */
export const cm2 = /* @__PURE__ */ squared(cm, 'cm2');
/** The square metre. */
export const m2 = /* @__PURE__ */ squared(m, 'm2');

/** The cubic inch, the canonical volume unit. */
export const in3 = /* @__PURE__ */ cubed(inch, 'in3');
/** The cubic foot, exactly 1728 in3. */
export const ft3 = /* @__PURE__ */ cubed(ft, 'ft3');
/** The cubic yard, exactly 46656 in3. */
export const yd3 = /* @__PURE__ */ cubed(yd, 'yd3');
/** The cubic millimetre. */
export const mm3 = /* @__PURE__ */ cubed(mm, 'mm3');
/** The cubic centimetre. */
export const cm3 = /* @__PURE__ */ cubed(cm, 'cm3');
/** The cubic metre. */
export const m3 = /* @__PURE__ */ cubed(m, 'm3');
/** The US liquid gallon, exactly 231 in3 (NIST SP 811, Appendix B). */
export const gal = /* @__PURE__ */ defineUnit('volume', 'gal', /* @__PURE__ */ Rational.of(231));
/** The liter, exactly 1000 cm3 (`L`, as NIST SP 811 writes it). */
export const liter = /* @__PURE__ */ defineUnit(
  'volume',
  'L',
  /* @__PURE__ */ cm3.factor.mul(/* @__PURE__ */ Rational.of(1000)),
);

// Canonical mass unit: the avoirdupois pound, exactly 45359237/10^8 kg (1959 agreement; NIST SP 811).
// An ounce is 1/16 lb and a US short ton is 2000 lb; a tonne is 1000 kg. Written as fractions of
// integers: 1 kg = 10^8 / 45359237 lb.
/** The avoirdupois pound, the canonical mass unit (exactly 45359237/10^8 kg). */
export const lb = /* @__PURE__ */ defineUnit('mass', 'lb', /* @__PURE__ */ Rational.of(1));
/** The ounce, exactly 1/16 lb. */
export const oz = /* @__PURE__ */ defineUnit('mass', 'oz', /* @__PURE__ */ Rational.of(1, 16));
/** The US short ton, exactly 2000 lb (not the 1000 kg tonne). */
export const ton = /* @__PURE__ */ defineUnit('mass', 'ton', /* @__PURE__ */ Rational.of(2000));
/** The kilogram, exactly 10^8/45359237 lb. */
export const kg = /* @__PURE__ */ defineUnit(
  'mass',
  'kg',
  /* @__PURE__ */ Rational.of(100000000, 45359237),
);
/** The metric tonne, exactly 1000 kg (not the 2000 lb US short ton). */
export const tonne = /* @__PURE__ */ defineUnit(
  'mass',
  'tonne',
  /* @__PURE__ */ Rational.of(100000000000, 45359237),
);

// A density factor is the mass factor over the volume factor of its pair.
const densityOf = (
  mass: Unit<'mass'>,
  volume: Unit<'volume'>,
  id: UnitIdOf<'density'>,
): Unit<'density'> => defineUnit('density', id, mass.factor.div(volume.factor));

/** Pounds per cubic inch, the canonical density unit. */
export const lbIn3 = /* @__PURE__ */ densityOf(lb, in3, 'lb/in3');
/** Pounds per cubic foot. */
export const lbFt3 = /* @__PURE__ */ densityOf(lb, ft3, 'lb/ft3');
/** Pounds per cubic yard. */
export const lbYd3 = /* @__PURE__ */ densityOf(lb, yd3, 'lb/yd3');
/** US short tons per cubic yard. */
export const tonYd3 = /* @__PURE__ */ densityOf(ton, yd3, 'ton/yd3');
/** Kilograms per cubic metre. */
export const kgM3 = /* @__PURE__ */ densityOf(kg, m3, 'kg/m3');

/** Every unit, grouped by dimension; the catalog and its lists are frozen. */
export const UNITS: { readonly [D in DimensionName]: readonly Unit<D>[] } =
  /* @__PURE__ */ Object.freeze({
    length: /* @__PURE__ */ Object.freeze([inch, ft, yd, mm, cm, m]),
    area: /* @__PURE__ */ Object.freeze([in2, ft2, yd2, mm2, cm2, m2]),
    volume: /* @__PURE__ */ Object.freeze([in3, ft3, yd3, mm3, cm3, m3, gal, liter]),
    mass: /* @__PURE__ */ Object.freeze([lb, oz, ton, kg, tonne]),
    density: /* @__PURE__ */ Object.freeze([lbIn3, lbFt3, lbYd3, tonYd3, kgM3]),
  });

/**
 * Looks up a unit by its exact, case-sensitive id within one dimension; an unknown id (or the id
 * of another dimension) answers `undefined`, never a default, and so does a dimension name that
 * is not one of the five (`'__proto__'` from untyped input).
 */
export const findUnit = <D extends DimensionName>(
  dimension: D,
  id: string,
): Unit<D> | undefined => {
  if (!Object.hasOwn(UNITS, dimension)) return undefined;
  const units: readonly Unit<D>[] = UNITS[dimension];
  return units.find((unit) => unit.id === id);
};
