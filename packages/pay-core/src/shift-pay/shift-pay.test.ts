import { Rational, usd } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { shiftPay } from './shift-pay.ts';

// Hand-verified:
// 9:00 to 17:00 is 8 h, less a 30 min break 7 h 30 min; at $20 the day is 7.5 × 20 = $150; five
// shifts are 37.5 h, no overtime, 37.5 × 20 = $750.
// 19:00 to 7:00 crosses midnight, 12 h, less 30 min 11.5 h; the day 11.5 × 20 = $230; five shifts
// 57.5 h, 17.5 h past 40: 40 × 20 = $800 plus 17.5 × 30 = $525, $1,325.
// 6:00 to 14:30 with no break is 8.5 h; at $22 the day is $187; five shifts 42.5 h, 2.5 h past 40:
// 40 × 22 = $880 plus 2.5 × 33 = $82.50, $962.50.
const r = (n: number, d = 1): Rational => Rational.of(n, d);

const ranOf = (raw: Readonly<Record<string, unknown>>) => {
  const ran = shiftPay.run(raw);
  if (!ran.ok) throw new Error(JSON.stringify(ran.errors));
  const outputs = Object.fromEntries(ran.value.outputs.map(({ key, value }) => [key, value]));
  return { outputs, warnings: ran.value.warnings };
};

const zero = {
  hours: r(0),
  shiftHours: r(0),
  dayPay: usd(0),
  weekHours: r(0),
  overtimeHours: r(0),
  weekPay: usd(0),
};

describe('the hours and the pay of one shift, and of a week of five', () => {
  it('pays 9:00 to 17:00 less 30 minutes at $20 as $150 a day and $750 a week', () => {
    expect(ranOf({})).toEqual({
      outputs: {
        hours: r(15, 2),
        shiftHours: r(8),
        dayPay: usd(150),
        weekHours: r(75, 2),
        overtimeHours: r(0),
        weekPay: usd(750),
      },
      warnings: [],
    });
  });

  it('pays a 12-hour night shift with the hours past 40 at time and a half: $1,325', () => {
    expect(ranOf({ start: '7:00 pm', end: '7:00 am', unpaidBreak: '30', rate: '20' })).toEqual({
      outputs: {
        hours: r(23, 2),
        shiftHours: r(12),
        dayPay: usd(230),
        weekHours: r(115, 2),
        overtimeHours: r(35, 2),
        weekPay: usd(1325),
      },
      warnings: [{ code: 'overnight', params: {} }],
    });
  });

  it('pays 6:00 to 14:30 with no break at $22 as $187 a day and $962.50 a week', () => {
    expect(ranOf({ start: '6:00', end: '14:30', unpaidBreak: '0', rate: '22' })).toEqual({
      outputs: {
        hours: r(17, 2),
        shiftHours: r(17, 2),
        dayPay: usd(187),
        weekHours: r(85, 2),
        overtimeHours: r(5, 2),
        weekPay: usd(r(96250, 100)),
      },
      warnings: [],
    });
  });

  it('counts exactly 40 hours as no overtime: 8:00 to 16:00 with no break at $15', () => {
    const { outputs } = ranOf({ start: '8:00', end: '16:00', unpaidBreak: '0', rate: '15' });
    expect(outputs['weekHours']).toEqual(r(40));
    expect(outputs['overtimeHours']).toEqual(r(0));
    expect(outputs['weekPay']).toEqual(usd(600));
  });

  it('counts zero and warns as the hours calculator does', () => {
    expect(ranOf({ start: '7:00', end: '7:30', unpaidBreak: '30' })).toEqual({
      outputs: { ...zero, shiftHours: r(1, 2) },
      warnings: [{ code: 'breakTooLong', params: {} }],
    });
    expect(ranOf({ start: '' })).toEqual({
      outputs: zero,
      warnings: [{ code: 'missingTime', params: {} }],
    });
    expect(ranOf({ start: '9:00', end: '9:00' }).warnings).toEqual([
      { code: 'sameTime', params: {} },
    ]);
  });

  it('refuses a time, a break or a rate it cannot read', () => {
    expect(shiftPay.run({ start: '25:00' }).ok).toBe(false);
    expect(shiftPay.run({ unpaidBreak: '721' }).ok).toBe(false);
    expect(shiftPay.run({ rate: 'abc' }).ok).toBe(false);
    expect(shiftPay.run({ rate: '1000.01' }).ok).toBe(false);
  });
});
