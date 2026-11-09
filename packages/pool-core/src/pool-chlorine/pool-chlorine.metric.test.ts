import { cm3, isQuantityOf, kg, Rational, valueIn } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { poolChlorine } from './pool-chlorine.ts';

// Metric: the volume is litres, so grams of available chlorine = litres x (target - current) / 1,000.
const ran = (raw: Readonly<Record<string, unknown>>) => {
  const result = poolChlorine.run({ units: 'metric', ...raw });
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.value.outputs;
};

const liquidMl = (raw: Readonly<Record<string, unknown>>): Rational => {
  const value = ran(raw).find((output) => output.key === 'liquid')?.value;
  if (!isQuantityOf(value, 'volume')) throw new Error('liquid is not a volume');
  return valueIn(value, cm3);
};

const dryKg = (raw: Readonly<Record<string, unknown>>): Rational => {
  const value = ran(raw).find((output) => output.key === 'dry')?.value;
  if (!isQuantityOf(value, 'mass')) throw new Error('dry is not a mass');
  return valueIn(value, kg);
};

describe('pool chlorine in metric', () => {
  // 50,000 L x 2 ppm = 100 g; 100 g x 100 / 12.5 = 800 mL of 12.5% liquid
  it('raises 50,000 L by 2 ppm with 800 mL of 12.5% liquid', () => {
    expect(liquidMl({ gallons: '50000' })).toEqual(Rational.of(800));
    expect(dryKg({ gallons: '50000' })).toEqual(Rational.ZERO);
  });

  // 40,000 L x 30 ppm = 1,200 g; / 0.65 = 1.846 kg of cal-hypo; / 0.1 = 12 L of 10% liquid
  it('shocks 40,000 L to 30 ppm with 1.85 kg of 65% cal-hypo or 12 L of 10% liquid', () => {
    const shock = { gallons: '40000', current: '0', target: '30' };
    expect(dryKg({ ...shock, product: 'cal-hypo-65' })).toEqual(Rational.of(1200, 650));
    expect(liquidMl({ ...shock, product: 'liquid-10' })).toEqual(Rational.of(12_000));
  });

  it('gives the same dose for the same water in either system', () => {
    const us = poolChlorine.run({ gallons: '20000' });
    const metric = poolChlorine.run({ gallons: '75708.23568', units: 'metric' });
    expect(metric.ok && metric.value.outputs).toEqual(us.ok && us.value.outputs);
  });
});
