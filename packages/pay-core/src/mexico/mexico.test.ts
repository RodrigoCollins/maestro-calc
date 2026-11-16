import { describe, expect, it } from 'vitest';
import type { CivilDate } from '../calendar/calendar.ts';
import {
  AGUINALDO_EXEMPT_CENTS,
  AGUINALDO_MIN_DAYS,
  aguinaldoOf,
  completedYearsOf,
  MINIMUM_WAGE_2026,
  nextAnniversaryOf,
  parseCents,
  parseWhole,
  PRIMA_EXEMPT_CENTS,
  PRIMA_MIN_PERCENT,
  UMA_2026,
  VACATION_TABLE,
  vacacionesOf,
  vacationDaysFor,
} from './mexico.ts';

const date = (y: number, m: number, d: number): CivilDate => ({ y, m, d });

// The official figures, as published (read 2026-11-15):
// - UMA: INEGI in the DOF of 9 January 2026, $117.31 a day, in force from 1 February 2026.
// - Minimum wage: CONASAMI resolution in the DOF of 9 December 2025, $315.04 a day in the general
//   zone and $440.87 in the northern border free zone, from 1 January 2026.
describe('the official figures of 2026', () => {
  it('holds the UMA of 2026 and the 2026 minimum wages, in centavos', () => {
    expect(UMA_2026).toEqual({ dailyCents: 11731, from: '2026-02-01', published: '2026-01-09' });
    expect(MINIMUM_WAGE_2026).toEqual({
      generalCents: 31504,
      borderCents: 44087,
      from: '2026-01-01',
      published: '2025-12-09',
    });
  });

  it('exempts 30 UMA of aguinaldo, $3,519.30, and 15 UMA of prima vacacional, $1,759.65', () => {
    // 30 × 117.31 = 3,519.30; 15 × 117.31 = 1,759.65
    expect(AGUINALDO_EXEMPT_CENTS).toBe(351930);
    expect(PRIMA_EXEMPT_CENTS).toBe(175965);
  });

  it('keeps the legal floors: 15 days of aguinaldo and a prima of 25%', () => {
    expect(AGUINALDO_MIN_DAYS).toBe(15);
    expect(PRIMA_MIN_PERCENT).toBe(25);
  });
});

describe('parseCents', () => {
  it('reads pesos with or without centavos, a sign, spaces and thousands commas', () => {
    expect(parseCents('315.04')).toBe(31504);
    expect(parseCents('315')).toBe(31500);
    expect(parseCents('315.5')).toBe(31550);
    expect(parseCents(' $12,000.00 ')).toBe(1200000);
    expect(parseCents('1,234,567')).toBe(123456700);
    expect(parseCents('10,000,000')).toBe(1000000000);
    expect(parseCents('0.01')).toBe(1);
  });

  it('refuses empty, zero, negative, more than two decimals, bad grouping and huge amounts', () => {
    for (const text of ['', '0', '0.00', '-5', '1.234', '12,34', '1,2345', 'abc', '10000000.01'])
      expect(parseCents(text)).toBeNull();
  });

  it('reads up to a larger ceiling when one is given, for a company figure', () => {
    expect(parseCents('100,000,000,000', 10_000_000_000_000)).toBe(10_000_000_000_000);
    expect(parseCents('2,000,000.50', 10_000_000_000_000)).toBe(200_000_050);
    expect(parseCents('100000000000.01', 10_000_000_000_000)).toBeNull();
  });
});

describe('parseWhole', () => {
  it('reads a whole number within its bounds and refuses anything else', () => {
    expect(parseWhole('15', 1, 365)).toBe(15);
    expect(parseWhole(' 30 ', 1, 365)).toBe(30);
    expect(parseWhole('1', 1, 365)).toBe(1);
    expect(parseWhole('365', 1, 365)).toBe(365);
    for (const text of ['', '0', '366', '15.5', '-1', 'x'])
      expect(parseWhole(text, 1, 365)).toBeNull();
  });
});

