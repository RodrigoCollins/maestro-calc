import { describe, expect, it } from 'vitest';
import {
  addDays,
  dateOfRule,
  daysBetween,
  daysFrom,
  daysInMonth,
  easterOf,
  isLeapYear,
  isoOf,
  isValidDate,
  nextOccurrence,
  nthWeekdayOf,
  parseIsoDate,
  restDayPayOf,
  weekdayOf,
  weeksAndDaysOf,
} from './calendar.ts';

// Hand-verified against a printed calendar: 2026-11-09 is a Monday, 2026-12-25 a Friday,
// 2027-01-01 a Friday, 2024-02-29 a Thursday. Easter Sunday (the Gregorian computus, as the
// Catholic Church dates it) fell on 2000-04-23, 2008-03-23, 2011-04-24, 2019-04-21, 2024-03-31,
// 2025-04-20 and falls on 2026-04-05, 2027-03-28, 2028-04-16, 2029-04-01, 2030-04-21,
// 2031-04-13, 2032-03-28; its extremes are March 22 (1818, 2285) and April 25 (1943, 2038).

const date = (y: number, m: number, d: number) => ({ y, m, d });

describe('isLeapYear and daysInMonth', () => {
  it('leaps every fourth year but the centuries not divisible by 400', () => {
    expect([2024, 2028, 2000, 2400].map(isLeapYear)).toEqual([true, true, true, true]);
    expect([2026, 2027, 1900, 2100].map(isLeapYear)).toEqual([false, false, false, false]);
  });

  it('gives February 29 days in a leap year and 28 otherwise, and 30 or 31 to the rest', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(
      Array.from({ length: 12 }, (_, i) => daysInMonth(2026, i + 1)).filter((d) => d !== 28),
    ).toEqual([31, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]);
  });
});

describe('isValidDate and parseIsoDate', () => {
  it('accepts a real date of the Gregorian calendar', () => {
    expect(isValidDate(date(2024, 2, 29))).toBe(true);
    expect(isValidDate(date(1583, 1, 1))).toBe(true);
    expect(isValidDate(date(9999, 12, 31))).toBe(true);
  });

  it.each([
    [2026, 2, 29],
    [2026, 4, 31],
    [2026, 13, 1],
    [2026, 0, 1],
    [2026, 1, 0],
    [1582, 12, 31],
    [10000, 1, 1],
    [2026.5, 1, 1],
    [2026, 1.5, 1],
    [2026, 1, 1.5],
  ])('rejects %d-%d-%d', (y, m, d) => {
    expect(isValidDate(date(y, m, d))).toBe(false);
  });

  it('reads the YYYY-MM-DD of a date field, with spaces around it', () => {
    expect(parseIsoDate('2026-12-25')).toEqual(date(2026, 12, 25));
    expect(parseIsoDate(' 2024-02-29 ')).toEqual(date(2024, 2, 29));
  });

  it.each(['', '2026-2-5', '26-12-25', '2026/12/25', '2026-12-25x', 'x2026-12-25', '2026-02-30'])(
    'reads %j as no date',
    (text) => {
      expect(parseIsoDate(text)).toBeNull();
    },
  );

  it('writes a date back as YYYY-MM-DD, zero-padded', () => {
    expect(isoOf(date(2026, 1, 6))).toBe('2026-01-06');
    expect(isoOf(date(2026, 11, 20))).toBe('2026-11-20');
  });
});

describe('addDays, daysFrom and weekdayOf', () => {
  it('moves across months, years and February 29', () => {
    expect(addDays(date(2026, 11, 9), 46)).toEqual(date(2026, 12, 25));
    expect(addDays(date(2026, 12, 31), 1)).toEqual(date(2027, 1, 1));
    expect(addDays(date(2024, 2, 28), 1)).toEqual(date(2024, 2, 29));
    expect(addDays(date(2024, 3, 1), -1)).toEqual(date(2024, 2, 29));
    expect(addDays(date(2026, 3, 1), -1)).toEqual(date(2026, 2, 28));
  });

  it('counts the days from one date to another, negative backwards', () => {
    expect(daysFrom(date(2026, 11, 9), date(2026, 12, 25))).toBe(46);
    expect(daysFrom(date(2026, 12, 25), date(2026, 11, 9))).toBe(-46);
    expect(daysFrom(date(2026, 1, 1), date(2027, 1, 1))).toBe(365);
    expect(daysFrom(date(2024, 1, 1), date(2025, 1, 1))).toBe(366);
    expect(daysFrom(date(2026, 5, 5), date(2026, 5, 5))).toBe(0);
  });

  it('gives the weekday, 0 for Monday to 6 for Sunday', () => {
    expect(weekdayOf(date(2026, 11, 9))).toBe(0);
    expect(weekdayOf(date(2024, 2, 29))).toBe(3);
    expect(weekdayOf(date(2026, 12, 25))).toBe(4);
    expect(weekdayOf(date(2026, 11, 14))).toBe(5);
    expect(weekdayOf(date(2026, 11, 15))).toBe(6);
  });
});

