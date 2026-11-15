import { describe, expect, it } from 'vitest';
import type { CivilDate } from '../calendar/calendar.ts';
import {
  ANTIGUEDAD_DAYS_PER_YEAR,
  ANTIGUEDAD_VOLUNTARY_YEARS,
  DOMINICAL_MIN_PERCENT,
  EXTRA_DOUBLE_WEEKLY_HOURS,
  horasExtrasOf,
  JORNADA_HOURS,
  primaAntiguedadOf,
  primaDominicalOf,
  SBC_CAP_CENTS,
  sdiOf,
  SDI_TABLE,
} from './labor.ts';

const date = (y: number, m: number, d: number): CivilDate => ({ y, m, d });

// The rules, as the Ley Federal del Trabajo (Cámara de Diputados text, last reform DOF
// 21-02-2025) and the Ley del Seguro Social (last reform DOF 07-06-2024) read on 2026-11-15:
// - LFT art. 71: a prima of 25% at least over the salary of an ordinary day for working on Sunday.
// - LFT arts. 61, 66, 67, 68: a day of 8, 7 or 7.5 hours; overtime paid with 100% more, and the
//   hours over nine a week with 200% more.
// - LFT arts. 162, 485, 486: 12 days of salary for each year of service, the salary no lower than
//   the minimum wage and no higher than twice it; voluntary separation from 15 years.
// - LSS arts. 27 and 28: the salary integrated with the prestaciones, up to 25 times the minimum
//   wage, read as 25 UMA since the desindexation of 2016.
describe('the legal figures', () => {
  it('holds the floors and limits of the law', () => {
    expect(DOMINICAL_MIN_PERCENT).toBe(25);
    expect(EXTRA_DOUBLE_WEEKLY_HOURS).toBe(9);
    expect(JORNADA_HOURS).toEqual({ diurna: 8, nocturna: 7, mixta: 7.5 });
    expect(ANTIGUEDAD_DAYS_PER_YEAR).toBe(12);
    expect(ANTIGUEDAD_VOLUNTARY_YEARS).toBe(15);
    // 25 × 117.31 = 2,932.75
    expect(SBC_CAP_CENTS).toBe(293275);
  });
});

describe('primaDominicalOf', () => {
  it('pays 25% of a day of the 2026 minimum wage for one Sunday: $78.76', () => {
    // 315.04 × 25% = 78.76
    expect(primaDominicalOf({ wageCents: 31504, period: 'day', percent: 25, sundays: 1 })).toEqual({
      dailyCents: 31504,
      primaCents: 7876,
      totalCents: 7876,
      belowMinimum: false,
    });
  });

  it('divides a monthly salary by 30 and counts each Sunday worked', () => {
    // 12,000 / 30 = 400.00; × 25% = 100.00; four Sundays: 400.00
    expect(
      primaDominicalOf({ wageCents: 1200000, period: 'month', percent: 25, sundays: 4 }),
    ).toEqual({ dailyCents: 40000, primaCents: 10000, totalCents: 40000, belowMinimum: false });
  });

  it('rounds once at the end, and flags a prima under the 25% of the law', () => {
    // 10,000 / 30 × 20% = 66.666… → 66.67; three Sundays: 200.00 exactly
    const result = primaDominicalOf({
      wageCents: 1000000,
      period: 'month',
      percent: 20,
      sundays: 3,
    });
    expect(result.primaCents).toBe(6667);
    expect(result.totalCents).toBe(20000);
    expect(result.belowMinimum).toBe(true);
    expect(
      primaDominicalOf({ wageCents: 31504, period: 'day', percent: 24, sundays: 1 }).belowMinimum,
    ).toBe(true);
    expect(
      primaDominicalOf({ wageCents: 31504, period: 'day', percent: 26, sundays: 1 }).belowMinimum,
    ).toBe(false);
  });
});

