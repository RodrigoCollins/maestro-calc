import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { civilFromDays, daysFromCivil, daysInMonth } from './dates.ts';

describe('civil days', () => {
  it('counts days from 1970-01-01', () => {
    expect(daysFromCivil(1970, 1, 1)).toBe(0);
    expect(daysFromCivil(1970, 1, 2)).toBe(1);
    expect(daysFromCivil(1969, 12, 31)).toBe(-1);
    expect(daysFromCivil(2000, 3, 1)).toBe(11_017);
    expect(daysFromCivil(2026, 3, 1)).toBe(20_513);
  });

  it('names the date of a day count', () => {
    expect(civilFromDays(0)).toEqual({ year: 1970, month: 1, day: 1 });
    expect(civilFromDays(-1)).toEqual({ year: 1969, month: 12, day: 31 });
    expect(civilFromDays(11_017)).toEqual({ year: 2000, month: 3, day: 1 });
    expect(civilFromDays(20_513 + 58)).toEqual({ year: 2026, month: 4, day: 28 });
  });

  it('knows leap years: every fourth, not every hundredth, but every four hundredth', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2023, 2)).toBe(28);
    expect(daysInMonth(1900, 2)).toBe(28);
    expect(daysInMonth(2000, 2)).toBe(29);
  });

  it('knows the length of every month', () => {
    expect(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => daysInMonth(2023, month)),
    ).toEqual([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]);
  });

  it('goes there and back for every date', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1970, max: 2100 }),
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: 1, max: 31 }),
        (year, month, rawDay) => {
          const day = Math.min(rawDay, daysInMonth(year, month));
          expect(civilFromDays(daysFromCivil(year, month, day))).toEqual({ year, month, day });
        },
      ),
      { numRuns: 200 },
    );
  });

  it('steps one day at a time', () => {
    fc.assert(
      fc.property(fc.integer({ min: -20_000, max: 60_000 }), (days) => {
        const date = civilFromDays(days);
        const next = civilFromDays(days + 1);
        expect(daysFromCivil(next.year, next.month, next.day)).toBe(days + 1);
        expect(daysFromCivil(date.year, date.month, date.day)).toBe(days);
      }),
      { numRuns: 200 },
    );
  });
});
