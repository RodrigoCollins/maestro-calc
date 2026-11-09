import { isQuantityOf, kg, Rational, valueIn } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { poolStabilizer } from './pool-stabilizer.ts';

// Metric: 1 ppm is 1 mg/L, so kilograms of cyanuric acid = litres x (target - current) / 1,000,000.
const kilograms = (raw: Readonly<Record<string, unknown>>): Rational => {
  const result = poolStabilizer.run({ units: 'metric', ...raw });
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  const value = result.value.outputs.find((output) => output.key === 'ounces')?.value;
  if (!isQuantityOf(value, 'mass')) throw new Error('ounces is not a mass');
  return valueIn(value, kg);
};

describe('pool stabilizer in metric', () => {
  it('raises 50,000 L from 0 to 30 ppm with 1.5 kg', () => {
    expect(kilograms({ gallons: '50000' })).toEqual(Rational.of(3, 2));
  });

  it('tops 40,000 L up from 20 to 50 ppm with 1.2 kg', () => {
    expect(kilograms({ gallons: '40000', current: '20', target: '50' })).toEqual(Rational.of(6, 5));
  });
});