describe('horasExtrasOf', () => {
  it('pays 12 extra hours of an 8-hour day at the minimum wage: 9 double, 3 triple', () => {
    // 315.04 / 8 = 39.38 an hour; 9 × 78.76 = 708.84; 3 × 118.14 = 354.42; total 1,063.26
    expect(
      horasExtrasOf({ wageCents: 31504, period: 'day', jornada: 'diurna', hours: 12 }),
    ).toEqual({
      dailyCents: 31504,
      hourCents: 3938,
      doubleHours: 9,
      tripleHours: 3,
      doubleCents: 70884,
      tripleCents: 35442,
      totalCents: 106326,
      overLimit: true,
    });
  });

  it('pays up to nine hours double and none triple, within the limit', () => {
    // 12,000 / 30 / 8 = 50.00 an hour; 9 × 100.00 = 900.00
    const result = horasExtrasOf({
      wageCents: 1200000,
      period: 'month',
      jornada: 'diurna',
      hours: 9,
    });
    expect(result.hourCents).toBe(5000);
    expect(result.doubleHours).toBe(9);
    expect(result.tripleHours).toBe(0);
    expect(result.doubleCents).toBe(90000);
    expect(result.tripleCents).toBe(0);
    expect(result.totalCents).toBe(90000);
    expect(result.overLimit).toBe(false);
  });

  it('divides by 7 hours at night and 7.5 on a mixed day, rounding once', () => {
    // 315.04 × 2 × 9 / 7 = 810.1028… → 810.10; the hour 315.04 / 7 = 45.0057… → 45.01
    const night = horasExtrasOf({ wageCents: 31504, period: 'day', jornada: 'nocturna', hours: 9 });
    expect(night.hourCents).toBe(4501);
    expect(night.totalCents).toBe(81010);
    // 315.04 / 7.5 = 42.0053… → 42.01; 4 hours double: 315.04 × 2 × 4 / 7.5 = 336.0426… → 336.04
    const mixed = horasExtrasOf({ wageCents: 31504, period: 'day', jornada: 'mixta', hours: 4 });
    expect(mixed.hourCents).toBe(4201);
    expect(mixed.totalCents).toBe(33604);
  });

  it('reads half hours: 10.5 hours of $500 a day, 1.5 of them triple', () => {
    // 500 / 8 = 62.50; 9 × 125.00 = 1,125.00; 1.5 × 187.50 = 281.25; total 1,406.25
    const result = horasExtrasOf({
      wageCents: 50000,
      period: 'day',
      jornada: 'diurna',
      hours: 10.5,
    });
    expect(result.doubleHours).toBe(9);
    expect(result.tripleHours).toBe(1.5);
    expect(result.tripleCents).toBe(28125);
    expect(result.totalCents).toBe(140625);
  });

  it('pays nothing for no extra hours', () => {
    const result = horasExtrasOf({ wageCents: 31504, period: 'day', jornada: 'diurna', hours: 0 });
    expect(result.totalCents).toBe(0);
    expect(result.overLimit).toBe(false);
  });
});

