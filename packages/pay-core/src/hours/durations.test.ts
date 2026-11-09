import { describe, expect, it } from 'vitest';
import {
  additionOf,
  differenceOf,
  minutesOf,
  readAmount,
  splitOf,
  subtractionOf,
  sumOf,
  type Duration,
} from './durations.ts';

// Hand-verified: 7 h 45 min + 3 h 30 min: 45 + 30 = 75 min = 1 h 15 min, 7 + 3 + 1 = 11 h, so
// 11 h 15 min (675 min); 7 h 45 min − 3 h 30 min = 4 h 15 min (255 min); 10 h 15 min − 2 h 50 min
// borrows an hour: 75 − 50 = 25 min, 9 − 2 = 7 h, so 7 h 25 min; 1 h 20 min − 2 h 45 min is
// −1 h 25 min (−85 min).
const d = (hours: number, minutes: number): Duration => ({ hours, minutes });

describe('readAmount', () => {
  it.each([
    ['0', 0],
    ['7', 7],
    ['45', 45],
    ['075', 75],
    ['9999', 9999],
  ])('reads %j as %i', (text, value) => {
    expect(readAmount(text, 9999)).toBe(value);
  });

  it('reads an empty field as zero, so a duration can be minutes only', () => {
    expect(readAmount('', 9999)).toBe(0);
  });

  it.each(['-1', '1.5', '1,5', 'a', ' 7', '7 ', '1e3', '10000'])('rejects %j', (text) => {
    expect(readAmount(text, 9999)).toBeNull();
  });

  it('holds the maximum it is given', () => {
    expect(readAmount('59', 59)).toBe(59);
    expect(readAmount('60', 59)).toBeNull();
  });
});

describe('durations in minutes', () => {
  it('counts the hours as 60 minutes each', () => {
    expect(minutesOf(d(7, 45))).toBe(465);
    expect(minutesOf(d(0, 90))).toBe(90);
    expect(minutesOf(d(0, 0))).toBe(0);
  });

  it('sums any number of durations, none being zero', () => {
    expect(sumOf([d(7, 45), d(3, 30)])).toBe(675);
    expect(sumOf([d(8, 15), d(7, 50), d(8, 5), d(9, 30), d(6, 45)])).toBe(2425);
    expect(sumOf([])).toBe(0);
  });

  it('subtracts the second from the first, negative when the second is longer', () => {
    expect(differenceOf(d(7, 45), d(3, 30))).toBe(255);
    expect(differenceOf(d(10, 15), d(2, 50))).toBe(445);
    expect(differenceOf(d(1, 20), d(2, 45))).toBe(-85);
    expect(differenceOf(d(2, 0), d(2, 0))).toBe(0);
  });

  it('splits minutes back into hours and minutes, with the sign apart', () => {
    expect(splitOf(675)).toEqual({ negative: false, hours: 11, minutes: 15 });
    expect(splitOf(-85)).toEqual({ negative: true, hours: 1, minutes: 25 });
    expect(splitOf(59)).toEqual({ negative: false, hours: 0, minutes: 59 });
    expect(splitOf(60)).toEqual({ negative: false, hours: 1, minutes: 0 });
    expect(splitOf(0)).toEqual({ negative: false, hours: 0, minutes: 0 });
  });
});

describe('the column method', () => {
  it('adds the minutes first and carries whole hours', () => {
    expect(additionOf(d(7, 45), d(3, 30))).toEqual({
      minutes: 75,
      carry: 1,
      restMinutes: 15,
      hours: 11,
      total: 675,
    });
    expect(additionOf(d(2, 10), d(1, 20))).toEqual({
      minutes: 30,
      carry: 0,
      restMinutes: 30,
      hours: 3,
      total: 210,
    });
    expect(additionOf(d(0, 59), d(0, 61))).toEqual({
      minutes: 120,
      carry: 2,
      restMinutes: 0,
      hours: 2,
      total: 120,
    });
  });

  it('borrows an hour when the minutes to take away are more', () => {
    expect(subtractionOf(d(10, 15), d(2, 50))).toEqual({
      negative: false,
      borrow: true,
      minutes: 25,
      hours: 7,
      total: 445,
    });
    expect(subtractionOf(d(7, 45), d(3, 30))).toEqual({
      negative: false,
      borrow: false,
      minutes: 15,
      hours: 4,
      total: 255,
    });
    expect(subtractionOf(d(5, 0), d(0, 1))).toEqual({
      negative: false,
      borrow: true,
      minutes: 59,
      hours: 4,
      total: 299,
    });
  });

  it('takes the shorter from the longer and marks the result negative', () => {
    expect(subtractionOf(d(1, 20), d(2, 45))).toEqual({
      negative: true,
      borrow: false,
      minutes: 25,
      hours: 1,
      total: -85,
    });
    expect(subtractionOf(d(2, 0), d(2, 0))).toEqual({
      negative: false,
      borrow: false,
      minutes: 0,
      hours: 0,
      total: 0,
    });
  });

  it('normalizes minutes past 59 before borrowing', () => {
    // 1 h 90 min = 2 h 30 min; minus 0 h 45 min: borrow, 90 − 45 = 45 min, 1 h
    expect(subtractionOf(d(1, 90), d(0, 45))).toEqual({
      negative: false,
      borrow: true,
      minutes: 45,
      hours: 1,
      total: 105,
    });
  });
});
