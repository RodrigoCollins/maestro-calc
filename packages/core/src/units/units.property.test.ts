import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { rationalArb } from '../__testing__/arbitraries.ts';
import { numRuns } from '../__testing__/property-runs.ts';
import type { Rational } from '../rational/rational.ts';
import { UNITS } from './catalog.ts';
import type { DimensionName } from './dimension.ts';
import { quantity, valueIn } from './quantity.ts';
import type { Unit } from './unit.ts';

const roundTrips = <D extends DimensionName>(x: Rational, units: readonly Unit<D>[]): void => {
  for (const unit of units) {
    expect(valueIn(quantity(x, unit), unit), unit.id).toEqual(x);
  }
};

const viaAnyUnit = <D extends DimensionName>(x: Rational, units: readonly Unit<D>[]): void => {
  for (const from of units) {
    for (const through of units) {
      const original = quantity(x, from);
      const converted = quantity(valueIn(original, through), through);
      expect(converted, `${from.id} via ${through.id}`).toEqual(original);
    }
  }
};

const forAllRationals = (check: (x: Rational) => void): void => {
  // fast-check prints the seed and the counterexample when a property fails.
  fc.assert(fc.property(rationalArb, check), { numRuns });
};

describe('unit conversion properties (units-quantities › Construction and conversion)', () => {
  it('covers all 32 units', () => {
    const counts = Object.values(UNITS).map((units) => units.length);
    expect(counts.reduce((total, count) => total + count, 0)).toBe(32);
  });

  // spec: units-quantities › Round trip property [UQ14], all 32 units
  it('reads back the value it was built from, in every unit', () => {
    forAllRationals((x) => {
      roundTrips(x, UNITS.length);
      roundTrips(x, UNITS.area);
      roundTrips(x, UNITS.volume);
      roundTrips(x, UNITS.mass);
      roundTrips(x, UNITS.density);
    });
  });

  // spec: units-quantities › Construction and conversion — converting through w changes nothing.
  // One test per dimension: every pair of units runs a thousand times, and with the gallon and the
  // liter the volume pairs alone went from 36 to 64, past the time of one test for all five.
  it.each(['length', 'area', 'volume', 'mass', 'density', 'angle'] as const)(
    'is unchanged by converting through any other %s unit',
    (dimension) => {
      forAllRationals((x) => {
        viaAnyUnit(x, UNITS[dimension]);
      });
    },
  );
});
