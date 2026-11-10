import { gal, isQuantityOf, lb, Rational, valueIn } from '@maestro-calc/core';
import { poolChlorine } from '@maestro-calc/pool-core/pool-chlorine';
import { poolHeater } from '@maestro-calc/pool-core/pool-heater';
import { poolSalt } from '@maestro-calc/pool-core/pool-salt';
import { run } from './worked-math.ts';

/*
 * What a pool costs to run, worked out from the calculators of the site: the heat a warm-up takes
 * (the heater calculator), the chlorine that raises free chlorine 1 ppm (the chlorine calculator)
 * and the salt a new salt pool starts with (the salt calculator), priced at EIA's average US
 * residential energy prices and at the list prices of named products, each as read on
 * November 10, 2026 (`src/costs.ts` cites them). The heat leaves out what the pool loses while it
 * warms, so a real warm-up takes more.
 */

/** The energy and product prices, as read on 2026-11-10. */
export const PRICES = {
  /** EIA Electric Power Monthly, table 5.6.A: US residential, August 2026, dollars per kWh. */
  electricity: 0.1816,
  /** EIA natural gas prices: US residential, August 2026, dollars per thousand cubic feet. */
  naturalGas: 27.05,
  /** EIA Heating Oil and Propane Update: US residential, week of November 2, 2026, per gallon. */
  propane: 2.82,
  /** HASA 4 Gallon Liquid Chlorine Case, 12.5%, $35.99 at Simplified Pools: per gallon. */
  liquidChlorine: 35.99 / 4,
  /** Doheny's Super Pool Shock, 24 one-pound bags, $99.99 on sale: per pound. */
  shock: 99.99 / 24,
  /** AQUASALT pool salt, a 40 lb bag, $10.99 at Simplified Pools. */
  saltBag: 10.99,
} as const;

/** EIA's Btu conversion factors (units and calculators). */
const BTU_PER_KWH = 3412;
const BTU_PER_CUBIC_FOOT = 1036;
const BTU_PER_PROPANE_GALLON = 91_452;
/** Raypak's AVIA gas heaters: 84% thermal efficiency. */
const GAS_EFFICIENCY = 0.84;
/** Hayward's HeatPro HP21124T, AHRI 1160: COP 5.7 at 80 °F air, 4.0 at 50 °F air. */
const COP_WARM = 5.7;
const COP_COOL = 4;

const numberOf = (value: unknown): number => {
  if (!(value instanceof Rational)) throw new Error('a count must be a Rational');
  return value.toNumber();
};

/** A sum in dollars and cents, grouped: `17.1504` is `$17.15`. */
export const cents = (dollars: number): string =>
  `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** The Btu that warm `gallons` by `rise` °F, from the heater calculator. */
export const heatOf = (gallons: number, rise: number): number =>
  numberOf(
    run(poolHeater, { gallons: String(gallons), rise: String(rise), hours: '24' }).get('btu'),
  );

/** The hours a heater giving `output` Btu per hour takes to put `btu` into the water. */
export const hoursToHeat = (btu: number, output: number): number => btu / output;

/** One way of heating: what it burns or draws for a warm-up, in its own unit, and the cost. */
export interface HeatingCost {
  readonly key: 'heat-pump-80' | 'heat-pump-50' | 'resistance' | 'natural-gas' | 'propane';
  readonly amount: number;
  readonly dollars: number;
}

/** What `btu` of heat costs by each heater, at EIA's average residential prices. */
export const heatingCostsOf = (btu: number): readonly HeatingCost[] => {
  const kwh = (cop: number) => btu / BTU_PER_KWH / cop;
  const burned = btu / GAS_EFFICIENCY;
  const mcf = burned / (BTU_PER_CUBIC_FOOT * 1000);
  const propane = burned / BTU_PER_PROPANE_GALLON;
  const electric = (key: HeatingCost['key'], cop: number): HeatingCost => ({
    key,
    amount: kwh(cop),
    dollars: kwh(cop) * PRICES.electricity,
  });
  return [
    electric('heat-pump-80', COP_WARM),
    electric('heat-pump-50', COP_COOL),
    electric('resistance', 1),
    { key: 'natural-gas', amount: mcf, dollars: mcf * PRICES.naturalGas },
    { key: 'propane', amount: propane, dollars: propane * PRICES.propane },
  ];
};

/** The gallons of 12.5% liquid chlorine that raise free chlorine 1 ppm, and their price. */
export const chlorinePerPpm = (gallons: number): { gallons: number; dollars: number } => {
  const liquid = run(poolChlorine, {
    gallons: String(gallons),
    current: '0',
    target: '1',
    product: 'liquid-12-5',
  }).get('liquid');
  if (!isQuantityOf(liquid, 'volume')) throw new Error('liquid chlorine must be a volume');
  const amount = valueIn(liquid, gal).toNumber();
  return { gallons: amount, dollars: amount * PRICES.liquidChlorine };
};

/** The salt a new salt pool takes from 0 to 3,200 ppm, the salt calculator's target. */
export const saltStartOf = (gallons: number): { pounds: number; bags: number } => {
  const ran = run(poolSalt, { gallons: String(gallons), current: '0', target: '3200' });
  const pounds = ran.get('pounds');
  if (!isQuantityOf(pounds, 'mass')) throw new Error('salt must be a mass');
  return { pounds: valueIn(pounds, lb).toNumber(), bags: Number(ran.get('bags')) };
};
