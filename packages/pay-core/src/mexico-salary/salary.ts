import { MINIMUM_WAGE_2026, UMA_2026, vacationDaysFor } from '../mexico/mexico.ts';

/*
 * The ISR withheld from a salary in Mexico in 2026 and the take-home pay of a month, in whole
 * centavos, each amount rounded half up once:
 * - the withholding tariffs of LISR art. 96 as published in Anexo 8 of the Resolución Miscelánea
 *   Fiscal para 2026 (DOF 28-12-2025), section B, for 7 days, 15 days and the month;
 * - the subsidio para el empleo of the decree of DOF 31-12-2025 (15.02% of the monthly UMA, for
 *   monthly income up to $11,492.66; for shorter periods, its share of 30.4 days), which lowers
 *   the ISR and is never paid beyond it (decree of DOF 01-05-2024, art. Segundo);
 * - no withholding for whoever earns only the minimum wage (LISR art. 96), read here as a daily
 *   salary (the period divided by its days) not over the minimum of the zone;
 * - the worker quotas of the IMSS under the Ley del Seguro Social, on the salario base de
 *   cotización integrated with the legal aguinaldo and prima vacacional, capped at 25 UMA
 *   (art. 28), and paid by the employer at the minimum wage (art. 36).
 * It is valid from 1 February 2026, when the UMA of 2026 came in force.
 */

/** A pay period with its own tariff in Anexo 8. */
export type PayPeriod = 'week' | 'fortnight' | 'month';

/** The minimum wage zone: the general one or the northern border free zone. */
export type WageZone = 'general' | 'border';

/** The days of each period: a month counts 30 for the daily salary (LFT art. 89). */
export const PERIOD_DAYS: Readonly<Record<PayPeriod, number>> = {
  week: 7,
  fortnight: 15,
  month: 30,
};

/** A row of a tariff: limits and fixed fee in centavos, the rate in hundredths of a percent. */
export interface TariffRow {
  readonly lowerCents: number;
  /** `null` in the open top row («En adelante»). */
  readonly upperCents: number | null;
  readonly fixedCents: number;
  readonly rateBp: number;
}

/** A tariff: its first row, then the rest (a tariff is never empty). */
export type Tariff = readonly [TariffRow, ...TariffRow[]];

/** A row of a published table: lower limit and fixed fee in centavos, rate in basis points. */
type Published = readonly [number, number, number];

/** Rows from the lower limits, fixed fees and rates of a published table. */
const tariff = (rows: readonly [Published, ...Published[]]): Tariff => {
  const rowOf = ([lowerCents, fixedCents, rateBp]: Published, i: number): TariffRow => {
    const next = rows[i + 1];
    return {
      lowerCents,
      upperCents: next === undefined ? null : next[0] - 1,
      fixedCents,
      rateBp,
    };
  };
  const [first, ...rest] = rows;
  return [rowOf(first, 0), ...rest.map((each, i) => rowOf(each, i + 1))];
};

/** The tariffs of Anexo 8 B.II (7 days), B.IV (15 days) and B.V (the month), 2026. */
export const ISR_TARIFFS_2026: Readonly<Record<PayPeriod, Tariff>> = {
  week: tariff([
    [1, 0, 192],
    [19447, 371, 640],
    [165068, 9695, 1088],
    [290088, 23296, 1600],
    [337212, 30835, 1792],
    [403733, 42756, 2136],
    [814276, 130445, 2352],
    [1283409, 240786, 3000],
    [2450246, 590835, 3200],
    [3266992, 852194, 3400],
    [9800967, 3073749, 3500],
  ]),
  fortnight: tariff([
    [1, 0, 192],
    [41671, 795, 640],
    [353716, 20775, 1088],
    [621616, 49920, 1600],
    [722596, 66075, 1792],
    [865141, 91620, 2136],
    [1744876, 279525, 2352],
    [2750161, 515970, 3000],
    [5250526, 1266075, 3200],
    [7000696, 1826130, 3400],
    [21002071, 6586605, 3500],
  ]),
  month: tariff([
    [1, 0, 192],
    [84460, 1622, 640],
    [716852, 42095, 1088],
    [1259803, 101168, 1600],
    [1464465, 133914, 1792],
    [1753365, 185684, 2136],
    [3536284, 566516, 2352],
    [5573669, 1045709, 3000],
    [10641051, 2565923, 3200],
    [14188067, 3700969, 3400],
    [42564200, 13348854, 3500],
  ]),
};

