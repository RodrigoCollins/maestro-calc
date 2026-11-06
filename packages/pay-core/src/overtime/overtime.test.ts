import { Rational, usd } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { timeCard } from '../time-card/time-card.ts';
import { overtime } from './overtime.ts';

// Hand-verified cases, hours worked each day Monday to Sunday at $22.00 an hour unless stated:
// overtime is $33.00 an hour (1.5x) and double time $44.00 (2x).
const r = (n: number, d = 1): Rational => Rational.of(n, d);

const outputsOf = (raw: Readonly<Record<string, unknown>>): Record<string, unknown> => {
  const ran = overtime.run(raw);
  if (!ran.ok) throw new Error(JSON.stringify(ran.errors));
  return Object.fromEntries(ran.value.outputs.map(({ key, value }) => [key, value]));
};

const OFF = { mon: '0', tue: '0', wed: '0', thu: '0', fri: '0', sat: '0', sun: '0' };

describe('overtime calculator', () => {
  it('pays the default federal week: 49.5 h, 40 regular, 9.5 overtime, $1,193.50', () => {
    // 40 x 22 = 880; 9.5 x 33 = 313.50
    expect(outputsOf({})).toEqual({
      pay: usd(r(238700, 200)),
      totalHours: r(99, 2),
      regularHours: r(40),
      overtimeHours: r(19, 2),
      doubleHours: r(0),
      regularPay: usd(880),
      overtimePay: usd(r(627, 2)),
      doublePay: usd(0),
      overtimeRate: usd(33),
      doubleRate: usd(44),
    });
  });

  it('pays four 10 h days $880.00 under the federal rule and $968.00 in California', () => {
    const week = { ...OFF, mon: '10', tue: '10', wed: '10', thu: '10' };
    const federal = outputsOf(week);
    expect(federal['overtimeHours']).toEqual(r(0));
    expect(federal['pay']).toEqual(usd(880));
    // California: 32 x 22 = 704; 8 x 33 = 264
    const california = outputsOf({ ...week, rule: 'california' });
    expect(california['regularHours']).toEqual(r(32));
    expect(california['overtimeHours']).toEqual(r(8));
    expect(california['pay']).toEqual(usd(968));
  });

  it('pays a 13 h day in California as 8 regular, 4 overtime and 1 double: $352.00', () => {
    // 8 x 22 = 176; 4 x 33 = 132; 1 x 44 = 44
    const out = outputsOf({ ...OFF, mon: '13', rule: 'california' });
    expect(out['regularPay']).toEqual(usd(176));
    expect(out['overtimePay']).toEqual(usd(132));
    expect(out['doublePay']).toEqual(usd(44));
    expect(out['pay']).toEqual(usd(352));
  });

  it('pays the California seventh day: 9 h every day is $1,650.00', () => {
    // 40 x 22 = 880; 22 x 33 = 726; 1 x 44 = 44
    const nine = Object.fromEntries(Object.keys(OFF).map((day) => [day, '9']));
    const out = outputsOf({ ...nine, rule: 'california' });
    expect([out['regularHours'], out['overtimeHours'], out['doubleHours']]).toEqual([
      r(40),
      r(22),
      r(1),
    ]);
    expect(out['pay']).toEqual(usd(1650));
  });

  it('takes quarter hours and cents: $18.50 for five 8.25 h days is $774.69', () => {
    // 41.25 h: 40 x 18.50 = 740; 1.25 x 27.75 = 34.6875; the money rounds only when shown
    const out = outputsOf({
      ...OFF,
      rate: '18.50',
      mon: '8.25',
      tue: '8.25',
      wed: '8.25',
      thu: '8.25',
      fri: '8.25',
    });
    expect(out['overtimeRate']).toEqual(usd(r(2775, 100)));
    expect(out['overtimeHours']).toEqual(r(5, 4));
    expect(out['pay']).toEqual(usd(r(7746875, 10000)));
  });

  it('refuses a day longer than 24 hours or below zero', () => {
    for (const mon of ['24.5', '-1']) {
      const ran = overtime.run({ mon });
      expect(ran.ok, mon).toBe(false);
      expect(!ran.ok && ran.errors.map(({ field }) => field)).toEqual(['mon']);
    }
  });

  it('agrees with the time card on the same week of whole hours', () => {
    // Mon 6:00 to 19:00 (13 h), Tue-Fri 8:00 to 18:00 (10 h), Sat 8:00 to 12:30 (4.5 h)
    const card = timeCard.run({
      rule: 'california',
      mon: '6:00',
      monOut: '19:00',
      ...Object.fromEntries(
        ['tue', 'wed', 'thu', 'fri'].flatMap((day) => [
          [day, '8:00'],
          [`${day}Out`, '18:00'],
          [`${day}Break`, '0'],
        ]),
      ),
      monBreak: '0',
      sat: '8:00',
      satOut: '12:30',
    });
    if (!card.ok) throw new Error('the time card week must run');
    const fromCard = Object.fromEntries(card.value.outputs.map(({ key, value }) => [key, value]));
    const out = outputsOf({
      rule: 'california',
      mon: '13',
      tue: '10',
      wed: '10',
      thu: '10',
      fri: '10',
    });
    for (const key of ['pay', 'regularHours', 'overtimeHours', 'doubleHours']) {
      expect(out[key], key).toEqual(fromCard[key]);
    }
  });
});

describe('overtime calculator, the state rules', () => {
  // four 10 h days: Alaska pays 8 h past 8 a day, 32 x $22 + 8 x $33 = $968.00
  it('pays four 10 h days in Alaska like California, without double time', () => {
    const four = { ...OFF, mon: '10', tue: '10', wed: '10', thu: '10' };
    expect(outputsOf({ ...four, rule: 'alaska' })['pay']).toEqual(usd(968));
    // a 13 h Monday: 8 + 5 overtime, no double; 8 x 22 + 5 x 33 = $341.00
    expect(outputsOf({ ...OFF, rule: 'alaska', mon: '13' })['doubleHours']).toEqual(r(0));
    expect(outputsOf({ ...OFF, rule: 'alaska', mon: '13' })['pay']).toEqual(usd(341));
  });

  it('pays Nevada by the day below $18.00 an hour and by the week from $18.00', () => {
    const four = { ...OFF, mon: '10', tue: '10', wed: '10', thu: '10', rule: 'nevada' };
    // $15: 32 x 15 + 8 x 22.50 = 480 + 180 = $660.00; $18: 40 x 18 = $720.00
    expect(outputsOf({ ...four, rate: '15' })['pay']).toEqual(usd(660));
    expect(outputsOf({ ...four, rate: '18' })['overtimeHours']).toEqual(r(0));
    expect(outputsOf({ ...four, rate: '18' })['pay']).toEqual(usd(720));
  });

  it('pays Colorado past 12 h a day: three 14 h days at $22 are $990.00', () => {
    // 36 x 22 = 792 + 6 x 33 = 198
    const days = { ...OFF, mon: '14', tue: '14', wed: '14', rule: 'colorado' };
    expect(outputsOf(days)['pay']).toEqual(usd(990));
  });

  it('keeps the time card on the federal and California rules', () => {
    const rule = timeCard.inputs.find(({ key }) => key === 'rule');
    expect(rule?.kind === 'select' ? rule.options : []).toEqual(['federal', 'california']);
  });
});
