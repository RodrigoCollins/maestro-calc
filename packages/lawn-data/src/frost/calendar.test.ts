import { describe, expect, it } from 'vitest';
import { monthDayOfDay } from './calendar.ts';

describe('monthDayOfDay', () => {
  it('turns a 365-day day number into a month and day', () => {
    expect(monthDayOfDay(1)).toEqual({ month: 1, day: 1 });
    expect(monthDayOfDay(59)).toEqual({ month: 2, day: 28 });
    expect(monthDayOfDay(60)).toEqual({ month: 3, day: 1 });
    expect(monthDayOfDay(134)).toEqual({ month: 5, day: 14 });
    expect(monthDayOfDay(267)).toEqual({ month: 9, day: 24 });
    expect(monthDayOfDay(365)).toEqual({ month: 12, day: 31 });
  });

  it('rejects numbers outside 1..365 and non-integers', () => {
    for (const bad of [0, 366, -1, 1.5, Number.NaN]) {
      expect(() => monthDayOfDay(bad), String(bad)).toThrow(/1\.\.365/);
    }
  });
});
