import { CoreError } from '../errors.ts';
import type { Rational } from '../rational/rational.ts';
import {
  addVec,
  DIMENSIONS,
  nameOf,
  subVec,
  type AddVec,
  type DimensionName,
  type Dimensions,
  type Exponents,
  type NameOf,
  type SubVec,
} from './dimension.ts';
import { makeQuantity, requireSameVector, type Quantity } from './quantity.ts';

/** The dimension of `A × B`, or `never` when the exponent sum names no dimension. */
export type Product<A extends DimensionName, B extends DimensionName> = NameOf<
  AddVec<Dimensions[A], Dimensions[B]>
>;

/** The dimension of `A ÷ B`, or `never` when the exponent difference names no dimension. */
export type Quotient<A extends DimensionName, B extends DimensionName> = NameOf<
  SubVec<Dimensions[A], Dimensions[B]>
>;

// Intersecting an argument with an unnamed result makes the call a type error, and the missing
// property below is what the diagnostic prints, so it says why the call was rejected.
interface Unnamed {
  readonly 'the exponent vector names no dimension': never;
}
type Named<N extends DimensionName> = [N] extends [never] ? Unnamed : unknown;

const map = <D extends DimensionName>(q: Quantity<D>, canonical: Rational): Quantity<D> =>
  makeQuantity<D>(q.exponents, canonical);

/** `a + b` in the canonical unit; a mismatched pair (untyped callers) fails `DIMENSION_MISMATCH`. */
export const add = <D extends DimensionName>(
  a: Quantity<D>,
  b: Quantity<NoInfer<D>>,
): Quantity<D> => {
  requireSameVector(a.exponents, b.exponents);
  return map(a, a.canonical.add(b.canonical));
};

/** `a - b` in the canonical unit; a mismatched pair (untyped callers) fails `DIMENSION_MISMATCH`. */
export const sub = <D extends DimensionName>(
  a: Quantity<D>,
  b: Quantity<NoInfer<D>>,
): Quantity<D> => {
  requireSameVector(a.exponents, b.exponents);
  return map(a, a.canonical.sub(b.canonical));
};

/** `-q`, keeping the dimension. */
export const negate = <D extends DimensionName>(q: Quantity<D>): Quantity<D> =>
  map(q, q.canonical.neg());

/** `|q|`, keeping the dimension. */
export const abs = <D extends DimensionName>(q: Quantity<D>): Quantity<D> =>
  map(q, q.canonical.abs());

/** Orders `a` against `b` across units; mismatched dimensions fail `DIMENSION_MISMATCH`. */
export const compare = <D extends DimensionName>(
  a: Quantity<D>,
  b: Quantity<NoInfer<D>>,
): -1 | 0 | 1 => {
  requireSameVector(a.exponents, b.exponents);
  return a.canonical.compare(b.canonical);
};

/** True when `a` and `b` are the same amount; mismatched dimensions fail `DIMENSION_MISMATCH`. */
export const equals = <D extends DimensionName>(
  a: Quantity<D>,
  b: Quantity<NoInfer<D>>,
): boolean => {
  requireSameVector(a.exponents, b.exponents);
  return a.canonical.equals(b.canonical);
};

/** True for a zero amount of any dimension. */
export const isZero = (q: Quantity<DimensionName>): boolean => q.canonical.isZero();

/** `-1`, `0` or `1` for a negative, zero or positive amount of any dimension. */
export const sign = (q: Quantity<DimensionName>): -1 | 0 | 1 => q.canonical.sign();

/** Multiplies by an exact Rational, keeping the dimension. */
export const scale = <D extends DimensionName>(q: Quantity<D>, k: Rational): Quantity<D> =>
  map(q, q.canonical.mul(k));

/** Divides by an exact Rational, keeping the dimension; zero fails `DIVISION_BY_ZERO`. */
export const divideScalar = <D extends DimensionName>(q: Quantity<D>, k: Rational): Quantity<D> =>
  map(q, q.canonical.div(k));

/** The same-dimension quotient as a plain Rational; a zero divisor fails `DIVISION_BY_ZERO`. */
export const ratio = <D extends DimensionName>(
  a: Quantity<D>,
  b: Quantity<NoInfer<D>>,
): Rational => {
  requireSameVector(a.exponents, b.exponents);
  return a.canonical.div(b.canonical);
};

/** The named dimension of a derived vector; an unnamed one is a `DIMENSION_MISMATCH`. */
const named = (exponents: Exponents): DimensionName => {
  const name = nameOf(exponents);
  if (name === undefined) throw new CoreError('DIMENSION_MISMATCH');
  return name;
};

/** `a × b`; the result dimension adds the exponent vectors and must be a named dimension. */
export const multiply = <A extends DimensionName, B extends DimensionName>(
  a: Quantity<A>,
  b: Quantity<B> & Named<Product<A, B>>,
): Quantity<Product<A, B>> =>
  makeQuantity<Product<A, B>>(
    DIMENSIONS[named(addVec(a.exponents, b.exponents))],
    a.canonical.mul(b.canonical),
  );

/** `a ÷ b`; the result dimension subtracts the vectors; a zero divisor fails `DIVISION_BY_ZERO`. */
export const divide = <A extends DimensionName, B extends DimensionName>(
  a: Quantity<A>,
  b: Quantity<B> & Named<Quotient<A, B>>,
): Quantity<Quotient<A, B>> =>
  makeQuantity<Quotient<A, B>>(
    DIMENSIONS[named(subVec(a.exponents, b.exponents))],
    a.canonical.div(b.canonical),
  );
