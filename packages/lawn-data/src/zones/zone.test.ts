import { describe, expect, it } from 'vitest';
import { ZONES, zoneAt, zoneOf } from './zone.ts';

describe('zoneOf', () => {
  it('puts an average extreme minimum in its USDA half zone, 5°F wide from -60°F', () => {
    expect(zoneOf(-60).label).toBe('1a');
    expect(zoneOf(-55.01).label).toBe('1a');
    expect(zoneOf(-55).label).toBe('1b');
    expect(zoneOf(-7.3).label).toBe('6a');
    expect(zoneOf(4.99).label).toBe('7a');
    expect(zoneOf(5).label).toBe('7b');
    expect(zoneOf(9.99).label).toBe('7b');
    expect(zoneOf(10).label).toBe('8a');
    expect(zoneOf(38.2).label).toBe('10b');
    expect(zoneOf(69.9).label).toBe('13b');
  });

  it('gives the range of the half zone, low inclusive, in whole degrees', () => {
    expect(zoneOf(7)).toEqual({ label: '7b', zone: 7, half: 'b', low: 5, high: 10 });
    expect(zoneOf(-37)).toEqual({ label: '3a', zone: 3, half: 'a', low: -40, high: -35 });
  });

  it('refuses a temperature outside the 26 half zones of the map', () => {
    expect(() => zoneOf(-60.5)).toThrow(RangeError);
    expect(() => zoneOf(70)).toThrow(RangeError);
    expect(() => zoneOf(Number.NaN)).toThrow(RangeError);
  });
});

describe('ZONES', () => {
  it('lists the 26 half zones from 1a to 13b, each 5°F above the one before', () => {
    expect(ZONES).toHaveLength(26);
    expect(ZONES[0]?.label).toBe('1a');
    expect(ZONES.at(-1)?.label).toBe('13b');
    ZONES.forEach((zone, index) => {
      expect(zone.low).toBe(-60 + 5 * index);
      expect(zone.high - zone.low).toBe(5);
      expect(zoneOf(zone.low)).toEqual(zone);
    });
  });

  it('finds a half zone by its label, and throws on an unknown one', () => {
    expect(zoneAt('8b')).toEqual({ label: '8b', zone: 8, half: 'b', low: 15, high: 20 });
    expect(() => zoneAt('14a')).toThrow('no zone 14a');
  });
});
