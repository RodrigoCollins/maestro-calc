import { describe, expect, it } from 'vitest';
import { UMA_2026 } from '../mexico/mexico.ts';
import {
  IMSS_WORKER_QUOTAS,
  ISR_TARIFFS_2026,
  isrOf,
  netPayOf,
  PERIOD_DAYS,
  SBC_CAP_CENTS,
  SBC_EXCESS_FLOOR_CENTS,
  SUBSIDY_2026,
  subsidyFor,
  type PayPeriod,
  type TariffRow,
} from './salary.ts';

// The figures below are worked by hand from the official publications, read 2026-11-15:
// - Anexo 8 de la Resolución Miscelánea Fiscal para 2026, DOF 28-12-2025, section B: the
//   withholding tariffs of LISR art. 96 for 7, 15 days and the month.
// - Decreto por el que se modifica el diverso que otorga el subsidio para el empleo, DOF
//   31-12-2025: 15.02% of the monthly UMA for monthly income up to $11,492.66, the share of
//   30.4 days for shorter periods, never paid in cash beyond the ISR (decree of DOF 01-05-2024).
// - INEGI, DOF 09-01-2026: monthly UMA $3,566.22 from 1 February 2026.
// - Ley del Seguro Social (Cámara de Diputados text, last reform DOF 15-01-2026): worker shares
//   0.40% over 3 UMA (art. 106 II with the 19th transitory: 2% − 10 × 0.16), 0.25% (art. 107),
//   0.375% (art. 25), 0.625% (art. 147), 1.125% (art. 168 II b); cap 25 UMA (art. 28); the
//   employer pays the worker share at the minimum wage (art. 36).
// - LISR art. 96: no withholding for whoever earns only the minimum wage.

/** The daily tariff of Anexo 8 B.I (work done, not days): the 7 and 15 day tables are it × days. */
const DAILY: readonly (readonly [number, number | null, number])[] = [
  [1, 2778, 0],
  [2779, 23581, 53],
  [23582, 41441, 1385],
  [41442, 48173, 3328],
  [48174, 57676, 4405],
  [57677, 116325, 6108],
  [116326, 183344, 18635],
  [183345, 350035, 34398],
  [350036, 466713, 84405],
  [466714, 1400138, 121742],
  [1400139, null, 439107],
];

const RATES = [192, 640, 1088, 1600, 1792, 2136, 2352, 3000, 3200, 3400, 3500];

