import { ft3, type DimensionName, type Quantity } from '@maestro-calc/core';
import type { MaterialRecord } from '@maestro-calc/data';

/** The bag yields by purchase unit id (`bag-<pounds>`), as three sides name them. */
export type SizedYields = Readonly<Record<string, Quantity<DimensionName>>>;

const EXPECTED = { 'bag-40': '3/10', 'bag-60': '9/20', 'bag-80': '3/5' } as const;

/** The purchase unit sizes of a material record by purchase unit id. */
export const yieldsOfRecord = (record: MaterialRecord): SizedYields =>
  Object.fromEntries(record.purchaseUnits.map(({ id, size }) => [id, size]));

/** True for a volume: the exponent vector of `length^3`. */
const isVolume = ({ exponents }: Quantity<DimensionName>): boolean =>
  exponents.length === 3 && exponents.mass === 0;

/**
 * What differs from `3/10`, `9/20` and `3/5` ft3 in any named side, one line per fault: the guard
 * that fails when a single side changes alone (calc-concrete › Yield drift guard).
 */
export const yieldDrift = (sides: Readonly<Record<string, SizedYields>>): string[] =>
  Object.entries(sides).flatMap(([name, yields]) =>
    Object.entries(EXPECTED).flatMap(([size, expected]) => {
      const yieldOfSize = yields[size];
      if (yieldOfSize === undefined) return [`${name}: ${size} is missing`];
      const actual = isVolume(yieldOfSize)
        ? yieldOfSize.canonical.div(ft3.factor).toString()
        : 'not a volume';
      return actual === expected
        ? []
        : [`${name}: ${size} is ${actual} ft3, expected ${expected} ft3`];
    }),
  );
