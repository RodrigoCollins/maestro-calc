import { describe, expect, it } from 'vitest';
import { err, ok } from '../result.ts';
import { clockText, parseClock, shiftMinutes } from './clock.ts';

// core-clock-time: a time of day is minutes since midnight, 0..1439.
describe('parseClock', () => {
  it.each([
    ['0:00', 0],
    ['7', 420],
    ['7:30', 450],
    ['07:30', 450],
    ['16:30', 990],
    ['23:59', 1439],
    ['0730', 450],
    ['1630', 990],
  ])('reads %s on the 24-hour clock as %i', (text, minutes) => {
    expect(parseClock(text)).toEqual(ok(minutes));
  });

  it.each([
    ['7am', 420],
    ['7 am', 420],
    ['7:00 a.m.', 420],
    ['7:00 a', 420],
    ['7:30PM', 1170],
    ['4:30 p', 990],
    ['4:30 P.M.', 990],
    ['12 am', 0],
    ['12:15 a.m.', 15],
    ['12 pm', 720],
    ['12:45 pm', 765],
    ['11:59 pm', 1439],
  ])('reads %s on the 12-hour clock as %i', (text, minutes) => {
    expect(parseClock(text)).toEqual(ok(minutes));
  });

  it.each([
    '',
    'am',
    '24:00',
    '25',
    '7:60',
    '7:5',
    '7:005',
    '730',
    '2400',
    '0760',
    '0730 pm',
    '0 am',
    '13 pm',
    '7.30',
    '-1',
    '7:30 xm',
    '7:30 a.m.m',
    ' 7:30',
    '7:30 ',
    '١٢:٠٠',
  ])('rejects %j as MALFORMED', (text) => {
    expect(parseClock(text)).toEqual(err({ code: 'MALFORMED' }));
  });
});

describe('clockText', () => {
  it.each([
    [0, '0000'],
    [420, '0700'],
    [990, '1630'],
    [1439, '2359'],
  ])('writes %i as the canonical %s', (minutes, text) => {
    expect(clockText(minutes)).toBe(text);
    expect(parseClock(text)).toEqual(ok(minutes));
  });
});

describe('shiftMinutes', () => {
  it('is the time from in to out on the same day', () => {
    expect(shiftMinutes(420, 990)).toBe(570);
  });

  it('crosses midnight when out is before in, never negative', () => {
    expect(shiftMinutes(1320, 360)).toBe(480);
  });

  it('is zero when in and out are the same time', () => {
    expect(shiftMinutes(420, 420)).toBe(0);
  });
});
