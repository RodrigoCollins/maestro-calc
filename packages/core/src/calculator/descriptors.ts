import type { Money } from '../money/money.ts';
import type { Rational } from '../rational/rational.ts';
import type { DimensionName } from '../units/dimension.ts';
import type { Quantity } from '../units/quantity.ts';
import type { Result } from '../result.ts';
import type { UnitIdOf } from '../units/unit.ts';
import type { FieldErrorCode } from '../error-codes.ts';

/** The unit system that picks the unit of a bare number in a length field. */
export type UnitSystem = 'imperial' | 'metric';

interface Base {
  readonly key: string;
  readonly urlKey: string;
}

/** A length input; `defaultUnit` applies to bare numbers in imperial, `metricDefaultUnit` in metric. */
export type LengthDescriptor = Base & {
  readonly kind: 'length';
  readonly default: Quantity<'length'>;
  readonly defaultUnit: 'in' | 'ft' | 'yd';
  readonly metricDefaultUnit: 'mm' | 'cm' | 'm';
  readonly min?: Quantity<'length'>;
  readonly max?: Quantity<'length'>;
};

/** A whole-number input; the bounds default to `0..Number.MAX_SAFE_INTEGER`. */
export type CountDescriptor = Base & {
  readonly kind: 'count';
  readonly default: number;
  readonly min?: number;
  readonly max?: number;
};

/** A percent input in percent points (12.5 percent is `25/2`, not `1/8`); bounds default to `0..100`. */
export type PercentDescriptor = Base & {
  readonly kind: 'percent';
  readonly default: Rational;
  readonly min?: Rational;
  readonly max?: Rational;
};

/** A choice among a non-empty list of unique option ids. */
export type SelectDescriptor = Base & {
  readonly kind: 'select';
  readonly options: readonly [string, ...string[]];
  readonly default: string;
};

export type BooleanDescriptor = Base & {
  readonly kind: 'boolean';
  readonly default: boolean;
};

/** An amount of US dollars; the minimum defaults to `usd(0)` and is never negative. */
export type MoneyDescriptor = Base & {
  readonly kind: 'money';
  readonly default: Money;
  readonly min?: Money;
  readonly max?: Money;
};

/**
 * One input of a calculator. The kinds are closed: a form and the URL codec are driven from these
 * descriptors alone. Bounds are inclusive.
 */
export type InputDescriptor =
  | LengthDescriptor
  | CountDescriptor
  | PercentDescriptor
  | SelectDescriptor
  | BooleanDescriptor
  | MoneyDescriptor;

/** The kinds whose value is an amount with inclusive bounds. */
export type BoundedDescriptor =
  LengthDescriptor | CountDescriptor | PercentDescriptor | MoneyDescriptor;

/** How the web layer may show an output (never applied by core): `places` 0..12, `denominator` 2..64. */
export type DisplayHint =
  | {
      readonly unit: UnitIdOf<DimensionName>;
      readonly format: 'decimal';
      readonly places: number;
    }
  | {
      readonly unit: UnitIdOf<'length'>;
      readonly format: 'fraction';
      readonly denominator: number;
    };

/** One output: `measure` is a named dimension, or `money`. Exactly one output is `primary`. */
export interface OutputDescriptor {
  readonly key: string;
  readonly measure: DimensionName | 'money';
  readonly role: 'primary' | 'secondary' | 'intermediate';
  readonly display?: DisplayHint;
}

/** The validated value type of one input descriptor. */
export type ValueOf<D extends InputDescriptor> = D extends { readonly kind: 'length' }
  ? Quantity<'length'>
  : D extends { readonly kind: 'count' }
    ? number
    : D extends { readonly kind: 'percent' }
      ? Rational
      : D extends { readonly kind: 'select'; readonly options: readonly (infer Option)[] }
        ? Option
        : D extends { readonly kind: 'boolean' }
          ? boolean
          : D extends { readonly kind: 'money' }
            ? Money
            : never;

/** The record `compute` receives: one entry per declared input. */
export type InputsOf<I extends readonly InputDescriptor[]> = {
  readonly [D in I[number] as D['key']]: ValueOf<D>;
};

/** The value of an output: a quantity of its dimension, or money. */
export type MeasureValue<M extends OutputDescriptor['measure']> = M extends 'money'
  ? Money
  : M extends DimensionName
    ? Quantity<M>
    : never;

/** A purchase line; `qty` comes from `ceilToPurchaseUnits`. */
export interface ShoppingLine {
  readonly materialId: string;
  readonly purchaseUnit: string;
  readonly qty: bigint;
}

/** A warning: one of the declared codes and identifier-like or numeric params, never prose. */
export interface WarningEntry<Code extends string> {
  readonly code: Code;
  readonly params: Readonly<Record<string, number | boolean | string>>;
}

/** What `compute` returns: exactly one entry per declared output key. */
export interface ComputeResult<O extends readonly OutputDescriptor[], W extends string> {
  readonly outputs: { readonly [D in O[number] as D['key']]: MeasureValue<D['measure']> };
  readonly shopping: readonly ShoppingLine[];
  readonly warnings: readonly WarningEntry<W>[];
}

/** One output of a run, tagged with its key and role. */
export type RunOutput<O extends readonly OutputDescriptor[]> = {
  readonly [D in O[number] as D['key']]: {
    readonly key: D['key'];
    readonly role: D['role'];
    readonly value: MeasureValue<D['measure']>;
  };
}[O[number]['key']];

/** What a successful `run` returns: `outputs` is the list of `RunOutput` in declaration order. */
export interface RunResult<O extends readonly OutputDescriptor[], W extends string> {
  readonly outputs: readonly RunOutput<O>[];
  readonly shopping: readonly ShoppingLine[];
  readonly warnings: readonly WarningEntry<W>[];
}

/** One failed field: its key, one code, and the violated bound for `BELOW_MIN`/`ABOVE_MAX`. */
export interface FieldError {
  readonly field: string;
  readonly code: FieldErrorCode;
  readonly params?: { readonly min: string } | { readonly max: string };
}

export interface ValidateOptions {
  /** Picks the unit of a bare number in a length field. Default `imperial`. */
  readonly unitSystem?: UnitSystem;
}

/** A defined calculator: its metadata in declared order, `validate` and its pure `compute`. */
export interface Calculator<
  Id extends string,
  I extends readonly InputDescriptor[],
  O extends readonly OutputDescriptor[],
  W extends readonly string[],
> {
  readonly id: Id;
  readonly inputs: I;
  readonly outputs: O;
  readonly warnings: W;
  readonly retiredUrlKeys: readonly string[];
  /** Validates an untyped record (form strings, or typed values) without coercing anything. */
  readonly validate: (
    raw: Readonly<Record<string, unknown>>,
    options?: ValidateOptions,
  ) => Result<InputsOf<I>, FieldError>;
  readonly compute: (inputs: InputsOf<I>) => ComputeResult<O, W[number]>;
  /**
   * `validate` then `compute`, with the shape of the result enforced: a result that breaks the
   * contract throws `CoreError('INVALID_RESULT')`, a programming error.
   */
  readonly run: (
    raw: Readonly<Record<string, unknown>>,
    options?: ValidateOptions,
  ) => Result<RunResult<O, W[number]>, FieldError>;
}

/** A calculator of any shape: what generic code such as `run` and `messageKeysOf` accepts. */
export type AnyCalculator = Calculator<
  string,
  readonly InputDescriptor[],
  readonly OutputDescriptor[],
  readonly string[]
>;
