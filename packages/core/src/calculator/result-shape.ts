import type { ComputeResult, OutputDescriptor, RunOutput, RunResult } from './descriptors.ts';
import type { Runnable } from './run.ts';

type Output = RunOutput<readonly OutputDescriptor[]>;

/**
 * The shape of a `compute` result without the checks of `result-checks.ts`, which a page script
 * loads in their place (`skipResultChecks` of the web client build): the outputs listed in
 * declaration order with their roles, the shopping lines and the warnings as `compute` returned
 * them. Every calculator a page ships keeps the contract on every input, which its property tests
 * prove in Node with the checks in place, so the browser would only run them again; on such a
 * result the two give the same (`result-shape.test.ts`). Never used outside a client build.
 */
export const shapeOf = (
  { outputs }: Pick<Runnable, 'id' | 'outputs' | 'warnings'>,
  result: unknown,
): RunResult<readonly OutputDescriptor[], string> => {
  // the contract this module trusts: `compute` returned its declared outputs, lines and warnings
  const computed = result as ComputeResult<readonly OutputDescriptor[], string>;
  const values = computed.outputs as Readonly<Record<string, Output['value']>>;
  return {
    outputs: outputs.map(({ key, role }): Output => ({
      key,
      role,
      value: values[key] as Output['value'],
    })),
    shopping: computed.shopping,
    warnings: computed.warnings,
  };
};
