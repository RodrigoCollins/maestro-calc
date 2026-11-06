import { Rational, usd } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { overtime } from './overtime.ts';

// The URL keys are a public contract: a shared link must reopen the same week forever.
describe('overtime contract', () => {
  it('keys the rate, the rule and each day by its two-letter stem', () => {
    expect(overtime.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['rate', 'r'],
      ['rule', 'ru'],
      ['mon', 'mo'],
      ['tue', 'tu'],
      ['wed', 'we'],
      ['thu', 'th'],
      ['fri', 'fr'],
      ['sat', 'sa'],
      ['sun', 'su'],
    ]);
  });

  it('starts at the time card week: $22, federal, Mon-Fri 9 h, Sat 4.5 h, Sunday off', () => {
    const [rate, rule, ...days] = overtime.inputs;
    expect(rate.default).toEqual(usd(22));
    expect(rate.max).toEqual(usd(1000));
    // appended, never reordered: `ru=california` must keep meaning California
    expect(rule.options).toEqual(['federal', 'california', 'alaska', 'nevada', 'colorado']);
    expect(rule.default).toBe('federal');
    expect(days.map((day) => day.default)).toEqual([
      Rational.of(9),
      Rational.of(9),
      Rational.of(9),
      Rational.of(9),
      Rational.of(9),
      Rational.of(9, 2),
      Rational.of(0),
    ]);
    for (const day of days) {
      expect(day.kind).toBe('decimal');
      expect([day.min, day.max]).toEqual([Rational.of(0), Rational.of(24)]);
    }
  });

  it('leads with the pay, then the hours, the pay of each rate and the rates', () => {
    expect(overtime.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['pay', 'primary'],
      ...[
        'totalHours',
        'regularHours',
        'overtimeHours',
        'doubleHours',
        'regularPay',
        'overtimePay',
        'doublePay',
        'overtimeRate',
        'doubleRate',
      ].map((key) => [key, 'secondary']),
    ]);
  });
});
