import { Rational, usd } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { NEVADA_MINIMUM_WAGE, payOf, splitWeek } from './split.ts';

const r = (n: number, d = 1): Rational => Rational.of(n, d);
const week = (...hours: number[]): Rational[] => hours.map((h) => r(h));
/** The rate of a week whose rule does not depend on it. */
const RATE = usd(22);

// Hand-verified splits of a Monday-to-Sunday week, in hours.
describe('splitWeek, federal (FLSA: past 40 hours in the workweek at 1.5x)', () => {
  it('splits a 49.5 h week into 40 regular and 9.5 overtime, with no double time', () => {
    expect(splitWeek('federal', [...week(9, 9, 9, 9, 9), r(9, 2), r(0)], RATE)).toEqual({
      regular: r(40),
      overtime: r(19, 2),
      double: r(0),
    });
  });

  it('has no overtime at exactly 40 hours, however long the days', () => {
    expect(splitWeek('federal', week(10, 10, 10, 10, 0, 0, 0), RATE)).toEqual({
      regular: r(40),
      overtime: r(0),
      double: r(0),
    });
  });

  it('has no daily overtime: one 13 h day is 13 regular hours', () => {
    expect(splitWeek('federal', week(13, 0, 0, 0, 0, 0, 0), RATE)).toEqual({
      regular: r(13),
      overtime: r(0),
      double: r(0),
    });
  });
});

describe('splitWeek, California (Labor Code 510, no pyramiding)', () => {
  it('pays four 10 h days as 32 regular and 8 daily overtime', () => {
    expect(splitWeek('california', week(10, 10, 10, 10, 0, 0, 0), RATE)).toEqual({
      regular: r(32),
      overtime: r(8),
      double: r(0),
    });
  });

  it('pays a 13 h day as 8 regular, 4 overtime and 1 double', () => {
    expect(splitWeek('california', week(13, 0, 0, 0, 0, 0, 0), RATE)).toEqual({
      regular: r(8),
      overtime: r(4),
      double: r(1),
    });
  });

  it('pays exactly 8 and exactly 12 hours at their edges', () => {
    expect(splitWeek('california', week(8, 12, 0, 0, 0, 0, 0), RATE)).toEqual({
      regular: r(16),
      overtime: r(4),
      double: r(0),
    });
  });

  it('moves regular hours past 40 to overtime, never daily overtime twice', () => {
    // DLSE 2000.01.19: 7 h a day for six days is 42 h, 2 of them weekly overtime
    expect(splitWeek('california', week(7, 7, 7, 7, 7, 7, 0), RATE)).toEqual({
      regular: r(40),
      overtime: r(2),
      double: r(0),
    });
  });

  it('pays the seventh consecutive day: the first 8 h at 1.5x, the rest at 2x', () => {
    // Mon-Sat 6 x (8 + 1) = 48 regular, 6 overtime; 8 regular move to overtime; Sunday 8 + 1
    expect(splitWeek('california', week(9, 9, 9, 9, 9, 9, 9), RATE)).toEqual({
      regular: r(40),
      overtime: r(22),
      double: r(1),
    });
  });

  it('pays a short seventh day all at 1.5x', () => {
    // Mon-Sat 6 x 5 h = 30 regular; Sunday 5 h is the seventh day, all overtime
    expect(splitWeek('california', week(5, 5, 5, 5, 5, 5, 5), RATE)).toEqual({
      regular: r(30),
      overtime: r(5),
      double: r(0),
    });
  });

  it('has no seventh day when any day of the week is off', () => {
    expect(splitWeek('california', week(0, 9, 9, 9, 9, 9, 9), RATE)).toEqual({
      regular: r(40),
      overtime: r(14),
      double: r(0),
    });
  });

  it('keeps fractions exact: 8.25 h a day for five days', () => {
    expect(
      splitWeek('california', [...Array<Rational>(5).fill(r(33, 4)), r(0), r(0)], RATE),
    ).toEqual({
      regular: r(40),
      overtime: r(5, 4),
      double: r(0),
    });
  });
});

