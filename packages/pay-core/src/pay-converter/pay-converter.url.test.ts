import { describe, expect, it } from 'vitest';
import { payConverter } from './pay-converter.ts';

// The URL keys are a public contract: a shared link must reopen the same conversion forever.
describe('pay converter URL keys and inputs', () => {
  it('keys the amount, the period, the hours and the weeks', () => {
    expect(payConverter.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['amount', 'a'],
      ['per', 'p'],
      ['hoursPerWeek', 'h'],
      ['weeksPerYear', 'w'],
    ]);
  });

  it('offers the six periods, hourly first', () => {
    const per = payConverter.inputs[1];
    expect(per.options).toEqual([
      'hour',
      'week',
      'biweekly',
      'semimonthly',
      'month',
      'year',
    ]);
  });
});
