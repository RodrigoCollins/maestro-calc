import { CoreError } from '../errors.ts';
import { toDecimalParts, type DecimalParts } from '../format/decimal-parts.ts';
import { Rational } from '../rational/rational.ts';

// The brand exists only in the type system, like the ones of `Quantity` and `UnitPrice`: an object
// literal with the right fields is never `Money`, so the type agrees with the `instanceof` guard
// of `requireMoney`, which then only fires for untyped callers.
const brand: unique symbol = Symbol();

/**
 * An exact amount of US dollars. The amount is never rounded when it is stored or computed (a unit
 * price such as $0.333 and every intermediate result stay exact); `toCents` rounds for display
 * only. A difference may be negative: non-negativity belongs to the `money` field kind.
 *
 * The operations are named `addMoney`, `subMoney`, `compareMoney` and so on, with a `Money` suffix,
 * because the root barrel already exports `add`, `sub`, `compare` and the like for quantities and
 * money must never reach them.
 */
export interface Money {
  readonly currency: 'USD';
  readonly amount: Rational;
  readonly [brand]: true;
}

class MoneyValue implements Money {
  declare readonly [brand]: true;
  readonly currency = 'USD';
  readonly amount: Rational;

  constructor(amount: Rational) {
    this.amount = amount;
    Object.freeze(this);
  }
}

/**
 * Money from an exact amount of dollars (a Rational or a safe integer). A non-integer `number` or
 * an unsafe integer fails `NOT_AN_INTEGER`.
 */
export const usd = (amount: Rational | number): Money =>
  new MoneyValue(typeof amount === 'number' ? Rational.of(amount) : amount);

/**
 * Runtime guard for untyped callers (the typed signatures already forbid it): only `usd` builds
 * money, so a quantity or a plain object fails `DIMENSION_MISMATCH`. Returns the exact amount.
 */
export const requireMoney = (value: Money): Rational => {
  if (!(value instanceof MoneyValue)) throw new CoreError('DIMENSION_MISMATCH');
  return value.amount;
};

/** `a + b`. */
export const addMoney = (a: Money, b: Money): Money => usd(requireMoney(a).add(requireMoney(b)));

/** `a - b`; the result may be negative. */
export const subMoney = (a: Money, b: Money): Money => usd(requireMoney(a).sub(requireMoney(b)));

/** Orders `a` against `b`. */
export const compareMoney = (a: Money, b: Money): -1 | 0 | 1 =>
  requireMoney(a).compare(requireMoney(b));

/** True when `a` and `b` are the same amount. */
export const equalsMoney = (a: Money, b: Money): boolean => requireMoney(a).equals(requireMoney(b));

/** Multiplies by an exact Rational factor. */
export const scaleMoney = (m: Money, k: Rational): Money => usd(requireMoney(m).mul(k));

/**
 * Multiplies by a whole count, for example the result of `ceilToPurchaseUnits`. A negative count
 * fails `NEGATIVE_QUANTITY` and a non-integer `number` fails `NOT_AN_INTEGER`.
 */
export const multiplyCount = (m: Money, count: number | bigint): Money => {
  const factor = Rational.of(count);
  if (factor.sign() === -1) throw new CoreError('NEGATIVE_QUANTITY');
  return scaleMoney(m, factor);
};

/** The amount rounded to the nearest cent, ties away from zero, split into decimal parts. */
export const toCents = (m: Money): DecimalParts => toDecimalParts(requireMoney(m), 2, 'nearest');
