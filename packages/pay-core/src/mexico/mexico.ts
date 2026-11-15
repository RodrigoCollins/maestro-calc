import { daysFrom, isLeapYear, type CivilDate } from '../calendar/calendar.ts';

/*
 * The aguinaldo and the vacaciones of Mexico's Ley Federal del Trabajo, in whole centavos (exact
 * in a `number`: the largest product here is far under 2^53), each amount rounded half up once, at
 * the end. A monthly salary is divided by 30 for the daily one (LFT art. 89). Nothing here works
 * out ISR withholding: only the part LISR art. 93 fracción XIV exempts, with the UMA in force.
 */

/** The UMA of 2026 (INEGI, DOF 9 January 2026): $117.31 a day, in force from 1 February 2026. */
export const UMA_2026 = { dailyCents: 11731, from: '2026-02-01', published: '2026-01-09' } as const;

/**
 * The general minimum wages of 2026 (CONASAMI resolution, DOF 9 December 2025): $315.04 a day in
 * the general zone and $440.87 in the northern border free zone, from 1 January 2026.
 */
export const MINIMUM_WAGE_2026 = {
  generalCents: 31504,
  borderCents: 44087,
  from: '2026-01-01',
  published: '2025-12-09',
} as const;

/** The least aguinaldo, 15 days of salary (LFT art. 87). */
export const AGUINALDO_MIN_DAYS = 15;
/** The least prima vacacional, 25% of the salary of the vacation days (LFT art. 80). */
export const PRIMA_MIN_PERCENT = 25;
/** The aguinaldo free of ISR: 30 UMA (LISR art. 93 fr. XIV), $3,519.30 in 2026. */
export const AGUINALDO_EXEMPT_CENTS = 30 * UMA_2026.dailyCents;
/** The prima vacacional free of ISR: 15 UMA (LISR art. 93 fr. XIV), $1,759.65 in 2026. */
export const PRIMA_EXEMPT_CENTS = 15 * UMA_2026.dailyCents;
/** The days of the year the share of a partial year is counted over. */
export const YEAR_DAYS = 365;

/** How the salary is given: by the day, or by the month (divided by 30). */
export type WagePeriod = 'day' | 'month';

/** The largest salary read: $10,000,000.00. */
const MAX_CENTS = 1_000_000_000;

/** `num / den` rounded to the nearest whole, half up; both positive. */
const rounded = (num: number, den: number): number => Math.floor((2 * num + den) / (2 * den));

const perDay = (period: WagePeriod): number => (period === 'month' ? 30 : 1);

