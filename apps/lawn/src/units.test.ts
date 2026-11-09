import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { FT2_PER_M2, G_PER_LB, imperialOf, METRIC, switchedText, unitsOf } from './units.ts';

describe('the metric factors', () => {
  // 1 ft = 0.3048 m exactly, so 1 m² = 1 / 0.09290304 ft²; 1 lb = 453.59237 g exactly
  it('are the exact definitions of the foot and the pound', () => {
    expect(FT2_PER_M2.mul(Rational.of(9290304, 100_000_000))).toEqual(Rational.ONE);
    expect(G_PER_LB).toEqual(Rational.of(45_359_237, 100_000));
  });

  it('are offered by the grass seed calculator only: square metres and kilograms', () => {
    expect(Object.keys(METRIC)).toEqual(['grass-seed']);
    expect(Object.keys(METRIC['grass-seed'] ?? {})).toEqual(['area', 'bag']);
  });
});

describe('the unit system of a form', () => {
  it('is metric only when the field says so, imperial otherwise', () => {
    expect(unitsOf('metric')).toBe('metric');
    expect(unitsOf('imperial')).toBe('imperial');
    expect(unitsOf(undefined)).toBe('imperial');
    expect(unitsOf('m')).toBe('imperial');
  });
});

describe('a metric state in the units of the engine', () => {
  it('turns square metres into square feet and kilograms into pounds', () => {
    const state = { area: Rational.of(100), bag: Rational.of(5), species: 'tall-fescue' };
    const imperial = imperialOf('grass-seed', state, 'metric');
    // 100 / 0.09290304 = 1,076.39 sq ft; 5 kg = 5,000 / 453.59237 = 11.02 lb
    expect(imperial.area).toEqual(Rational.of(10_000_000_000, 9_290_304));
    expect(imperial.bag).toEqual(Rational.of(500_000_000, 45_359_237));
    expect(imperial.species).toBe('tall-fescue');
  });

  it('leaves an imperial state, and a calculator with no metric fields, as they are', () => {
    const state = { area: Rational.of(100) };
    expect(imperialOf('grass-seed', state, 'imperial')).toBe(state);
    expect(imperialOf('sod', state, 'metric')).toBe(state);
  });
});

describe('a field switched to the other system', () => {
  it('converts the number to two decimals at most', () => {
    // 5,000 sq ft x 0.09290304 = 464.5152 m²; 5 lb = 2.26796 kg
    expect(switchedText('5000', FT2_PER_M2, 'metric')).toBe('464.52');
    expect(switchedText('5', Rational.of(1000).div(G_PER_LB), 'metric')).toBe('2.27');
    // 100 m² = 1,076.39 sq ft
    expect(switchedText('100', FT2_PER_M2, 'imperial')).toBe('1076.39');
  });

  it('leaves a field it cannot read as it is', () => {
    expect(switchedText('abc', FT2_PER_M2, 'metric')).toBe('abc');
    expect(switchedText('', FT2_PER_M2, 'imperial')).toBe('');
  });
});
