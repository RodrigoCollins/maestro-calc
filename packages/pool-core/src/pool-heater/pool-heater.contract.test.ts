import { describe, expect, it } from 'vitest';
import { poolHeater } from './pool-heater.ts';

// The URL keys are a public contract: a shared link must reopen the same numbers forever.
describe('pool-heater contract', () => {
  it('keys every input', () => {
    expect(poolHeater.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['gallons', 'g'],
      ['rise', 'r'],
      ['hours', 'h'],
    ]);
  });

  it('leads with its primary output', () => {
    expect(poolHeater.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['btuPerHour', 'primary'],
      ['btu', 'secondary'],
    ]);
  });
});
