import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { gallonsOf, litersOf, LITERS_PER_GALLON, UNITS, unitsInput } from './units.ts';

// A US gallon is exactly 3.785411784 L (NIST SP 811, appendix B.8).
describe('pool units', () => {
  it('names the two systems, US first', () => {
    expect(UNITS).toEqual(['us', 'metric']);
  });

  it('is a select keyed m that opens on US, so a released link with no m still reads gallons', () => {
    const input = unitsInput();
    expect(input.kind).toBe('select');
    expect([input.key, input.urlKey, input.default]).toEqual(['units', 'm', 'us']);
    expect(input.options).toEqual(['us', 'metric']);
  });

  it('holds the exact litres of a gallon', () => {
    expect(LITERS_PER_GALLON).toEqual(Rational.of(3_785_411_784, 1_000_000_000));
  });

  it('reads a US volume as gallons and a metric one as litres', () => {
    expect(gallonsOf(Rational.of(20_000), 'us')).toEqual(Rational.of(20_000));
    expect(litersOf(Rational.of(20_000), 'us')).toEqual(Rational.of(75_708_235_680, 1_000_000));
    expect(litersOf(Rational.of(50_000), 'metric')).toEqual(Rational.of(50_000));
    expect(gallonsOf(Rational.of(3_785_411_784, 1_000_000), 'metric')).toEqual(Rational.of(1000));
  });
});
