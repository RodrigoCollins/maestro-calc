import type { Lang } from '../time-card/receipt.ts';

/*
 * The other spellings people search an amount in (plans/growth/ahrefs-2026-11-08.md, US volumes):
 * "25 an hour" 24K, "$25 an hour" 15K and "25 dollars an hour" 10K; "60k a year" 18K, "60000 a
 * year" 11K and "60 000 a year" 11K. One page answers every spelling of its amount: the title and
 * the heading carry the most searched ones, the FAQ and the "also written as" line each of the
 * others once. The figures keep the site's US style in both languages (`$60,000`, `$17.50`).
 */

/** Thousands apart with a space, as many write them outside the US: `60000` is `60 000`. */
const spacedOf = (amount: string): string => amount.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/** A salary in thousands: `60000` is `60`. */
const thousandsOf = (amount: string): string => {
  const thousands = Number(amount) / 1000;
  if (!Number.isInteger(thousands)) throw new Error(`the salary ${amount} is not whole thousands`);
  return String(thousands);
};

export interface HourlySpellings {
  /** "25 dollars an hour", the spelling of the description and of the FAQ's first question. */
  readonly dollars: string;
  /** "25 an hour", with no sign, the spelling of the FAQ's second question. */
  readonly bare: string;
  /** The line under the answer: the spellings the page does not use elsewhere. */
  readonly aka: string;
}

export interface SalarySpellings {
  /** "60k a year", the spelling of the title and of the FAQ's first question. */
  readonly thousands: string;
  /** "60000 a year", with no comma, the spelling of the FAQ's second question. */
  readonly plain: string;
  /** The line under the answer: the spellings the page does not use elsewhere. */
  readonly aka: string;
}

/** The spellings of an hourly rate (`25`, `17.50`) in `lang`. */
export const hourlySpellingsOf = (amount: string, lang: Lang): HourlySpellings =>
  lang === 'en'
    ? {
        dollars: `${amount} dollars an hour`,
        bare: `${amount} an hour`,
        aka: `Also written as $${amount}/hr or $${amount} per hour.`,
      }
    : {
        dollars: `${amount} dólares la hora`,
        bare: `${amount} la hora`,
        aka: `También se escribe ${amount} dólares por hora o $${amount}/h.`,
      };

/** The spellings of a yearly salary in whole thousands (`60000`) in `lang`. */
export const salarySpellingsOf = (amount: string, lang: Lang): SalarySpellings => {
  const thousands = thousandsOf(amount);
  const spaced = spacedOf(amount);
  return lang === 'en'
    ? {
        thousands: `${thousands}k a year`,
        plain: `${amount} a year`,
        aka: `Also written as ${spaced} or ${thousands} thousand dollars a year.`,
      }
    : {
        thousands: `${thousands} mil al año`,
        plain: `${amount} al año`,
        aka: `También se escribe ${thousands}k o ${spaced} dólares al año.`,
      };
};
