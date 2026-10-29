import { isQuantity, lbYd3, valueIn } from '@maestro-calc/core';
import { createGravel } from '@maestro-calc/core/calculators/gravel';
import { GRAVEL_DENSITIES as FIXTURE } from '@maestro-calc/core/testing/gravel-yields';
import { GRAVEL_DENSITIES } from '@maestro-calc/data/yields/gravel';
import { describe, expect, it } from 'vitest';
import { gravel } from './gravel.ts';

/** Each output of a run as text: a quantity by its exact canonical value, money marked as such. */
const outputsOf = (calculator: typeof gravel, raw: Readonly<Record<string, unknown>> = {}) => {
  const result = calculator.run(raw);
  if (!result.ok) throw new Error('run failed');
  return result.value.outputs.map(({ key, value }) =>
    isQuantity(value) ? `${key}=${value.canonical.toString()}` : `${key}=money`,
  );
};

describe('the web gravel calculator (calc-gravel › Injected densities)', () => {
  // the composition root builds core's factory from the numbers-only module of the data package
  it('is built from the data densities and runs like core with its fixture', () => {
    expect(gravel.id).toBe('gravel');
    expect(outputsOf(gravel)).toEqual(outputsOf(createGravel(FIXTURE)));
    expect(outputsOf(gravel, { placement: 'loose' })).toEqual(
      outputsOf(createGravel(FIXTURE), { placement: 'loose' }),
    );
  });

  // drift guard: the data module and the core fixture hold the same densities
  it.each(['compacted', 'loose'] as const)('holds the same %s density on both sides', (key) => {
    expect(valueIn(GRAVEL_DENSITIES[key], lbYd3)).toEqual(valueIn(FIXTURE[key], lbYd3));
  });
});
