import { describe, expect, it } from 'vitest';
import { poolStabilizer } from './pool-stabilizer.ts';

// The URL keys are a public contract: a shared link must reopen the same numbers forever.
describe('pool-stabilizer contract', () => {
  it('keys every input', () => {
    expect(poolStabilizer.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['gallons', 'g'],
      ['current', 'c'],
      ['target', 't'],
    ]);
  });

  it('leads with its primary output', () => {
    expect(poolStabilizer.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['pounds', 'primary'],
      ['ounces', 'secondary'],
    ]);
  });
});