describe('aguinaldoOf', () => {
  const minimum = { wageCents: 31504, period: 'day' as const, days: 15 };

  it('pays 15 days of the 2026 minimum wage for a whole year: $4,725.60', () => {
    // 315.04 × 15 = 4,725.60; exempt 3,519.30; taxable 4,725.60 − 3,519.30 = 1,206.30
    const result = aguinaldoOf({ ...minimum, start: date(2024, 5, 2), end: date(2026, 12, 31) });
    expect(result).toEqual({
      dailyCents: 31504,
      daysWorked: 365,
      earnedHundredths: 1500,
      fullCents: 472560,
      amountCents: 472560,
      exemptCents: 351930,
      taxableCents: 120630,
      belowMinimum: false,
    });
  });

  it('pays the share of the days worked from 1 July: 184 days, $2,382.22', () => {
    // July 31 + August 31 + September 30 + October 31 + November 30 + December 31 = 184 days;
    // 4,725.60 × 184 / 365 = 869,510.40 / 365 = 2,382.2203 → 2,382.22; 15 × 184 / 365 = 7.56 days
    const result = aguinaldoOf({ ...minimum, start: date(2026, 7, 1), end: date(2026, 12, 31) });
    expect(result.daysWorked).toBe(184);
    expect(result.earnedHundredths).toBe(756);
    expect(result.amountCents).toBe(238222);
    expect(result.exemptCents).toBe(238222);
    expect(result.taxableCents).toBe(0);
    expect(result.fullCents).toBe(472560);
  });

  it('counts both ends: hired on 1 December, 31 days to the 31st', () => {
    // 4,725.60 × 31 / 365 = 146,493.60 / 365 = 401.3523 → 401.35
    const result = aguinaldoOf({ ...minimum, start: date(2026, 12, 1), end: date(2026, 12, 31) });
    expect(result.daysWorked).toBe(31);
    expect(result.amountCents).toBe(40135);
  });

  it('counts a year that ends early, as on leaving the job on 30 June', () => {
    // 1 January to 30 June 2026: 31 + 28 + 31 + 30 + 31 + 30 = 181 days;
    // 4,725.60 × 181 / 365 = 855,333.60 / 365 = 2,343.3797 → 2,343.38
    const result = aguinaldoOf({ ...minimum, start: date(2020, 1, 1), end: date(2026, 6, 30) });
    expect(result.daysWorked).toBe(181);
    expect(result.amountCents).toBe(234338);
  });

  it('divides a monthly salary by 30 for the daily one (LFT art. 89)', () => {
    // 12,000 / 30 = 400.00 a day; × 15 = 6,000.00; taxable 6,000.00 − 3,519.30 = 2,480.70
    const result = aguinaldoOf({
      wageCents: 1200000,
      period: 'month',
      days: 15,
      start: date(2026, 1, 1),
      end: date(2026, 12, 31),
    });
    expect(result.dailyCents).toBe(40000);
    expect(result.amountCents).toBe(600000);
    expect(result.taxableCents).toBe(248070);
  });

  it('rounds a monthly salary only once, at the end', () => {
    // 10,000 / 30 = 333.333… a day: 333.33 shown, but 15 days are 10,000 × 15 / 30 = 5,000.00
    const result = aguinaldoOf({
      wageCents: 1000000,
      period: 'month',
      days: 15,
      start: date(2026, 1, 1),
      end: date(2026, 12, 31),
    });
    expect(result.dailyCents).toBe(33333);
    expect(result.amountCents).toBe(500000);
  });

  it('pays the days the employer gives over the 15: 30 days at $1,000', () => {
    // 1,000 × 30 = 30,000.00; taxable 30,000.00 − 3,519.30 = 26,480.70
    const result = aguinaldoOf({
      wageCents: 100000,
      period: 'day',
      days: 30,
      start: date(2026, 1, 1),
      end: date(2026, 12, 31),
    });
    expect(result.amountCents).toBe(3000000);
    expect(result.taxableCents).toBe(2648070);
  });

  it('pays the border minimum, $440.87 × 15 = $6,613.05', () => {
    const result = aguinaldoOf({
      wageCents: 44087,
      period: 'day',
      days: 15,
      start: date(2026, 1, 1),
      end: date(2026, 12, 31),
    });
    expect(result.amountCents).toBe(661305);
  });

  it('flags fewer days than the law gives and still works them out', () => {
    // 315.04 × 10 = 3,150.40
    const result = aguinaldoOf({
      ...minimum,
      days: 10,
      start: date(2026, 1, 1),
      end: date(2026, 12, 31),
    });
    expect(result.belowMinimum).toBe(true);
    expect(result.amountCents).toBe(315040);
  });

  it('never pays more than a year for a leap year of 366 days', () => {
    const result = aguinaldoOf({ ...minimum, start: date(2028, 1, 1), end: date(2028, 12, 31) });
    expect(result.daysWorked).toBe(365);
    expect(result.amountCents).toBe(472560);
  });

  it('refuses a start after the end', () => {
    expect(() =>
      aguinaldoOf({ ...minimum, start: date(2026, 12, 2), end: date(2026, 12, 1) }),
    ).toThrow(RangeError);
  });
});

