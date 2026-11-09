import { describe, expect, it } from 'vitest';
import {
  militaryTimeOf,
  numberWords,
  readTime,
  spokenOf,
  US_ZONES,
  zoneTimesOf,
} from './military-time.ts';

// Hand-verified: 1500 is hour 15, past 12, so 15 − 12 = 3:00 PM; 0000 is 12:00 AM (midnight);
// 1200 is 12:00 PM (noon); 0930 is 9:30 AM, unchanged but for the leading zero; 2359 is 11:59 PM;
// 2400 is the midnight that ends a day, 12:00 AM of the next. Eastern Standard Time is UTC−5,
// Central −6, Mountain −7, Pacific −8, Alaska −9, Hawaii −10; in daylight time each moves an hour
// ahead but Hawaii, so 1500 Eastern is 1400 Central and 0900 Hawaii in summer, 1000 in winter.

describe('militaryTimeOf', () => {
  it('writes 1500 as fifteen hundred hours, 3:00 PM', () => {
    expect(militaryTimeOf(900)).toEqual({
      minutes: 900,
      hour: 15,
      minute: 0,
      military: '1500',
      colon: '15:00',
      twelve: { hour: 3, minute: 0, meridiem: 'pm' },
      twelveText: '3:00 PM',
      spoken: 'fifteen hundred hours',
    });
  });

  it.each([
    [0, '0000', '00:00', '12:00 AM'],
    [5, '0005', '00:05', '12:05 AM'],
    [30, '0030', '00:30', '12:30 AM'],
    [60, '0100', '01:00', '1:00 AM'],
    [570, '0930', '09:30', '9:30 AM'],
    [659, '1059', '10:59', '10:59 AM'],
    [719, '1159', '11:59', '11:59 AM'],
    [720, '1200', '12:00', '12:00 PM'],
    [750, '1230', '12:30', '12:30 PM'],
    [780, '1300', '13:00', '1:00 PM'],
    [825, '1345', '13:45', '1:45 PM'],
    [1439, '2359', '23:59', '11:59 PM'],
    [1440, '2400', '24:00', '12:00 AM'],
  ])('writes minute %i as %s, %s and %s', (minutes, military, colon, twelveText) => {
    const time = militaryTimeOf(minutes);
    expect([time.military, time.colon, time.twelveText]).toEqual([military, colon, twelveText]);
  });

  it('reads the 12-hour parts: 12 for the hour of midnight and noon, am before noon', () => {
    expect(militaryTimeOf(0).twelve).toEqual({ hour: 12, minute: 0, meridiem: 'am' });
    expect(militaryTimeOf(719).twelve).toEqual({ hour: 11, minute: 59, meridiem: 'am' });
    expect(militaryTimeOf(720).twelve).toEqual({ hour: 12, minute: 0, meridiem: 'pm' });
    expect(militaryTimeOf(1439).twelve).toEqual({ hour: 11, minute: 59, meridiem: 'pm' });
    expect(militaryTimeOf(1440)).toMatchObject({
      hour: 24,
      minute: 0,
      twelve: { hour: 12, minute: 0, meridiem: 'am' },
    });
  });

  it.each([-1, 1441, 1.5, Number.NaN])('refuses %d minutes', (minutes) => {
    expect(() => militaryTimeOf(minutes)).toThrow(RangeError);
  });
});

describe('numberWords', () => {
  it.each([
    [0, 'zero'],
    [1, 'one'],
    [9, 'nine'],
    [10, 'ten'],
    [11, 'eleven'],
    [12, 'twelve'],
    [13, 'thirteen'],
    [15, 'fifteen'],
    [19, 'nineteen'],
    [20, 'twenty'],
    [21, 'twenty-one'],
    [24, 'twenty-four'],
    [30, 'thirty'],
    [45, 'forty-five'],
    [50, 'fifty'],
    [59, 'fifty-nine'],
  ])('says %i as %s', (value, words) => {
    expect(numberWords(value)).toBe(words);
  });

  it.each([-1, 60, 2.5])('refuses %d', (value) => {
    expect(() => numberWords(value)).toThrow(RangeError);
  });
});