describe('primaAntiguedadOf', () => {
  const minimum = { wageCents: 31504, period: 'day' as const, zone: 'general' as const };

  it('pays 15 whole years on leaving voluntarily: 180 days of $315.04, $56,707.20', () => {
    // 1 January 2011 to 31 December 2025, both counted: 15 years; 12 × 15 = 180 days;
    // 315.04 × 180 = 56,707.20
    const result = primaAntiguedadOf({
      ...minimum,
      start: date(2011, 1, 1),
      end: date(2025, 12, 31),
      reason: 'voluntary',
    });
    expect(result).toEqual({
      dailyCents: 31504,
      baseCents: 31504,
      capCents: 63008,
      capped: false,
      floored: false,
      years: 15,
      extraDays: 0,
      yearDays: 365,
      earnedHundredths: 18000,
      wholeYearsCents: 5670720,
      amountCents: 5670720,
      eligible: true,
    });
  });

  it('pays no prima on leaving voluntarily before 15 years', () => {
    const result = primaAntiguedadOf({
      ...minimum,
      start: date(2016, 3, 1),
      end: date(2026, 2, 28),
      reason: 'voluntary',
    });
    expect(result.years).toBe(10);
    expect(result.eligible).toBe(false);
    // what it would be: 315.04 × 120 = 37,804.80, shown but not owed
    expect(result.amountCents).toBe(3780480);
  });

  it('pays on a dismissal at any seniority, with the share of the year begun', () => {
    // $20,000 a month: 666.67 a day, over twice the minimum (630.08), so 630.08;
    // 1 January 2022 to 30 June 2026: 4 years and 181 days of a 365-day year;
    // 630.08 × 12 × (4 × 365 + 181) / 365 = 7,560.96 × 1,641 / 365 = 33,993.2487… → 33,993.25
    const result = primaAntiguedadOf({
      wageCents: 2000000,
      period: 'month',
      zone: 'general',
      start: date(2022, 1, 1),
      end: date(2026, 6, 30),
      reason: 'dismissal',
    });
    expect(result.dailyCents).toBe(66667);
    expect(result.baseCents).toBe(63008);
    expect(result.capped).toBe(true);
    expect(result.years).toBe(4);
    expect(result.extraDays).toBe(181);
    expect(result.yearDays).toBe(365);
    // 12 × 1,641 / 365 = 53.95 days
    expect(result.earnedHundredths).toBe(5395);
    // 630.08 × 48 = 30,243.84
    expect(result.wholeYearsCents).toBe(3024384);
    expect(result.amountCents).toBe(3399325);
    expect(result.eligible).toBe(true);
  });

  it('caps at twice the border minimum wage in the northern border zone', () => {
    // 2 × 440.87 = 881.74; $1,000 a day is over it; 1 year: 881.74 × 12 = 10,580.88
    const result = primaAntiguedadOf({
      wageCents: 100000,
      period: 'day',
      zone: 'border',
      start: date(2025, 7, 1),
      end: date(2026, 6, 30),
      reason: 'justified',
    });
    expect(result.capCents).toBe(88174);
    expect(result.baseCents).toBe(88174);
    expect(result.amountCents).toBe(1058088);
    expect(result.eligible).toBe(true);
  });

  it('raises a salary under the minimum to it (art. 485), and pays on death at any seniority', () => {
    // 200.00 a day is under 315.04; 1 March 2026 to 31 August 2026: 184 days;
    // 315.04 × 12 × 184 / 365 = 1,905.78…
    const result = primaAntiguedadOf({
      wageCents: 20000,
      period: 'day',
      zone: 'general',
      start: date(2026, 3, 1),
      end: date(2026, 8, 31),
      reason: 'death',
    });
    expect(result.floored).toBe(true);
    expect(result.baseCents).toBe(31504);
    expect(result.years).toBe(0);
    expect(result.extraDays).toBe(184);
    expect(result.wholeYearsCents).toBe(0);
    expect(result.amountCents).toBe(190578);
    expect(result.eligible).toBe(true);
  });

  it('counts the share over a year of 366 days when the year of service holds 29 February', () => {
    // 1 March 2023 to 29 February 2024 is one whole year of 366 days; to 31 March 2024: 1 year
    // and 31 days of the year from 1 March 2024 (365 days)
    const whole = primaAntiguedadOf({
      ...minimum,
      start: date(2023, 3, 1),
      end: date(2024, 2, 29),
      reason: 'dismissal',
    });
    expect(whole.years).toBe(1);
    expect(whole.extraDays).toBe(0);
    const before = primaAntiguedadOf({
      ...minimum,
      start: date(2023, 3, 1),
      end: date(2024, 2, 28),
      reason: 'dismissal',
    });
    expect(before.years).toBe(0);
    expect(before.extraDays).toBe(365);
    expect(before.yearDays).toBe(366);
  });

  it('refuses an end before the start', () => {
    expect(() =>
      primaAntiguedadOf({
        ...minimum,
        start: date(2026, 2, 1),
        end: date(2026, 1, 31),
        reason: 'death',
      }),
    ).toThrow(RangeError);
    // one day of service is fine
    expect(
      primaAntiguedadOf({
        ...minimum,
        start: date(2026, 2, 1),
        end: date(2026, 2, 1),
        reason: 'death',
      }).extraDays,
    ).toBe(1);
  });
});

