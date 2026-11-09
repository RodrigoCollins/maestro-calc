import { isQuantityOf, lb, Rational, valueIn } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { poolCalcium } from './pool-calcium.ts';

// Metric: the label is written per gallon, so the litres are turned into US gallons first.
const mass = (raw: Readonly<Record<string, unknown>>, key: string): Rational => {
  const result = poolCalcium.run({ units: 'metric', ...raw });
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  const value = result.value.outputs.find((output) => output.key === key)?.value;
  if (!isQuantityOf(value, 'mass')) throw new Error(`${key} is not a mass`);
  return valueIn(value, lb);
};

describe('pool calcium in metric', () => {
  it('doses 75,708.23568 L as the 20,000 gallons they are: 5 lb for 20 ppm', () => {
    expect(mass({ gallons: '75708.23568' }, 'pounds')).toEqual(Rational.of(5));
  });

  // 37,854.11784 L = 10,000 gal: 100 ppm is 12.5 lb, over the 3 lb a time, so 3 lb first
  it('splits the dose at 3 lb per 10,000 gallons of the litres', () => {
    const raw = { gallons: '37854.11784', current: '100', target: '200' };
    expect(mass(raw, 'pounds')).toEqual(Rational.of(25, 2));
    expect(mass(raw, 'firstAddition')).toEqual(Rational.of(3));
  });
});
