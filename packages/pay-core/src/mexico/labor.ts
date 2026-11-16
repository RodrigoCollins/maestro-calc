import { addDays, daysFrom, type CivilDate } from '../calendar/calendar.ts';
import {
  AGUINALDO_MIN_DAYS,
  completedYearsOf,
  MINIMUM_WAGE_2026,
  nextAnniversaryOf,
  PRIMA_MIN_PERCENT,
  UMA_2026,
  VACATION_TABLE,
  vacationDaysFor,
  YEAR_DAYS,
  type WagePeriod,
} from './mexico.ts';

/*
 * The prima dominical, the overtime, the prima de antigüedad and the salario diario integrado of
 * Mexico's Ley Federal del Trabajo and Ley del Seguro Social, in whole centavos, each amount rounded
 * half up once, at the end (as `./mexico.ts`). A monthly salary is divided by 30 (LFT art. 89).
 */

/** The least prima dominical, 25% of the salary of an ordinary day (LFT art. 71). */
export const DOMINICAL_MIN_PERCENT = 25;
/** The overtime hours of a week paid double; the ones past them are paid triple (LFT art. 68). */
export const EXTRA_DOUBLE_WEEKLY_HOURS = 9;
/** The longest working day of each kind, in hours (LFT art. 61). */
export const JORNADA_HOURS = { diurna: 8, nocturna: 7, mixta: 7.5 } as const;
/** The days of salary of the prima de antigüedad for each year of service (LFT art. 162 fr. I). */
export const ANTIGUEDAD_DAYS_PER_YEAR = 12;
/** The years of service a voluntary separation needs for the prima (LFT art. 162 fr. III). */
export const ANTIGUEDAD_VOLUNTARY_YEARS = 15;
/** The top of the IMSS base: 25 UMA a day (LSS art. 28, the UMA since 2016), $2,932.75 in 2026. */
export const SBC_CAP_CENTS = 25 * UMA_2026.dailyCents;

export type Jornada = keyof typeof JORNADA_HOURS;

/** `num / den` rounded to the nearest whole, half up; both positive. */
const rounded = (num: number, den: number): number => Math.floor((2 * num + den) / (2 * den));

const perDay = (period: WagePeriod): number => (period === 'month' ? 30 : 1);

export interface PrimaDominicalInput {
  readonly wageCents: number;
  readonly period: WagePeriod;
  /** The prima, in percent of the salary of an ordinary day: 25 at least. */
  readonly percent: number;
  /** The Sundays worked. */
  readonly sundays: number;
}

export interface PrimaDominical {
  readonly dailyCents: number;
  /** The prima of one Sunday. */
  readonly primaCents: number;
  /** The prima of every Sunday worked. */
  readonly totalCents: number;
  readonly belowMinimum: boolean;
}

/** The prima for the Sundays worked: a share of the salary of an ordinary day (LFT art. 71). */
export const primaDominicalOf = ({
  wageCents,
  period,
  percent,
  sundays,
}: PrimaDominicalInput): PrimaDominical => {
  const den = perDay(period) * 100;
  return {
    dailyCents: rounded(wageCents, perDay(period)),
    primaCents: rounded(wageCents * percent, den),
    totalCents: rounded(wageCents * percent * sundays, den),
    belowMinimum: percent < DOMINICAL_MIN_PERCENT,
  };
};

export interface HorasExtrasInput {
  readonly wageCents: number;
  readonly period: WagePeriod;
  readonly jornada: Jornada;
  /** The overtime hours of the week, in whole or half hours. */
  readonly hours: number;
}

export interface HorasExtras {
  readonly dailyCents: number;
  /** The salary of one hour of the working day. */
  readonly hourCents: number;
  readonly doubleHours: number;
  readonly tripleHours: number;
  /** The first nine hours of the week, paid with 100% more (LFT art. 67). */
  readonly doubleCents: number;
  /** The hours past nine, paid with 200% more (LFT art. 68). */
  readonly tripleCents: number;
  readonly totalCents: number;
  /** More than the nine hours a week the law allows (LFT art. 66). */
  readonly overLimit: boolean;
}

