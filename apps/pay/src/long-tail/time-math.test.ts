import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  civilOf,
  clockShift,
  dayDelta,
  daysInMonth,
  durationOf,
  fillTemplate,
  isLeap,
  liveTextOf,
  untilOf,
  weekdayOf,
  weekdaysIn,
} from './time-math.ts';

describe('clockShift', () => {
  it('moves a time of day by minutes and counts the days it crosses', () => {
    // 15 hours ago from 5:00 pm is 2:00 am of the same day
    expect(clockShift(17 * 60, -15 * 60)).toEqual({ minutes: 2 * 60, days: 0 });
    // 8 hours ago from 3:00 am is 7:00 pm of the previous day
    expect(clockShift(3 * 60, -8 * 60)).toEqual({ minutes: 19 * 60, days: -1 });
    // 30 minutes from 11:45 pm is 12:15 am of the next day
    expect(clockShift(23 * 60 + 45, 30)).toEqual({ minutes: 15, days: 1 });
    expect(clockShift(0, 0)).toEqual({ minutes: 0, days: 0 });
  });
});

describe('untilOf', () => {
  it('counts to the next time of day, tomorrow once it has passed', () => {
    // until 3:00 pm from 9:00 am: 6 hours
    expect(untilOf(9 * 60, 15 * 60)).toEqual({ minutes: 360, tomorrow: false });
    // until 12:00 am from 6:00 pm: 6 hours, at midnight
    expect(untilOf(18 * 60, 0)).toEqual({ minutes: 360, tomorrow: true });
    // until 3:00 pm from 8:00 pm: 19 hours, tomorrow
    expect(untilOf(20 * 60, 15 * 60)).toEqual({ minutes: 1140, tomorrow: true });
    expect(untilOf(15 * 60, 15 * 60)).toEqual({ minutes: 0, tomorrow: false });
  });

  it('writes a count of minutes as hours and minutes', () => {
    expect(durationOf(360)).toBe('6 h 0 min');
    expect(durationOf(1139)).toBe('18 h 59 min');
    expect(durationOf(5)).toBe('0 h 5 min');
  });
});

describe('the calendar', () => {
  it('knows the leap years and the length of each month', () => {
    expect([2024, 2027, 2028, 1900, 2000].map(isLeap)).toEqual([true, false, true, false, true]);
    expect(daysInMonth(2027, 2)).toBe(28);
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(daysInMonth(2027, 4)).toBe(30);
    expect(daysInMonth(2027, 12)).toBe(31);
  });

  it('adds and subtracts days across months and years', () => {
    // 28 days from Jan 1 is Jan 29
    expect(addDays({ y: 2027, m: 1, d: 1 }, 28)).toEqual({ y: 2027, m: 1, d: 29 });
    // 30 days ago from Mar 1 in a non-leap year is Jan 30, in a leap year Jan 31
    expect(addDays({ y: 2027, m: 3, d: 1 }, -30)).toEqual({ y: 2027, m: 1, d: 30 });
    expect(addDays({ y: 2028, m: 3, d: 1 }, -30)).toEqual({ y: 2028, m: 1, d: 31 });
    expect(addDays({ y: 2027, m: 12, d: 25 }, 10)).toEqual({ y: 2028, m: 1, d: 4 });
  });

  it('adds months, holding the day of the month and clamping it to the month end', () => {
    // 6 months from Aug 31 is Feb 28, or Feb 29 in a leap year
    expect(addMonths({ y: 2026, m: 8, d: 31 }, 6)).toEqual({ y: 2027, m: 2, d: 28 });
    expect(addMonths({ y: 2027, m: 8, d: 31 }, 6)).toEqual({ y: 2028, m: 2, d: 29 });
    expect(addMonths({ y: 2027, m: 3, d: 31 }, 6)).toEqual({ y: 2027, m: 9, d: 30 });
    expect(addMonths({ y: 2027, m: 3, d: 15 }, 6)).toEqual({ y: 2027, m: 9, d: 15 });
    expect(addMonths({ y: 2027, m: 3, d: 15 }, -6)).toEqual({ y: 2026, m: 9, d: 15 });
  });

  it('gives the weekday (0 is Monday) and the days between two dates', () => {
    // January 1, 2027 is a Friday; November 8, 2026 is a Sunday
    expect(weekdayOf({ y: 2027, m: 1, d: 1 })).toBe(4);
    expect(weekdayOf({ y: 2026, m: 11, d: 8 })).toBe(6);
    expect(dayDelta({ y: 2027, m: 1, d: 1 }, { y: 2027, m: 1, d: 29 })).toBe(28);
    expect(dayDelta({ y: 2027, m: 3, d: 1 }, { y: 2027, m: 2, d: 28 })).toBe(-1);
  });

  it('counts the weekdays, Monday to Friday, of a span after or before a start', () => {
    // 28 days from any weekday hold 20 weekdays
    for (const start of [0, 1, 2, 3, 4, 5, 6]) expect(weekdaysIn(start, 28)).toBe(20);
    // 10 days from a Monday: Tue to Fri, the next Mon to Thu: 8
    expect(weekdaysIn(0, 10)).toBe(8);
    // 10 days from a Friday: Mon to Fri, Mon: 6
    expect(weekdaysIn(4, 10)).toBe(6);
    // 30 days before a Monday: 4 full weeks (20) and the Saturday and Sunday before them
    expect(weekdaysIn(0, -30)).toBe(20);
    // 30 days before a Wednesday: 20, and the Tuesday and Monday
    expect(weekdaysIn(2, -30)).toBe(22);
  });

  it('reads the local date of a moment', () => {
    expect(civilOf(new Date(2027, 0, 29, 23, 59))).toEqual({ y: 2027, m: 1, d: 29 });
  });
});

