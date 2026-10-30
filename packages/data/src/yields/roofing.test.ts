import { ft, ft2, inch, quantity, Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import * as coverageModule from './roofing.ts';
import { ROOFING_COVERAGE } from './roofing.ts';

describe('ROOFING_COVERAGE (calc-roofing › Injected coverage)', () => {
  it('exports nothing else', () => {
    expect(Object.keys(coverageModule)).toEqual(['ROOFING_COVERAGE']);
  });

  // GAF Timberline HDZ: 33.33 sq ft per bundle, three bundles a square (retailer listing of the
  // product); GAF FeltBuster data sheet (©2014, 7/14): 10 squares a roll, 1,000 sq ft excluding laps,
  // 48 in wide, 250 ft long
  it('holds a third of a square a bundle and a 48 in by 250 ft roll, exactly, and is frozen', () => {
    expect(ROOFING_COVERAGE).toEqual({
      bundle: quantity(Rational.of(100, 3), ft2),
      rollWidth: quantity(48, inch),
      rollLength: quantity(250, ft),
    });
    expect(Object.keys(ROOFING_COVERAGE)).toEqual(['bundle', 'rollWidth', 'rollLength']);
    expect(Object.isFrozen(ROOFING_COVERAGE)).toBe(true);
  });
});
