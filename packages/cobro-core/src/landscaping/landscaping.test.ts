import { Rational } from '@maestro-calc/core';
import { mulch } from '@maestro-calc/core/calculators/mulch';
import { describe, expect, it } from 'vitest';
import { dollarsOf, exactOf } from '../__testing__/figures.ts';
import { createLandscapingQuote } from './landscaping.ts';

const landscaping = createLandscapingQuote(mulch);

describe('landscaping quote', () => {
  // 20 ft x 4 ft x 3 in = 20 cu ft; with 5% waste 21 cu ft; a 2 cu ft bag, so 10.5 and 11 bags at
  // $5 = $55. Labor 8 h x $25 = $200; subtotal 255; overhead 25.50; profit 15% of 280.50 =
  // 42.075, to the cent 42.08; total 322.58.
  it('itemizes the default bed to $322.58', () => {
    expect(dollarsOf(landscaping, {}, 'labor')).toBe('200.00');
    expect(dollarsOf(landscaping, {}, 'materials')).toBe('55.00');
    expect(dollarsOf(landscaping, {}, 'subtotal')).toBe('255.00');
    expect(dollarsOf(landscaping, {}, 'overhead')).toBe('25.50');
    expect(dollarsOf(landscaping, {}, 'profit')).toBe('42.08');
    expect(dollarsOf(landscaping, {}, 'total')).toBe('322.58');
  });

  it('reports the bags and the square feet of the bed', () => {
    expect(exactOf(landscaping, {}, 'units')).toEqual(Rational.of(11));
    expect(exactOf(landscaping, {}, 'area')).toEqual(Rational.of(80));
  });

  // 80 sq ft x $1.25 = $100
  it('prices the labor by the square foot of bed', () => {
    const raw = { laborBy: 'area', areaRate: '1.25', overhead: '0', profit: '0', bagPrice: '0' };
    expect(dollarsOf(landscaping, raw, 'labor')).toBe('100.00');
  });

  // 3 cu ft bags: 21 / 3 = 7 bags exactly at $7.25 = $50.75
  it('buys whole bags of the size chosen', () => {
    const raw = { bag: '3', bagPrice: '7.25' };
    expect(exactOf(landscaping, raw, 'units')).toEqual(Rational.of(7));
    expect(dollarsOf(landscaping, raw, 'materials')).toBe('50.75');
  });

  it('rejects a bed deeper than the engine maximum', () => {
    expect(landscaping.run({ depth: '3 ft' }).ok).toBe(false);
  });
});
