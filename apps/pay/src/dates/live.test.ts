import { describe, expect, it } from 'vitest';
import { countdownOf, dataOfRule, ruleOfData } from './live.ts';

describe('the live countdown', () => {
  it('counts to Christmas from 9 November 2026: 46 days, 6 weeks and 4 days', () => {
    // 21 days left in November (9 to 30) plus 25 in December
    expect(countdownOf({ kind: 'fixed', m: 12, d: 25 }, { y: 2026, m: 11, d: 9 })).toEqual({
      days: '46 días',
      weeks: '6 semanas y 4 días',
      date: 'viernes 25 de diciembre de 2026',
      today: false,
    });
  });

  it('says it is today on the day, and counts to next year the day after', () => {
    const rule = { kind: 'fixed', m: 1, d: 6 } as const;
    expect(countdownOf(rule, { y: 2027, m: 1, d: 6 })).toEqual({
      days: '¡Es hoy!',
      weeks: 'Hoy mismo',
      date: 'miércoles 6 de enero de 2027',
      today: true,
    });
    // 2027 is not a leap year: 365 days to 6 Jan 2028, a Thursday
    expect(countdownOf(rule, { y: 2027, m: 1, d: 7 }).days).toBe('364 días');
    expect(countdownOf(rule, { y: 2027, m: 1, d: 5 }).days).toBe('1 día');
  });

  it('carries each kind of rule through the data attributes and back', () => {
    const rules = [
      { kind: 'fixed', m: 12, d: 25 },
      { kind: 'easter', offset: -7 },
      { kind: 'nth-weekday', m: 5, weekday: 6, n: 1 },
    ] as const;
    for (const rule of rules) {
      const data = dataOfRule(rule);
      for (const value of Object.values(data)) expect(typeof value).toBe('string');
      expect(ruleOfData(data)).toEqual(rule);
    }
  });

  it('reads no rule from missing or broken data', () => {
    expect(ruleOfData({})).toBeNull();
    expect(ruleOfData({ rule: 'fixed', m: '12' })).toBeNull();
    expect(ruleOfData({ rule: 'fixed', m: 'x', d: '1' })).toBeNull();
    expect(ruleOfData({ rule: 'easter' })).toBeNull();
    expect(ruleOfData({ rule: 'nth-weekday', m: '5', weekday: '6' })).toBeNull();
    expect(ruleOfData({ rule: 'other', m: '5', d: '1' })).toBeNull();
  });
});
