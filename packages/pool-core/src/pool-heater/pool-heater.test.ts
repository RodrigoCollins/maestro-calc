import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { poolHeater } from './pool-heater.ts';

// 1 BTU raises 1 lb of water by 1 °F, and a US gallon of water weighs about 8.34 lb, so the heat
// to warm the water is gallons x 8.34 x the rise, and the heater output is that over the hours.
const ran = (raw: Readonly<Record<string, unknown>>) => {
  const result = poolHeater.run(raw);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.value;
};

const figure = (raw: Readonly<Record<string, unknown>>, key: string): Rational => {
  const value = ran(raw).outputs.find((output) => output.key === key)?.value;
  if (!(value instanceof Rational)) throw new Error(`${key} is not a number`);
  return value;
};

describe('the constants', () => {
  // USGS: 62.366 lb per cubic foot at 60 °F; a gallon is 231 in3 of the 1,728 in a cubic foot
  it('weighs a gallon of water at about 8.34 lb', () => {
    expect((62.366 * 231) / 1728).toBeCloseTo(8.34, 2);
  });
});

describe('pool heater', () => {
  it('reads the defaults: 20,000 gallons, 10 °F in 24 hours', () => {
    const state = poolHeater.validate({});
    expect(state.ok && state.value).toEqual({
      gallons: Rational.of(20_000),
      rise: Rational.of(10),
      hours: Rational.of(24),
    });
  });

  // 20,000 x 8.34 x 10 = 1,668,000 BTU, and 1,668,000 / 24 = 69,500 BTU an hour
  it('needs 1,668,000 BTU, 69,500 an hour, by default', () => {
    expect(figure({}, 'btu')).toEqual(Rational.of(1_668_000));
    expect(figure({}, 'btuPerHour')).toEqual(Rational.of(69_500));
    expect(ran({}).shopping).toEqual([]);
    expect(ran({}).warnings).toEqual([]);
  });

  // 1 gallon x 8.34 x 1 °F = 8.34 BTU, exactly
  it('takes 8.34 BTU to warm a gallon by 1 °F', () => {
    const raw = { gallons: '1', rise: '1', hours: '1' };
    expect(figure(raw, 'btu')).toEqual(Rational.of(834, 100));
    expect(figure(raw, 'btuPerHour')).toEqual(Rational.of(834, 100));
  });

  // 15,000 x 8.34 x 8 = 1,000,800 BTU; over 12 hours 83,400 BTU an hour
  it('divides the heat by the hours', () => {
    const raw = { gallons: '15000', rise: '8', hours: '12' };
    expect(figure(raw, 'btu')).toEqual(Rational.of(1_000_800));
    expect(figure(raw, 'btuPerHour')).toEqual(Rational.of(83_400));
  });

  it('needs nothing for no rise', () => {
    expect(figure({ rise: '0' }, 'btu')).toEqual(Rational.ZERO);
    expect(figure({ rise: '0' }, 'btuPerHour')).toEqual(Rational.ZERO);
  });

  it('takes a rise of 0 to 100 °F over 1 to 720 hours', () => {
    expect(poolHeater.run({ rise: '-1' }).ok).toBe(false);
    expect(poolHeater.run({ rise: '100' }).ok).toBe(true);
    expect(poolHeater.run({ rise: '101' }).ok).toBe(false);
    expect(poolHeater.run({ hours: '0' }).ok).toBe(false);
    expect(poolHeater.run({ hours: '0.5' }).ok).toBe(false);
    expect(poolHeater.run({ hours: '1' }).ok).toBe(true);
    expect(poolHeater.run({ hours: '720' }).ok).toBe(true);
    expect(poolHeater.run({ hours: '721' }).ok).toBe(false);
    expect(poolHeater.run({ gallons: '1000001' }).ok).toBe(false);
  });
});