describe('the ISR tariffs of Anexo 8, 2026', () => {
  it('holds the monthly tariff as published', () => {
    expect(ISR_TARIFFS_2026.month).toEqual<readonly TariffRow[]>([
      { lowerCents: 1, upperCents: 84459, fixedCents: 0, rateBp: 192 },
      { lowerCents: 84460, upperCents: 716851, fixedCents: 1622, rateBp: 640 },
      { lowerCents: 716852, upperCents: 1259802, fixedCents: 42095, rateBp: 1088 },
      { lowerCents: 1259803, upperCents: 1464464, fixedCents: 101168, rateBp: 1600 },
      { lowerCents: 1464465, upperCents: 1753364, fixedCents: 133914, rateBp: 1792 },
      { lowerCents: 1753365, upperCents: 3536283, fixedCents: 185684, rateBp: 2136 },
      { lowerCents: 3536284, upperCents: 5573668, fixedCents: 566516, rateBp: 2352 },
      { lowerCents: 5573669, upperCents: 10641050, fixedCents: 1045709, rateBp: 3000 },
      { lowerCents: 10641051, upperCents: 14188066, fixedCents: 2565923, rateBp: 3200 },
      { lowerCents: 14188067, upperCents: 42564199, fixedCents: 3700969, rateBp: 3400 },
      { lowerCents: 42564200, upperCents: null, fixedCents: 13348854, rateBp: 3500 },
    ]);
  });

  it.each(['week', 'fortnight', 'month'] as const)(
    'the %s tariff has no gap: each lower limit is a centavo over the upper one before it',
    (period) => {
      const rows = ISR_TARIFFS_2026[period];
      expect(rows[0]?.lowerCents).toBe(1);
      expect(rows.at(-1)?.upperCents).toBeNull();
      rows.slice(1).forEach((row, i) => {
        expect(row.lowerCents).toBe((rows[i]?.upperCents ?? Number.NaN) + 1);
      });
      expect(rows.map((row) => row.rateBp)).toEqual(RATES);
    },
  );

  it('the monthly fixed fees continue the bracket below within a centavo', () => {
    const rows = ISR_TARIFFS_2026.month;
    rows.slice(1).forEach((row, i) => {
      const below = rows[i] as TariffRow;
      const reach =
        below.fixedCents +
        (((below.upperCents as number) - below.lowerCents + 1) * below.rateBp) / 10000;
      expect(Math.abs(reach - row.fixedCents)).toBeLessThanOrEqual(1);
    });
  });

  it.each([
    ['week', 7],
    ['fortnight', 15],
  ] as const)('the %s tariff is the daily one of Anexo 8 times %i days', (period, days) => {
    ISR_TARIFFS_2026[period].forEach((row, i) => {
      const [, upper, fixed] = DAILY[i] as readonly [number, number | null, number];
      expect(row.upperCents).toBe(upper === null ? null : upper * days);
      expect(row.fixedCents).toBe(fixed * days);
    });
  });

  it('counts the days of each period: 7, 15 and the 30 of a month (LFT art. 89)', () => {
    expect(PERIOD_DAYS).toEqual({ week: 7, fortnight: 15, month: 30 });
  });
});

describe('the subsidio para el empleo of 2026', () => {
  it('is 15.02% of the monthly UMA, $535.65, up to $11,492.66 of monthly income', () => {
    // 3,566.22 × 15.02% = 535.646… → 535.65
    expect(SUBSIDY_2026).toEqual({
      percentBp: 1502,
      limitCents: 1149266,
      umaMonthlyCents: 356622,
      published: '2025-12-31',
    });
    expect(SUBSIDY_2026.umaMonthlyCents).toBe(Math.round(UMA_2026.dailyCents * 30.4));
    expect(subsidyFor('month')).toBe(53565);
  });

  it('gives the share of 30.4 days to a week and a fortnight', () => {
    // 535.646… / 30.4 × 7 = 123.339… → 123.34; × 15 = 264.299… → 264.30
    expect(subsidyFor('week')).toBe(12334);
    expect(subsidyFor('fortnight')).toBe(26430);
  });
});

