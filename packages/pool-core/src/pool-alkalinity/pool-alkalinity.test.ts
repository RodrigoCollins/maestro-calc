import { isQuantityOf, kg, lb, oz, Rational, valueIn } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { poolAlkalinity } from './pool-alkalinity.ts';

// Total alkalinity is read in ppm as calcium carbonate. CaCO3 is 100.087 g/mol and takes two
// equivalents, so its equivalent weight is 50.04 g; sodium bicarbonate, NaHCO3, is 84.007 g/mol and
// gives one. 1 ppm of TA is then 84.007 / 50.04 = 1.6788 mg/L of baking soda, and a US gallon is
// exactly 3.785411784 L (10,000 gal is 37,854.1 L).
const ran = (raw: Readonly<Record<string, unknown>>) => {
  const result = poolAlkalinity.run(raw);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.value;
};

const mass = (raw: Readonly<Record<string, unknown>>, key: string, unit = lb): Rational => {
  const value = ran(raw).outputs.find((output) => output.key === key)?.value;
  if (!isQuantityOf(value, 'mass')) throw new Error(`${key} is not a mass`);
  return valueIn(value, unit);
};

const PER_PPM = { gallons: '10000', current: '0', target: '1' };

describe('the constants', () => {
  it('takes CaCO3 at two equivalents of 100.087 g/mol: 50.04 g each', () => {
    expect(100.087 / 2).toBeCloseTo(50.04, 2);
  });

  it('gives 1.6788 mg/L of NaHCO3 (84.007 g/mol, one equivalent) per ppm of TA', () => {
    expect(84.007 / 50.04).toBeCloseTo(1.6788, 4);
  });

  it('reads 10,000 US gallons as 37,854.1 liters', () => {
    expect(10_000 * 3.785411784).toBeCloseTo(37_854.1, 1);
  });
});

describe('pool alkalinity', () => {
  it('reads the defaults: 20,000 gallons from 70 to 100 ppm', () => {
    const state = poolAlkalinity.validate({});
    expect(state.ok && state.value).toEqual({
      gallons: Rational.of(20_000),
      current: Rational.of(70),
      target: Rational.of(100),
      units: 'us',
    });
  });

  // 37,854.11784 L x 1 mg/L x 84.007 / 50.04 = 63,549 mg = 1.6788 mg/L
  it('needs 63.55 g of baking soda per ppm per 10,000 gallons, exactly', () => {
    expect(mass(PER_PPM, 'pounds', kg)).toEqual(
      Rational.of(3_785_411_784n * 84_007n, 50_040n * 10n ** 11n),
    );
    expect((mass(PER_PPM, 'pounds', kg).toNumber() * 1e6) / 37_854.117_84).toBeCloseTo(1.6788, 4);
  });

  // 10 x 63.549 g = 635.5 g = 1.401 lb = 22.42 oz
  it('raises 10,000 gallons by 10 ppm with 0.6355 kg: 1.40 lb, 22.4 oz', () => {
    const raw = { gallons: '10000', current: '80', target: '90' };
    expect(mass(raw, 'pounds', kg).toNumber()).toBeCloseTo(0.6355, 4);
    expect(mass(raw, 'pounds').toNumber()).toBeCloseTo(1.401, 3);
    expect(mass(raw, 'ounces', oz).toNumber()).toBeCloseTo(22.416, 3);
    expect(mass(raw, 'ounces')).toEqual(mass(raw, 'pounds'));
  });

  // 20,000 gal x 3.785411784 x 30 ppm x 1.6788 mg = 3.813 kg = 8.41 lb = 134.5 oz
  it('adds 8.41 lb by default, with no note', () => {
    expect(mass({}, 'pounds').toNumber()).toBeCloseTo(8.406, 3);
    expect(mass({}, 'ounces', oz).toNumber()).toBeCloseTo(134.5, 1);
    expect(ran({}).shopping).toEqual([]);
    expect(ran({}).warnings).toEqual([]);
  });

  it('adds nothing at the target', () => {
    expect(mass({ current: '100' }, 'pounds')).toEqual(Rational.ZERO);
    expect(mass({ current: '100' }, 'ounces')).toEqual(Rational.ZERO);
    expect(ran({ current: '100' }).warnings).toEqual([]);
  });

  it('adds nothing above the target and says lowering alkalinity takes acid', () => {
    const over = { current: '150' };
    expect(mass(over, 'pounds')).toEqual(Rational.ZERO);
    expect(mass(over, 'ounces')).toEqual(Rational.ZERO);
    expect(ran(over).warnings).toEqual([{ code: 'acidToLower', params: {} }]);
  });

  it('rejects a negative reading', () => {
    expect(poolAlkalinity.run({ current: '-5' }).ok).toBe(false);
  });
});
