import { CoreError } from '../errors.ts';
import { UNITS } from '../units/catalog.ts';
import { boundsOf, checkAmount, defaultAmount } from './constraints.ts';
import { validateRecord } from './validate.ts';
import type {
  BoundedDescriptor,
  Calculator,
  ComputeResult,
  InputDescriptor,
  InputsOf,
  OutputDescriptor,
  SelectDescriptor,
  ValidateOptions,
} from './descriptors.ts';

export interface CalculatorDefinition<
  Id extends string,
  I extends readonly InputDescriptor[],
  O extends readonly OutputDescriptor[],
  W extends readonly string[],
> {
  readonly id: Id;
  readonly inputs: I;
  readonly outputs: O;
  readonly warnings?: W;
  readonly retiredUrlKeys?: readonly string[];
  readonly compute: (inputs: InputsOf<I>) => ComputeResult<O, W[number]>;
}

/** Why a definition is rejected; each is the `reason` of an `INVALID_DEFINITION` error. */
export const DEFINITION_REASONS = [
  'INVALID_ID',
  'INVALID_KEY',
  'INVALID_URL_KEY',
  'RESERVED_URL_KEY',
  'DUPLICATE_KEY',
  'DUPLICATE_URL_KEY',
  'NO_INPUTS',
  'NO_OPTIONS',
  'DUPLICATE_OPTION',
  'INVALID_OPTION_ID',
  'INVALID_UNIT',
  'INVALID_BOUNDS',
  'DEFAULT_INVALID',
  'NO_OUTPUTS',
  'DUPLICATE_OUTPUT_KEY',
  'PRIMARY_COUNT',
  'INVALID_DISPLAY',
] as const;

export type DefinitionReason = (typeof DEFINITION_REASONS)[number];

const ID = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const KEY = /^[a-z][A-Za-z0-9]*$/;
const URL_KEY = /^[a-z][a-z0-9]{0,2}$/;
const OPTION_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/** URL keys that belong to the codec: the format version and the unit-system preference. */
const RESERVED_URL_KEYS: readonly string[] = ['v', 'u'];
const IMPERIAL_UNITS: readonly string[] = ['in', 'ft', 'yd'];
const METRIC_UNITS: readonly string[] = ['mm', 'cm', 'm'];

/**
 * Where a definition is faulty, carried as the `cause` of the `INVALID_DEFINITION` error: the
 * calculator `id` and, when one applies, the key of the faulty input, output or warning. Only
 * identifiers, never prose.
 */
export interface DefinitionLocus {
  readonly id: string;
  readonly field?: string;
}

/** Throws `INVALID_DEFINITION` with the reason and the locus of `field` unless `condition` holds. */
type Ensure = (condition: boolean, reason: DefinitionReason, field?: string) => void;

const ensureIn =
  (id: string): Ensure =>
  (condition, reason, field) => {
    if (condition) return;
    const locus: DefinitionLocus = field === undefined ? { id } : { id, field };
    throw new CoreError('INVALID_DEFINITION', reason, { cause: locus });
  };

const keyOf = ({ key }: { readonly key: string }): string => key;
const self = (text: string): string => text;

/** Fails with the locus of `culprit`, the first faulty item, unless there is none. */
const ensureNone = <T>(
  ensure: Ensure,
  culprit: T | undefined,
  reason: DefinitionReason,
  fieldOf: (item: T) => string,
): void => {
  ensure(culprit === undefined, reason, culprit === undefined ? undefined : fieldOf(culprit));
};

/** The first item whose value repeats an earlier one, or `undefined` when all are distinct. */
const firstRepeat = <T>(items: readonly T[], valueOf: (item: T) => string): T | undefined => {
  const seen = new Set<string>();
  return items.find((item) => {
    const value = valueOf(item);
    const repeated = seen.has(value);
    seen.add(value);
    return repeated;
  });
};

const isWithin = (value: number, min: number, max: number): boolean =>
  Number.isInteger(value) && value >= min && value <= max;

const isWholeBound = (bound: number | undefined): boolean =>
  bound === undefined || (Number.isSafeInteger(bound) && bound >= 0);

/** Bounds must be ordered; a count's are whole numbers and a money minimum is never negative. */
const hasValidBounds = (input: BoundedDescriptor): boolean => {
  if (input.kind === 'count' && !(isWholeBound(input.min) && isWholeBound(input.max))) return false;
  if (input.kind === 'money' && input.min !== undefined && input.min.amount.sign() < 0)
    return false;
  const { min, max } = boundsOf(input);
  return min === undefined || max === undefined || min.compare(max) <= 0;
};

const checkBounded = (ensure: Ensure, input: BoundedDescriptor): void => {
  ensure(hasValidBounds(input), 'INVALID_BOUNDS', input.key);
  // a fractional count default has no exact amount to compare; it is not a valid default either
  const whole = input.kind !== 'count' || Number.isSafeInteger(input.default);
  ensure(
    whole && checkAmount(input, defaultAmount(input)) === undefined,
    'DEFAULT_INVALID',
    input.key,
  );
};

