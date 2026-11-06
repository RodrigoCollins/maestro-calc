import type { ComputeResult, OutputDescriptor, RunOutput, RunResult } from './descriptors.ts';
import type { Runnable } from './run.ts';

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
  { outputs: values, shopping, warnings }: ComputeResult<readonly OutputDescriptor[], string>,
): RunResult<readonly OutputDescriptor[], string> => ({
  // every declared key is there on a result that keeps the contract, so none is skipped
  outputs: outputs.flatMap(({ key, role }): RunOutput<readonly OutputDescriptor[]>[] => {
    const value = values[key];
    return value === undefined ? [] : [{ key, role, value }];
  }),
  shopping,
  warnings,
});