describe('spokenOf', () => {
  it.each([
    [0, 0, 'zero hundred hours'],
    [8, 0, 'zero eight hundred hours'],
    [10, 0, 'ten hundred hours'],
    [15, 0, 'fifteen hundred hours'],
    [20, 0, 'twenty hundred hours'],
    [24, 0, 'twenty-four hundred hours'],
    [0, 5, 'zero zero zero five'],
    [0, 30, 'zero zero thirty'],
    [8, 30, 'zero eight thirty'],
    [10, 5, 'ten zero five'],
    [13, 45, 'thirteen forty-five'],
    [21, 30, 'twenty-one thirty'],
    [23, 59, 'twenty-three fifty-nine'],
  ])('says %i:%i as %s', (hour, minute, words) => {
    expect(spokenOf(hour, minute)).toBe(words);
  });
});

describe('readTime', () => {
  it.each([
    ['1500', 900],
    ['15:00', 900],
    ['1500 hours', 900],
    ['1500 hrs', 900],
    ['1500h', 900],
    ['  1500  ', 900],
    ['3 pm', 900],
    ['3:00 PM', 900],
    ['3:00pm', 900],
    ['3:00 p.m.', 900],
    ['0000', 0],
    ['12 am', 0],
    ['12:00 PM', 720],
    ['0930', 570],
    ['930', 570],
    ['9:30', 570],
    ['0005', 5],
    ['2359', 1439],
    ['2400', 1440],
    ['24:00', 1440],
    ['2400 hours', 1440],
  ])('reads %j as minute %i', (text, minutes) => {
    expect(readTime(text)?.minutes).toBe(minutes);
  });

  it.each(['', 'noon', '2401', '24:30', '1560', '25:00', '13 pm', '0 am', '15000', '1500 days'])(
    'refuses %j',
    (text) => {
      expect(readTime(text)).toBeNull();
    },
  );
});

describe('zoneTimesOf', () => {
  it('lists the six US zones from Eastern, each with its offset from UTC in standard time', () => {
    expect(US_ZONES.map(({ id, standard }) => [id, standard])).toEqual([
      ['ET', -5],
      ['CT', -6],
      ['MT', -7],
      ['PT', -8],
      ['AKT', -9],
      ['HT', -10],
    ]);
    expect(US_ZONES.map(({ daylight }) => daylight)).toEqual([true, true, true, true, true, false]);
  });

  it('gives 1500 Eastern in every zone, a day back where it falls before midnight', () => {
    expect(zoneTimesOf(900, 'standard')).toEqual([
      { zone: 'ET', minutes: 900, day: 0 },
      { zone: 'CT', minutes: 840, day: 0 },
      { zone: 'MT', minutes: 780, day: 0 },
      { zone: 'PT', minutes: 720, day: 0 },
      { zone: 'AKT', minutes: 660, day: 0 },
      { zone: 'HT', minutes: 600, day: 0 },
    ]);
    expect(zoneTimesOf(900, 'daylight').at(-1)).toEqual({ zone: 'HT', minutes: 540, day: 0 });
  });

  it('moves 0100 Eastern into the day before west of it', () => {
    expect(zoneTimesOf(60, 'standard').map(({ minutes, day }) => [minutes, day])).toEqual([
      [60, 0],
      [0, 0],
      [1380, -1],
      [1320, -1],
      [1260, -1],
      [1200, -1],
    ]);
    expect(zoneTimesOf(60, 'daylight').at(-1)).toEqual({ zone: 'HT', minutes: 1140, day: -1 });
  });

  it('reads 2400 Eastern as the midnight that starts the next day', () => {
    expect(zoneTimesOf(1440, 'standard').slice(0, 2)).toEqual([
      { zone: 'ET', minutes: 0, day: 1 },
      { zone: 'CT', minutes: 1380, day: 0 },
    ]);
  });
});
