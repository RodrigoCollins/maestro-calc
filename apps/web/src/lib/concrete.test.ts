import { ft3, in3, isQuantity, valueIn } from '@maestro-calc/core';
import { createConcrete } from '@maestro-calc/core/calculators/concrete';
import { CONCRETE_YIELDS } from '@maestro-calc/core/testing/concrete-yields';
import { CONCRETE_MIX_YIELDS } from '@maestro-calc/data/yields/concrete-mix';
import { describe, expect, it } from 'vitest';
import { concrete } from './concrete.ts';

/** Each output of the default run, a volume as exact cubic inches and money marked as such. */
const defaultsOf = (calculator: typeof concrete): string[] => {
  const result = calculator.run({});
  if (!result.ok) throw new Error('run failed');
  return result.value.outputs.map(({ key, value }) =>
    isQuantity(value) ? `${key}=${valueIn(value, in3).toString()}` : `${key}=money`,
  );
};

describe('the web concrete calculator (calc-concrete › Yield injection)', () => {
  // spec: calc-concrete › Yield injection: the root builds the record from the yields-only module
  it('is built from CONCRETE_MIX_YIELDS, bag-<n> mapped to <n>', () => {
    expect(concrete.id).toBe('concrete');
    expect(defaultsOf(concrete)).toEqual(defaultsOf(createConcrete(CONCRETE_YIELDS)));
    expect(valueIn(CONCRETE_MIX_YIELDS['bag-80'], ft3).toString()).toBe('3/5');
    const result = concrete.run({ bag: '40' });
    expect(result.ok && result.value.shopping[0]?.qty).toBe(147n);
  });
});
