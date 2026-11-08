import { civilFromDays } from '@maestro-calc/pets-core/dog-due-date';
import { calendarSvg } from '../strips.ts';
import { dateText } from '../format.ts';
import type { FieldCopy } from './dog.ts';
import { figureOf, type Patch, type View } from './view.ts';

/** The copy of the due date page. */
export interface DueDatePage {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  readonly lead: string;
  readonly fields: Readonly<Record<string, FieldCopy>>;
  readonly initial: Readonly<Record<string, string>>;
  readonly notes: readonly string[];
  readonly dayMovedBack: string;
}

export const DUE_DATE_PAGE: DueDatePage = {
  path: '/dog-pregnancy-calculator',
  title: 'Dog Pregnancy Calculator: Due Date Window | Bowl Figures',
  description:
    'The window of dates a dog’s litter is due, from the breeding date, the LH surge or the first day of diestrus: 58 to 72, 64 to 66 or 56 to 58 days (Merck).',
  kicker: 'Dogs · pregnancy · free',
  h1: 'Dog pregnancy due date calculator',
  lead: 'Pick the date you know and what it is. You get the window of dates the puppies are due, never one day.',
  fields: {
    method: {
      label: 'The date you know is',
      options: {
        breeding: 'The first day she allowed breeding',
        lh: 'The day of the LH surge, or progesterone first above 2 ng/mL',
        diestrus: 'The first day of diestrus',
      },
    },
    month: {
      label: 'Month',
      options: {
        '1': 'January',
        '2': 'February',
        '3': 'March',
        '4': 'April',
        '5': 'May',
        '6': 'June',
        '7': 'July',
        '8': 'August',
        '9': 'September',
        '10': 'October',
        '11': 'November',
        '12': 'December',
      },
    },
    day: { label: 'Day' },
    year: { label: 'Year' },
  },
  initial: { method: 'breeding', month: '3', day: '1', year: '2026' },
  notes: [
    'A window, because breeding does not time ovulation: a veterinarian can narrow it with ovulation timing (LH or progesterone tests).',
    'Call your veterinarian for a pregnancy check, for the signs of trouble in whelping, and before the due window starts to plan the birth.',
  ],
  dayMovedBack: 'That month has fewer days, so the count starts from its last day.',
};

/** The result of the due date calculator: the window of dates and the strip that shades it. */
export const dueDateView: View = (figures, _raw, warnings): Patch => {
  const earliest = civilFromDays(figureOf(figures, 'earliest').toNumber());
  const latest = civilFromDays(figureOf(figures, 'latest').toNumber());
  const min = figureOf(figures, 'minDays').toNumber();
  const max = figureOf(figures, 'maxDays').toNumber();
  return {
    text: {
      earliest: dateText(earliest),
      latest: dateText(latest),
      from: dateText(civilFromDays(figureOf(figures, 'from').toNumber())),
      window: `${String(min)} to ${String(max)} days`,
    },
    html: { strip: calendarSvg(min, max) },
    show: { dayMovedBack: warnings.has('dayMovedBack') },
    vars: {},
    flags: {},
  };
};
