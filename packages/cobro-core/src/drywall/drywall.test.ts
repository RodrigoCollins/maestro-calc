import { Rational } from '@maestro-calc/core';
import { createDrywall } from '@maestro-calc/core/calculators/drywall';
import { DRYWALL_FINISHING } from '@maestro-calc/core/testing/drywall-yields';
import { describe, expect, it } from 'vitest';
import { dollarsOf, exactOf } from '../__testing__/figures.ts';
import { createDrywallQuote } from './drywall.ts';

const drywall = createDrywallQuote(createDrywall(DRYWALL_FINISHING));

describe('drywall quote', () => {
  // 12 x 12 room, 8 ft walls: 384 less a door (20) and two windows (30) is 334, plus the 144 sq ft
  // ceiling is 478 sq ft; with 10% waste 525.8 sq ft over 32 sq ft sheets is 16.43, so 17 sheets at
  // $15 = $255. Labor 8 h x $25 = $200; subtotal 455; overhead 45.50; profit 15% of 500.50 =
  // 75.075, to the cent 75.08; total 575.58.
  it('itemizes the default room to $575.58', () => {
    expect(dollarsOf(drywall, {}, 'labor')).toBe('200.00');
    expect(dollarsOf(drywall, {}, 'materials')).toBe('255.00');
    expect(dollarsOf(drywall, {}, 'subtotal')).toBe('455.00');
    expect(dollarsOf(drywall, {}, 'overhead')).toBe('45.50');
    expect(dollarsOf(drywall, {}, 'profit')).toBe('75.08');
    expect(dollarsOf(drywall, {}, 'total')).toBe('575.58');
  });

  it('reports the sheets and the area the drywall engine worked out', () => {
    expect(exactOf(drywall, {}, 'units')).toEqual(Rational.of(17));
    expect(exactOf(drywall, {}, 'area')).toEqual(Rational.of(478));
  });

  // 478 sq ft x $0.80 = $382.40
  it('prices the labor by the square foot hung', () => {
    const raw = { laborBy: 'area', areaRate: '0.8', overhead: '0', profit: '0', sheetPrice: '0' };
    expect(dollarsOf(drywall, raw, 'labor')).toBe('382.40');
  });

  // walls only: 334 sq ft with 10% waste is 367.4, over 32 is 11.48, so 12 sheets at $15 = $180
  it('hangs the walls only when the ceiling is left out', () => {
    const raw = { surfaces: 'walls' };
    expect(exactOf(drywall, raw, 'units')).toEqual(Rational.of(12));
    expect(dollarsOf(drywall, raw, 'materials')).toBe('180.00');
  });

  it('rejects a sheet price below zero', () => {
    expect(drywall.run({ sheetPrice: '-1' }).ok).toBe(false);
  });
});
