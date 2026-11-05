import { Rational, usd } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { shiftDifferential } from './shift-differential.ts';

// Hand-verified at $20 an hour with 10 percent more on the shift: $22 an hour.
// 24 h x $20 = $480, 16 h x $22 = $352: $832 for 40 h, $32 of it the differential,
// a regular rate of $832 / 40 = $20.80 and no overtime.
// 24 h + 24 h = 48 h: $480 + $528 = $1,008, regular rate $1,008 / 48 = $21.00, 8 h over 40,
// premium 8 x $21.00 / 2 = $84.00, pay $1,092.00 (29 CFR 778.115 and 778.207(b)).
const r = (n: number, d = 1): Rational => Rational.of(n, d);

const runOf = (raw: Readonly<Record<string, unknown>>) => {
  const ran = shiftDifferential.run(raw);
  if (!ran.ok) throw new Error(JSON.stringify(ran.errors));
  return {
    outputs: Object.fromEntries(ran.value.outputs.map(({ key, value }) => [key, value])),
    warnings: ran.value.warnings.map(({ code }) => code),
  };
};

describe('shift differential', () => {
  it('pays 16 of 40 hours at 10 percent more: $832 with no overtime', () => {
    expect(runOf({})).toEqual({
      outputs: {
        pay: usd(832),
        shiftRate: usd(22),
        differentialPay: usd(32),
        straightPay: usd(832),
        totalHours: r(40),
        regularRate: usd(r(104, 5)),
        overtimeHours: r(0),
        overtimePremium: usd(0),
      },
      warnings: [],
    });
  });

  it('counts the differential in the regular rate of the overtime: 48 hours pay $1,092', () => {
    const { outputs } = runOf({ shiftHours: '24' });
    expect(outputs['straightPay']).toEqual(usd(1008));
    expect(outputs['regularRate']).toEqual(usd(21));
    expect(outputs['overtimeHours']).toEqual(r(8));
    expect(outputs['overtimePremium']).toEqual(usd(84));
    expect(outputs['pay']).toEqual(usd(1092));
  });

  it('adds a flat amount an hour when the differential is in dollars', () => {
    // $20 + $1.50 = $21.50; 24 h x $20 + 16 h x $21.50 = $480 + $344 = $824
    const { outputs } = runOf({ source: 'amount', amount: '1.50' });
    expect(outputs['shiftRate']).toEqual(usd(r(43, 2)));
    expect(outputs['differentialPay']).toEqual(usd(24));
    expect(outputs['pay']).toEqual(usd(824));
  });

  it('ignores the amount in percent mode and the percent in amount mode', () => {
    expect(runOf({ amount: '5' }).outputs['shiftRate']).toEqual(usd(22));
    expect(runOf({ source: 'amount', percent: '50' }).outputs['shiftRate']).toEqual(usd(22));
  });

  it('pays every hour at the shift rate when there are no base hours', () => {
    // 40 h x $22 = $880, regular rate $22, no overtime at exactly 40
    const { outputs } = runOf({ baseHours: '0', shiftHours: '40' });
    expect(outputs['pay']).toEqual(usd(880));
    expect(outputs['regularRate']).toEqual(usd(22));
    expect(outputs['overtimeHours']).toEqual(r(0));
  });

  it('warns when the hours are more than the 168 of a week, not when they are equal', () => {
    expect(runOf({ baseHours: '84', shiftHours: '84' }).warnings).toEqual([]);
    expect(runOf({ baseHours: '84', shiftHours: '84.5' }).warnings).toEqual(['moreThanAWeek']);
  });

  it('refuses no shift hours, a percent over 100 and a differential over $100', () => {
    expect(shiftDifferential.run({ shiftHours: '0' }).ok).toBe(false);
    expect(shiftDifferential.run({ shiftHours: '0.5' }).ok).toBe(true);
    expect(shiftDifferential.run({ shiftHours: '168' }).ok).toBe(true);
    expect(shiftDifferential.run({ shiftHours: '168.5' }).ok).toBe(false);
    expect(shiftDifferential.run({ baseHours: '168' }).ok).toBe(true);
    expect(shiftDifferential.run({ baseHours: '168.5' }).ok).toBe(false);
    expect(shiftDifferential.run({ percent: '100' }).ok).toBe(true);
    expect(shiftDifferential.run({ percent: '101' }).ok).toBe(false);
    expect(shiftDifferential.run({ amount: '100' }).ok).toBe(true);
    expect(shiftDifferential.run({ amount: '100.01' }).ok).toBe(false);
    expect(shiftDifferential.run({ rate: '0' }).ok).toBe(false);
  });
});
