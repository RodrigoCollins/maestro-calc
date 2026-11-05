import { Rational, usd } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import {
  clockFieldText,
  decimalHoursText,
  hoursMinutesText,
  hoursText,
  moneyText,
  rateText,
  shiftText,
} from './format.ts';

describe('decimalHoursText', () => {
  it.each([
    [Rational.of(8), '8.00'],
    [Rational.of(25, 3), '8.33'],
    [Rational.of(33, 4), '8.25'],
    [Rational.of(1, 6), '0.17'],
    [Rational.of(59, 60), '0.98'],
    [Rational.of(1999, 2), '999.50'],
    [Rational.of(1234), '1,234.00'],
  ])('writes %o hours as %s, always two places', (hours, text) => {
    expect(decimalHoursText(hours)).toBe(text);
  });
});

describe('rateText', () => {
  it.each([
    [Rational.of(1, 26), '0.0385'],
    [Rational.of(3, 52), '0.0577'],
    [Rational.of(1, 40), '0.025'],
    [Rational.of(1), '1'],
    [Rational.of(1, 100_000), '0'],
  ])('writes the rate %o to four places at most, as %s', (rate, text) => {
    expect(rateText(rate)).toBe(text);
  });
});

describe('hoursMinutesText', () => {
  it.each([
    [Rational.of(8), '8 h 0 min'],
    [Rational.of(33, 4), '8 h 15 min'],
    [Rational.of(25, 3), '8 h 20 min'],
    [Rational.of(3, 4), '0 h 45 min'],
    [Rational.of(59, 60), '0 h 59 min'],
    // to the nearest minute: 0.999 h is 59.94 min, so 1 h 0 min
    [Rational.of(999, 1000), '1 h 0 min'],
    [Rational.of(1999, 2), '999 h 30 min'],
    [Rational.of(1234), '1,234 h 0 min'],
  ])('writes %o hours as %s', (hours, text) => {
    expect(hoursMinutesText(hours)).toBe(text);
  });
});

describe('moneyText', () => {
  it.each([
    [usd(Rational.of(2387, 2)), '$1,193.50'],
    [usd(880), '$880.00'],
    [usd(0), '$0.00'],
    [usd(Rational.of(1, 3)), '$0.33'],
    [usd(1234567), '$1,234,567.00'],
  ])('writes %o as %s', (money, text) => {
    expect(moneyText(money)).toBe(text);
  });
});

describe('hoursText', () => {
  it.each([
    [Rational.of(99, 2), '49.5'],
    [Rational.of(40), '40'],
    [Rational.of(33, 4), '8.25'],
    [Rational.of(1, 3), '0.33'],
    [Rational.of(0), '0'],
  ])('writes %o hours as %s', (hours, text) => {
    expect(hoursText(hours)).toBe(text);
  });
});

describe('clockFieldText', () => {
  it.each([
    [420, '7:00 am'],
    [990, '4:30 pm'],
    [0, '12:00 am'],
    [720, '12:00 pm'],
    [null, ''],
  ])('writes %j as %j', (minutes, text) => {
    expect(clockFieldText(minutes)).toBe(text);
  });
});

describe('shiftText', () => {
  it.each([
    [420, 990, '7:00a–4:30p'],
    [0, 720, '12:00a–12:00p'],
    [1350, 375, '10:30p–6:15a'],
    [null, null, ''],
    [420, null, ''],
  ])('writes a shift from %j to %j as %j', (start, end, text) => {
    expect(shiftText(start, end)).toBe(text);
  });
});
