import { Rational, usd } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { timeCard } from './time-card.ts';

// Hand-verified cases (plans/pago-del-trabajador/PLAN.md, the mockup week):
// Mon-Fri 7:00 a.m. to 4:30 p.m. with a 30 min break = 9 h a day, Sat 7:00 to 11:30 = 4.5 h,
// Sunday off: 49.5 h at $22.00. Federal (FLSA): 40 h regular, 9.5 h at 1.5x = $33.00.
const r = (n: number, d = 1): Rational => Rational.of(n, d);

const outputsOf = (raw: Readonly<Record<string, unknown>>): Record<string, unknown> => {
  const ran = timeCard.run(raw);
  if (!ran.ok) throw new Error(JSON.stringify(ran.errors));
  return Object.fromEntries(ran.value.outputs.map(({ key, value }) => [key, value]));
};

describe('time card (federal overtime after 40 hours)', () => {
  it('pays the default week: 49.5 h, 40 regular, 9.5 overtime, $1,193.50', () => {
    expect(outputsOf({})).toEqual({
      pay: usd(r(238700, 200)),
      totalHours: r(99, 2),
      regularHours: r(40),
      overtimeHours: r(19, 2),
      doubleHours: r(0),
      regularPay: usd(880),
      overtimePay: usd(r(627, 2)),
      doublePay: usd(0),
      monHours: r(9),
      tueHours: r(9),
      wedHours: r(9),
      thuHours: r(9),
      friHours: r(9),
      satHours: r(9, 2),
      sunHours: r(0),
    });
  });

  it('has no overtime at 40 hours or less', () => {
    const fourDays = { fri: '', friOut: '', sat: '', satOut: '' };
    const out = outputsOf({ ...fourDays, rate: '20' });
    // 4 x 9 h = 36 h, all regular
    expect(out['totalHours']).toEqual(r(36));
    expect(out['overtimeHours']).toEqual(r(0));
    expect(out['pay']).toEqual(usd(720));
  });

  it('counts an overnight shift across midnight', () => {
    const night = {
      mon: '10:00 pm',
      monOut: '6:00 am',
      monBreak: '0',
      tue: '',
      tueOut: '',
      wed: '',
      wedOut: '',
      thu: '',
      thuOut: '',
      fri: '',
      friOut: '',
      sat: '',
      satOut: '',
    };
    expect(outputsOf(night)['totalHours']).toEqual(r(8));
  });

  it('counts a day with only one time as not worked, and does not warn about it', () => {
    for (const saturday of [
      { sat: '7:00 am', satOut: '' },
      { sat: '', satOut: '11:30 am' },
    ]) {
      const ran = timeCard.run({ ...saturday, satBreak: '30' });
      expect(ran.ok && ran.value.warnings).toEqual([]);
      expect(outputsOf({ ...saturday, satBreak: '30' })['totalHours']).toEqual(r(45));
    }
  });

  it('warns and counts zero when the break is as long as the shift, or longer', () => {
    for (const satBreak of ['30', '45']) {
      const ran = timeCard.run({ sat: '7:00', satOut: '7:30', satBreak });
      expect(ran.ok && ran.value.warnings, satBreak).toEqual([
        { code: 'breakTooLong', params: { day: 'sat' } },
      ]);
      expect(outputsOf({ sat: '7:00', satOut: '7:30', satBreak })['totalHours']).toEqual(r(45));
    }
  });
});

describe('time card (California: daily and weekly overtime, seventh day)', () => {
  it('gives the default week the same pay: 5 daily + 4.5 weekly overtime hours', () => {
    const out = outputsOf({ rule: 'california' });
    expect(out['regularHours']).toEqual(r(40));
    expect(out['overtimeHours']).toEqual(r(19, 2));
    expect(out['pay']).toEqual(usd(r(238700, 200)));
  });

  it('pays double after 12 hours in a day', () => {
    // Mon 6:00 a.m. to 7:30 p.m., 30 min break = 13 h: 8 regular, 4 overtime, 1 double
    const out = outputsOf({ rule: 'california', mon: '6:00 am', monOut: '7:30 pm' });
    expect(out['doubleHours']).toEqual(r(1));
    expect(out['doublePay']).toEqual(usd(44));
    // daily overtime stops at 12 h: Mon 4, Tue-Fri 4 x 1, plus 4.5 regular hours past 40 (44.5)
    expect(out['overtimeHours']).toEqual(r(25, 2));
    expect(out['regularHours']).toEqual(r(40));
  });

  it('has no seventh day when another day of the week is off', () => {
    // Monday off, Tue-Fri 9 h, Sat 4.5 h, Sun 9 h: Sunday is the sixth workday, paid by the day.
    // Daily: 36.5 + 8 regular, 4 + 1 overtime; weekly cap moves 4.5 regular to overtime.
    const out = outputsOf({
      rule: 'california',
      mon: '',
      monOut: '',
      sun: '7:00 am',
      sunOut: '4:30 pm',
      sunBreak: '30',
    });
    expect(out['regularHours']).toEqual(r(40));
    expect(out['overtimeHours']).toEqual(r(19, 2));
    expect(out['doubleHours']).toEqual(r(0));
  });

  it('pays the seventh consecutive day: first 8 h at 1.5x, beyond 8 at 2x', () => {
    // every day 7:00 a.m. to 4:30 p.m. less 30 min = 9 h; Sunday is the seventh day
    const week = {
      sat: '7:00 am',
      satOut: '4:30 pm',
      satBreak: '30',
      sun: '7:00 am',
      sunOut: '4:30 pm',
      sunBreak: '30',
    };
    const out = outputsOf({ ...week, rule: 'california' });
    // Mon-Sat: 6 x (8 regular + 1 daily overtime) = 48 regular, 6 overtime; weekly cap moves 8
    // regular to overtime: 40 regular, 14 overtime. Sunday: 8 overtime, 1 double.
    expect(out['regularHours']).toEqual(r(40));
    expect(out['overtimeHours']).toEqual(r(22));
    expect(out['doubleHours']).toEqual(r(1));
    expect(out['totalHours']).toEqual(r(63));
  });
});