describe('isrOf, the ISR withheld from a salary', () => {
  const month = (grossCents: number) => isrOf({ grossCents, period: 'month', zone: 'general' });

  it('withholds $946.62 from $12,000 a month, over the subsidy limit', () => {
    // 420.95 + (12,000 − 7,168.52) × 10.88% = 420.95 + 525.665… = 946.62
    const isr = month(1_200_000);
    expect(isr).toEqual({
      grossCents: 1_200_000,
      period: 'month',
      row: ISR_TARIFFS_2026.month[2],
      rowIndex: 2,
      excessCents: 483148,
      marginalCents: 52567,
      tariffCents: 94662,
      subsidyEligible: false,
      subsidyCents: 0,
      subsidyAppliedCents: 0,
      withheldCents: 94662,
      minimumWage: false,
    });
  });

  it('withholds $2,383.65 from $20,000 and $6,755.82 from $40,000', () => {
    // 1,856.84 + (20,000 − 17,533.65) × 21.36% = 1,856.84 + 526.812… = 2,383.65
    expect(month(2_000_000).withheldCents).toBe(238365);
    expect(month(2_000_000).rowIndex).toBe(5);
    // 5,665.16 + (40,000 − 35,362.84) × 23.52% = 5,665.16 + 1,090.660… = 6,755.82
    expect(month(4_000_000).withheldCents).toBe(675582);
    expect(month(4_000_000).marginalCents).toBe(109066);
  });

  it('withholds nothing from the general minimum wage (LISR art. 96), though the tariff gives $669.31', () => {
    // 315.04 × 30 = 9,451.20; 420.95 + 2,282.68 × 10.88% = 669.31; − 535.65 would leave 133.66
    const isr = month(945_120);
    expect(isr.tariffCents).toBe(66931);
    expect(isr.subsidyEligible).toBe(true);
    expect(isr.subsidyCents).toBe(53565);
    expect(isr.minimumWage).toBe(true);
    expect(isr.subsidyAppliedCents).toBe(0);
    expect(isr.withheldCents).toBe(0);
  });

  it('withholds from a centavo over the minimum wage, net of the subsidy', () => {
    const isr = month(945_121);
    expect(isr.minimumWage).toBe(false);
    expect(isr.withheldCents).toBe(isr.tariffCents - 53565);
    expect(isr.withheldCents).toBe(13366);
  });

  it('reads the minimum wage of the border zone, $440.87 a day', () => {
    // 440.87 × 30 = 13,226.10: over the subsidy limit, yet nothing is withheld
    const border = isrOf({ grossCents: 1_322_610, period: 'month', zone: 'border' });
    expect(border.minimumWage).toBe(true);
    expect(border.withheldCents).toBe(0);
    expect(isrOf({ grossCents: 1_322_611, period: 'month', zone: 'border' }).minimumWage).toBe(
      false,
    );
    expect(isrOf({ grossCents: 1_322_610, period: 'month', zone: 'general' }).minimumWage).toBe(
      false,
    );
  });

  it('drops the whole subsidy a centavo over $11,492.66', () => {
    // 420.95 + 4,324.14 × 10.88% = 891.416… → 891.42; − 535.65 = 355.77
    const at = month(1_149_266);
    expect(at.subsidyEligible).toBe(true);
    expect(at.subsidyAppliedCents).toBe(53565);
    expect(at.withheldCents).toBe(35577);
    const over = month(1_149_267);
    expect(over.subsidyEligible).toBe(false);
    expect(over.tariffCents).toBe(89142);
    expect(over.withheldCents).toBe(89142);
  });

  it('never pays out the subsidy beyond the ISR', () => {
    // part time, $5,000: 16.22 + 4,155.40 × 6.40% = 282.17 < 535.65 (daily 166.67 under the minimum)
    const low = isrOf({ grossCents: 500_000, period: 'month', zone: 'general' });
    expect(low.tariffCents).toBe(28217);
    expect(low.minimumWage).toBe(true);
    expect(low.withheldCents).toBe(0);
  });

  it('lets the subsidy cover the ISR up to where they meet, with no negative withholding', () => {
    // a weekly salary under the general minimum × 7 is minimum wage; the week of $2,206 is not:
    // 96.95 + 555.32 × 10.88% = 157.37; − 123.34 = 34.03
    const week = isrOf({ grossCents: 220_600, period: 'week', zone: 'general' });
    expect(week.minimumWage).toBe(false);
    expect(week.withheldCents).toBe(3403);
  });

  it('switches brackets at the published limits', () => {
    // 7,168.51: 16.22 + 6,323.91 × 6.40% = 420.95; 7,168.52: the fixed fee 420.95 alone
    const top = isrOf({ grossCents: 716_851, period: 'month', zone: 'border' });
    expect(top.rowIndex).toBe(1);
    expect(top.tariffCents).toBe(42095);
    const next = isrOf({ grossCents: 716_852, period: 'month', zone: 'border' });
    expect(next.rowIndex).toBe(2);
    expect(next.excessCents).toBe(0);
    expect(next.tariffCents).toBe(42095);
    expect(isrOf({ grossCents: 1, period: 'month', zone: 'border' }).rowIndex).toBe(0);
    // the open top bracket: 133,488.54 + (500,000 − 425,642) × 35% = 159,513.84
    const high = isrOf({ grossCents: 50_000_000, period: 'month', zone: 'general' });
    expect(high.rowIndex).toBe(10);
    expect(high.withheldCents).toBe(15951384);
  });

  it('rounds the tariff half up once', () => {
    // 844.68: 16.22 + 0.08 × 6.40% = 16.22 + 0.00512 = 16.22512 → 16.23 (the half centavo up)
    expect(isrOf({ grossCents: 84_468, period: 'month', zone: 'border' }).tariffCents).toBe(1623);
    // 7,168.60: 420.95 + 0.08 × 10.88% = 420.958704 → 420.96
    expect(isrOf({ grossCents: 716_860, period: 'month', zone: 'border' }).tariffCents).toBe(42096);
    // 7,168.56: 420.95 + 0.04 × 10.88% = 420.954352 → 420.95
    expect(isrOf({ grossCents: 716_856, period: 'month', zone: 'border' }).tariffCents).toBe(42095);
  });

  it('withholds a week and a fortnight with their own tariff and subsidy', () => {
    // week $2,500: 96.95 + 849.32 × 10.88% = 189.36; × 30.4 / 7 = 10,857 ≤ 11,492.66: − 123.34
    const week = isrOf({ grossCents: 250_000, period: 'week', zone: 'general' });
    expect(week.tariffCents).toBe(18936);
    expect(week.subsidyCents).toBe(12334);
    expect(week.withheldCents).toBe(6602);
    // fortnight $5,000: 207.75 + 1,462.84 × 10.88% = 366.91; 10,133.33 a month: − 264.30
    const fortnight = isrOf({ grossCents: 500_000, period: 'fortnight', zone: 'general' });
    expect(fortnight.tariffCents).toBe(36691);
    expect(fortnight.withheldCents).toBe(10261);
    // fortnight $6,000: 475.71, and 12,160 a month is over the limit
    const more = isrOf({ grossCents: 600_000, period: 'fortnight', zone: 'general' });
    expect(more.subsidyEligible).toBe(false);
    expect(more.withheldCents).toBe(47571);
  });

  it('takes the subsidy limit of a short period as its share of 30.4 days', () => {
    // week: 11,492.66 × 7 / 30.4 = 2,646.33…; 2,646.33 is in, 2,646.34 is out
    const isWeekIn = (cents: number): boolean =>
      isrOf({ grossCents: cents, period: 'week', zone: 'general' }).subsidyEligible;
    expect(isWeekIn(264_633)).toBe(true);
    expect(isWeekIn(264_634)).toBe(false);
  });

  it.each(['week', 'fortnight', 'month'] as const satisfies readonly PayPeriod[])(
    'treats %s salaries up to the minimum wage of the period as minimum wage',
    (period) => {
      const days = PERIOD_DAYS[period];
      expect(isrOf({ grossCents: 31_504 * days, period, zone: 'general' }).minimumWage).toBe(true);
      expect(isrOf({ grossCents: 31_504 * days + 1, period, zone: 'general' }).minimumWage).toBe(
        false,
      );
    },
  );
});

