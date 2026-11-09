import { describe, expect, it } from 'vitest';
import { poolSalt } from './pool-salt.ts';

// The URL keys are a public contract: a shared link must reopen the same numbers forever.
describe('pool-salt contract', () => {
  it('keys every input', () => {
    expect(poolSalt.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['gallons', 'g'],
      ['current', 'c'],
      ['target', 't'],
      ['units', 'm'],
    ]);
  });

  it('leads with its primary output', () => {
    expect(poolSalt.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['pounds', 'primary'],
      ['kilograms', 'secondary'],
      ['firstAddition', 'secondary'],
    ]);
  });
});