/** The pay of the overtime hours of a week (LFT arts. 67 and 68). */
export const horasExtrasOf = ({
  wageCents,
  period,
  jornada,
  hours,
}: HorasExtrasInput): HorasExtras => {
  // in half hours, so the 7.5 hours of a mixed day stay whole
  const den = perDay(period) * JORNADA_HOURS[jornada] * 2;
  const doubleHours = Math.min(hours, EXTRA_DOUBLE_WEEKLY_HOURS);
  const tripleHours = hours - doubleHours;
  return {
    dailyCents: rounded(wageCents, perDay(period)),
    hourCents: rounded(wageCents * 2, den),
    doubleHours,
    tripleHours,
    doubleCents: rounded(wageCents * 2 * doubleHours * 2, den),
    tripleCents: rounded(wageCents * 3 * tripleHours * 2, den),
    totalCents: rounded(wageCents * (2 * doubleHours + 3 * tripleHours) * 2, den),
    overLimit: hours > EXTRA_DOUBLE_WEEKLY_HOURS,
  };
};

/** The area of the minimum wage: the general one, or the northern border free zone. */
export type WageZone = 'general' | 'border';

/** Why the job ends: the prima is owed on all but a voluntary separation before 15 years. */
export type Separation = 'voluntary' | 'justified' | 'dismissal' | 'death';

export interface PrimaAntiguedadInput {
  readonly wageCents: number;
  readonly period: WagePeriod;
  readonly zone: WageZone;
  /** The day the job started. */
  readonly start: CivilDate;
  /** The last day of the job. */
  readonly end: CivilDate;
  readonly reason: Separation;
}

export interface PrimaAntiguedad {
  readonly dailyCents: number;
  /** The salary the prima is paid on: the daily one, from the minimum to twice it. */
  readonly baseCents: number;
  /** Twice the minimum wage of the zone (LFT art. 486). */
  readonly capCents: number;
  readonly capped: boolean;
  /** Raised to the minimum wage (LFT art. 485). */
  readonly floored: boolean;
  /** The whole years of service. */
  readonly years: number;
  /** The days of the year of service begun and not complete. */
  readonly extraDays: number;
  /** The days of that year of service: 365, or 366 when it holds 29 February. */
  readonly yearDays: number;
  /** The days of salary of the prima, in hundredths: 12 for each year and its share of one begun. */
  readonly earnedHundredths: number;
  /** The prima of the whole years only. */
  readonly wholeYearsCents: number;
  /** The prima of the whole years and the share of the year begun. */
  readonly amountCents: number;
  /** Whether the prima is owed: always, but before 15 years on a voluntary separation. */
  readonly eligible: boolean;
}

/** The prima de antigüedad: 12 days of salary for each year of service (LFT art. 162). */
export const primaAntiguedadOf = ({
  wageCents,
  period,
  zone,
  start,
  end,
  reason,
}: PrimaAntiguedadInput): PrimaAntiguedad => {
  if (daysFrom(start, end) < 0) throw new RangeError('the end comes before the start');
  const minimum =
    zone === 'border' ? MINIMUM_WAGE_2026.borderCents : MINIMUM_WAGE_2026.generalCents;
  const capCents = 2 * minimum;
  const den = perDay(period);
  // the salary as a fraction `num / den`: the daily one, kept within the minimum and twice it
  const capped = wageCents > capCents * den;
  const floored = wageCents < minimum * den;
  const [num, by] = capped ? [capCents, 1] : floored ? [minimum, 1] : [wageCents, den];
  // the service runs to the end of the last day
  const after = addDays(end, 1);
  const years = completedYearsOf(start, after);
  const from = nextAnniversaryOf(start, years - 1);
  const extraDays = daysFrom(from, after);
  const yearDays = daysFrom(from, nextAnniversaryOf(start, years));
  const units = years * yearDays + extraDays;
  return {
    dailyCents: rounded(wageCents, den),
    baseCents: rounded(num, by),
    capCents,
    capped,
    floored,
    years,
    extraDays,
    yearDays,
    earnedHundredths: rounded(ANTIGUEDAD_DAYS_PER_YEAR * units * 100, yearDays),
    wholeYearsCents: rounded(num * ANTIGUEDAD_DAYS_PER_YEAR * years, by),
    amountCents: rounded(num * ANTIGUEDAD_DAYS_PER_YEAR * units, by * yearDays),
    eligible: reason !== 'voluntary' || years >= ANTIGUEDAD_VOLUNTARY_YEARS,
  };
};