describe('the IMSS worker quotas', () => {
  it('lists the five worker shares of the LSS, in thousandths of a percent', () => {
    expect(IMSS_WORKER_QUOTAS).toEqual([
      { key: 'excedente', rate: 400, overThreeUma: true },
      { key: 'dinero', rate: 250, overThreeUma: false },
      { key: 'pensionados', rate: 375, overThreeUma: false },
      { key: 'invalidez', rate: 625, overThreeUma: false },
      { key: 'cesantia', rate: 1125, overThreeUma: false },
    ]);
    // 3 UMA = 351.93; 25 UMA = 2,932.75
    expect(SBC_EXCESS_FLOOR_CENTS).toBe(35193);
    expect(SBC_CAP_CENTS).toBe(293275);
  });
});

describe('netPayOf, the take-home pay of a month', () => {
  it('nets $10,746.18 from $12,000 in the first year', () => {
    // SBC 400 × (365 + 15 + 12 × 25%) / 365 = 419.726… → 419.73; over 3 UMA: 67.80
    // 67.80 × 30 × 0.40% = 8.14; 419.73 × 30 × 0.25% = 31.48, 0.375% = 47.22, 0.625% = 78.70,
    // 1.125% = 141.66: 307.20 in all; 12,000 − 946.62 − 307.20 = 10,746.18
    const net = netPayOf({ monthlyCents: 1_200_000, years: 1, zone: 'general' });
    expect(net.dailyCents).toBe(40000);
    expect(net.vacationDays).toBe(12);
    expect(net.sbcCents).toBe(41973);
    expect(net.capped).toBe(false);
    expect(net.quotas).toEqual({
      excedente: 814,
      dinero: 3148,
      pensionados: 4722,
      invalidez: 7870,
      cesantia: 14166,
    });
    expect(net.imssCents).toBe(30720);
    expect(net.isr.withheldCents).toBe(94662);
    expect(net.netCents).toBe(1_074_618);
    expect(net.minimumWage).toBe(false);
  });

  it('nets $17,076.22 from $20,000 and $32,121.67 from $40,000', () => {
    // 20,000: SBC 699.54, quotas 41.71 + 52.47 + 78.70 + 131.16 + 236.09 = 540.13
    const twenty = netPayOf({ monthlyCents: 2_000_000, years: 1, zone: 'general' });
    expect(twenty.sbcCents).toBe(69954);
    expect(twenty.quotas).toEqual({
      excedente: 4171,
      dinero: 5247,
      pensionados: 7870,
      invalidez: 13116,
      cesantia: 23609,
    });
    expect(twenty.imssCents).toBe(54013);
    expect(twenty.netCents).toBe(1_707_622);
    // 40,000: SBC 1,399.09, quotas 125.66 + 104.93 + 157.40 + 262.33 + 472.19 = 1,122.51
    const forty = netPayOf({ monthlyCents: 4_000_000, years: 1, zone: 'general' });
    expect(forty.sbcCents).toBe(139909);
    expect(forty.imssCents).toBe(112251);
    expect(forty.netCents).toBe(3_212_167);
  });

  it('keeps the whole minimum wage: no ISR (LISR art. 96) and the employer pays the quotas (LSS art. 36)', () => {
    const net = netPayOf({ monthlyCents: 945_120, years: 1, zone: 'general' });
    expect(net.minimumWage).toBe(true);
    expect(net.sbcCents).toBe(33058);
    expect(net.imssCents).toBe(0);
    expect(Object.values(net.quotas)).toEqual([0, 0, 0, 0, 0]);
    expect(net.netCents).toBe(945_120);
  });

  it('charges nothing over 3 UMA under it', () => {
    // 9,451.21 is over the minimum: SBC 330.58 < 351.93, so the 0.40% line is 0
    const net = netPayOf({ monthlyCents: 945_121, years: 1, zone: 'general' });
    expect(net.minimumWage).toBe(false);
    expect(net.quotas.excedente).toBe(0);
    expect(net.quotas.cesantia).toBe(11157);
  });

  it('integrates more vacation days with the years of service', () => {
    // 11 years: 24 days; 20,000 / 30 × (365 + 15 + 6) / 365 = 705.022… → 705.02
    const net = netPayOf({ monthlyCents: 2_000_000, years: 11, zone: 'general' });
    expect(net.vacationDays).toBe(24);
    expect(net.sbcCents).toBe(70502);
    expect(net.imssCents).toBe(54469);
    // before the first year the integration uses the 12 days it will give
    expect(netPayOf({ monthlyCents: 2_000_000, years: 0, zone: 'general' }).sbcCents).toBe(69954);
  });

  it('caps the SBC at 25 UMA', () => {
    // 100,000: 3,497.72 a day integrated, capped at 2,932.75
    const net = netPayOf({ monthlyCents: 10_000_000, years: 1, zone: 'general' });
    expect(net.capped).toBe(true);
    expect(net.sbcCents).toBe(293275);
    expect(net.imssCents).toBe(239928);
    expect(net.netCents).toBe(7_386_464);
  });
});