describe('easterOf', () => {
  it.each([
    [2000, 4, 23],
    [2008, 3, 23],
    [2011, 4, 24],
    [2019, 4, 21],
    [2024, 3, 31],
    [2025, 4, 20],
    [2026, 4, 5],
    [2027, 3, 28],
    [2028, 4, 16],
    [2029, 4, 1],
    [2030, 4, 21],
    [2031, 4, 13],
    [2032, 3, 28],
    [1818, 3, 22],
    [2285, 3, 22],
    [1943, 4, 25],
    [2038, 4, 25],
  ])('dates Easter Sunday %d on %d/%d', (y, m, d) => {
    const easter = easterOf(y);
    expect(easter).toEqual(date(y, m, d));
    expect(weekdayOf(easter)).toBe(6);
  });
});

describe('nthWeekdayOf', () => {
  it('finds the first Sunday of May, the Mother’s Day of Spain', () => {
    expect(nthWeekdayOf(2025, 5, 6, 1)).toEqual(date(2025, 5, 4));
    expect(nthWeekdayOf(2026, 5, 6, 1)).toEqual(date(2026, 5, 3));
    expect(nthWeekdayOf(2027, 5, 6, 1)).toEqual(date(2027, 5, 2));
  });

  it('finds the third Monday of November and a weekday on the first of the month', () => {
    expect(nthWeekdayOf(2026, 11, 0, 3)).toEqual(date(2026, 11, 16));
    expect(nthWeekdayOf(2027, 5, 5, 1)).toEqual(date(2027, 5, 1));
  });
});

describe('dateOfRule', () => {
  it('places a fixed date, a day counted from Easter and an nth weekday in a year', () => {
    expect(dateOfRule({ kind: 'fixed', m: 12, d: 25 }, 2026)).toEqual(date(2026, 12, 25));
    expect(dateOfRule({ kind: 'easter', offset: -2 }, 2026)).toEqual(date(2026, 4, 3));
    expect(dateOfRule({ kind: 'easter', offset: -3 }, 2027)).toEqual(date(2027, 3, 25));
    expect(dateOfRule({ kind: 'easter', offset: -7 }, 2026)).toEqual(date(2026, 3, 29));
    expect(dateOfRule({ kind: 'nth-weekday', m: 5, weekday: 6, n: 1 }, 2026)).toEqual(
      date(2026, 5, 3),
    );
  });
});

describe('nextOccurrence', () => {
  const christmas = { kind: 'fixed', m: 12, d: 25 } as const;

  it('counts to this year’s date while it is ahead', () => {
    expect(nextOccurrence(christmas, date(2026, 11, 9))).toEqual({
      date: date(2026, 12, 25),
      days: 46,
    });
  });

  it('counts 0 on the day itself', () => {
    expect(nextOccurrence(christmas, date(2026, 12, 25))).toEqual({
      date: date(2026, 12, 25),
      days: 0,
    });
  });

  it('counts to next year’s once it has passed', () => {
    expect(nextOccurrence(christmas, date(2026, 12, 26))).toEqual({
      date: date(2027, 12, 25),
      days: 364,
    });
    expect(nextOccurrence({ kind: 'fixed', m: 1, d: 1 }, date(2026, 11, 9))).toEqual({
      date: date(2027, 1, 1),
      days: 53,
    });
  });

  it('follows Easter from one year to the next', () => {
    expect(nextOccurrence({ kind: 'easter', offset: -2 }, date(2026, 4, 4))).toEqual({
      date: date(2027, 3, 26),
      days: 356,
    });
  });
});

