import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { decimalHours } from './decimal-hours.ts';

// Hand-verified: 8 h 20 min = 8 + 20/60 = 8 1/3 h (8.33); 45 min = 45/60 = 0.75 h;
// 7.75 h = 7 h + 0.75 x 60 = 7 h 45 min.
const r = (n: number, d = 1): Rational => Rational.of(n, d);

const outputsOf = (raw: Readonly<Record<string, unknown>>): Record<string, unknown> => {
  const ran = decimalHours.run(raw);
  if (!ran.ok) throw new Error(JSON.stringify(ran.errors));
  return Object.fromEntries(ran.value.outputs.map(({ key, value }) => [key, value]));
};

describe('minutes to decimal hours', () => {
  it('turns 8 h 20 min into 25/3 hours and reads 7.75 h back as 7 h 45 min', () => {
    expect(outputsOf({})).toEqual({ decimalHours: r(25, 3), fromDecimal: r(31, 4) });
  });

  it('turns 45 minutes into 0.75 hours', () => {
    expect(outputsOf({ hours: '0', minutes: '45' })['decimalHours']).toEqual(r(3, 4));
  });

  it('takes 0 to 59 minutes and refuses 60', () => {
    expect(outputsOf({ hours: '0', minutes: '0' })['decimalHours']).toEqual(r(0));
    expect(outputsOf({ hours: '0', minutes: '59' })['decimalHours']).toEqual(r(59, 60));
    expect(decimalHours.run({ minutes: '60' }).ok).toBe(false);
    expect(decimalHours.run({ minutes: '-1' }).ok).toBe(false);
  });

  it('takes up to 999 hours', () => {
    expect(outputsOf({ hours: '999', minutes: '30' })['decimalHours']).toEqual(r(1999, 2));
    expect(decimalHours.run({ hours: '1000' }).ok).toBe(false);
    expect(decimalHours.run({ decimal: '999' }).ok).toBe(true);
    expect(decimalHours.run({ decimal: '999.01' }).ok).toBe(false);
  });

  it('reads a decimal back to the nearest whole minute', () => {
    // 8.33 h = 8 h 19.8 min, so 8 h 20 min; 0.1 h = 6 min; 0.01 h = 0.6 min, so 1 min
    expect(outputsOf({ decimal: '8.33' })['fromDecimal']).toEqual(r(25, 3));
    expect(outputsOf({ decimal: '0.1' })['fromDecimal']).toEqual(r(1, 10));
    expect(outputsOf({ decimal: '0.01' })['fromDecimal']).toEqual(r(1, 60));
    expect(outputsOf({ decimal: '0.005' })['fromDecimal']).toEqual(r(0));
    expect(outputsOf({ decimal: '2' })['fromDecimal']).toEqual(r(2));
  });
});
