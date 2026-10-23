import { CoreError } from '../errors.ts';
import { Rational } from '../rational/rational.ts';
import { DIMENSIONS, sameVector, type DimensionName, type Exponents } from './dimension.ts';
import type { Unit } from './unit.ts';

// The brand exists only in the type system (a class field with `declare` emits nothing), so a
// plain `{ exponents, canonical }` literal can never be a `Quantity`. It is a `unique symbol`
// made with `Symbol()` because a `declare const` would trip the ban on ambient declarations.
const brand: unique symbol = Symbol();

/**
 * An exact amount of one named dimension, stored in the canonical unit of that dimension (in,
 * in2, in3, lb, lb/in3). The dimension is in the type; the exponent vector is also kept at
 * runtime for untyped callers.
 */
export interface Quantity<D extends DimensionName> {
  readonly exponents: Exponents;
  readonly canonical: Rational;
  readonly [brand]: D;
}

class QuantityValue<D extends DimensionName> implements Quantity<D> {
  declare readonly [brand]: D;
  readonly exponents: Exponents;
  readonly canonical: Rational;

  constructor(exponents: Exponents, canonical: Rational) {
    this.exponents = exponents;
    this.canonical = canonical;
    Object.freeze(this);
  }
}

/** The only way to build a quantity from parts; the caller vouches that the vector names `D`. */
export const makeQuantity = <D extends DimensionName>(
  exponents: Exponents,
  canonical: Rational,
): Quantity<D> => new QuantityValue<D>(exponents, canonical);

/**
 * Runtime guard behind every typed signature: throws `DIMENSION_MISMATCH` for untyped misuse. An
 * operand with no exponent vector at all (a money value passed as a quantity) is a mismatch too.
 */
export const requireSameVector = (a: Exponents | undefined, b: Exponents | undefined): void => {
  if (a === undefined || b === undefined || !sameVector(a, b)) {
    throw new CoreError('DIMENSION_MISMATCH');
  }
};

/** True when `value` is a quantity of any dimension built by this package; a lookalike never is. */
export const isQuantity = (value: unknown): value is Quantity<DimensionName> =>
  value instanceof QuantityValue;

/**
 * True when `value` is a quantity built by this package whose dimension is `dimension`: the guard
 * for untyped input, where a lookalike object or a quantity of another dimension must not pass.
 */
export const isQuantityOf = <D extends DimensionName>(
  value: unknown,
  dimension: D,
): value is Quantity<D> => isQuantity(value) && sameVector(value.exponents, DIMENSIONS[dimension]);

/** `value` in `unit` (a Rational or a safe integer) as a quantity of the unit's dimension. */
export const quantity = <D extends DimensionName>(
  value: Rational | number,
  unit: Unit<D>,
): Quantity<D> => {
  const amount = typeof value === 'number' ? Rational.of(value) : value;
  return makeQuantity<D>(DIMENSIONS[unit.dimension], amount.mul(unit.factor));
};

/** The exact value of `q` in `unit`; a unit of another dimension throws `DIMENSION_MISMATCH`. */
export const valueIn = <D extends DimensionName>(
  q: Quantity<D>,
  unit: Unit<NoInfer<D>>,
): Rational => {
  requireSameVector(q.exponents, DIMENSIONS[unit.dimension]);
  return q.canonical.div(unit.factor);
};
