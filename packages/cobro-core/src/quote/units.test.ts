import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { unitsOf } from './units.ts';

describe('unitsOf', () => {
  const lines = [
    { materialId: 'drywall', qty: 17n },
    { materialId: 'joint-tape', qty: 1n },
  ];

  it('reads the quantity of the material asked for, not the first line', () => {
    expect(unitsOf(lines, 'joint-tape')).toEqual(Rational.of(1));
    expect(unitsOf(lines, 'drywall')).toEqual(Rational.of(17));
  });

  it('is none for a material the list does not hold', () => {
    expect(unitsOf(lines, 'paint')).toEqual(Rational.ZERO);
    expect(unitsOf([], 'paint')).toEqual(Rational.ZERO);
  });
});
