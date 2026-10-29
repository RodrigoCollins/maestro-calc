import { lbYd3, quantity, Rational, valueIn } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import * as densitiesModule from './gravel.ts';
import { GRAVEL_DENSITIES } from './gravel.ts';

describe('GRAVEL_DENSITIES (calc-gravel › Injected densities)', () => {
  it('exports nothing else', () => {
    expect(Object.keys(densitiesModule)).toEqual(['GRAVEL_DENSITIES']);
  });

  // WisDOT WHRP G22-05 (December 2023), Table E2, Dense Graded Base 3/4-inch: 1.80 to 1.86 tons per
  // cubic yard compacted (midpoint 1.83), and 36 to 47 % compacted-to-loose expansion (midpoint
  // 41.5 %): 1.83 / 1.415 = 1.29 tons per cubic yard loose
  it.each([
    ['compacted', 3660, Rational.of(183, 100)],
    ['loose', 2580, Rational.of(129, 100)],
  ] as const)('holds %s as an exact density', (key, pounds, tons) => {
    expect(GRAVEL_DENSITIES[key]).toEqual(quantity(pounds, lbYd3));
    const perYard = valueIn(GRAVEL_DENSITIES[key], lbYd3).div(Rational.of(2000));
    expect(perYard).toEqual(tons);
  });

  it('has exactly the two placements and is frozen', () => {
    expect(Object.keys(GRAVEL_DENSITIES)).toEqual(['compacted', 'loose']);
    expect(Object.isFrozen(GRAVEL_DENSITIES)).toBe(true);
  });
});