/** Pesos typed into a field (`315.04`, `$12,000`) as centavos, or `null` when it is no amount. */
export const parseCents = (text: string): number | null => {
  const plain = text.trim().replace(/^\$\s*/, '');
  const match = /^(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?$/.exec(plain);
  if (match === null) return null;
  const cents =
    Number((match[1] ?? '').replaceAll(',', '')) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
  return cents > 0 && cents <= MAX_CENTS ? cents : null;
};

/** A whole number typed into a field, from `min` to `max`, or `null`. */
export const parseWhole = (text: string, min: number, max: number): number | null => {
  const plain = text.trim();
  if (!/^\d+$/.test(plain)) return null;
  const value = Number(plain);
  return value >= min && value <= max ? value : null;
};

export interface AguinaldoInput {
  readonly wageCents: number;
  readonly period: WagePeriod;
  /** The days of salary the aguinaldo is worth for a whole year: 15 at least by law. */
  readonly days: number;
  /** The day the job started (a day before the year counts from 1 January). */
  readonly start: CivilDate;
  /** The last day counted: 31 December, or the day the job ended. Its year is the year paid. */
  readonly end: CivilDate;
}

export interface Aguinaldo {
  readonly dailyCents: number;
  /** The days worked in the year, both ends counted, at most 365. */
  readonly daysWorked: number;
  /** The days of salary earned, in hundredths: 15 days in a whole year are 1500. */
  readonly earnedHundredths: number;
  /** The aguinaldo of a whole year. */
  readonly fullCents: number;
  /** The aguinaldo of the days worked: the whole one, or its share (LFT art. 87). */
  readonly amountCents: number;
  /** The part free of ISR, at most 30 UMA. */
  readonly exemptCents: number;
  /** The part over 30 UMA, which pays ISR. */
  readonly taxableCents: number;
  /** Fewer days than the 15 of the law. */
  readonly belowMinimum: boolean;
}

/** The aguinaldo of a salary for the days worked in the year of `end` (LFT art. 87). */
export const aguinaldoOf = ({ wageCents, period, days, start, end }: AguinaldoInput): Aguinaldo => {
  if (daysFrom(start, end) < 0) throw new RangeError('the start comes after the end');
  const january = { y: end.y, m: 1, d: 1 };
  const from = daysFrom(january, start) > 0 ? start : january;
  const daysWorked = Math.min(daysFrom(from, end) + 1, YEAR_DAYS);
  const den = perDay(period);
  const amountCents = rounded(wageCents * days * daysWorked, den * YEAR_DAYS);
  const exemptCents = Math.min(amountCents, AGUINALDO_EXEMPT_CENTS);
  return {
    dailyCents: rounded(wageCents, den),
    daysWorked,
    earnedHundredths: rounded(days * daysWorked * 100, YEAR_DAYS),
    fullCents: rounded(wageCents * days, den),
    amountCents,
    exemptCents,
    taxableCents: amountCents - exemptCents,
    belowMinimum: days < AGUINALDO_MIN_DAYS,
  };
};

/**
 * The vacation days of a year of service (LFT art. 76 as reformed in the DOF of 27 December
 * 2022): 12 the first year, 2 more each year up to 20 in the fifth, then 2 more for each five
 * years of service; none before the first year is complete.
 */
export const vacationDaysFor = (years: number): number =>
  years < 1 ? 0 : years <= 5 ? 10 + 2 * years : 20 + 2 * Math.ceil((years - 5) / 5);

/** The table of art. 76: each span of years of service and its days, to 35 years. */
export const VACATION_TABLE: readonly {
  readonly from: number;
  readonly to: number;
  readonly days: number;
}[] = [
  ...[1, 2, 3, 4, 5].map((year) => ({ from: year, to: year, days: vacationDaysFor(year) })),
  ...[6, 11, 16, 21, 26, 31].map((from) => ({ from, to: from + 4, days: vacationDaysFor(from) })),
];

/** The anniversary of `start` in year `y`: 29 February falls on 1 March of a common year. */
const anniversaryIn = (start: CivilDate, y: number): CivilDate =>
  start.m === 2 && start.d === 29 && !isLeapYear(y)
    ? { y, m: 3, d: 1 }
    : { y, m: start.m, d: start.d };

/** The whole years of service from `start` to `on`. */
export const completedYearsOf = (start: CivilDate, on: CivilDate): number => {
  const years = on.y - start.y;
  return daysFrom(anniversaryIn(start, on.y), on) < 0 ? years - 1 : years;
};

/** The day the next year of service is complete, after `years` whole years. */
export const nextAnniversaryOf = (start: CivilDate, years: number): CivilDate =>
  anniversaryIn(start, start.y + years + 1);

export interface VacacionesInput {
  readonly wageCents: number;
  readonly period: WagePeriod;
  /** The prima vacacional, in percent of the salary of the vacation days: 25 at least. */
  readonly primaPercent: number;
  /** The day the job started. */
  readonly start: CivilDate;
  /** The day of the count. */
  readonly on: CivilDate;
}

export interface Vacaciones {
  readonly dailyCents: number;
  readonly years: number;
  /** Whether the first year is complete; before it, the days are those it will give. */
  readonly earned: boolean;
  readonly days: number;
  /** The salary of the vacation days. */
  readonly payCents: number;
  readonly primaCents: number;
  /** The part of the prima free of ISR, at most 15 UMA. */
  readonly primaExemptCents: number;
  readonly primaTaxableCents: number;
  /** The next year of service: the day it is complete and its days. */
  readonly next: { readonly date: CivilDate; readonly days: number };
  /** A prima under the 25% of the law. */
  readonly belowMinimum: boolean;
}

/** The vacation days of the years of service on `on`, their salary and the prima vacacional. */
export const vacacionesOf = ({
  wageCents,
  period,
  primaPercent,
  start,
  on,
}: VacacionesInput): Vacaciones => {
  if (daysFrom(start, on) < 0) throw new RangeError('the day of the count comes before the start');
  const years = completedYearsOf(start, on);
  const days = vacationDaysFor(Math.max(years, 1));
  const den = perDay(period);
  const primaCents = rounded(wageCents * days * primaPercent, den * 100);
  const primaExemptCents = Math.min(primaCents, PRIMA_EXEMPT_CENTS);
  return {
    dailyCents: rounded(wageCents, den),
    years,
    earned: years >= 1,
    days,
    payCents: rounded(wageCents * days, den),
    primaCents,
    primaExemptCents,
    primaTaxableCents: primaCents - primaExemptCents,
    next: { date: nextAnniversaryOf(start, years), days: vacationDaysFor(years + 1) },
    belowMinimum: primaPercent < PRIMA_MIN_PERCENT,
  };
};
