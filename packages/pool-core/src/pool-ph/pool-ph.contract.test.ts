import { describe, expect, it } from 'vitest';
import { poolPh } from './pool-ph.ts';

// The URL keys are a public contract: a shared link must reopen the same numbers forever.
describe('pool-ph contract', () => {
  it('keys every input', () => {
    expect(poolPh.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['gallons', 'g'],
      ['product', 'p'],
      ['drops', 'd'],
    ]);
  });

  it('leads with its primary output', () => {
    expect(poolPh.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['liquid', 'primary'],
      ['dry', 'secondary'],
    ]);
  });
});
