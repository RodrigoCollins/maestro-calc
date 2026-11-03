import { Rational, usd } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { payConverter } from './pay-converter.ts';

// Hand-verified: weekly = hourly × hours a week, biweekly = 2 × weekly, annual = weekly × weeks a
// year, monthly = annual ÷ 12, semimonthly = annual ÷ 24; any other period goes through the annual.
const r = (n: number, d = 1): Rational => Rational.of(n, d);

const outputsOf = (raw: Readonly<Record<string, unknown>>): Record<string, unknown> => {
  const ran = payConverter.run(raw);
  if (!ran.ok) throw new Error(JSON.stringify(ran.errors));
  return Object.fromEntries(ran.value.outputs.map(({ key, value }) => [key, value]));
};

describe('pay converter', () => {
  it('turns the default $22 an hour, 40 h a week, 52 weeks into every period', () => {
    expect(outputsOf({})).toEqual({
      annual: usd(45760),
      hourly: usd(22),
      weekly: usd(880),
      biweekly: usd(1760),
      semimonthly: usd(r(5720, 3)),
      monthly: usd(r(11440, 3)),
    });
  });

  it('turns a $60,000 salary into $375/13 an hour (about $28.85)', () => {
    const out = outputsOf({ amount: '60000', per: 'year' });
    expect(out['hourly']).toEqual(usd(r(375, 13)));
    expect(out['weekly']).toEqual(usd(r(15000, 13)));
    expect(out['biweekly']).toEqual(usd(r(30000, 13)));
    expect(out['monthly']).toEqual(usd(5000));
    expect(out['semimonthly']).toEqual(usd(2500));
    expect(out['annual']).toEqual(usd(60000));
  });

  it('pays only the weeks worked: 50 weeks at $22 and 40 h is $44,000', () => {
    expect(outputsOf({ weeksPerYear: '50' })['annual']).toEqual(usd(44000));
  });

  it.each([
    ['week', '880', usd(22)],
    ['biweekly', '1760', usd(22)],
    ['semimonthly', '2500', usd(r(375, 13))],
    ['month', '5000', usd(r(375, 13))],
  ] as const)('reads %s pay of $%s back to the hourly rate', (per, amount, hourly) => {
    expect(outputsOf({ amount, per })['hourly']).toEqual(hourly);
  });

  it('returns the amount it was given in its own period', () => {
    expect(outputsOf({ amount: '3000', per: 'month' })['monthly']).toEqual(usd(3000));
    expect(outputsOf({ amount: '1200', per: 'biweekly' })['biweekly']).toEqual(usd(1200));
  });

  it('refuses zero hours or zero weeks', () => {
    expect(payConverter.run({ hoursPerWeek: '0' }).ok).toBe(false);
    expect(payConverter.run({ weeksPerYear: '0' }).ok).toBe(false);
  });

  it('takes decimal hours: 37.5 h a week at $22 is $42,900 a year', () => {
    expect(outputsOf({ hoursPerWeek: '37.5' })['annual']).toEqual(usd(42900));
  });
});
