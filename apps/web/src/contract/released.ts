import {
  compareReleased,
  type ReleasedCalculator,
  type ReleasedField,
} from '@maestro-calc/core/testing/released-harness';

/**
 * What stands between a calculator and a public URL contract it does not honour. The harness
 * (`compareReleased`) holds released tuples to their inputs but lets a new field be appended
 * without a tuple, and says nothing of a calculator that is not in the snapshot at all; this adds
 * the completeness half: every live input of every calculator in the registry has its tuple, and
 * a released calculator is still in the registry. A tuple marked `retired` belongs to no input.
 */
export const completenessProblems = (
  snapshot: readonly ReleasedField[],
  registry: readonly ReleasedCalculator[],
): string[] => {
  const live = (id: string): ReleasedField[] =>
    snapshot.filter((tuple) => tuple.calculatorId === id && tuple.retired !== true);
  const unreleased = registry.flatMap((calculator) => {
    const tuples = live(calculator.id);
    if (tuples.length === 0) {
      return [`${calculator.id}: no released tuple, add its inputs to RELEASED`];
    }
    return calculator.inputs
      .slice(tuples.length)
      .map((input) => `${calculator.id}.${input.key}: input has no released tuple`);
  });
  const missing = [...new Set(snapshot.map(({ calculatorId }) => calculatorId))]
    .filter((id) => !registry.some((calculator) => calculator.id === id))
    .map((id) => `${id}: released calculator is missing from the registry`);
  // a missing calculator is reported once, by the line above, not again by the harness
  const kept = registry.map(({ id }) => id);
  const known = snapshot.filter(({ calculatorId }) => kept.includes(calculatorId));
  return [...unreleased, ...missing, ...compareReleased(known, registry)];
};
