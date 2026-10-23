import { CoreError } from '../errors.ts';
import type { Rational } from '../rational/rational.ts';
import { DIMENSIONS, type DimensionName, type Exponents } from '../units/dimension.ts';
import { requireSameVector, type Quantity } from '../units/quantity.ts';
import type { Unit } from '../units/unit.ts';
import { requireMoney, usd, type Money } from './money.ts';

// The brand exists only in the type system, like the one of `Quantity`: a price per square foot
// is not assignable to a price per foot, and a plain object is never a `UnitPrice`.
const brand: unique symbol = Symbol();

/**
 * A price of "one canonical unit" of a dimension (`perCanonical` dollars per in, in2, in3, lb or
 * lb/in3), stored exactly. The dimension is in the type; the exponent vector is kept at runtime
 * for untyped callers.
 */
export interface UnitPrice<D extends DimensionName> {
  readonly currency: 'USD';
  readonly perCanonical: Rational;
  readonly exponents: Exponents;
  readonly [brand]: D;
}

class UnitPriceValue<D extends DimensionName> implements UnitPrice<D> {
  declare readonly [brand]: D;
  readonly currency = 'USD';
  readonly perCanonical: Rational;
  readonly exponents: Exponents;

  constructor(perCanonical: Rational, exponents: Exponents) {
    this.perCanonical = perCanonical;
    this.exponents = exponents;
    Object.freeze(this);
  }
}

/** The price `m` per one `unit`, stored per canonical unit as `m / factor(unit)`. */
export const unitPrice = <D extends DimensionName>(m: Money, unit: Unit<D>): UnitPrice<D> =>
  new UnitPriceValue<D>(requireMoney(m).div(unit.factor), DIMENSIONS[unit.dimension]);

/**
 * Runtime guard for untyped callers, like `requireMoney`: only `unitPrice` builds a price, so a
 * quantity or a plain object fails `DIMENSION_MISMATCH`.
 */
const requireUnitPrice = <D extends DimensionName>(value: UnitPrice<D>): UnitPriceValue<D> => {
  if (!(value instanceof UnitPriceValue)) throw new CoreError('DIMENSION_MISMATCH');
  return value;
};

/**
 * The exact cost of `q`: the price times the quantity, whatever unit `q` was entered in. A
 * quantity of another dimension fails `DIMENSION_MISMATCH` (a type error for typed callers).
 */
export const costOf = <D extends DimensionName>(
  price: UnitPrice<D>,
  q: Quantity<NoInfer<D>>,
): Money => {
  const { exponents, perCanonical } = requireUnitPrice(price);
  requireSameVector(exponents, q.exponents);
  return usd(perCanonical.mul(q.canonical));
};
