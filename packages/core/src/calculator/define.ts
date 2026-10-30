import { checkDefinition } from './definition-checks.ts';
import { runCalculator } from './run.ts';
import { validateRecord } from './validate.ts';
import type {
  AnyCalculator,
  Calculator,
  ComputeResult,
  InputDescriptor,
  InputsOf,
  OutputDescriptor,
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

export type { DefinitionLocus } from './definition-checks.ts';

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
): AnyCalculator {
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
  const runnable = {
    id: definition.id,
    outputs: definition.outputs,
    warnings: Object.freeze(definition.warnings ?? []),
    validate: (raw: Readonly<Record<string, unknown>>, options?: ValidateOptions) =>
      validateRecord(definition.inputs, raw, options),
    compute: definition.compute,
  };
  return Object.freeze({
    inputs: definition.inputs,
    retiredUrlKeys: Object.freeze(definition.retiredUrlKeys ?? []),
    ...runnable,
    run: (raw: Readonly<Record<string, unknown>>, options?: ValidateOptions) =>
      runCalculator(runnable, raw, options),
  });
}
