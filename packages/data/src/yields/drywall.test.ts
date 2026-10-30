import { ft, ft2, gal, quantity } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import * as finishingModule from './drywall.ts';
import { DRYWALL_FINISHING } from './drywall.ts';

describe('DRYWALL_FINISHING (calc-drywall › Injected finishing rates)', () => {
  it('exports nothing else', () => {
    expect(Object.keys(finishingModule)).toEqual(['DRYWALL_FINISHING']);
  });

  // USG FAQ 1977: about two 4.5-gallon pails of Sheetrock UltraLightweight All Purpose Joint
  // Compound finish 1,000 sq ft; USG Sheetrock Heavy Joint Tape submittal J1393 (rev. 10-15):
  // approximately 370 ft per 1,000 sq ft
  it('holds 9 gallons and 370 feet per 1,000 square feet, exactly, and is frozen', () => {
    expect(DRYWALL_FINISHING).toEqual({
      per: quantity(1000, ft2),
      compound: quantity(9, gal),
      tape: quantity(370, ft),
    });
    expect(Object.keys(DRYWALL_FINISHING)).toEqual(['per', 'compound', 'tape']);
    expect(Object.isFrozen(DRYWALL_FINISHING)).toBe(true);
  });
});
