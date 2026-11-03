import { Rational, usd } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { clockFieldText, hoursText, moneyText, shiftText } from './format.ts';

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