describe('liveTextOf', () => {
  // formats that read the local clock of the Date, so the test needs no time zone
  const formats = {
    time: (moment: Date): string =>
      `${String(moment.getHours())}:${String(moment.getMinutes()).padStart(2, '0')}`,
    weekday: (moment: Date): string => String(moment.getDay()),
    date: (moment: Date): string =>
      `${String(moment.getFullYear())}-${String(moment.getMonth() + 1)}-${String(moment.getDate())}`,
  };
  const now = new Date(2027, 0, 1, 6, 0);
  const offset = { before: 'B {time} {weekday} {now}', same: 'S {time}', after: 'A {time}' };

  it('fills an offset with the time then and the day it falls on', () => {
    // 15 hours before Friday 6:00 am is Thursday 3:00 pm
    expect(liveTextOf('offset', { amount: '-900', ...offset }, now, formats)).toBe(
      'B 15:00 4 6:00',
    );
    expect(liveTextOf('offset', { amount: '30', ...offset }, now, formats)).toBe('S 6:30');
    expect(liveTextOf('offset', { amount: '1110', ...offset }, now, formats)).toBe('A 0:30');
  });

  it('fills a countdown for today or for tomorrow', () => {
    const data = { amount: '900', today: 'T {duration}', tomorrow: 'M {duration} {now}' };
    expect(liveTextOf('until', data, now, formats)).toBe('T 9 h 0 min');
    expect(liveTextOf('until', data, new Date(2027, 0, 1, 20, 0), formats)).toBe(
      'M 19 h 0 min 20:00',
    );
  });

  it('fills a date some days or months away', () => {
    const text = '{today} → {date}';
    expect(liveTextOf('date', { amount: '28', unit: 'day', text }, now, formats)).toBe(
      '2027-1-1 → 2027-1-29',
    );
    const august = new Date(2026, 7, 31, 12, 0);
    expect(liveTextOf('date', { amount: '6', unit: 'month', text }, august, formats)).toBe(
      '2026-8-31 → 2027-2-28',
    );
    expect(
      liveTextOf('date', { amount: '-30', unit: 'day', text }, new Date(2027, 2, 1), formats),
    ).toBe('2027-3-1 → 2027-1-30');
  });

  it('leaves the page as built for a kind it does not know', () => {
    expect(liveTextOf('other', { amount: '1' }, now, formats)).toBeUndefined();
  });
});

describe('fillTemplate', () => {
  it('puts each value in its place and leaves unknown names', () => {
    expect(fillTemplate('It is {now}: {d} left', { now: '9:00 AM', d: '6 h 0 min' })).toBe(
      'It is 9:00 AM: 6 h 0 min left',
    );
    expect(fillTemplate('{a}{a} {b}', { a: 'x' })).toBe('xx {b}');
  });
});
