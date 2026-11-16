import { addDays, daysFrom, daysInMonth, type CivilDate } from '../calendar/calendar.ts';
import {
  primaAntiguedadOf,
  sdiOf,
  type PrimaAntiguedad,
  type Sdi,
  type WageZone,
} from './labor.ts';
import {
  AGUINALDO_MIN_DAYS,
  aguinaldoOf,
  nextAnniversaryOf,
  PRIMA_EXEMPT_CENTS,
  PRIMA_MIN_PERCENT,
  UMA_2026,
  vacationDaysFor,
  type Aguinaldo,
  type WagePeriod,
} from './mexico.ts';

/*
 * The finiquito and the liquidación of Mexico's Ley Federal del Trabajo, in whole centavos, each
 * amount rounded half up once, built from the engine of `./mexico.ts` and `./labor.ts` with the
 * legal minimums (15 days of aguinaldo, a prima vacacional of 25%) and a job of indefinite time:
 * - finiquito, on any exit: the days worked and unpaid, the share of the aguinaldo (art. 87), the
 *   vacation days of the year completed and not taken and the share of the year begun (arts. 76
 *   and 79) with their prima (art. 80), and the prima de antigüedad when it is owed (art. 162);
 * - liquidación, on an unjustified dismissal: three months of the integrated salary (arts. 48, 50
 *   fr. III and 89, counted as 90 days), and 20 days of it for each year of service when the
 *   employer refuses reinstatement (arts. 49 and 50 fr. II), the share of a year begun included.
 * The ISR is not worked out: only the part LISR art. 93 exempts (fr. XIII and XIV).
 */

/** The days of integrated salary of the indemnización of three months (LFT arts. 48 and 50). */
export const INDEMNIZACION_DAYS = 90;
/** The days of integrated salary for each year of service (LFT art. 50 fr. II). */
export const VEINTE_DIAS_PER_YEAR = 20;
/** The UMA free of ISR for each year of service on a separation (LISR art. 93 fr. XIII). */
export const SEPARATION_EXEMPT_UMA = 90;

/** How the job ends. */
export type Exit = 'resignation' | 'justifiedDismissal' | 'unjustifiedDismissal';

export interface FiniquitoInput {
  readonly wageCents: number;
  readonly period: WagePeriod;
  readonly zone: WageZone;
  /** The day the job started. */
  readonly start: CivilDate;
  /** The last day of the job. */
  readonly end: CivilDate;
  readonly exit: Exit;
  /** The employer refuses reinstatement: the 20 days a year of art. 50 fr. II are owed. */
  readonly refusedReinstatement: boolean;
  /** The vacation days taken since the last anniversary (or since the start). */
  readonly vacationTaken: number;
  /** The days worked and not yet paid. */
  readonly unpaidDays: number;
}

export interface FiniquitoIsr {
  /** The years of service of the exemption: a fraction of more than six months is a whole one. */
  readonly exemptYears: number;
  /** The prima de antigüedad and the indemnizaciones. */
  readonly separationCents: number;
  /** Their part free of ISR, 90 UMA for each year of service at most. */
  readonly separationExemptCents: number;
  /** The aguinaldo free of ISR, 30 UMA at most. */
  readonly aguinaldoExemptCents: number;
  /** The prima vacacional free of ISR, 15 UMA at most. */
  readonly primaExemptCents: number;
  readonly exemptCents: number;
  /** All the rest: the salary, the vacation pay and every part over its exemption. */
  readonly taxableCents: number;
}

export interface Finiquito {
  readonly dailyCents: number;
  /** The whole years of service, the days of the year begun, and the days of that year. */
  readonly years: number;
  readonly extraDays: number;
  readonly yearDays: number;
  /** The days worked and unpaid, at the daily salary. */
  readonly unpaidCents: number;
  /** The aguinaldo of the days worked in the year of the exit. */
  readonly aguinaldo: Aguinaldo;
  /** The vacation days of the last year of service completed (0 before the first). */
  readonly pendingVacationDays: number;
  /** The share of the days of the year begun, in hundredths. */
  readonly proportionalHundredths: number;
  /** The vacation days owed, less those taken (never under 0), in hundredths. */
  readonly vacationHundredths: number;
  readonly vacationCents: number;
  readonly primaVacacionalCents: number;
  /** The prima de antigüedad as `./labor.ts` works it, owed or not. */
  readonly antiguedad: PrimaAntiguedad;
  /** The prima de antigüedad paid: 0 when it is not owed. */
  readonly antiguedadCents: number;
  /** The salario diario integrado on the last day, which the indemnizaciones are paid on. */
  readonly sdi: Sdi;
  /** Three months of integrated salary, on an unjustified dismissal. */
  readonly indemnizacionCents: number;
  /** 20 days of integrated salary a year, when the employer refuses reinstatement. */
  readonly veinteDiasCents: number;
  /** The salary, the aguinaldo, the vacation days, their prima and the prima de antigüedad. */
  readonly finiquitoCents: number;
  /** The indemnizaciones of an unjustified dismissal. */
  readonly liquidacionCents: number;
  readonly totalCents: number;
  readonly isr: FiniquitoIsr;
}

