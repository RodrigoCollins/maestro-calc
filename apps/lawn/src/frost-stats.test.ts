import type { Station } from '@maestro-calc/lawn-data/frost/types';
import { describe, expect, it } from 'vitest';
import { frostStatsOf, quantileOf, shiftDay } from './frost-stats.ts';

const station = (id: string, spring: number | null, fall: number | null): Station => ({
  id,
  name: id,
  lat: 0,
  lon: 0,
  elevation: null,
  spring: [null, spring, null],
  fall: [null, fall, null],
});

describe('shiftDay', () => {
  it('moves a day of the 365-day calendar, across the turn of the year', () => {
    expect(shiftDay(305, -45)).toBe(260); // Nov 1 less 45 days is Sep 17
    expect(shiftDay(20, -30)).toBe(355); // Jan 20 less 30 days is Dec 21
    expect(shiftDay(350, 30)).toBe(15); // Dec 16 and 30 days is Jan 15
    expect(shiftDay(1, -1)).toBe(365);
  });
});

describe('quantileOf', () => {
  it('reads the value at a share of a sorted list, the lower one between two', () => {
    expect(quantileOf([1, 2, 3, 4, 5], 0.5)).toBe(3);
    expect(quantileOf([1, 2, 3, 4], 0.5)).toBe(2);
    expect(quantileOf([1, 2, 3, 4, 5, 6, 7, 8, 9], 0.25)).toBe(3);
    expect(quantileOf([1, 2, 3, 4, 5, 6, 7, 8, 9], 0.75)).toBe(7);
    const none: readonly number[] = [];
    expect(quantileOf(none, 0.5)).toBeUndefined();
  });
});

describe('frostStatsOf', () => {
  it('gives the middle half and the middle of the 50% dates of the stations, in season order', () => {
    const stats = frostStatsOf([
      station('a', 80, 320),
      station('b', 90, 310),
      station('c', 100, 300),
      station('d', 110, 290),
      station('e', 120, 280),
    ]);
    expect(stats).toEqual({
      stations: 5,
      dated: 5,
      spring: { low: 90, middle: 100, high: 110 },
      fall: { low: 290, middle: 300, high: 310 },
      season: { low: 180, middle: 200, high: 220 },
    });
  });

  it('orders a spring date of the previous December before any date of the new year', () => {
    // NOAA counts from August 1: a last freeze on day 350 lies in the December before
    const stats = frostStatsOf([
      station('a', 350, 20),
      station('b', 10, 30),
      station('c', 30, 340),
    ]);
    expect(stats?.spring).toEqual({ low: 350, middle: 10, high: 10 });
    expect(stats?.fall).toEqual({ low: 340, middle: 20, high: 20 });
  });

  it('leaves out stations with no 50% date or a freeze all year, and gives none for no station', () => {
    const frozen: Station = { ...station('f', null, null), year: 'always-freezing' };
    const stats = frostStatsOf([station('a', 100, 300), station('b', null, 290), frozen]);
    expect(stats?.stations).toBe(3);
    expect(stats?.dated).toBe(1);
    expect(stats?.spring.middle).toBe(100);
    expect(frostStatsOf([frozen])).toBeUndefined();
  });
});