describe('vacationDaysFor (LFT art. 76, DOF 27-12-2022)', () => {
  it('gives 12 days the first year and 2 more each year to 20 in the fifth', () => {
    expect([1, 2, 3, 4, 5].map(vacationDaysFor)).toEqual([12, 14, 16, 18, 20]);
  });

  it('then 2 more for each five years of service', () => {
    expect([6, 10, 11, 15, 16, 20, 21, 25, 26, 30, 31, 35].map(vacationDaysFor)).toEqual([
      22, 22, 24, 24, 26, 26, 28, 28, 30, 30, 32, 32,
    ]);
  });

  it('gives none before the first year is complete', () => {
    expect(vacationDaysFor(0)).toBe(0);
  });

  it('tabulates the years of service and their days', () => {
    expect(VACATION_TABLE.map(({ from, to, days }) => [from, to, days])).toEqual([
      [1, 1, 12],
      [2, 2, 14],
      [3, 3, 16],
      [4, 4, 18],
      [5, 5, 20],
      [6, 10, 22],
      [11, 15, 24],
      [16, 20, 26],
      [21, 25, 28],
      [26, 30, 30],
      [31, 35, 32],
    ]);
  });
});

describe('completedYearsOf and nextAnniversaryOf', () => {
  it('counts a year only on its anniversary', () => {
    expect(completedYearsOf(date(2021, 1, 15), date(2026, 1, 14))).toBe(4);
    expect(completedYearsOf(date(2021, 1, 15), date(2026, 1, 15))).toBe(5);
    expect(completedYearsOf(date(2026, 3, 1), date(2026, 12, 31))).toBe(0);
  });

  it('reaches the anniversary of 29 February on 1 March of a common year', () => {
    expect(completedYearsOf(date(2024, 2, 29), date(2025, 2, 28))).toBe(0);
    expect(completedYearsOf(date(2024, 2, 29), date(2025, 3, 1))).toBe(1);
    expect(nextAnniversaryOf(date(2024, 2, 29), 0)).toEqual(date(2025, 3, 1));
    expect(nextAnniversaryOf(date(2024, 2, 29), 3)).toEqual(date(2028, 2, 29));
  });
});

describe('vacacionesOf', () => {
  it('gives five years 20 days: $6,300.80 of pay and a prima of $1,575.20, all exempt', () => {
    // 315.04 × 20 = 6,300.80; × 25% = 1,575.20, under the 15 UMA of 1,759.65
    expect(
      vacacionesOf({
        wageCents: 31504,
        period: 'day',
        primaPercent: 25,
        start: date(2021, 1, 15),
        on: date(2026, 12, 31),
      }),
    ).toEqual({
      dailyCents: 31504,
      years: 5,
      earned: true,
      days: 20,
      payCents: 630080,
      primaCents: 157520,
      primaExemptCents: 157520,
      primaTaxableCents: 0,
      next: { date: date(2027, 1, 15), days: 22 },
      belowMinimum: false,
    });
  });

  it('gives 11 years on $15,000 a month 24 days and a prima over the exempt part', () => {
    // 15,000 / 30 = 500 a day; × 24 = 12,000.00; × 25% = 3,000.00;
    // exempt 1,759.65, taxable 3,000.00 − 1,759.65 = 1,240.35
    const result = vacacionesOf({
      wageCents: 1500000,
      period: 'month',
      primaPercent: 25,
      start: date(2015, 6, 1),
      on: date(2026, 12, 31),
    });
    expect(result.dailyCents).toBe(50000);
    expect(result.years).toBe(11);
    expect(result.days).toBe(24);
    expect(result.payCents).toBe(1200000);
    expect(result.primaCents).toBe(300000);
    expect(result.primaExemptCents).toBe(175965);
    expect(result.primaTaxableCents).toBe(124035);
    expect(result.next).toEqual({ date: date(2027, 6, 1), days: 24 });
  });

  it('shows the 12 days of the first year before it is complete', () => {
    // 315.04 × 12 = 3,780.48; × 25% = 945.12
    const result = vacacionesOf({
      wageCents: 31504,
      period: 'day',
      primaPercent: 25,
      start: date(2026, 3, 1),
      on: date(2026, 12, 31),
    });
    expect(result.years).toBe(0);
    expect(result.earned).toBe(false);
    expect(result.days).toBe(12);
    expect(result.payCents).toBe(378048);
    expect(result.primaCents).toBe(94512);
    expect(result.next).toEqual({ date: date(2027, 3, 1), days: 12 });
  });

  it('pays a higher prima and flags one under 25%', () => {
    // 3,780.48 × 30% = 1,134.144 → 1,134.14; × 20% = 756.096 → 756.10
    const base = { wageCents: 31504, period: 'day' as const, start: date(2026, 3, 1) };
    const on = date(2026, 12, 31);
    expect(vacacionesOf({ ...base, on, primaPercent: 30 }).primaCents).toBe(113414);
    const low = vacacionesOf({ ...base, on, primaPercent: 20 });
    expect(low.primaCents).toBe(75610);
    expect(low.belowMinimum).toBe(true);
  });

  it('refuses a date before the start', () => {
    expect(() =>
      vacacionesOf({
        wageCents: 31504,
        period: 'day',
        primaPercent: 25,
        start: date(2026, 3, 1),
        on: date(2026, 2, 28),
      }),
    ).toThrow(RangeError);
  });
});
