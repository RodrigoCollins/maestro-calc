import { describe, expect, it } from 'vitest';
import { poolChlorine } from './pool-chlorine.ts';

// The URL keys are a public contract: a shared link must reopen the same numbers forever.
describe('pool-chlorine contract', () => {
  it('keys every input', () => {
    expect(poolChlorine.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['gallons', 'g'],
      ['current', 'c'],
      ['target', 't'],
      ['product', 'p'],
    ]);
  });

  it('leads with its primary output', () => {
    expect(poolChlorine.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['liquid', 'primary'],
      ['dry', 'secondary'],
    ]);
  });
});
