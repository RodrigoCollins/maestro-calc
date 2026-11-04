import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { poolFillTime } from './pool-fill-time.ts';

// A flow of F gallons a minute fills G gallons in G / F minutes, which is G / F / 60 hours.
const ran = (raw: Readonly<Record<string, unknown>>) => {
  const result = poolFillTime.run(raw);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.value;
};

const figure = (raw: Readonly<Record<string, unknown>>, key: string): Rational => {
  const value = ran(raw).outputs.find((output) => output.key === key)?.value;
  if (!(value instanceof Rational)) throw new Error(`${key} is not a number`);
  return value;
};

describe('pool fill time', () => {
  it('reads the defaults: 20,000 gallons at 10 gallons a minute', () => {
    const state = poolFillTime.validate({});
    expect(state.ok && state.value).toEqual({
      gallons: Rational.of(20_000),
      flow: Rational.of(10),
    });
  });

  // 20,000 / 10 = 2,000 minutes = 33 1/3 hours: 33 h 20 min
  it('fills 20,000 gallons in 2,000 minutes, 33 1/3 hours, by default', () => {
    expect(figure({}, 'minutes')).toEqual(Rational.of(2_000));
    expect(figure({}, 'time')).toEqual(Rational.of(100, 3));
    expect(ran({}).shopping).toEqual([]);
    expect(ran({}).warnings).toEqual([]);
  });

  // 15,000 / 12 = 1,250 minutes = 20 5/6 hours: 20 h 50 min
  it('divides the gallons by the flow', () => {
    const raw = { gallons: '15000', flow: '12' };
    expect(figure(raw, 'minutes')).toEqual(Rational.of(1_250));
    expect(figure(raw, 'time')).toEqual(Rational.of(125, 6));
  });

  it('takes a flow of 0.1 to 1,000 gallons a minute', () => {
    expect(poolFillTime.run({ flow: '0' }).ok).toBe(false);
    expect(poolFillTime.run({ flow: '0.09' }).ok).toBe(false);
    expect(poolFillTime.run({ flow: '0.1' }).ok).toBe(true);
    expect(poolFillTime.run({ flow: '1000' }).ok).toBe(true);
    expect(poolFillTime.run({ flow: '1001' }).ok).toBe(false);
    expect(poolFillTime.run({ gallons: '1000001' }).ok).toBe(false);
  });
});
