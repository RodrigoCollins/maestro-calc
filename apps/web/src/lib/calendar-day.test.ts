import { describe, expect, it } from 'vitest';
import { calendarDay } from './calendar-day.ts';

describe('calendarDay', () => {
  it.each([
    ['en', '2026-10-25', 'October 25, 2026'],
    ['es', '2026-10-25', '25 de octubre de 2026'],
  ] as const)('writes the %s day of %s as %s', (locale, iso, shown) => {
    expect(calendarDay(iso, locale)).toBe(shown);
  });

  // formatted in UTC: the first day of a month never moves to the last day of the month before
  it('keeps the calendar day whatever the timezone', () => {
    expect(calendarDay('2026-11-01', 'en')).toBe('November 1, 2026');
  });
});
