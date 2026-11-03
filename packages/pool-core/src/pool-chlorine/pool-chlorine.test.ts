import { cm3, gal, isQuantityOf, oz, Rational, valueIn } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { poolChlorine } from './pool-chlorine.ts';

// 1 ppm is 1 mg/L, and a US gallon is exactly 3.785411784 L, so 10,000 gal at +1 ppm needs
// 37.854 g of available chlorine. Liquid chlorine is labeled in trade percent (12.5% is 12.5 g of
// available chlorine per 100 mL); granular products by weight (cal-hypo 65%, EPA Reg. 1258-1232;
// dichlor 56%, EPA Reg. 7124-31). A US fluid ounce is 1/128 gal.
const ran = (raw: Readonly<Record<string, unknown>>) => {
  const result = poolChlorine.run(raw);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return Object.fromEntries(result.value.outputs.map(({ key, value }) => [key, value]));
};

const fluidOunces = (raw: Readonly<Record<string, unknown>>): Rational => {
  const value = ran(raw)['liquid'];
  if (!isQuantityOf(value, 'volume')) throw new Error('liquid is not a volume');
  return valueIn(value, gal).mul(Rational.of(128));
};

const ounces = (raw: Readonly<Record<string, unknown>>): Rational => {
  const value = ran(raw)['dry'];
  if (!isQuantityOf(value, 'mass')) throw new Error('dry is not a mass');
  return valueIn(value, oz);
};

const PER_PPM = { gallons: '10000', current: '0', target: '1' };

describe('pool chlorine', () => {
  it('reads the defaults: 20,000 gallons from 1 to 3 ppm with 12.5% liquid chlorine', () => {
    const state = poolChlorine.validate({});
    expect(state.ok && state.value).toEqual({
      gallons: Rational.of(20_000),
      current: Rational.of(1),
      target: Rational.of(3),
      product: 'liquid-12-5',
    });
  });

  it('needs 10.24 fl oz of 12.5% liquid per ppm per 10,000 gallons', () => {
    expect(fluidOunces(PER_PPM).toNumber()).toBeCloseTo(10.24, 2);
    const ml = ran(PER_PPM)['liquid'];
    expect(isQuantityOf(ml, 'volume') && valueIn(ml, cm3)).toEqual(
      Rational.of(3_785_411_784, 12_500_000),
    );
    expect(ounces(PER_PPM)).toEqual(Rational.ZERO);
  });

  it('needs 40.96 fl oz to raise 20,000 gallons by 2 ppm', () => {
    expect(fluidOunces({}).toNumber()).toBeCloseTo(40.96, 2);
  });

  it('needs more of a weaker 10% liquid: 12.80 fl oz per ppm per 10,000 gallons', () => {
    expect(fluidOunces({ ...PER_PPM, product: 'liquid-10' }).toNumber()).toBeCloseTo(12.8, 2);
  });

  it('weighs granular cal-hypo 65%: 2.05 oz per ppm per 10,000 gallons', () => {
    const raw = { ...PER_PPM, product: 'cal-hypo-65' };
    expect(ounces(raw).toNumber()).toBeCloseTo(2.054, 3);
    expect(fluidOunces(raw)).toEqual(Rational.ZERO);
  });

  it('weighs granular dichlor 56%: 2.38 oz per ppm per 10,000 gallons', () => {
    expect(ounces({ ...PER_PPM, product: 'dichlor-56' }).toNumber()).toBeCloseTo(2.384, 3);
  });

  it('adds nothing at or above the target', () => {
    expect(fluidOunces({ current: '3' })).toEqual(Rational.ZERO);
    expect(fluidOunces({ current: '5' })).toEqual(Rational.ZERO);
  });

  it('rejects a negative reading', () => {
    expect(poolChlorine.run({ current: '-1' }).ok).toBe(false);
  });
});