describe('weeksAndDaysOf', () => {
  it('splits days into whole weeks and the days left', () => {
    expect(weeksAndDaysOf(46)).toEqual({ weeks: 6, days: 4 });
    expect(weeksAndDaysOf(14)).toEqual({ weeks: 2, days: 0 });
    expect(weeksAndDaysOf(6)).toEqual({ weeks: 0, days: 6 });
    expect(weeksAndDaysOf(0)).toEqual({ weeks: 0, days: 0 });
  });
});

describe('daysBetween', () => {
  it('counts 46 days from Monday 9 November to Friday 25 December 2026, 34 of them weekdays', () => {
    // the 46 days counted are 10 November to 25 December: 6 weeks (30 weekdays) and 4 days,
    // Tuesday 22 to Friday 25 December, all weekdays
    expect(daysBetween(date(2026, 11, 9), date(2026, 12, 25), false)).toEqual({
      days: 46,
      weeks: 6,
      restDays: 4,
      businessDays: 34,
      reversed: false,
    });
  });

  it('adds the first day when both ends count', () => {
    expect(daysBetween(date(2026, 11, 9), date(2026, 12, 25), true)).toEqual({
      days: 47,
      weeks: 6,
      restDays: 5,
      businessDays: 35,
      reversed: false,
    });
  });

  it('counts a weekend start and a weekend end as no business day', () => {
    // Saturday 14 to Sunday 22 November: the days counted are 15 to 22, Monday 16 to Friday 20
    expect(daysBetween(date(2026, 11, 14), date(2026, 11, 22), false)).toMatchObject({
      days: 8,
      businessDays: 5,
    });
    expect(daysBetween(date(2026, 11, 14), date(2026, 11, 22), true)).toMatchObject({
      days: 9,
      businessDays: 5,
    });
    expect(daysBetween(date(2026, 11, 13), date(2026, 11, 16), false)).toMatchObject({
      days: 3,
      businessDays: 1,
    });
  });

  it('counts the same date as 0 days, or 1 with both ends', () => {
    expect(daysBetween(date(2026, 11, 9), date(2026, 11, 9), false)).toEqual({
      days: 0,
      weeks: 0,
      restDays: 0,
      businessDays: 0,
      reversed: false,
    });
    expect(daysBetween(date(2026, 11, 15), date(2026, 11, 15), true)).toMatchObject({
      days: 1,
      businessDays: 0,
    });
    expect(daysBetween(date(2026, 11, 9), date(2026, 11, 9), true)).toMatchObject({
      days: 1,
      businessDays: 1,
    });
  });

  it('counts dates given end first, and says so', () => {
    expect(daysBetween(date(2026, 12, 25), date(2026, 11, 9), false)).toEqual({
      days: 46,
      weeks: 6,
      restDays: 4,
      businessDays: 34,
      reversed: true,
    });
  });

  it('counts a whole year of weekdays and a leap year', () => {
    expect(daysBetween(date(2026, 1, 1), date(2027, 1, 1), false)).toMatchObject({
      days: 365,
      weeks: 52,
      restDays: 1,
      businessDays: 261,
    });
    expect(daysBetween(date(2024, 1, 1), date(2024, 12, 31), true)).toMatchObject({
      days: 366,
      businessDays: 262,
    });
  });

  it('agrees with a day-by-day count over every short span of a month', () => {
    const start = date(2026, 11, 1);
    for (let from = 0; from < 14; from += 1)
      for (let length = 0; length < 30; length += 1) {
        const a = addDays(start, from);
        const b = addDays(a, length);
        let weekdays = 0;
        for (let i = 1; i <= length; i += 1) if (weekdayOf(addDays(a, i)) < 5) weekdays += 1;
        expect(daysBetween(a, b, false).businessDays, `${isoOf(a)} ${isoOf(b)}`).toBe(weekdays);
        const first = weekdayOf(a) < 5 ? 1 : 0;
        expect(daysBetween(a, b, true).businessDays).toBe(weekdays + first);
      }
  });
});

describe('restDayPayOf', () => {
  it('pays the day’s wage plus double for the service on a mandatory rest day: three wages', () => {
    expect(restDayPayOf(50000)).toEqual({ wage: 50000, double: 100000, total: 150000 });
    expect(restDayPayOf(31504)).toEqual({ wage: 31504, double: 63008, total: 94512 });
  });

  it.each([-1, 0.5, Number.NaN])('rejects a wage of %d cents', (cents) => {
    expect(() => restDayPayOf(cents)).toThrow(RangeError);
  });
});
