import { isQuantityOf, kg, lb, oz, Rational, valueIn } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { poolStabilizer } from './pool-stabilizer.ts';

// 1 ppm is 1 mg/L, so 1 ppm of cyanuric acid is 1 mg of the pure acid per liter (the dose assumes a
// 100% product); a US gallon is exactly 3.785411784 L. The CDC's Model Aquatic Health Code (2024,
// 5.7.3.1.3.2) keeps CYA at or below 90 ppm in public pools; CYA only comes down by draining.
const ran = (raw: Readonly<Record<string, unknown>>) => {
  const result = poolStabilizer.run(raw);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.value;
};

const mass = (raw: Readonly<Record<string, unknown>>, key: string, unit = lb): Rational => {
  const value = ran(raw).outputs.find((output) => output.key === key)?.value;
  if (!isQuantityOf(value, 'mass')) throw new Error(`${key} is not a mass`);
  return valueIn(value, unit);
};

describe('the constants', () => {
  it('weighs an ounce at 28.35 g and a pound at 453.6 g', () => {
    expect(453.592_37 / 16).toBeCloseTo(28.35, 2);
    expect(Rational.ONE.toNumber()).toBe(1);
  });
});

describe('pool stabilizer', () => {
  it('reads the defaults: 20,000 gallons from 0 to 30 ppm', () => {
    const state = poolStabilizer.validate({});
    expect(state.ok && state.value).toEqual({
      gallons: Rational.of(20_000),
      current: Rational.of(0),
      target: Rational.of(30),
      units: 'us',
    });
  });

  // 37,854.11784 L x 1 mg/L = 37.854 g per ppm per 10,000 gallons
  it('needs 37.85 g of cyanuric acid per ppm per 10,000 gallons, exactly', () => {
    const raw = { gallons: '10000', current: '0', target: '1' };
    expect(mass(raw, 'pounds', kg)).toEqual(Rational.of(3_785_411_784, 10n ** 11n));
  });

  // 10 x 37.854 g = 378.5 g = 13.35 oz = 0.83 lb
  it('raises 10,000 gallons by 10 ppm with 378.5 g: 13.35 oz', () => {
    const raw = { gallons: '10000', current: '20', target: '30' };
    expect(mass(raw, 'pounds', kg).toNumber()).toBeCloseTo(0.3785, 4);
    expect(mass(raw, 'ounces', oz).toNumber()).toBeCloseTo(13.353, 3);
    expect(mass(raw, 'pounds').toNumber()).toBeCloseTo(0.8345, 4);
    expect(mass(raw, 'ounces')).toEqual(mass(raw, 'pounds'));
  });

  // 20,000 x 3.785411784 x 30 mg = 2.271 kg = 5.01 lb = 80.1 oz
  it('adds 5.01 lb by default, with no note', () => {
    expect(mass({}, 'pounds').toNumber()).toBeCloseTo(5.007, 3);
    expect(mass({}, 'ounces', oz).toNumber()).toBeCloseTo(80.12, 2);
    expect(ran({}).shopping).toEqual([]);
    expect(ran({}).warnings).toEqual([]);
  });

  it('adds nothing at the target', () => {
    expect(mass({ current: '30' }, 'pounds')).toEqual(Rational.ZERO);
    expect(ran({ current: '30' }).warnings).toEqual([]);
  });

  it('adds nothing above the target and says only draining lowers CYA', () => {
    const over = { current: '60' };
    expect(mass(over, 'pounds')).toEqual(Rational.ZERO);
    expect(mass(over, 'ounces')).toEqual(Rational.ZERO);
    expect(ran(over).warnings).toEqual([{ code: 'drainToLower', params: {} }]);
  });

  it('notes a target over the 90 ppm public-pool limit, and not one at it', () => {
    expect(ran({ target: '90' }).warnings).toEqual([]);
    expect(ran({ target: '91' }).warnings).toEqual([{ code: 'overCodeLimit', params: {} }]);
    expect(ran({ current: '120', target: '100' }).warnings).toEqual([
      { code: 'drainToLower', params: {} },
      { code: 'overCodeLimit', params: {} },
    ]);
  });

  it('rejects a negative reading', () => {
    expect(poolStabilizer.run({ current: '-5' }).ok).toBe(false);
  });
});
