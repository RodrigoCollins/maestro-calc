import type { Lang } from '../time-card/receipt.ts';

/*
 * The state meal periods a shift page names, from the U.S. Department of Labor table "Minimum
 * Length of Meal Period Required under State Law for Adult Employees in Private Sector" (January 1,
 * 2023, https://www.dol.gov/agencies/whd/state/meal-breaks; `SOURCES.mealTable`). Only the rows
 * whose basic standard is a length owed after a set number of hours of work are here; the table's
 * rows that turn on the industry, the size of the store or the time of day (Colorado, Kentucky,
 * Maryland, Nebraska, New York, Vermont) are left to the table itself. Each row keeps the table's
 * own words in `standard`, so a reader and a test can hold the threshold against them.
 */

/** When a rule applies, by the hours from the start of the shift to its end. */
export interface Threshold {
  readonly hours: number;
  /** `over`: more than `hours`; `atLeast`: `hours` or more. */
  readonly kind: 'over' | 'atLeast';
}

/** When in the shift the meal period must fall, as hours from its start or before its end. */
export type Window =
  | { readonly kind: 'between'; readonly afterStart: number; readonly beforeEnd: number }
  | { readonly kind: 'fromStart'; readonly from: number; readonly to: number }
  | { readonly kind: 'by'; readonly afterStart: number };

export interface MealPeriod {
  readonly state: Readonly<Record<Lang, string>>;
  /** The basic standard, word for word from the DOL table. */
  readonly standard: string;
  readonly threshold: Threshold;
  /** The length owed, in minutes; none: the table names no length ("sufficient unpaid time"). */
  readonly minutes?: number;
  readonly window?: Window;
}

const over = (hours: number): Threshold => ({ hours, kind: 'over' });
const atLeast = (hours: number): Threshold => ({ hours, kind: 'atLeast' });

/** In the order of the DOL table. */
export const MEAL_PERIODS: readonly MealPeriod[] = [
  {
    state: { en: 'California', es: 'California' },
    standard:
      '½ hour, if work is for more than 5 hours per day, except when workday will be completed in 6 hours or less and there is mutual employer/employee consent to waive meal period.',
    threshold: over(5),
    minutes: 30,
  },
  {
    state: { en: 'Connecticut', es: 'Connecticut' },
    standard:
      '½ hour at some time after first 2 hours and before last 2 hours for employees who work 7½ consecutive hours or more.',
    threshold: atLeast(7.5),
    minutes: 30,
    window: { kind: 'between', afterStart: 2, beforeEnd: 2 },
  },
  {
    state: { en: 'Delaware', es: 'Delaware' },
    standard:
      '½ hour, at some time, after first 2 hours and before the last 2 hours, for employees who work 7½ consecutive hours or more.',
    threshold: atLeast(7.5),
    minutes: 30,
    window: { kind: 'between', afterStart: 2, beforeEnd: 2 },
  },
  {
    state: { en: 'Illinois', es: 'Illinois' },
    standard:
      'At least 20 minutes, no later than 5 hours after the start of the work period, to employees who work 7 ½ continuous hours or more.',
    threshold: atLeast(7.5),
    minutes: 20,
    window: { kind: 'by', afterStart: 5 },
  },
  {
    state: { en: 'Maine', es: 'Maine' },
    standard: '30 minutes after 6 consecutive hours, except in cases of emergency.',
    threshold: over(6),
    minutes: 30,
  },
  {
    state: { en: 'Massachusetts', es: 'Massachusetts' },
    standard:
      'Workers have a right to at least a 30-minute meal break or each 6 hours worked in a calendar day.',
    threshold: over(6),
    minutes: 30,
  },
  {
    state: { en: 'Minnesota', es: 'Minnesota' },
    standard: 'Sufficient unpaid time for employees who work 8 consecutive hours or more.',
    threshold: atLeast(8),
  },
  {
    state: { en: 'Nevada', es: 'Nevada' },
    standard: '½ hour, if work is for 8 continuous hours.',
    threshold: atLeast(8),
    minutes: 30,
  },
  {
    state: { en: 'New Hampshire', es: 'Nuevo Hampshire' },
    standard:
      '½ hour, after 5 consecutive hours, unless feasible for employee to eat while working and is permitted to do so by employer.',
    threshold: over(5),
    minutes: 30,
  },
  {
    state: { en: 'North Dakota', es: 'Dakota del Norte' },
    standard: '½ hour, if desired, on each shift exceeding 5 hours.',
    threshold: over(5),
    minutes: 30,
  },
  {
    state: { en: 'Oregon', es: 'Oregón' },
    standard:
      '½ hour, with relief from all duty, for each work period of 6 to 8 hours, between 2nd and 5th hour for work period of 7 hours or less and between 3rd and 6th hour for work period over 7 hours.',
    threshold: atLeast(6),
    minutes: 30,
  },
  {
    state: { en: 'Rhode Island', es: 'Rhode Island' },
    standard:
      'All employees are entitled to a 20 minute mealtime within a six hour work shift, and a 30 minute mealtime within an eight hour work shift.',
    threshold: atLeast(6),
    minutes: 20,
  },
  {
    state: { en: 'Tennessee', es: 'Tennessee' },
    standard: '½ hour for employees scheduled to work 6 consecutive hours or more.',
    threshold: atLeast(6),
    minutes: 30,
  },
  {
    state: { en: 'Washington', es: 'Washington' },
    standard:
      '½ hour, if work period is more than 5 consecutive hours, to be given not less than 2 hours nor more than 5 hours from beginning of shift.',
    threshold: over(5),
    minutes: 30,
    window: { kind: 'fromStart', from: 2, to: 5 },
  },
  {
    state: { en: 'West Virginia', es: 'Virginia Occidental' },
    standard: '20 minutes for employees who work 6 hours or more in a workday.',
    threshold: atLeast(6),
    minutes: 20,
  },
];

/** Rhode Island owes 30 minutes, not 20, from an eight-hour shift (its `standard`). */
const RHODE_ISLAND_LONG = { hours: 8, minutes: 30 } as const;

/** The minutes a rule owes on a shift of `hours`; none: no length named. */
export const mealMinutesOf = (period: MealPeriod, hours: number): number | undefined =>
  period.state.en === 'Rhode Island' && hours >= RHODE_ISLAND_LONG.hours
    ? RHODE_ISLAND_LONG.minutes
    : period.minutes;

/** Whether `period` applies to a shift of `hours` from start to end. */
export const appliesTo = (period: MealPeriod, hours: number): boolean =>
  period.threshold.kind === 'over'
    ? hours > period.threshold.hours
    : hours >= period.threshold.hours;
