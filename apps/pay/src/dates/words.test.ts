import { daysBetween } from '@maestro-calc/pay-core/calendar';
import { describe, expect, it } from 'vitest';
import { betweenOf, countOf, longDateOf, pesosOf, shortDateOf, weeksTextOf } from './words.ts';

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
