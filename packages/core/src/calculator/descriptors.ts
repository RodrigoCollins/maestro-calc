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
  /**
   * The readers and the URL writer of the kind, set by the builder of the kind (`lengthInput`,
   * `countInput`, ...). `validate`, `encode` and `decode` call it and hold no code of their own for
   * any kind, so a bundle carries only the kinds its calculator declares.
   */
  readonly codec: InputKind;
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

/**
 * A plain decimal input, such as 37.5 hours a week: an exact Rational read from `37.5` (no unit,
 * no `%`); the minimum defaults to 0 and there is no maximum unless one is declared.
 */
export type DecimalDescriptor = Base & {
  readonly kind: 'decimal';
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
 * A time of day in minutes since midnight (0..1439), read from `7:00 am`, `16:30` or `0730`; `null`
 * is no time (an empty field, a day off).
 */
export type ClockDescriptor = Base & {
  readonly kind: 'clock';
  readonly default: number | null;
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
  | MoneyDescriptor
  | ClockDescriptor
  | DecimalDescriptor;

/** The validated value of one field: any of the value types of the kinds. */
export type FieldValue = Quantity<'length'> | Money | Rational | number | string | boolean | null;

/** A failed field before it is tagged with its key: one code, and the violated bound. */
export type FieldFailure = Omit<FieldError, 'field'>;

/**
 * The code of one kind of input, shared by every descriptor of that kind. The methods take the
 * descriptor they read for (a method, so the code of one kind is a code of any kind: the builder of
 * the kind is what pairs a descriptor with its own code).
 */
export interface InputKind<D extends InputDescriptor = InputDescriptor> {
  /**
   * Reads a raw field that is not `undefined` and, when it is a string, not longer than
   * `MAX_TEXT_LENGTH`: form text or a typed value. Nothing is coerced.
   */
  read(
    input: D,
    raw: unknown,
    unitSystem: UnitSystem | undefined,
  ): Result<FieldValue, FieldFailure>;
  /** The canonical URL text of a value of the kind, or `undefined` for any other value. */
  urlText(input: D, value: unknown): string | undefined;
  /** The value that a percent-decoded URL text names, or `undefined` when it is invalid. */
  fromUrl(input: D, text: string): FieldValue | undefined;
}

/** What a calculator writes for one input: its descriptor without the `kind` and the `codec`. */
export type InputSpec<D extends InputDescriptor> = Omit<D, 'kind' | 'codec'> & {
  readonly kind?: never;
  readonly codec?: never;
};

/** The kinds whose value is an amount with inclusive bounds. */
export type BoundedDescriptor =
  LengthDescriptor | CountDescriptor | PercentDescriptor | MoneyDescriptor | DecimalDescriptor;

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

/**
 * One output: `measure` is a named dimension, `money`, `hours` (an exact Rational of hours, the
 * measure of a time card) or `number` (an exact Rational with no dimension, whose unit the page
 * names: BTU, minutes). Exactly one output is `primary`.
 */
export interface OutputDescriptor {
  readonly key: string;
  readonly measure: DimensionName | 'money' | 'hours' | 'number';
  readonly role: 'primary' | 'secondary' | 'intermediate';
  readonly display?: DisplayHint;
}

/** The validated value type of one input descriptor. */
export type ValueOf<D extends InputDescriptor> = D extends { readonly kind: 'length' }
  ? Quantity<'length'>
  : D extends { readonly kind: 'count' }
    ? number
    : D extends { readonly kind: 'percent' | 'decimal' }
      ? Rational
      : D extends { readonly kind: 'select'; readonly options: readonly (infer Option)[] }
        ? Option
        : D extends { readonly kind: 'boolean' }
          ? boolean
          : D extends { readonly kind: 'money' }
            ? Money
            : D extends { readonly kind: 'clock' }
              ? number | null
              : never;

/** The record `compute` receives: one entry per declared input. */
export type InputsOf<I extends readonly InputDescriptor[]> = {
  readonly [D in I[number] as D['key']]: ValueOf<D>;
};

/** The value of an output: a quantity of its dimension, or money. */
export type MeasureValue<M extends OutputDescriptor['measure']> = M extends 'money'
  ? Money
  : M extends 'hours' | 'number'
    ? Rational
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
   * contract throws `CoreError('INVALID_RESULT', reason)`, a programming error. The result is a
   * frozen copy of what `compute` built.
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
