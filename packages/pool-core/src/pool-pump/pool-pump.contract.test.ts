import { describe, expect, it } from 'vitest';
import { poolPump } from './pool-pump.ts';

// The URL keys are a public contract: a shared link must reopen the same numbers forever.
describe('pool-pump contract', () => {
  it('keys every input', () => {
    expect(poolPump.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([['gallons', 'g']]);
  });

  it('leads with its primary output', () => {
    expect(poolPump.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['flow', 'primary'],
      ['eightHour', 'secondary'],
    ]);
  });
});