export interface SdiInput {
  readonly wageCents: number;
  readonly period: WagePeriod;
  /** The days of aguinaldo a year: 15 at least (LFT art. 87). */
  readonly aguinaldoDays: number;
  /** The prima vacacional, in percent: 25 at least (LFT art. 80). */
  readonly primaPercent: number;
  /** The day the job started. */
  readonly start: CivilDate;
  /** The day of the count. */
  readonly on: CivilDate;
}

export interface Sdi {
  readonly dailyCents: number;
  /** The year of service under way: the first until the first anniversary. */
  readonly serviceYear: number;
  /** The vacation days of that year of service (LFT art. 76). */
  readonly vacationDays: number;
  /** The integration factor in ten-thousandths, as the IMSS tables print it: 1.0493 is 10493. */
  readonly factorTenThousandths: number;
  /** The aguinaldo spread over the 365 days of the year. */
  readonly aguinaldoDailyCents: number;
  /** The prima vacacional spread over the 365 days of the year. */
  readonly primaDailyCents: number;
  /** The salario diario integrado: the daily salary and the share of both. */
  readonly sdiCents: number;
  /** The salario base de cotización of the IMSS: the integrado up to 25 UMA (LSS art. 28). */
  readonly sbcCents: number;
  readonly capped: boolean;
}

/** The parts of a year a factor counts, in hundredths of a day. */
const factorUnitsOf = (aguinaldoDays: number, vacationDays: number, primaPercent: number): number =>
  YEAR_DAYS * 100 + aguinaldoDays * 100 + vacationDays * primaPercent;

/**
 * The salario diario integrado with the aguinaldo and the prima vacacional of the year of service
 * under way (LFT art. 84, LSS art. 27): the daily salary × (365 + aguinaldo + vacation days ×
 * prima) / 365, rounded once; the factor is printed to four decimals, as the IMSS tables do.
 */
export const sdiOf = ({
  wageCents,
  period,
  aguinaldoDays,
  primaPercent,
  start,
  on,
}: SdiInput): Sdi => {
  if (daysFrom(start, on) < 0) throw new RangeError('the day of the count comes before the start');
  const serviceYear = completedYearsOf(start, on) + 1;
  const vacationDays = vacationDaysFor(serviceYear);
  const units = factorUnitsOf(aguinaldoDays, vacationDays, primaPercent);
  const den = perDay(period) * YEAR_DAYS * 100;
  const sdiCents = rounded(wageCents * units, den);
  return {
    dailyCents: rounded(wageCents, perDay(period)),
    serviceYear,
    vacationDays,
    factorTenThousandths: rounded(units * 10000, YEAR_DAYS * 100),
    aguinaldoDailyCents: rounded(wageCents * aguinaldoDays * 100, den),
    primaDailyCents: rounded(wageCents * vacationDays * primaPercent, den),
    sdiCents,
    sbcCents: Math.min(sdiCents, SBC_CAP_CENTS),
    capped: sdiCents > SBC_CAP_CENTS,
  };
};

/** The integration factor of each span of years of service of art. 76, at 15 days and 25%. */
export const SDI_TABLE: readonly {
  readonly from: number;
  readonly to: number;
  readonly days: number;
  readonly factorTenThousandths: number;
}[] = VACATION_TABLE.map(({ from, to, days }) => ({
  from,
  to,
  days,
  factorTenThousandths: rounded(
    factorUnitsOf(AGUINALDO_MIN_DAYS, days, PRIMA_MIN_PERCENT) * 10000,
    YEAR_DAYS * 100,
  ),
}));
