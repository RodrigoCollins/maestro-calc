import { countInput, defineCalculator, Rational, selectInput } from '@maestro-calc/core';
import { daysFromCivil, daysInMonth } from './dates.ts';

/** What the date given is: the first day she allowed breeding, the LH surge, or the first day of diestrus. */
const METHODS = ['breeding', 'lh', 'diestrus'] as const;

/**
 * Merck Veterinary Manual, "Whelping and Queening in Dogs and Cats" (Davidson, last updated July
 * 2026): 58 to 72 days from the first day the female allowed breeding; 64 to 66 days from the LH
 * surge (or the first rise of progesterone above 2 ng/mL); 56 to 58 days from the first day of
 * diestrus. The page gives the whole window, never one day.
 */
const WINDOWS = {
  breeding: { min: 58, max: 72 },
  lh: { min: 64, max: 66 },
  diestrus: { min: 56, max: 58 },
} as const satisfies Record<(typeof METHODS)[number], unknown>;

/**
 * Dog due date: the window of days the litter is due, from a date and what the date is. The date
 * is a year, a month and a day (there is no date kind); every output that is a date is a count of
 * days since 1970-01-01, which `civilFromDays` turns back into a date. A day past the end of the
 * month is moved back to its last day, and the run says so.
 */
export const dogDueDate = defineCalculator({
  id: 'dog-due-date',
  inputs: [
    selectInput({ key: 'method', urlKey: 'm', options: METHODS, default: 'breeding' }),
    countInput({ key: 'year', urlKey: 'y', default: 2026, min: 1970, max: 2100 }),
    countInput({ key: 'month', urlKey: 'mo', default: 3, min: 1, max: 12 }),
    countInput({ key: 'day', urlKey: 'd', default: 1, min: 1, max: 31 }),
  ],
  outputs: [
    { key: 'earliest', measure: 'number', role: 'primary' },
    { key: 'latest', measure: 'number', role: 'secondary' },
    { key: 'from', measure: 'number', role: 'secondary' },
    { key: 'minDays', measure: 'number', role: 'secondary' },
    { key: 'maxDays', measure: 'number', role: 'secondary' },
  ],
  warnings: ['dayMovedBack'],
  compute: ({ method, year, month, day }) => {
    const last = daysInMonth(year, month);
    const from = daysFromCivil(year, month, Math.min(day, last));
    const { min, max } = WINDOWS[method];
    return {
      outputs: {
        earliest: Rational.of(from + min),
        latest: Rational.of(from + max),
        from: Rational.of(from),
        minDays: Rational.of(min),
        maxDays: Rational.of(max),
      },
      shopping: [],
      warnings: day > last ? [{ code: 'dayMovedBack' as const, params: {} }] : [],
    };
  },
});
