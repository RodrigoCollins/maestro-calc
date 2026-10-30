import { ft2, quantity } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import * as coverageModule from './paint.ts';
import { PAINT_COVERAGE } from './paint.ts';

describe('PAINT_COVERAGE (calc-paint › Injected coverage)', () => {
  it('exports nothing else', () => {
    expect(Object.keys(coverageModule)).toEqual(['PAINT_COVERAGE']);
  });

  // Sherwin-Williams Quali-Kote Interior Latex, Product Data Sheet (07/2020): 350 to 400 sq ft per
  // gallon at 4 mils wet; the low end is used
  it('holds 350 square feet per gallon, exactly, and is frozen', () => {
    expect(PAINT_COVERAGE.perGallon).toEqual(quantity(350, ft2));
    expect(Object.keys(PAINT_COVERAGE)).toEqual(['perGallon']);
    expect(Object.isFrozen(PAINT_COVERAGE)).toBe(true);
  });
});
