import { describe, expect, it } from 'vitest';
import { poolFillTime } from './pool-fill-time.ts';

// The URL keys are a public contract: a shared link must reopen the same numbers forever.
describe('pool-fill-time contract', () => {
  it('keys every input', () => {
    expect(poolFillTime.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['gallons', 'g'],
      ['flow', 'f'],
    ]);
  });

  it('leads with its primary output', () => {
    expect(poolFillTime.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['time', 'primary'],
      ['minutes', 'secondary'],
    ]);
  });
});
