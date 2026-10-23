import { CoreError } from '../errors.ts';
import { UNITS } from '../units/catalog.ts';
import { boundsOf, checkAmount, defaultAmount } from './constraints.ts';
import type {
  BoundedDescriptor,
  Calculator,
  ComputeResult,
  InputDescriptor,
  InputsOf,
  OutputDescriptor,
  SelectDescriptor,
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

const ensure = (condition: boolean, reason: DefinitionReason): void => {
  if (!condition) throw new CoreError('INVALID_DEFINITION', reason);
};

const isUnique = (values: readonly string[]): boolean => new Set(values).size === values.length;

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

const checkBounded = (input: BoundedDescriptor): void => {
  ensure(hasValidBounds(input), 'INVALID_BOUNDS');
  // a fractional count default has no exact amount to compare; it is not a valid default either
  const whole = input.kind !== 'count' || Number.isSafeInteger(input.default);
  ensure(whole && checkAmount(input, defaultAmount(input)) === undefined, 'DEFAULT_INVALID');
};

const checkSelect = (input: SelectDescriptor): void => {
  ensure(input.options.length > 0, 'NO_OPTIONS');
  ensure(
    input.options.every((option) => OPTION_ID.test(option)),
    'INVALID_OPTION_ID',
  );
  ensure(isUnique(input.options), 'DUPLICATE_OPTION');
  ensure(input.options.includes(input.default), 'DEFAULT_INVALID');
};

const checkInput = (input: InputDescriptor): void => {
  if (input.kind === 'boolean') return;
  if (input.kind === 'select') {
    checkSelect(input);
    return;
  }
  if (input.kind === 'length') {
    const units = IMPERIAL_UNITS.includes(input.defaultUnit);
    ensure(units && METRIC_UNITS.includes(input.metricDefaultUnit), 'INVALID_UNIT');
  }
  checkBounded(input);
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
  ensure(ID.test(id), 'INVALID_ID');
  ensure(inputs.length > 0, 'NO_INPUTS');
  const retired = new Set(definition.retiredUrlKeys);
  for (const input of inputs) {
    ensure(KEY.test(input.key), 'INVALID_KEY');
    ensure(URL_KEY.test(input.urlKey), 'INVALID_URL_KEY');
    ensure(
      !RESERVED_URL_KEYS.includes(input.urlKey) && !retired.has(input.urlKey),
      'RESERVED_URL_KEY',
    );
    checkInput(input);
  }
  ensure(isUnique(inputs.map(({ key }) => key)), 'DUPLICATE_KEY');
  ensure(isUnique(inputs.map(({ urlKey }) => urlKey)), 'DUPLICATE_URL_KEY');
  ensure(outputs.length > 0, 'NO_OUTPUTS');
  ensure(
    outputs.every(({ key }) => KEY.test(key)),
    'INVALID_KEY',
  );
  ensure(isUnique(outputs.map(({ key }) => key)), 'DUPLICATE_OUTPUT_KEY');
  ensure(outputs.filter(({ role }) => role === 'primary').length === 1, 'PRIMARY_COUNT');
  ensure(outputs.every(hasValidDisplay), 'INVALID_DISPLAY');
  ensure(
    warnings.every((code) => KEY.test(code)),
    'INVALID_KEY',
  );
  ensure(isUnique(warnings), 'DUPLICATE_KEY');
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
  return Object.freeze({
    id: definition.id,
    inputs: definition.inputs,
    outputs: definition.outputs,
    warnings: definition.warnings ?? [],
    retiredUrlKeys: definition.retiredUrlKeys ?? [],
    compute: definition.compute,
  });
}