// Alaska (AS 23.10.060: past 8 h a day or 40 h a week) and Colorado (DOL table: past 12 h a day
// or 40 h a week). The sources name both thresholds; each hour is counted once, daily overtime
// first, then the regular hours past 40, so the week pays the greater of the two counts.
describe('splitWeek, Alaska (past 8 h a day or 40 h a week, each hour once)', () => {
  it('pays four 10 h days as 32 regular and 8 daily overtime', () => {
    expect(splitWeek('alaska', week(10, 10, 10, 10, 0, 0, 0), RATE)).toEqual({
      regular: r(32),
      overtime: r(8),
      double: r(0),
    });
  });

  it('has no double time: a 13 h day is 8 regular and 5 overtime', () => {
    expect(splitWeek('alaska', week(13, 0, 0, 0, 0, 0, 0), RATE)).toEqual({
      regular: r(8),
      overtime: r(5),
      double: r(0),
    });
  });

  it('moves regular hours past 40 to overtime: six 7 h days are 40 and 2', () => {
    expect(splitWeek('alaska', week(7, 7, 7, 7, 7, 7, 0), RATE)).toEqual({
      regular: r(40),
      overtime: r(2),
      double: r(0),
    });
  });

  it('has no seventh-day rule: seven 9 h days are 40 regular and 23 overtime', () => {
    // 7 x 8 = 56 regular, 7 daily overtime; 16 regular move past 40: 40 and 23
    expect(splitWeek('alaska', week(9, 9, 9, 9, 9, 9, 9), RATE)).toEqual({
      regular: r(40),
      overtime: r(23),
      double: r(0),
    });
  });
});

describe('splitWeek, Colorado (past 12 h a day or 40 h a week, each hour once)', () => {
  it('pays four 10 h days with no overtime, and a 13 h day with 1 h of it', () => {
    expect(splitWeek('colorado', week(10, 10, 10, 10, 0, 0, 0), RATE)).toEqual({
      regular: r(40),
      overtime: r(0),
      double: r(0),
    });
    expect(splitWeek('colorado', week(13, 0, 0, 0, 0, 0, 0), RATE)).toEqual({
      regular: r(12),
      overtime: r(1),
      double: r(0),
    });
  });

  it('pays three 14 h days as 36 regular and 6 overtime, and 5 x 9 h as 40 and 5', () => {
    expect(splitWeek('colorado', week(14, 14, 14, 0, 0, 0, 0), RATE)).toEqual({
      regular: r(36),
      overtime: r(6),
      double: r(0),
    });
    expect(splitWeek('colorado', week(9, 9, 9, 9, 9, 0, 0), RATE)).toEqual({
      regular: r(40),
      overtime: r(5),
      double: r(0),
    });
  });
});

// Nevada (NRS 608.018, DOL table): past 8 h a day only below 1.5 times the $12.00 minimum,
// $18.00 an hour; at $18.00 or more, past 40 h a week alone.
describe('splitWeek, Nevada (daily overtime below 1.5 x the minimum wage)', () => {
  it('pays four 10 h days at $17.99 as 32 regular and 8 overtime', () => {
    expect(splitWeek('nevada', week(10, 10, 10, 10, 0, 0, 0), usd(r(1799, 100)))).toEqual({
      regular: r(32),
      overtime: r(8),
      double: r(0),
    });
  });

  it('pays the same days at $18.00 by the week alone: 40 regular, no overtime', () => {
    expect(splitWeek('nevada', week(10, 10, 10, 10, 0, 0, 0), usd(18))).toEqual({
      regular: r(40),
      overtime: r(0),
      double: r(0),
    });
  });

  it('still pays past 40 a week at $18.00 or more: five 9 h days are 40 and 5', () => {
    expect(splitWeek('nevada', week(9, 9, 9, 9, 9, 0, 0), usd(25))).toEqual({
      regular: r(40),
      overtime: r(5),
      double: r(0),
    });
  });

  it('takes its line from the $12.00 minimum: 1.5 times is $18.00', () => {
    expect(NEVADA_MINIMUM_WAGE).toEqual(usd(12));
  });
});

describe('payOf', () => {
  it('pays regular hours at the rate, overtime at 1.5x and double time at 2x', () => {
    // $22: 40 x 22 = 880, 12.5 x 33 = 412.50, 1 x 44 = 44; 1,336.50 in all
    expect(payOf(usd(22), { regular: r(40), overtime: r(25, 2), double: r(1) })).toEqual({
      regularPay: usd(880),
      overtimePay: usd(r(825, 2)),
      doublePay: usd(44),
      pay: usd(r(2673, 2)),
    });
  });
});
