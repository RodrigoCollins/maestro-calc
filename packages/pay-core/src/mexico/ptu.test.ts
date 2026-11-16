import { describe, expect, it } from 'vitest';
import {
  EVENTUAL_MIN_DAYS,
  PTU_CAP_DAYS,
  PTU_EXEMPT_CENTS,
  PTU_MAX_CENTS,
  PTU_PERCENT,
  ptuOf,
  type PtuInput,
} from './ptu.ts';

// The rules, as the Ley Federal del Trabajo (Cámara de Diputados text, last reform DOF
// 21-02-2025), the Ley del ISR (last reform DOF 01-04-2024) and the resolution of the Quinta
// Comisión Nacional para la Participación de los Trabajadores en las Utilidades de las Empresas
// (DOF 03-02-2009) read on 2026-11-16:
// - the resolution, PRIMERO: 10% of the renta gravable (LFT arts. 117 and 120);
// - LFT art. 123: half of it by the days each worker worked in the year, regardless of the salary;
//   the other half in proportion to the salaries earned in the year (art. 124: the cuota diaria,
//   without bonuses, the benefits of art. 84 or overtime);
// - LFT art. 127 fr. VIII: at most three months of salary or the average of the participación of
//   the last three years, whichever favours the worker;
// - LFT art. 127 fr. VII: an eventual worker shares from 60 days worked in the year;
// - LISR art. 93 fr. XIV: free of ISR up to 15 days of minimum wage, 15 UMA since 2016:
//   15 × 117.31 = 1,759.65.
// Every figure below was worked by hand with exact fractions, rounded half up once.

/** $12,000 a month all year, in a company with a renta gravable of $2,000,000. */
const BASE: PtuInput = {
  wageCents: 1_200_000,
  period: 'month',
  days: 365,
  company: {
    base: 'profit',
    amountCents: 200_000_000,
    totalDays: 7300,
    totalSalaryCents: 365_000_000,
  },
  pastCents: [0, 0, 0],
};

describe('the legal figures', () => {
  it('holds the percentage, the cap, the 60 days and the exemption of the law', () => {
    expect(PTU_PERCENT).toBe(10);
    expect(PTU_CAP_DAYS).toBe(90);
    expect(EVENTUAL_MIN_DAYS).toBe(60);
    expect(PTU_EXEMPT_CENTS).toBe(175965);
    expect(PTU_MAX_CENTS).toBe(10_000_000_000_000);
  });
});

