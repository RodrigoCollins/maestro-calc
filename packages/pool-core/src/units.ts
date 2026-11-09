import { Rational, selectInput } from '@maestro-calc/core';

/** The systems a dose calculator reads the pool volume in: US gallons, or metric litres. */
export const UNITS = ['us', 'metric'] as const;

export type Units = (typeof UNITS)[number];

/**
 * The units choice of a dose calculator, declared last: a released link has no `m`, so it opens
 * on `us` and its `g` keeps meaning gallons; `m=metric` makes the same `g` litres. Core's own `u=m`
 * never changes the meaning of a value, so this is a field of the calculator, not that flag.
 */
export const unitsInput = () =>
  selectInput({ key: 'units', urlKey: 'm', options: UNITS, default: 'us' });

/** A US gallon is exactly 3.785411784 L (NIST SP 811), and 1 ppm is 1 mg/L. */
export const LITERS_PER_GALLON = Rational.of(3_785_411_784, 1_000_000_000);

/** The litres of a pool volume typed in `units`. */
export const litersOf = (volume: Rational, units: Units): Rational =>
  units === 'metric' ? volume : volume.mul(LITERS_PER_GALLON);

/** The US gallons of a pool volume typed in `units`. */
export const gallonsOf = (volume: Rational, units: Units): Rational =>
  units === 'metric' ? volume.div(LITERS_PER_GALLON) : volume;
