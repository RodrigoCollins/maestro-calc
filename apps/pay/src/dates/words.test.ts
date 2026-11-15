import { daysBetween } from '@maestro-calc/pay-core/calendar';
import { describe, expect, it } from 'vitest';
import {
  betweenOf,
  countOf,
  longDateOf,
  pesosOf,
  shiftTextOf,
  shortDateOf,
  weeksTextOf,
} from './words.ts';

describe('the date words', () => {
  it('writes a date with its weekday, in Spanish', () => {
    // 25 Dec 2026 is a Friday (checked on a printed calendar)
    expect(longDateOf({ y: 2026, m: 12, d: 25 })).toBe('viernes 25 de diciembre de 2026');
    expect(longDateOf({ y: 2027, m: 1, d: 1 })).toBe('viernes 1 de enero de 2027');
    expect(shortDateOf({ y: 2027, m: 2, d: 14 })).toBe('14 de febrero');
  });

  it('counts with the singular for one', () => {
    expect(countOf(1, 'día', 'días')).toBe('1 día');
    expect(countOf(0, 'día', 'días')).toBe('0 días');
    expect(countOf(46, 'día', 'días')).toBe('46 días');
  });

  it('splits days into weeks and days', () => {
    expect(weeksTextOf(46)).toBe('6 semanas y 4 días');
    expect(weeksTextOf(8)).toBe('1 semana y 1 día');
    expect(weeksTextOf(14)).toBe('2 semanas');
    expect(weeksTextOf(3)).toBe('3 días');
  });

  it('writes pesos with two decimals and thousands', () => {
    expect(pesosOf(30_000)).toBe('$300.00');
    expect(pesosOf(240_000)).toBe('$2,400.00');
  });

  it('words the days between two dates, and says when they were swapped', () => {
    const plain = betweenOf(daysBetween({ y: 2026, m: 1, d: 1 }, { y: 2026, m: 12, d: 31 }, false));
    expect(plain).toEqual({
      figure: '364 días',
      values: { weeks: '52 semanas', business: '260 días' },
      reversed: false,
    });
    const swapped = betweenOf(daysBetween({ y: 2026, m: 1, d: 8 }, { y: 2026, m: 1, d: 1 }, true));
    expect(swapped.figure).toBe('8 días');
    expect(swapped.values.weeks).toBe('1 semana y 1 día');
    expect(swapped.reversed).toBe(true);
  });
});

describe('the words of a date moved some days', () => {
  const form = { from: '2026-01-01', amount: '90', back: false, business: false };

  it('says the date 90 days after 1 January 2026, with the weekdays on the way', () => {
    // 1 Jan 2026 is a Thursday: 90 days are 12 weeks and 6 days, 60 + 4 weekdays
    expect(shiftTextOf(form)).toEqual({
      figure: 'miércoles 1 de abril de 2026',
      values: { calendar: '90 días', weeks: '12 semanas y 6 días', business: '64 días' },
    });
  });

  it('goes back 30 days from Sunday 15 November 2026 to Friday 16 October', () => {
    expect(shiftTextOf({ ...form, from: '2026-11-15', amount: '30', back: true })?.figure).toBe(
      'viernes 16 de octubre de 2026',
    );
  });

  it('counts weekdays only when asked: 10 after Friday 13 November 2026 is Friday 27', () => {
    expect(shiftTextOf({ ...form, from: '2026-11-13', amount: '10', business: true })).toEqual({
      figure: 'viernes 27 de noviembre de 2026',
      values: { calendar: '14 días', weeks: '2 semanas', business: '10 días' },
    });
  });

  it('reads a whole number of days from 0 to 99999, spaces around allowed', () => {
    expect(shiftTextOf({ ...form, amount: ' 0 ' })?.figure).toBe('jueves 1 de enero de 2026');
    expect(shiftTextOf({ ...form, amount: '99999' })).not.toBeNull();
    for (const amount of ['', '-3', '2.5', '1e3', '100000', 'diez'])
      expect(shiftTextOf({ ...form, amount }), amount).toBeNull();
  });

  it('gives nothing for a missing date or a date past the year 9999', () => {
    expect(shiftTextOf({ ...form, from: '' })).toBeNull();
    expect(shiftTextOf({ ...form, from: '9999-12-01', amount: '31' })).toBeNull();
  });
});
