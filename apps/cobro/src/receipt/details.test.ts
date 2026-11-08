import { Rational, usd } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { detailsOf, fill, type DetailTexts, type DetailValues } from './details.ts';

const TEXTS: DetailTexts = {
  hour: '{hours} h × {rate}/h',
  hourCrew: '{hours} h × {crew} × {rate}/h',
  area: '{area} sq ft × {areaRate}/sq ft',
  one: '{n} gallon',
  many: '{n} gallons',
  overhead: 'Overhead ({pct}%)',
  profit: 'Profit ({pct}%)',
};

const VALUES: DetailValues = {
  laborBy: 'hour',
  hours: Rational.of(8),
  crew: 1,
  rate: usd(25),
  areaRate: usd(2),
  area: Rational.of(1500),
  units: Rational.of(2),
  overhead: Rational.of(10),
  profit: Rational.of(15, 2),
};

describe('fill', () => {
  it('replaces each hole and leaves an unknown one', () => {
    expect(fill('{a} and {b} and {c}', { a: '1', b: '2' })).toBe('1 and 2 and {c}');
  });
});

describe('detailsOf', () => {
  it('writes the hourly labor without the crew when there is one worker', () => {
    expect(detailsOf(TEXTS, VALUES).labor).toBe('8 h × $25.00/h');
  });

  it('writes the crew when there are several workers', () => {
    expect(detailsOf(TEXTS, { ...VALUES, crew: 2, hours: Rational.of(7, 2) }).labor).toBe(
      '3.5 h × 2 × $25.00/h',
    );
  });

  it('writes the labor by area from the area and its price', () => {
    expect(detailsOf(TEXTS, { ...VALUES, laborBy: 'area' }).labor).toBe(
      '1,500 sq ft × $2.00/sq ft',
    );
  });

  it('writes the units of the material, one or many, and nothing when there are none', () => {
    expect(detailsOf(TEXTS, VALUES).materials).toBe('2 gallons');
    expect(detailsOf(TEXTS, { ...VALUES, units: Rational.of(1) }).materials).toBe('1 gallon');
    expect(detailsOf(TEXTS, { ...VALUES, units: Rational.ZERO }).materials).toBe('');
  });

  it('writes the two percentages', () => {
    const details = detailsOf(TEXTS, VALUES);
    expect(details.overhead).toBe('Overhead (10%)');
    expect(details.profit).toBe('Profit (7.5%)');
  });
});
