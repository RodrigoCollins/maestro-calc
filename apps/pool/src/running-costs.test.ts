import { describe, expect, it } from 'vitest';
import {
  cents,
  chlorinePerPpm,
  heatOf,
  heatingCostsOf,
  hoursToHeat,
  PRICES,
  saltStartOf,
} from './running-costs.ts';

// Every figure below is worked by hand from the sources' own numbers, read on 2026-11-10.
describe('a sum in dollars and cents', () => {
  it('keeps two decimals and groups the thousands', () => {
    expect(cents(17.1504)).toBe('$17.15');
    expect(cents(1585.2)).toBe('$1,585.20');
    expect(cents(0.5)).toBe('$0.50');
  });
});

describe('the prices the running costs use', () => {
  it('are EIA’s averages and the list prices as read', () => {
    expect(PRICES.electricity).toBe(0.1816);
    expect(PRICES.naturalGas).toBe(27.05);
    expect(PRICES.propane).toBe(2.82);
    expect(PRICES.liquidChlorine).toBeCloseTo(35.99 / 4, 10);
    expect(PRICES.shock).toBeCloseTo(99.99 / 24, 10);
    expect(PRICES.saltBag).toBe(10.99);
  });
});

describe('the heat a warm-up takes, from the heater calculator', () => {
  it('is gallons x 8.34 x the rise', () => {
    // 22,023 x 8.34 x 10
    expect(heatOf(22_023, 10)).toBeCloseTo(1_836_718.2, 6);
    // 3,800 x 8.34 x 10
    expect(heatOf(3800, 10)).toBeCloseTo(316_920, 6);
  });

  it('takes the hours a heater output gives it', () => {
    // 1,836,718.2 / 110,000
    expect(hoursToHeat(1_836_718.2, 110_000)).toBeCloseTo(16.697, 3);
  });
});

describe('what one warm-up costs in energy', () => {
  const costs = heatingCostsOf(heatOf(22_023, 10));
  const row = (key: string) => costs.find((cost) => cost.key === key);

  it('runs a heat pump at the COP of its rating, on EIA’s electricity price', () => {
    // 1,836,718.2 / 3,412 / 5.7 = 94.44 kWh, x $0.1816 = $17.15
    expect(row('heat-pump-80')?.amount).toBeCloseTo(94.4406, 3);
    expect(row('heat-pump-80')?.dollars).toBeCloseTo(17.1504, 3);
    // at COP 4.0: 134.58 kWh, $24.44
    expect(row('heat-pump-50')?.amount).toBeCloseTo(134.5778, 3);
    expect(row('heat-pump-50')?.dollars).toBeCloseTo(24.4393, 3);
  });

  it('turns every kilowatt-hour into heat in an electric resistance heater', () => {
    expect(row('resistance')?.amount).toBeCloseTo(538.3113, 3);
    expect(row('resistance')?.dollars).toBeCloseTo(97.7573, 3);
  });

  it('burns gas and propane at 84% thermal efficiency', () => {
    // 1,836,718.2 / 0.84 / 1,036,000 = 2.1106 Mcf, x $27.05 = $57.09
    expect(row('natural-gas')?.amount).toBeCloseTo(2.110588, 5);
    expect(row('natural-gas')?.dollars).toBeCloseTo(57.0914, 3);
    // / 91,452 = 23.909 gallons, x $2.82 = $67.42
    expect(row('propane')?.amount).toBeCloseTo(23.909475, 5);
    expect(row('propane')?.dollars).toBeCloseTo(67.4247, 3);
  });
});

describe('the chemicals, from the dose calculators', () => {
  it('gives the 12.5% liquid chlorine that raises free chlorine 1 ppm, and its price', () => {
    // 22,023 x 3.785411784 / 1,000 g / 12.5 x 100 = 666.9 mL = 0.176184 gal
    const { gallons, dollars } = chlorinePerPpm(22_023);
    expect(gallons).toBeCloseTo(0.176184, 6);
    // x $35.99 / 4
    expect(dollars).toBeCloseTo(1.58522, 4);
  });

  it('gives the salt bags a new salt pool starts with, and their price', () => {
    // 22,023 x 3,200 x 8.34 / 1,000,000 = 587.75 lb, 15 bags of 40 lb at $10.99
    const { pounds, bags } = saltStartOf(22_023);
    expect(pounds).toBeCloseTo(587.7498, 3);
    expect(bags).toBe(15);
  });
});
