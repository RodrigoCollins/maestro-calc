import { isQuantityOf, kg, Rational, valueIn } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { poolAlkalinity } from './pool-alkalinity.ts';

// Metric: milligrams of baking soda = litres x (target - current) x 84.007 / 50.04.
const kilograms = (raw: Readonly<Record<string, unknown>>): Rational => {
  const result = poolAlkalinity.run({ units: 'metric', ...raw });
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  const value = result.value.outputs.find((output) => output.key === 'pounds')?.value;
  if (!isQuantityOf(value, 'mass')) throw new Error('pounds is not a mass');
  return valueIn(value, kg);
};

describe('pool alkalinity in metric', () => {
  // 50,000 L x 30 ppm x 84.007 / 50.04 = 2,518,195 mg, 2.518 kg
  it('raises 50,000 L from 70 to 100 ppm with 2.52 kg of baking soda', () => {
    expect(kilograms({ gallons: '50000' })).toEqual(Rational.of(30 * 84_007, 20 * 50_040));
  });

  it('reads 10,000 L at 10 ppm as 0.168 kg', () => {
    expect(kilograms({ gallons: '10000', current: '90' })).toEqual(Rational.of(84_007, 500_400));
  });
});
