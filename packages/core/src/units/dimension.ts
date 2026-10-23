/** The named dimensions and their exponents over the base dimensions (length, mass). */
export interface Dimensions {
  length: { length: 1; mass: 0 };
  area: { length: 2; mass: 0 };
  volume: { length: 3; mass: 0 };
  mass: { length: 0; mass: 1 };
  density: { length: -3; mass: 1 };
}

export type DimensionName = keyof Dimensions;

/** An exponent vector over the base dimensions; any integers, named or not. */
export interface Exponents {
  readonly length: number;
  readonly mass: number;
}

type Up = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];
type Down = [6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6];
type InRange = Up[number];
type Positive = 1 | 2 | 3 | 4 | 5 | 6;

// The successor of `A` in a chain, so `Step<A, Up>` is A + 1 and `Step<A, Down>` is A - 1 within
// -6..6. Leaving the range yields the wide `number`, which names no dimension, so an overflowing
// vector can never be mistaken for a named one (callers only pass literals within `Bound`).
type Step<A extends number, Chain extends number[]> = Chain extends [
  infer Head extends number,
  infer Next extends number,
  ...infer Rest extends number[],
]
  ? Head extends A
    ? Next
    : Step<A, [Next, ...Rest]>
  : number;

// Invariant: `Add<A, B>` is A + B for literals A, B in -6..6 whose sum stays in range, and the wide
// `number` otherwise. Each step moves A one way and B one step toward 0, so the depth is |B| <= 6
// (each `Step` walks a chain of at most 13 entries), far below the checker's recursion limit.
type Add<A extends number, B extends number> = B extends 0
  ? A
  : A extends InRange
    ? B extends Positive
      ? Add<Step<A, Up>, Step<B, Down>>
      : B extends InRange
        ? Add<Step<A, Down>, Step<B, Up>>
        : number
    : number;

// Invariant: `Sub<A, B>` is A - B under the same rules and the same depth bound as `Add`.
type Sub<A extends number, B extends number> = B extends 0
  ? A
  : A extends InRange
    ? B extends Positive
      ? Sub<Step<A, Down>, Step<B, Down>>
      : B extends InRange
        ? Sub<Step<A, Up>, Step<B, Up>>
        : number
    : number;

// `Add` and `Sub` recurse once per unit of `B`, so they must only ever see concrete literals in
// range: when a generic argument reaches them (as `A['length']` does in the declarations below),
// the checker instantiates the whole recursion for every possible `DimensionName` pair, which cost
// 1.35 million instantiations. Binding the components with `infer … extends InRange` defers the
// work until both are literals. Outside -6..6 the result is the wide `number`.
type SumOf<A extends number, B extends number> = A extends infer X extends InRange
  ? B extends infer Y extends InRange
    ? Add<X, Y>
    : number
  : number;

type DifferenceOf<A extends number, B extends number> = A extends infer X extends InRange
  ? B extends infer Y extends InRange
    ? Sub<X, Y>
    : number
  : number;

/** Componentwise sum of two exponent vectors (the dimension of a product). */
export interface AddVec<A extends Exponents, B extends Exponents> {
  length: SumOf<A['length'], B['length']>;
  mass: SumOf<A['mass'], B['mass']>;
}

/** Componentwise difference of two exponent vectors (the dimension of a quotient). */
export interface SubVec<A extends Exponents, B extends Exponents> {
  length: DifferenceOf<A['length'], B['length']>;
  mass: DifferenceOf<A['mass'], B['mass']>;
}

/** The name of the dimension with this vector, or `never` when no named dimension has it. */
export type NameOf<V extends Exponents> = {
  [D in DimensionName]: V extends Dimensions[D] ? D : never;
}[DimensionName];

const vector = <L extends number, M extends number>(length: L, mass: M): { length: L; mass: M } =>
  Object.freeze({ length, mass });

/**
 * The exponent vectors at runtime. `Dimensions` gives the same vectors as types, and the mapped
 * type makes a missing or an extra entry here a compile error.
 */
export const DIMENSIONS: Readonly<{ [D in DimensionName]: Readonly<Dimensions[D]> }> =
  Object.freeze({
    length: vector(1, 0),
    area: vector(2, 0),
    volume: vector(3, 0),
    mass: vector(0, 1),
    density: vector(-3, 1),
  });

// A record with one entry per name: a missing or an extra name is a compile error, so the list
// below is exactly the five names.
const NAME_RECORD = {
  length: 'length',
  area: 'area',
  volume: 'volume',
  mass: 'mass',
  density: 'density',
} as const satisfies { readonly [D in DimensionName]: D };

const NAMES = /* @__PURE__ */ Object.values(NAME_RECORD);

export const sameVector = (a: Exponents, b: Exponents): boolean =>
  a.length === b.length && a.mass === b.mass;

/** The name of the dimension with this exponent vector, or `undefined` for an unnamed one. */
export const nameOf = (exponents: Exponents): DimensionName | undefined =>
  NAMES.find((name) => sameVector(DIMENSIONS[name], exponents));

export const addVec = (a: Exponents, b: Exponents): Exponents =>
  vector(a.length + b.length, a.mass + b.mass);

export const subVec = (a: Exponents, b: Exponents): Exponents =>
  vector(a.length - b.length, a.mass - b.mass);