describe('ptuOf', () => {
  it('splits 10% of the renta gravable by days and by salaries', () => {
    const result = ptuOf(BASE);
    // 12,000 / 30 = 400.00 a day; 400 × 365 = 146,000.00 earned in the year
    expect(result.dailyCents).toBe(40000);
    expect(result.salaryCents).toBe(14_600_000);
    const company = result.company;
    // 10% of 2,000,000 = 200,000.00, half of it 100,000.00
    expect(company?.poolCents).toBe(20_000_000);
    expect(company?.halfCents).toBe(10_000_000);
    // 100,000 × 365 / 7,300 = 5,000.00; 100,000 × 146,000 / 3,650,000 = 4,000.00
    expect(company?.daysShareCents).toBe(500_000);
    expect(company?.salaryShareCents).toBe(400_000);
    expect(company?.beforeCapCents).toBe(900_000);
    // under the cap of 90 × 400 = 36,000.00
    expect(result.capMonthsCents).toBe(3_600_000);
    expect(result.capAverageCents).toBe(0);
    expect(result.capCents).toBe(3_600_000);
    expect(result.capBy).toBe('months');
    expect(result.capped).toBe(false);
    expect(result.ptuCents).toBe(900_000);
    // free of ISR 1,759.65; 9,000 − 1,759.65 = 7,240.35
    expect(result.exemptCents).toBe(175_965);
    expect(result.taxableCents).toBe(724_035);
    expect(result.underEventualDays).toBe(false);
  });

  it('caps a large share at three months of salary', () => {
    // 315.04 a day all year; 10% of 5,000,000 = 500,000.00 among 1,825 days and 1,000,000.00
    const input: PtuInput = {
      wageCents: 31504,
      period: 'day',
      days: 365,
      company: {
        base: 'profit',
        amountCents: 500_000_000,
        totalDays: 1825,
        totalSalaryCents: 100_000_000,
      },
      pastCents: [2_000_000, 2_500_000, 3_000_000],
    };
    const result = ptuOf(input);
    // 315.04 × 365 = 114,989.60; 250,000 × 365 / 1,825 = 50,000.00;
    // 250,000 × 114,989.60 / 1,000,000 = 28,747.40; 78,747.40 in all
    expect(result.salaryCents).toBe(11_498_960);
    expect(result.company?.daysShareCents).toBe(5_000_000);
    expect(result.company?.salaryShareCents).toBe(2_874_740);
    expect(result.company?.beforeCapCents).toBe(7_874_740);
    // 90 × 315.04 = 28,353.60 beats the average of 20,000, 25,000 and 30,000 (25,000.00)
    expect(result.capMonthsCents).toBe(2_835_360);
    expect(result.capAverageCents).toBe(2_500_000);
    expect(result.capBy).toBe('months');
    expect(result.capped).toBe(true);
    expect(result.ptuCents).toBe(2_835_360);
    expect(result.taxableCents).toBe(2_659_395);
    // with 30,000, 32,000 and 34,000 the average, 32,000.00, favours the worker
    const average = ptuOf({ ...input, pastCents: [3_000_000, 3_200_000, 3_400_000] });
    expect(average.capAverageCents).toBe(3_200_000);
    expect(average.capCents).toBe(3_200_000);
    expect(average.capBy).toBe('average');
    expect(average.ptuCents).toBe(3_200_000);
    expect(average.taxableCents).toBe(3_024_035);
  });

  it('takes the amount to share as given, and rounds each half once', () => {
    // $9,876.54 a month for 200 days; $123,456.78 among 4,321 days and $2,345,678.90
    const result = ptuOf({
      wageCents: 987_654,
      period: 'month',
      days: 200,
      company: {
        base: 'amount',
        amountCents: 12_345_678,
        totalDays: 4321,
        totalSalaryCents: 234_567_890,
      },
      pastCents: [0, 0, 1],
    });
    // 9,876.54 / 30 = 329.218 → 329.22; 9,876.54 × 200 / 30 = 65,843.60
    expect(result.dailyCents).toBe(32922);
    expect(result.salaryCents).toBe(6_584_360);
    expect(result.company?.poolCents).toBe(12_345_678);
    // 123,456.78 / 2 = 61,728.39
    expect(result.company?.halfCents).toBe(6_172_839);
    // 123,456.78 × 200 / 8,642 = 2,857.1298… → 2,857.13
    expect(result.company?.daysShareCents).toBe(285_713);
    // 123,456.78 × 65,843.60 / 4,691,357.80 = 1,732.7307… → 1,732.73
    expect(result.company?.salaryShareCents).toBe(173_273);
    expect(result.ptuCents).toBe(458_986);
    // 9,876.54 × 3 = 29,629.62; 0.01 / 3 rounds to 0
    expect(result.capMonthsCents).toBe(2_962_962);
    expect(result.capAverageCents).toBe(0);
    expect(result.taxableCents).toBe(283_021);
  });

  it('flags an eventual worker under 60 days and leaves the exemption whole under it', () => {
    const result = ptuOf({ ...BASE, days: 45 });
    // 100,000 × 45 / 7,300 = 616.438… → 616.44; 400 × 45 = 18,000;
    // 100,000 × 18,000 / 3,650,000 = 493.150… → 493.15
    expect(result.underEventualDays).toBe(true);
    expect(result.company?.daysShareCents).toBe(61_644);
    expect(result.company?.salaryShareCents).toBe(49_315);
    expect(result.ptuCents).toBe(110_959);
    expect(result.exemptCents).toBe(110_959);
    expect(result.taxableCents).toBe(0);
    expect(ptuOf({ ...BASE, days: 60 }).underEventualDays).toBe(false);
  });

  it('estimates with the cap alone when the company figures are unknown', () => {
    const result = ptuOf({ ...BASE, company: null });
    expect(result.company).toBeNull();
    expect(result.capped).toBe(false);
    // 90 × 400 = 36,000.00, the most it can be; 36,000 − 1,759.65 = 34,240.35
    expect(result.ptuCents).toBe(3_600_000);
    expect(result.taxableCents).toBe(3_424_035);
    const average = ptuOf({ ...BASE, company: null, pastCents: [4_000_000, 4_000_000, 4_100_000] });
    // (40,000 + 40,000 + 41,000) / 3 = 40,333.33
    expect(average.capBy).toBe('average');
    expect(average.ptuCents).toBe(4_033_333);
  });

  it('refuses figures that cannot be: more days or salary than the whole company', () => {
    const company = BASE.company;
    if (company === null) throw new Error('BASE has a company');
    expect(() => ptuOf({ ...BASE, company: { ...company, totalDays: 364 } })).toThrow(RangeError);
    expect(() => ptuOf({ ...BASE, company: { ...company, totalSalaryCents: 14_599_999 } })).toThrow(
      RangeError,
    );
    expect(() => ptuOf({ ...BASE, days: 367 })).toThrow(RangeError);
  });

  it('keeps every centavo of a company of a hundred billion pesos', () => {
    // 10% of 100,000,000,000 = 10,000,000,000.00; half among 36,500,000 days: 365 days get
    // 50,000,000.00; capped at 36,000.00
    const result = ptuOf({
      ...BASE,
      company: {
        base: 'profit',
        amountCents: PTU_MAX_CENTS,
        totalDays: 36_500_000,
        totalSalaryCents: PTU_MAX_CENTS,
      },
    });
    expect(result.company?.poolCents).toBe(1_000_000_000_000);
    expect(result.company?.daysShareCents).toBe(5_000_000);
    // 5,000,000,000 × 146,000 / 100,000,000,000 = 7,300.00
    expect(result.company?.salaryShareCents).toBe(730_000);
    expect(result.ptuCents).toBe(3_600_000);
  });
});
