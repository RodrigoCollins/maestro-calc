import { isQuantityOf, kg, lb, Rational, valueIn } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { poolSalt } from './pool-salt.ts';

// pounds = gallons x (target - current ppm) x 8.34 / 1,000,000 (8.34 lb in a gallon of water).
// Hayward's AquaRite manual: ideal 2,700-3,400 ppm, 3,200 optimal; salt only comes down by
// draining; add three quarters, run the pump 24 hours, test, then add the rest.
const ran = (raw: Readonly<Record<string, unknown>>) => {
  const result = poolSalt.run(raw);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.value;
};

const pounds = (raw: Readonly<Record<string, unknown>>, key = 'pounds'): Rational => {
  const value = ran(raw).outputs.find((output) => output.key === key)?.value;
  if (!isQuantityOf(value, 'mass')) throw new Error(`${key} is not a mass`);
  return valueIn(value, lb);
};

describe('pool salt', () => {
  it('reads the defaults: 20,000 gallons at 2,400 ppm, aiming for 3,200', () => {
    const state = poolSalt.validate({});
    expect(state.ok && state.value).toEqual({
      gallons: Rational.of(20_000),
      current: Rational.of(2400),
      target: Rational.of(3200),
    });
  });

  // 20,000 x 800 x 8.34 / 1,000,000 = 133.44 lb: four 40 lb bags
  it('adds 133.44 lb by default: four 40 lb bags, 100.08 lb first', () => {
    expect(pounds({})).toEqual(Rational.of(13_344, 100));
    expect(pounds({}, 'firstAddition')).toEqual(Rational.of(10_008, 100));
    expect(ran({}).shopping).toEqual([
      { materialId: 'pool-salt', purchaseUnit: 'bag-40', qty: 4n },
    ]);
    const value = ran({}).outputs.find((output) => output.key === 'kilograms')?.value;
    expect(isQuantityOf(value, 'mass') && valueIn(value, kg).toNumber()).toBeCloseTo(60.53, 2);
    expect(ran({}).warnings).toEqual([]);
  });

  // a new plaster pool fills with fresh water: 15,000 x 3,200 x 8.34 / 1e6 = 400.32 lb, 11 bags
  it('starts a fresh fill from zero: 400.32 lb, eleven bags', () => {
    const raw = { gallons: '15000', current: '0' };
    expect(pounds(raw)).toEqual(Rational.of(40_032, 100));
    expect(ran(raw).shopping[0]?.qty).toBe(11n);
  });

  // 12,000 x 400 x 8.34 / 1e6 = 40.032 lb: just over one bag, so two
  it('rounds the bags up, never down', () => {
    const raw = { gallons: '12000', current: '3000', target: '3400' };
    expect(pounds(raw)).toEqual(Rational.of(40_032, 1000));
    expect(ran(raw).shopping[0]?.qty).toBe(2n);
  });

  it('adds nothing at the target', () => {
    expect(pounds({ current: '3200' })).toEqual(Rational.ZERO);
    expect(ran({ current: '3200' }).shopping[0]?.qty).toBe(0n);
    expect(ran({ current: '3200' }).warnings).toEqual([]);
  });

  it('adds nothing above the target and says only draining lowers salt', () => {
    const over = ran({ current: '3800' });
    expect(pounds({ current: '3800' })).toEqual(Rational.ZERO);
    expect(over.warnings).toEqual([{ code: 'drainToLower', params: {} }]);
  });

  it('rejects a negative reading', () => {
    expect(poolSalt.run({ current: '-5' }).ok).toBe(false);
  });
});