/** The subsidio para el empleo of 2026 (DOF 31-12-2025), on the monthly UMA of INEGI. */
export const SUBSIDY_2026 = {
  /** 15.02%, in hundredths of a percent. */
  percentBp: 1502,
  /** The largest monthly income that gets it: $11,492.66. */
  limitCents: 1149266,
  /** The monthly UMA from 1 February 2026: $3,566.22 (DOF 09-01-2026). */
  umaMonthlyCents: 356622,
  published: '2025-12-31',
} as const;

/** `num / den` rounded to the nearest whole, half up; both positive. */
const rounded = (num: number, den: number): number => Math.floor((2 * num + den) / (2 * den));

/** The subsidy of a whole period: the month's, or its share of 30.4 days for a week or fortnight. */
export const subsidyFor = (period: PayPeriod): number => {
  const monthly = SUBSIDY_2026.umaMonthlyCents * SUBSIDY_2026.percentBp;
  return period === 'month'
    ? rounded(monthly, 10000)
    : rounded(monthly * PERIOD_DAYS[period] * 10, 10000 * 304);
};

/** Whether the income of a period, taken to a month of 30.4 days, is within the subsidy limit. */
const subsidyEligible = (grossCents: number, period: PayPeriod): boolean =>
  period === 'month'
    ? grossCents <= SUBSIDY_2026.limitCents
    : grossCents * 304 <= SUBSIDY_2026.limitCents * PERIOD_DAYS[period] * 10;

const minimumOf = (zone: WageZone): number =>
  zone === 'border' ? MINIMUM_WAGE_2026.borderCents : MINIMUM_WAGE_2026.generalCents;

/** A salary whose daily part is not over the minimum wage of the zone. */
const isMinimumWage = (grossCents: number, days: number, zone: WageZone): boolean =>
  grossCents <= minimumOf(zone) * days;

export interface IsrInput {
  readonly grossCents: number;
  readonly period: PayPeriod;
  readonly zone: WageZone;
}

export interface Isr {
  readonly grossCents: number;
  readonly period: PayPeriod;
  /** The bracket of the tariff the salary falls in, and its place from 0. */
  readonly row: TariffRow;
  readonly rowIndex: number;
  /** The salary over the lower limit of its bracket. */
  readonly excessCents: number;
  /** The tax on that excess at the rate of the bracket (the tariff less the fixed fee). */
  readonly marginalCents: number;
  /** The ISR of the tariff: the fixed fee plus the marginal tax. */
  readonly tariffCents: number;
  /** Whether the income is within the subsidy limit. */
  readonly subsidyEligible: boolean;
  /** The subsidy the period gives, 0 when out of the limit. */
  readonly subsidyCents: number;
  /** The part of the subsidy taken off the ISR: never more than the ISR. */
  readonly subsidyAppliedCents: number;
  /** The ISR the employer withholds. */
  readonly withheldCents: number;
  /** A salary of the minimum wage, from which nothing is withheld (LISR art. 96). */
  readonly minimumWage: boolean;
}

/** The ISR withheld from the salary of a period (LISR art. 96, Anexo 8 RMF 2026, the subsidy). */
export const isrOf = ({ grossCents, period, zone }: IsrInput): Isr => {
  // the bracket is the last row whose lower limit the salary reaches (the rows have no gap)
  const rows = ISR_TARIFFS_2026[period];
  let rowIndex = 0;
  let row = rows[0];
  for (const [i, each] of rows.entries()) {
    if (each.lowerCents <= grossCents) {
      rowIndex = i;
      row = each;
    }
  }
  const excessCents = grossCents - row.lowerCents;
  const tariffCents = rounded(row.fixedCents * 10000 + excessCents * row.rateBp, 10000);
  const eligible = subsidyEligible(grossCents, period);
  const subsidyCents = eligible ? subsidyFor(period) : 0;
  const minimumWage = isMinimumWage(grossCents, PERIOD_DAYS[period], zone);
  const subsidyAppliedCents = minimumWage ? 0 : Math.min(subsidyCents, tariffCents);
  return {
    grossCents,
    period,
    row,
    rowIndex,
    excessCents,
    marginalCents: tariffCents - row.fixedCents,
    tariffCents,
    subsidyEligible: eligible,
    subsidyCents,
    subsidyAppliedCents,
    withheldCents: minimumWage ? 0 : tariffCents - subsidyAppliedCents,
    minimumWage,
  };
};

