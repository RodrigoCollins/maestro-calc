import { describe, expect, it } from 'vitest';
import { poolCalcium } from './pool-calcium.ts';

// The URL keys are a public contract: a shared link must reopen the same numbers forever.
describe('pool-calcium contract', () => {
  it('keys every input', () => {
    expect(poolCalcium.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['gallons', 'g'],
      ['current', 'c'],
      ['target', 't'],
    ]);
  });

  it('leads with its primary output', () => {
    expect(poolCalcium.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['pounds', 'primary'],
      ['ounces', 'secondary'],
      ['firstAddition', 'secondary'],
    ]);
  });
});
