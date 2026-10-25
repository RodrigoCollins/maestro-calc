import { ft3, type DimensionName, type Quantity } from '@maestro-calc/core';
import type { MaterialRecord } from '@maestro-calc/data';

/** The bag yields by bag size in pounds, as three sides name them. */
export type SizedYields = Readonly<Record<string, Quantity<DimensionName>>>;

const EXPECTED = { '40': '3/10', '60': '9/20', '80': '3/5' } as const;

const bagSize = (id: string): string => id.replace(/^bag-/, '');

/** The purchase unit sizes of a material record by bag size (`bag-80` to `80`). */
export const yieldsOfRecord = (record: MaterialRecord): SizedYields =>
  Object.fromEntries(record.purchaseUnits.map(({ id, size }) => [bagSize(id), size]));

/** The yields-only module's record by bag size (`bag-80` to `80`). */
export const yieldsOfSubpath = (yields: SizedYields): SizedYields =>
  Object.fromEntries(Object.entries(yields).map(([id, size]) => [bagSize(id), size]));

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