/** The key of a worker quota of the IMSS. */
export type QuotaKey = 'excedente' | 'dinero' | 'pensionados' | 'invalidez' | 'cesantia';

/**
 * The worker shares of the IMSS on the salario base de cotización, in thousandths of a percent:
 * enfermedades y maternidad over 3 UMA (art. 106 II, 2% lowered 0.16 a year from 1998 to 2007 by
 * the 19th transitory: 0.40%), its cash benefits (art. 107, 25% of 1%), the pensioners' medical
 * care (art. 25), invalidez y vida (art. 147) and cesantía en edad avanzada y vejez (art. 168 II b).
 */
export const IMSS_WORKER_RATES: Readonly<Record<QuotaKey, number>> = {
  excedente: 400,
  dinero: 250,
  pensionados: 375,
  invalidez: 625,
  cesantia: 1125,
};

/** Three UMA a day: the SBC over it pays the 0.40% of art. 106 II. */
export const SBC_EXCESS_FLOOR_CENTS = 3 * UMA_2026.dailyCents;
/** The largest SBC, 25 UMA a day (art. 28). */
export const SBC_CAP_CENTS = 25 * UMA_2026.dailyCents;

/** The days of a month the quotas are counted over. */
const QUOTA_DAYS = 30;

export interface NetPayInput {
  readonly monthlyCents: number;
  /** Whole years of service: they set the vacation days integrated in the SBC. */
  readonly years: number;
  readonly zone: WageZone;
}

export interface NetPay {
  readonly monthlyCents: number;
  /** The monthly salary divided by 30. */
  readonly dailyCents: number;
  /** The vacation days of the year of service whose prima is integrated (12 before the first). */
  readonly vacationDays: number;
  /** The salario base de cotización a day, with the aguinaldo of 15 days and a prima of 25%. */
  readonly sbcCents: number;
  /** Whether the SBC was cut down to 25 UMA. */
  readonly capped: boolean;
  readonly quotas: Readonly<Record<QuotaKey, number>>;
  /** The worker quotas of the month, in all. */
  readonly imssCents: number;
  readonly isr: Isr;
  /** The salary less the ISR withheld and the worker quotas. */
  readonly netCents: number;
  /** A minimum wage: no ISR, and the employer pays the worker quotas (LSS art. 36). */
  readonly minimumWage: boolean;
}

/** The take-home pay of a monthly salary of 2026: ISR withheld and the IMSS worker quotas. */
export const netPayOf = ({ monthlyCents, years, zone }: NetPayInput): NetPay => {
  const vacationDays = vacationDaysFor(Math.max(years, 1));
  // (365 + 15 days of aguinaldo + 25% of the vacation days) / 365, in hundredths of a day
  const integrated = rounded(monthlyCents * (38000 + 25 * vacationDays), QUOTA_DAYS * 36500);
  const sbcCents = Math.min(integrated, SBC_CAP_CENTS);
  const isr = isrOf({ grossCents: monthlyCents, period: 'month', zone });
  const minimumWage = isr.minimumWage;
  // at the minimum wage the employer pays the worker quotas too (art. 36)
  const quota = (key: QuotaKey, baseCents: number): number =>
    minimumWage ? 0 : rounded(baseCents * QUOTA_DAYS * IMSS_WORKER_RATES[key], 100000);
  const quotas: Readonly<Record<QuotaKey, number>> = {
    excedente: quota('excedente', Math.max(sbcCents - SBC_EXCESS_FLOOR_CENTS, 0)),
    dinero: quota('dinero', sbcCents),
    pensionados: quota('pensionados', sbcCents),
    invalidez: quota('invalidez', sbcCents),
    cesantia: quota('cesantia', sbcCents),
  };
  const imssCents =
    quotas.excedente + quotas.dinero + quotas.pensionados + quotas.invalidez + quotas.cesantia;
  return {
    monthlyCents,
    dailyCents: rounded(monthlyCents, QUOTA_DAYS),
    vacationDays,
    sbcCents,
    capped: integrated > SBC_CAP_CENTS,
    quotas,
    imssCents,
    isr,
    netCents: monthlyCents - isr.withheldCents - imssCents,
    minimumWage,
  };
};
