import type {
  Calculator,
  ComputeResult,
  InputDescriptor,
  InputsOf,
  OutputDescriptor,
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
  return Object.freeze({
    id: definition.id,
    inputs: definition.inputs,
    outputs: definition.outputs,
    warnings: definition.warnings ?? [],
    retiredUrlKeys: definition.retiredUrlKeys ?? [],
    compute: definition.compute,
  });
}