/** `num / den` rounded to the nearest whole, half up; both positive. */
const rounded = (num: number, den: number): number => Math.floor((2 * num + den) / (2 * den));

/** Six months after `date`, on the last day of that month when it is shorter. */
const sixMonthsAfter = ({ y, m, d }: CivilDate): CivilDate => {
  const month = m + 6;
  const year = month > 12 ? y + 1 : y;
  const each = month > 12 ? month - 12 : month;
  return { y: year, m: each, d: Math.min(d, daysInMonth(year, each)) };
};

/** The finiquito, the liquidación and their part free of ISR. */
export const finiquitoOf = ({
  wageCents,
  period,
  zone,
  start,
  end,
  exit,
  refusedReinstatement,
  vacationTaken,
  unpaidDays,
}: FiniquitoInput): Finiquito => {
  const dismissed = exit !== 'resignation';
  // the service, to the end of the last day, as the prima de antigüedad counts it
  const antiguedad = primaAntiguedadOf({
    wageCents,
    period,
    zone,
    start,
    end,
    reason: dismissed ? 'dismissal' : 'voluntary',
  });
  const { years, extraDays, yearDays } = antiguedad;
  const den = period === 'month' ? 30 : 1;
  const aguinaldo = aguinaldoOf({ wageCents, period, days: AGUINALDO_MIN_DAYS, start, end });
  // the vacation days in units of 1/yearDays of a day: the year completed, the share of the year
  // begun, less the days taken
  const pendingVacationDays = vacationDaysFor(years);
  const proportional = vacationDaysFor(years + 1) * extraDays;
  const units = Math.max(
    pendingVacationDays * yearDays + proportional - vacationTaken * yearDays,
    0,
  );
  const vacationCents = rounded(wageCents * units, den * yearDays);
  const primaVacacionalCents = rounded(wageCents * units * PRIMA_MIN_PERCENT, den * yearDays * 100);
  const antiguedadCents = antiguedad.eligible ? antiguedad.amountCents : 0;
  const sdi = sdiOf({
    wageCents,
    period,
    aguinaldoDays: AGUINALDO_MIN_DAYS,
    primaPercent: PRIMA_MIN_PERCENT,
    start,
    on: end,
  });
  const unjustified = exit === 'unjustifiedDismissal';
  const indemnizacionCents = unjustified ? sdi.sdiCents * INDEMNIZACION_DAYS : 0;
  const veinteDiasCents =
    unjustified && refusedReinstatement
      ? rounded(sdi.sdiCents * VEINTE_DIAS_PER_YEAR * (years * yearDays + extraDays), yearDays)
      : 0;
  const unpaidCents = rounded(wageCents * unpaidDays, den);
  const finiquitoCents =
    unpaidCents + aguinaldo.amountCents + vacationCents + primaVacacionalCents + antiguedadCents;
  const liquidacionCents = indemnizacionCents + veinteDiasCents;
  const totalCents = finiquitoCents + liquidacionCents;
  // a fraction of more than six months counts as a whole year (LISR art. 93 fr. XIII)
  const lastAnniversary = nextAnniversaryOf(start, years - 1);
  const exemptYears =
    years + (daysFrom(sixMonthsAfter(lastAnniversary), addDays(end, 1)) > 0 ? 1 : 0);
  const separationCents = antiguedadCents + liquidacionCents;
  const separationExemptCents = Math.min(
    separationCents,
    SEPARATION_EXEMPT_UMA * UMA_2026.dailyCents * exemptYears,
  );
  const primaExemptCents = Math.min(primaVacacionalCents, PRIMA_EXEMPT_CENTS);
  const exemptCents = separationExemptCents + aguinaldo.exemptCents + primaExemptCents;
  return {
    dailyCents: rounded(wageCents, den),
    years,
    extraDays,
    yearDays,
    unpaidCents,
    aguinaldo,
    pendingVacationDays,
    proportionalHundredths: rounded(proportional * 100, yearDays),
    vacationHundredths: rounded(units * 100, yearDays),
    vacationCents,
    primaVacacionalCents,
    antiguedad,
    antiguedadCents,
    sdi,
    indemnizacionCents,
    veinteDiasCents,
    finiquitoCents,
    liquidacionCents,
    totalCents,
    isr: {
      exemptYears,
      separationCents,
      separationExemptCents,
      aguinaldoExemptCents: aguinaldo.exemptCents,
      primaExemptCents,
      exemptCents,
      taxableCents: totalCents - exemptCents,
    },
  };
};