const checkSelect = (ensure: Ensure, input: SelectDescriptor): void => {
  ensure(input.options.length > 0, 'NO_OPTIONS', input.key);
  ensure(
    input.options.every((option) => OPTION_ID.test(option)),
    'INVALID_OPTION_ID',
    input.key,
  );
  ensureNone(ensure, firstRepeat(input.options, self), 'DUPLICATE_OPTION', () => input.key);
  ensure(input.options.includes(input.default), 'DEFAULT_INVALID', input.key);
};

const checkInput = (ensure: Ensure, input: InputDescriptor): void => {
  if (input.kind === 'boolean') return;
  if (input.kind === 'select') {
    checkSelect(ensure, input);
    return;
  }
  if (input.kind === 'length') {
    const imperialOk = IMPERIAL_UNITS.includes(input.defaultUnit);
    ensure(imperialOk && METRIC_UNITS.includes(input.metricDefaultUnit), 'INVALID_UNIT', input.key);
  }
  checkBounded(ensure, input);
};

/** A display hint must fit its output: a unit of the dimension, `places` 0..12, `denominator` 2..64. */
const hasValidDisplay = ({ measure, display }: OutputDescriptor): boolean => {
  if (display === undefined) return true;
  if (measure === 'money') return false;
  if (!UNITS[measure].some(({ id }) => id === display.unit)) return false;
  if (display.format === 'decimal') return isWithin(display.places, 0, 12);
  return measure === 'length' && isWithin(display.denominator, 2, 64);
};

const checkDefinition = (
  definition: CalculatorDefinition<
    string,
    readonly InputDescriptor[],
    readonly OutputDescriptor[],
    readonly string[]
  >,
): void => {
  const { id, inputs, outputs, warnings = [] } = definition;
  const ensure = ensureIn(id);
  ensure(ID.test(id), 'INVALID_ID');
  ensure(inputs.length > 0, 'NO_INPUTS');
  const retired = new Set(definition.retiredUrlKeys);
  for (const input of inputs) {
    ensure(KEY.test(input.key), 'INVALID_KEY', input.key);
    ensure(URL_KEY.test(input.urlKey), 'INVALID_URL_KEY', input.key);
    ensure(
      !RESERVED_URL_KEYS.includes(input.urlKey) && !retired.has(input.urlKey),
      'RESERVED_URL_KEY',
      input.key,
    );
    checkInput(ensure, input);
  }
  ensureNone(ensure, firstRepeat(inputs, keyOf), 'DUPLICATE_KEY', keyOf);
  ensureNone(
    ensure,
    firstRepeat(inputs, ({ urlKey }) => urlKey),
    'DUPLICATE_URL_KEY',
    keyOf,
  );
  ensure(outputs.length > 0, 'NO_OUTPUTS');
  ensureNone(
    ensure,
    outputs.find(({ key }) => !KEY.test(key)),
    'INVALID_KEY',
    keyOf,
  );
  ensureNone(ensure, firstRepeat(outputs, keyOf), 'DUPLICATE_OUTPUT_KEY', keyOf);
  ensure(outputs.filter(({ role }) => role === 'primary').length === 1, 'PRIMARY_COUNT');
  ensureNone(
    ensure,
    outputs.find((output) => !hasValidDisplay(output)),
    'INVALID_DISPLAY',
    keyOf,
  );
  ensureNone(
    ensure,
    warnings.find((code) => !KEY.test(code)),
    'INVALID_KEY',
    self,
  );
  ensureNone(ensure, firstRepeat(warnings, self), 'DUPLICATE_KEY', self);
};

/** Freezes every item of a list, then the list itself. */
const freezeList = (items: readonly unknown[]): void => {
  for (const item of items) Object.freeze(item);
  Object.freeze(items);
};

/**
 * Defines a calculator. The `const` type parameters keep every key, kind, measure, option id and
 * warning code as a literal, so `compute` receives exactly the declared inputs and must return
 * exactly the declared outputs and warnings.
 */
export function defineCalculator<
  const Id extends string,
  const I extends readonly InputDescriptor[],
  const O extends readonly OutputDescriptor[],
  const W extends readonly string[] = readonly [],
>(definition: CalculatorDefinition<Id, I, O, W>): Calculator<Id, I, O, W>;
// Widest signature: an omitted `warnings` is the default `readonly []`, which only the overload
// above can express without a type assertion.
export function defineCalculator(
  definition: CalculatorDefinition<
    string,
    readonly InputDescriptor[],
    readonly OutputDescriptor[],
    readonly string[]
  >,
): Calculator<string, readonly InputDescriptor[], readonly OutputDescriptor[], readonly string[]> {
  checkDefinition(definition);
  for (const input of definition.inputs) {
    if (input.kind === 'select') freezeList(input.options);
  }
  for (const output of definition.outputs) {
    // freezing an absent display is a no-op
    Object.freeze(output.display);
  }
  freezeList(definition.inputs);
  freezeList(definition.outputs);
  return Object.freeze({
    id: definition.id,
    inputs: definition.inputs,
    outputs: definition.outputs,
    warnings: Object.freeze(definition.warnings ?? []),
    retiredUrlKeys: Object.freeze(definition.retiredUrlKeys ?? []),
    validate: (raw: Readonly<Record<string, unknown>>, options?: ValidateOptions) =>
      validateRecord(definition.inputs, raw, options),
    compute: definition.compute,
  });
}
