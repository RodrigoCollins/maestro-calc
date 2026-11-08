import { Rational } from '@maestro-calc/core';
import { createPaint } from '@maestro-calc/core/calculators/paint';
import { PAINT_COVERAGE } from '@maestro-calc/core/testing/paint-yields';
import { describe, expect, it } from 'vitest';
import { dollarsOf, exactOf } from '../__testing__/figures.ts';
import { createPaintingQuote } from './painting.ts';

const painting = createPaintingQuote(createPaint(PAINT_COVERAGE));

describe('painting quote', () => {
  // 12 x 12 room, 8 ft walls: 2 x 24 x 8 = 384; one door (20) and two windows (30) leave 334 sq ft;
  // 334 / 350 x 2 coats = 1.909 gallons, so 2 cans. Paint 2 x $40 = $80; labor 8 h x $25 = $200;
  // subtotal 280; overhead 28; profit 15% of 308 = 46.20; total 354.20.
  it('itemizes the default room to $354.20', () => {
    expect(dollarsOf(painting, {}, 'labor')).toBe('200.00');
    expect(dollarsOf(painting, {}, 'materials')).toBe('80.00');
    expect(dollarsOf(painting, {}, 'subtotal')).toBe('280.00');
    expect(dollarsOf(painting, {}, 'overhead')).toBe('28.00');
    expect(dollarsOf(painting, {}, 'profit')).toBe('46.20');
    expect(dollarsOf(painting, {}, 'total')).toBe('354.20');
  });

  it('reports the cans and the wall area the paint engine worked out', () => {
    expect(exactOf(painting, {}, 'units')).toEqual(Rational.of(2));
    expect(exactOf(painting, {}, 'area')).toEqual(Rational.of(334));
  });

  // 334 sq ft x $1.20 = $400.80, not the hours
  it('prices the labor by the square foot of wall', () => {
    const raw = { laborBy: 'area', areaRate: '1.2', overhead: '0', profit: '0', gallonPrice: '0' };
    expect(dollarsOf(painting, raw, 'labor')).toBe('400.80');
    expect(dollarsOf(painting, raw, 'total')).toBe('400.80');
  });

  // three coats: 334 / 350 x 3 = 2.863 gallons, 3 cans at $38.50 = $115.50
  it('buys whole cans for the coats', () => {
    const raw = { coats: '3', gallonPrice: '38.50' };
    expect(exactOf(painting, raw, 'units')).toEqual(Rational.of(3));
    expect(dollarsOf(painting, raw, 'materials')).toBe('115.50');
  });

  it('rejects a gallon price below zero', () => {
    expect(painting.run({ gallonPrice: '-5' }).ok).toBe(false);
  });
});
