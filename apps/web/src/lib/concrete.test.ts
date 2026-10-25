import { ft3, in3, valueIn } from '@maestro-calc/core';
import { createConcrete } from '@maestro-calc/core/calculators/concrete';
import { CONCRETE_YIELDS } from '@maestro-calc/core/testing/concrete-yields';
import { CONCRETE_MIX_YIELDS } from '@maestro-calc/data/yields/concrete-mix';
import { describe, expect, it } from 'vitest';
import { concrete } from './concrete.ts';

const volumesOf = (calculator: typeof concrete): string[] => {
  const result = calculator.run({});
  if (!result.ok) throw new Error('run failed');
  return result.value.outputs.map(
    ({ key, value }) => `${key}=${valueIn(value as never, in3).toString()}`,
  );
};

describe('the web concrete calculator (calc-concrete › Yield injection)', () => {
  // spec: calc-concrete › Yield injection: the root builds the record from the yields-only module
  it('is built from CONCRETE_MIX_YIELDS, bag-<n> mapped to <n>', () => {
    expect(concrete.id).toBe('concrete');
    expect(volumesOf(concrete)).toEqual(volumesOf(createConcrete(CONCRETE_YIELDS)));
    expect(valueIn(CONCRETE_MIX_YIELDS['bag-80'], ft3).toString()).toBe('3/5');
  });
});
