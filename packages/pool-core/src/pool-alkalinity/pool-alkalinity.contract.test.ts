import { describe, expect, it } from 'vitest';
import { poolAlkalinity } from './pool-alkalinity.ts';

// The URL keys are a public contract: a shared link must reopen the same numbers forever.
describe('pool-alkalinity contract', () => {
  it('keys every input', () => {
    expect(poolAlkalinity.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['gallons', 'g'],
      ['current', 'c'],
      ['target', 't'],
      ['units', 'm'],
    ]);
  });

  it('leads with its primary output', () => {
    expect(poolAlkalinity.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['pounds', 'primary'],
      ['ounces', 'secondary'],
    ]);
  });
});