describe('sdiOf', () => {
  const base = { aguinaldoDays: 15, primaPercent: 25 };

  it('integrates the minimum wage in the first year: factor 1.0493, $330.58', () => {
    // (365 + 15 + 12 × 25%) / 365 = 383 / 365 = 1.049315…; 315.04 × 383 / 365 = 330.5765… → 330.58
    const result = sdiOf({
      ...base,
      wageCents: 31504,
      period: 'day',
      start: date(2026, 3, 1),
      on: date(2026, 11, 15),
    });
    expect(result).toEqual({
      dailyCents: 31504,
      serviceYear: 1,
      vacationDays: 12,
      factorTenThousandths: 10493,
      aguinaldoDailyCents: 1295,
      primaDailyCents: 259,
      sdiCents: 33058,
      sbcCents: 33058,
      capped: false,
    });
  });

  it('takes the vacation days of the year of service under way: the sixth, 22 days', () => {
    // 5 whole years: the sixth year, 22 days; (365 + 15 + 5.5) / 365 = 1.056164… → 1.0562
    const result = sdiOf({
      ...base,
      wageCents: 31504,
      period: 'day',
      start: date(2021, 1, 15),
      on: date(2026, 12, 31),
    });
    expect(result.serviceYear).toBe(6);
    expect(result.vacationDays).toBe(22);
    expect(result.factorTenThousandths).toBe(10562);
    // 315.04 × 385.5 / 365 = 332.7339… → 332.73
    expect(result.sdiCents).toBe(33273);
  });

  it('divides a monthly salary by 30 and rounds once', () => {
    // 3 whole years: the fourth, 18 days; 20,000 / 30 × (365 + 15 + 4.5) / 365 = 702.2831… → 702.28
    const result = sdiOf({
      ...base,
      wageCents: 2000000,
      period: 'month',
      start: date(2023, 1, 1),
      on: date(2026, 6, 30),
    });
    expect(result.dailyCents).toBe(66667);
    expect(result.vacationDays).toBe(18);
    expect(result.sdiCents).toBe(70228);
    // 20,000 / 30 × 15 / 365 = 27.397… → 27.40; × 18 × 25% / 365 = 8.219… → 8.22
    expect(result.aguinaldoDailyCents).toBe(2740);
    expect(result.primaDailyCents).toBe(822);
  });

  it('caps the IMSS base at 25 UMA, $2,932.75', () => {
    // 100,000 / 30 × 383 / 365 = 3,497.7168… over 2,932.75
    const result = sdiOf({
      ...base,
      wageCents: 10000000,
      period: 'month',
      start: date(2026, 1, 1),
      on: date(2026, 6, 1),
    });
    expect(result.sdiCents).toBe(349772);
    expect(result.sbcCents).toBe(293275);
    expect(result.capped).toBe(true);
  });

  it('takes the aguinaldo and the prima of the contract when they are more', () => {
    // 30 days of aguinaldo, 50% prima, first year: (365 + 30 + 6) / 365 = 1.098630… → 1.0986
    const result = sdiOf({
      aguinaldoDays: 30,
      primaPercent: 50,
      wageCents: 50000,
      period: 'day',
      start: date(2026, 1, 1),
      on: date(2026, 1, 1),
    });
    expect(result.factorTenThousandths).toBe(10986);
    // 500 × 401 / 365 = 549.3150… → 549.32
    expect(result.sdiCents).toBe(54932);
  });

  it('refuses a count before the start', () => {
    expect(() =>
      sdiOf({
        ...base,
        wageCents: 31504,
        period: 'day',
        start: date(2026, 2, 1),
        on: date(2026, 1, 1),
      }),
    ).toThrow(RangeError);
  });
});

describe('SDI_TABLE', () => {
  it('gives the factor of each span of years of service at the minimum prestaciones', () => {
    expect(
      SDI_TABLE.map(({ from, to, days, factorTenThousandths }) => [
        from,
        to,
        days,
        factorTenThousandths,
      ]),
    ).toEqual([
      [1, 1, 12, 10493],
      [2, 2, 14, 10507],
      [3, 3, 16, 10521],
      [4, 4, 18, 10534],
      [5, 5, 20, 10548],
      [6, 10, 22, 10562],
      [11, 15, 24, 10575],
      [16, 20, 26, 10589],
      [21, 25, 28, 10603],
      [26, 30, 30, 10616],
      [31, 35, 32, 10630],
    ]);
  });
});
