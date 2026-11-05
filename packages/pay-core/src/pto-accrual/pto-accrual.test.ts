import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { ptoAccrual } from './pto-accrual.ts';

// Hand-verified: 10 days x 8 h = 80 h a year; 40 h x 52 weeks = 2,080 h worked.
// 80 / 26 = 3.0769 h every two weeks; 80 / 52 = 1.5385 a week; 80 / 24 = 3.3333 twice a month;
// 80 / 12 = 6.6667 a month; 80 / 2,080 = 0.0385 h per hour worked, 1 h for every 26 h worked.
const r = (n: number, d = 1): Rational => Rational.of(n, d);

const runOf = (raw: Readonly<Record<string, unknown>>) => {
  const ran = ptoAccrual.run(raw);
  if (!ran.ok) throw new Error(JSON.stringify(ran.errors));
  return {
    outputs: Object.fromEntries(ran.value.outputs.map(({ key, value }) => [key, value])),
    warnings: ran.value.warnings.map(({ code }) => code),
  };
};

describe('PTO accrual', () => {
  it('spreads 10 days of 8 hours over a 40 hour week', () => {
    expect(runOf({})).toEqual({
      outputs: {
        biweekly: r(40, 13),
        weekly: r(20, 13),
        semimonthly: r(10, 3),
        monthly: r(20, 3),
        perHourWorked: r(1, 26),
        hoursPerPtoHour: r(26),
        annualHours: r(80),
      },
      warnings: [],
    });
  });

  it('gives 15 days 120 hours: 4.62 every two weeks, 1 hour for every 17.33 worked', () => {
    // 120 / 26 = 60/13; 120 / 2,080 = 3/52; 2,080 / 120 = 52/3
    const { outputs } = runOf({ ptoDays: '15' });
    expect(outputs['biweekly']).toEqual(r(60, 13));
    expect(outputs['perHourWorked']).toEqual(r(3, 52));
    expect(outputs['hoursPerPtoHour']).toEqual(r(52, 3));
    expect(outputs['monthly']).toEqual(r(10));
  });

  it('keeps the rate of a part-time week: 10 days of 6 hours on 30 hours a week', () => {
    // 60 h a year over 1,560 h worked is 1/26, the same rate as the full-time default
    const { outputs } = runOf({ hoursPerDay: '6', hoursPerWeek: '30' });
    expect(outputs['annualHours']).toEqual(r(60));
    expect(outputs['biweekly']).toEqual(r(30, 13));
    expect(outputs['perHourWorked']).toEqual(r(1, 26));
    expect(outputs['hoursPerPtoHour']).toEqual(r(26));
  });

  it('takes half days', () => {
    expect(runOf({ ptoDays: '12.5' }).outputs['annualHours']).toEqual(r(100));
  });

  it('warns when the time off is more than the hours worked a year, not when it is equal', () => {
    // 1 h a week is 52 h a year: 6.5 days of 8 h is 52 h, 7 days is 56 h
    expect(runOf({ ptoDays: '6.5', hoursPerWeek: '1' }).warnings).toEqual([]);
    expect(runOf({ ptoDays: '7', hoursPerWeek: '1' }).warnings).toEqual(['moreThanWorked']);
  });

  it('refuses no time off, a day longer than 24 hours and a week longer than 168', () => {
    expect(ptoAccrual.run({ ptoDays: '0' }).ok).toBe(false);
    expect(ptoAccrual.run({ ptoDays: '0.5' }).ok).toBe(true);
    expect(ptoAccrual.run({ ptoDays: '365' }).ok).toBe(true);
    expect(ptoAccrual.run({ ptoDays: '366' }).ok).toBe(false);
    expect(ptoAccrual.run({ hoursPerDay: '24' }).ok).toBe(true);
    expect(ptoAccrual.run({ hoursPerDay: '24.5' }).ok).toBe(false);
    expect(ptoAccrual.run({ hoursPerDay: '0.5' }).ok).toBe(false);
    expect(ptoAccrual.run({ hoursPerWeek: '168' }).ok).toBe(true);
    expect(ptoAccrual.run({ hoursPerWeek: '169' }).ok).toBe(false);
    expect(ptoAccrual.run({ hoursPerWeek: '0.5' }).ok).toBe(false);
  });
});
