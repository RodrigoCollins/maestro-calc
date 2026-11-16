import { UMA_2026, type WagePeriod } from './mexico.ts';

/*
 * The participación de los trabajadores en las utilidades (PTU) of Mexico's Ley Federal del
 * Trabajo, in whole centavos, each amount rounded half up once. The shares are worked in `bigint`:
 * a company figure times a salary passes 2^53.
 * - The amount to share: 10% of the renta gravable (resolution of the Quinta Comisión Nacional,
 *   DOF 03-02-2009; LFT arts. 117 and 120), or the amount the company announces.
 * - LFT art. 123: half of it by the days each worker worked in the year, the other half in
 *   proportion to the salaries earned (art. 124: the cuota diaria, a monthly salary over 30 days).
 * - LFT art. 127 fr. VIII: at most three months of salary (90 days) or the average of the
 *   participación of the last three years, whichever favours the worker.
 * - LISR art. 93 fr. XIV: free of ISR up to 15 UMA.
 * With no company figures it gives the cap alone: the most the PTU can be.
 */

/** The share of the renta gravable that goes to the workers (Quinta Comisión, DOF 03-02-2009). */
export const PTU_PERCENT = 10;
/** The days of salary of the cap of three months (LFT art. 127 fr. VIII). */
export const PTU_CAP_DAYS = 90;
/** The days an eventual worker needs in the year to share (LFT art. 127 fr. VII). */
export const EVENTUAL_MIN_DAYS = 60;
/** The PTU free of ISR: 15 UMA (LISR art. 93 fr. XIV), $1,759.65 in 2026. */
export const PTU_EXEMPT_CENTS = 15 * UMA_2026.dailyCents;
/** The largest company figure read: $100,000,000,000.00. */
export const PTU_MAX_CENTS = 10_000_000_000_000;

/** What the company figure is: its renta gravable, or the PTU it shares out. */
export type PtuBase = 'profit' | 'amount';

export interface PtuCompany {
  readonly base: PtuBase;
  readonly amountCents: number;
  /** The days worked in the year by all the workers who share. */
  readonly totalDays: number;
  /** The salaries earned in the year by all of them. */
  readonly totalSalaryCents: number;
}

export interface PtuInput {
  readonly wageCents: number;
  readonly period: WagePeriod;
  /** The days the worker worked in the year, 0 to 366. */
  readonly days: number;
  /** The company figures, or `null` to estimate with the cap alone. */
  readonly company: PtuCompany | null;
  /** The PTU received in each of the last three years (0 for none). */
  readonly pastCents: readonly [number, number, number];
}

export interface PtuShares {
  /** The PTU the company shares out. */
  readonly poolCents: number;
  /** Each of its two halves. */
  readonly halfCents: number;
  /** The worker's part of the half shared by days. */
  readonly daysShareCents: number;
  /** The worker's part of the half shared by salaries. */
  readonly salaryShareCents: number;
  readonly beforeCapCents: number;
}

export interface Ptu {
  readonly dailyCents: number;
  /** The salary earned in the year: the daily salary times the days. */
  readonly salaryCents: number;
  /** The shares, or `null` when estimated with the cap alone. */
  readonly company: PtuShares | null;
  /** Three months of salary: 90 days. */
  readonly capMonthsCents: number;
  /** The average of the last three years. */
  readonly capAverageCents: number;
  /** The larger of the two, which favours the worker. */
  readonly capCents: number;
  readonly capBy: 'months' | 'average';
  /** The shares pass the cap. */
  readonly capped: boolean;
  /** The PTU: the shares up to the cap, or the cap alone. */
  readonly ptuCents: number;
  readonly exemptCents: number;
  readonly taxableCents: number;
  /** Fewer than 60 days: an eventual worker does not share (art. 127 fr. VII). */
  readonly underEventualDays: boolean;
}

/** `num / den` rounded to the nearest whole, half up; both positive. */
const rounded = (num: bigint, den: bigint): number => Number((2n * num + den) / (2n * den));

const big = (value: number): bigint => BigInt(value);

/** The PTU of a worker, its cap and its part free of ISR. */
export const ptuOf = ({ wageCents, period, days, company, pastCents }: PtuInput): Ptu => {
  if (days > 366) throw new RangeError('A year has at most 366 days');
  const den = big(period === 'month' ? 30 : 1);
  const salaryCents = rounded(big(wageCents) * big(days), den);
  const capMonthsCents = rounded(big(wageCents) * big(PTU_CAP_DAYS), den);
  const capAverageCents = rounded(big(pastCents[0] + pastCents[1] + pastCents[2]), 3n);
  const capBy = capAverageCents > capMonthsCents ? 'average' : 'months';
  const capCents = Math.max(capMonthsCents, capAverageCents);
  let shares: PtuShares | null = null;
  if (company !== null) {
    if (days > company.totalDays || salaryCents > company.totalSalaryCents)
      throw new RangeError('The worker cannot have more days or salary than the company');
    const poolCents =
      company.base === 'profit'
        ? rounded(big(company.amountCents) * big(PTU_PERCENT), 100n)
        : company.amountCents;
    const pool = big(poolCents);
    const daysShareCents = rounded(pool * big(days), 2n * big(company.totalDays));
    const salaryShareCents = rounded(pool * big(salaryCents), 2n * big(company.totalSalaryCents));
    shares = {
      poolCents,
      halfCents: rounded(pool, 2n),
      daysShareCents,
      salaryShareCents,
      beforeCapCents: daysShareCents + salaryShareCents,
    };
  }
  const ptuCents = shares === null ? capCents : Math.min(shares.beforeCapCents, capCents);
  const exemptCents = Math.min(ptuCents, PTU_EXEMPT_CENTS);
  return {
    dailyCents: rounded(big(wageCents), den),
    salaryCents,
    company: shares,
    capMonthsCents,
    capAverageCents,
    capCents,
    capBy,
    capped: shares !== null && shares.beforeCapCents > capCents,
    ptuCents,
    exemptCents,
    taxableCents: ptuCents - exemptCents,
    underEventualDays: days < EVENTUAL_MIN_DAYS,
  };
};
