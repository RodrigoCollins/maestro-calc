import { Rational, usd } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { tippedWage } from './tipped-wage.ts';

// Hand-verified on the FLSA (DOL Fact Sheet #15): a cash wage of at least $2.13, a tip credit of
// at most $5.12, and cash wage + tips of at least $7.25 an hour over the workweek, or the
// employer makes up the difference; overtime is figured on the full $7.25.
// $2.13 x 40 h = $85.20, + $250 in tips = $335.20 >= 40 x $7.25 = $290: no top-up, $8.38 an hour.
// $150 in tips: $85.20 + $150 = $235.20, $290 - $235.20 = $54.80 owed, $290 = $7.25 an hour.
const r = (n: number, d = 1): Rational => Rational.of(n, d);

const runOf = (raw: Readonly<Record<string, unknown>>) => {
  const ran = tippedWage.run(raw);
  if (!ran.ok) throw new Error(JSON.stringify(ran.errors));
  return {
    outputs: Object.fromEntries(ran.value.outputs.map(({ key, value }) => [key, value])),
    warnings: ran.value.warnings.map(({ code }) => code),
  };
};

describe('tipped wage', () => {
  it('pays $335.20 for 40 hours at $2.13 with $250 in tips, and no top-up', () => {
    expect(runOf({})).toEqual({
      outputs: {
        perHour: usd(r(838, 100)),
        totalPay: usd(r(33520, 100)),
        wages: usd(r(8520, 100)),
        tipsPerHour: usd(r(625, 100)),
        tipCredit: usd(r(20480, 100)),
        topUp: usd(0),
        overtimeHours: r(0),
        overtimePremium: usd(0),
      },
      warnings: [],
    });
  });

  it('makes up the difference when the tips fall short: $54.80 on $150 of tips', () => {
    const { outputs, warnings } = runOf({ tips: '150' });
    expect(outputs['topUp']).toEqual(usd(r(5480, 100)));
    expect(outputs['tipCredit']).toEqual(usd(150));
    expect(outputs['totalPay']).toEqual(usd(290));
    expect(outputs['perHour']).toEqual(usd(r(725, 100)));
    expect(warnings).toEqual(['topUpOwed']);
  });

  it('owes no top-up when the tips exactly reach the minimum', () => {
    // $290 - $85.20 = $204.80 in tips: exactly $7.25 an hour
    const { outputs, warnings } = runOf({ tips: '204.80' });
    expect(outputs['topUp']).toEqual(usd(0));
    expect(outputs['tipCredit']).toEqual(usd(r(20480, 100)));
    expect(warnings).toEqual([]);
  });

  it('figures overtime on the full $7.25: 44 hours with $300 in tips pay $408.22', () => {
    // $2.13 x 44 = $93.72; 4 h over 40 add half of $7.25, $3.625 each: $14.50
    const { outputs } = runOf({ hours: '44', tips: '300' });
    expect(outputs['wages']).toEqual(usd(r(9372, 100)));
    expect(outputs['overtimeHours']).toEqual(r(4));
    expect(outputs['overtimePremium']).toEqual(usd(r(1450, 100)));
    expect(outputs['tipCredit']).toEqual(usd(r(22528, 100)));
    expect(outputs['topUp']).toEqual(usd(0));
    expect(outputs['totalPay']).toEqual(usd(r(40822, 100)));
    expect(outputs['perHour']).toEqual(usd(r(40822, 4400)));
  });

  it('tops up the straight time and still pays the overtime half on $7.25', () => {
    // 44 x $7.25 = $319, $319 - $93.72 - $100 = $125.28 owed; + $14.50: $333.50 in all,
    // which is 40 x $7.25 + 4 x $10.875
    const { outputs } = runOf({ hours: '44', tips: '100' });
    expect(outputs['topUp']).toEqual(usd(r(12528, 100)));
    expect(outputs['totalPay']).toEqual(usd(r(33350, 100)));
  });

  it('takes no tip credit at a cash wage of $7.25 or more, and bases overtime on it', () => {
    // $7.25 x 40 = $290 + $100 = $390, $9.75 an hour
    const full = runOf({ cashWage: '7.25', tips: '100' }).outputs;
    expect(full['tipCredit']).toEqual(usd(0));
    expect(full['topUp']).toEqual(usd(0));
    expect(full['perHour']).toEqual(usd(r(975, 100)));
    // $10 x 42 = $420, 2 h over 40 add $5 each: $10; tips leave the regular rate alone
    const high = runOf({ cashWage: '10', tips: '0', hours: '42' }).outputs;
    expect(high['tipCredit']).toEqual(usd(0));
    expect(high['overtimePremium']).toEqual(usd(10));
    expect(high['totalPay']).toEqual(usd(430));
  });

  it('caps the tip credit at the gap between the cash wage and $7.25', () => {
    // $5 cash wage: the credit is at most $2.25 x 40 = $90, whatever the tips
    expect(runOf({ cashWage: '5', tips: '500' }).outputs['tipCredit']).toEqual(usd(90));
    expect(runOf({ cashWage: '5', tips: '60' }).outputs['topUp']).toEqual(usd(30));
  });

  it('refuses a cash wage under $2.13, no hours and more hours than a week has', () => {
    expect(tippedWage.run({ cashWage: '2.12' }).ok).toBe(false);
    expect(tippedWage.run({ cashWage: '2.13' }).ok).toBe(true);
    expect(tippedWage.run({ cashWage: '1000' }).ok).toBe(true);
    expect(tippedWage.run({ cashWage: '1000.01' }).ok).toBe(false);
    expect(tippedWage.run({ tips: '0' }).ok).toBe(true);
    expect(tippedWage.run({ tips: '100000' }).ok).toBe(true);
    expect(tippedWage.run({ tips: '100000.01' }).ok).toBe(false);
    expect(tippedWage.run({ hours: '0' }).ok).toBe(false);
    expect(tippedWage.run({ hours: '0.5' }).ok).toBe(true);
    expect(tippedWage.run({ hours: '168' }).ok).toBe(true);
    expect(tippedWage.run({ hours: '168.5' }).ok).toBe(false);
  });

  // A state's figures (DOL table "Minimum Wages for Tipped Employees", July 1, 2026), by hand:
  // Arizona, $12.15 cash wage, $3.00 max tip credit, $15.15 minimum. 40 h: $486 in cash wages,
  // a $606 minimum; $100 in tips cover $100 of the $120 credit, $20 owed: $606, $15.15 an hour.
  it('tops up to a state minimum: Arizona, 40 hours with $100 in tips owe $20', () => {
    const { outputs, warnings } = runOf({
      cashWage: '12.15',
      minimumWage: '15.15',
      maxTipCredit: '3',
      tips: '100',
    });
    expect(outputs['wages']).toEqual(usd(486));
    expect(outputs['tipCredit']).toEqual(usd(100));
    expect(outputs['topUp']).toEqual(usd(20));
    expect(outputs['totalPay']).toEqual(usd(606));
    expect(outputs['perHour']).toEqual(usd(r(1515, 100)));
    expect(warnings).toEqual(['topUpOwed']);
  });

  it('never counts more of the tips than the state allows: $2.13 in Arizona owes $400.80', () => {
    // $2.13 x 40 = $85.20; the gap to $15.15 is $13.02 x 40 = $520.80, but at most $3.00 x 40 =
    // $120 of tips count: $400.80 owed, $85.20 + $400.80 + $500 = $986, $24.65 an hour
    const { outputs, warnings } = runOf({ minimumWage: '15.15', maxTipCredit: '3', tips: '500' });
    expect(outputs['tipCredit']).toEqual(usd(120));
    expect(outputs['topUp']).toEqual(usd(r(40080, 100)));
    expect(outputs['totalPay']).toEqual(usd(986));
    expect(outputs['perHour']).toEqual(usd(r(2465, 100)));
    expect(warnings).toEqual(['topUpOwed']);
  });

  it('takes no tip credit where the state allows none: California, $16.90 for every hour', () => {
    // $16.90 x 40 = $676 + $200 in tips = $876, $21.90 an hour; 44 h: $743.60 + 4 x $8.45 =
    // $33.80 + $200 = $977.40
    const week = { cashWage: '16.90', minimumWage: '16.90', maxTipCredit: '0', tips: '200' };
    const { outputs, warnings } = runOf(week);
    expect(outputs['tipCredit']).toEqual(usd(0));
    expect(outputs['topUp']).toEqual(usd(0));
    expect(outputs['totalPay']).toEqual(usd(876));
    expect(outputs['perHour']).toEqual(usd(r(2190, 100)));
    expect(warnings).toEqual([]);
    const long = runOf({ ...week, hours: '44' }).outputs;
    expect(long['overtimePremium']).toEqual(usd(r(3380, 100)));
    expect(long['totalPay']).toEqual(usd(r(97740, 100)));
  });

  it('figures overtime on the state minimum: 44 hours in Arizona add 4 x $7.575 = $30.30', () => {
    const { outputs } = runOf({
      cashWage: '12.15',
      minimumWage: '15.15',
      maxTipCredit: '3',
      tips: '300',
      hours: '44',
    });
    expect(outputs['overtimePremium']).toEqual(usd(r(3030, 100)));
  });

  it('refuses a minimum wage under the federal $7.25 and a negative tip credit', () => {
    expect(tippedWage.run({ minimumWage: '7.24' }).ok).toBe(false);
    expect(tippedWage.run({ minimumWage: '7.25' }).ok).toBe(true);
    expect(tippedWage.run({ minimumWage: '1000' }).ok).toBe(true);
    expect(tippedWage.run({ minimumWage: '1000.01' }).ok).toBe(false);
    expect(tippedWage.run({ maxTipCredit: '0' }).ok).toBe(true);
    expect(tippedWage.run({ maxTipCredit: '-1' }).ok).toBe(false);
    expect(tippedWage.run({ maxTipCredit: '1000' }).ok).toBe(true);
    expect(tippedWage.run({ maxTipCredit: '1000.01' }).ok).toBe(false);
  });
});
