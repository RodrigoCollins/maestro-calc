import { Rational } from '@maestro-calc/core';
import { hoursText } from '../format.ts';
import { HOURS_PATHS, HOURS_TEXTS } from '../hours/texts.ts';
import { descriptionOf, titleOf } from '../seo/meta.ts';
import type { LongTailPage } from './jobs.ts';
import { WORKED } from './live-links.ts';
import { NEIGHBORS } from './nearest.ts';
import { pathOf, SCHOOL_YEAR_PATH, WEEKS, type Weeks } from './routes.ts';
import {
  HOURS_BASED,
  SCHOOL_YEAR_SOURCE,
  SCHOOL_YEAR_STATES,
  SCHOOL_YEAR_TABLE_YEAR,
  type SchoolYearState,
} from './school-year-data.ts';
import type { LongTailSection } from './sections.ts';
import { addDays, dayDelta, weekdayOf, type CivilDate } from './time-math.ts';
import { weeksQuestionOf } from './weeks.ts';
import { monthDayOf, weekdayNameOf } from './days-from.ts';

/*
 * "How many weeks in a school year", in English only: the minimum school year of every state and
 * DC (NCES, `./school-year-data.ts`) in days, hours and weeks of five school days, and an example
 * calendar, worked out here, of how breaks stretch 180 school days over about 40 weeks.
 */

const H1 = 'How many weeks are in a school year?';

/** A school week: Monday to Friday. */
const SCHOOL_WEEK = 5;

const n = (value: number): string => value.toLocaleString('en-US');
const ratio = (a: number, b: number): string => hoursText(Rational.of(a, b));
/** A decimal figure such as 5.5 as an exact ratio. */
const rationalOf = (value: number): Rational => Rational.of(Math.round(value * 10), 10);
const quotient = (a: number, b: number): Rational => Rational.of(a).div(rationalOf(b));

/** `days` of school as weeks of five and days: `37 weeks and 1 day`, `36 weeks`. */
const schoolWeeksOf = (days: number): string => {
  const weeks = Math.floor(days / SCHOOL_WEEK);
  const rest = days % SCHOOL_WEEK;
  const whole = `${n(weeks)} weeks`;
  return rest === 0
    ? whole
    : `${whole} and ${n(rest)} day${rest === 1 ? '' : 's'} (${ratio(days, SCHOOL_WEEK)})`;
};

/** Calendar days as weeks of seven and days: `40 weeks and 2 days`. */
const calendarWeeksOf = (days: number): string => {
  const weeks = Math.floor(days / 7);
  const rest = days % 7;
  return rest === 0
    ? `${n(weeks)} weeks`
    : `${n(weeks)} weeks and ${n(rest)} day${rest === 1 ? '' : 's'}`;
};

const listOf = (parts: readonly string[]): string =>
  parts.length <= 1
    ? (parts[0] ?? '')
    : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1] ?? ''}`;

const namesOf = (keep: (state: SchoolYearState) => boolean): readonly string[] =>
  SCHOOL_YEAR_STATES.filter(keep).map(({ name }) => name);

/** The weeks column of a state: its days over 5, or its hours over its day when it sets no days. */
const weeksCellOf = (state: SchoolYearState): string => {
  if (state.days !== undefined) return ratio(state.days, SCHOOL_WEEK);
  if (state.perDay !== undefined && /^[\d,]+$/.test(state.hours)) {
    const hours = Number(state.hours.replaceAll(',', ''));
    const weeks = hoursText(quotient(hours, state.perDay).div(Rational.of(SCHOOL_WEEK)));
    return `${weeks} at ${n(state.perDay)} hours a day`;
  }
  return '—';
};

const at = (y: number, m: number, d: number): CivilDate => ({ y, m, d });
const fullOf = (date: CivilDate): string =>
  `${weekdayNameOf(weekdayOf(date), 'en')}, ${monthDayOf(date, 'en')}, ${String(date.y)}`;
const rangeOf = (from: CivilDate, days: number): readonly CivilDate[] =>
  Array.from({ length: days }, (_, i) => addDays(from, i));

/**
 * The example calendar: a Monday start in late August, the federal Monday holidays of the school
 * months, three days at Thanksgiving, two weeks at winter, one in spring. Not any district's.
 */
const START = at(2026, 8, 24);
const BREAKS: readonly CivilDate[] = [
  at(2026, 9, 7), // Labor Day
  ...rangeOf(at(2026, 11, 25), 3), // Thanksgiving, Wednesday to Friday
  ...rangeOf(at(2026, 12, 21), 12), // winter break, December 21 to January 1
  at(2027, 1, 18), // Martin Luther King Jr. Day
  at(2027, 2, 15), // Presidents' Day
  ...rangeOf(at(2027, 3, 22), 5), // spring break
  at(2027, 5, 31), // Memorial Day
];
const SCHOOL_DAYS = 180;

const isWeekday = (date: CivilDate): boolean => weekdayOf(date) < 5;
const sameDay = (a: CivilDate, b: CivilDate): boolean => dayDelta(a, b) === 0;

/** The example calendar counted: its last school day, and its days by kind. */
const calendarOf = () => {
  const off = BREAKS.filter(isWeekday);
  let date = START;
  let school = 0;
  for (;;) {
    const current = date;
    if (isWeekday(current) && !off.some((each) => sameDay(each, current))) school += 1;
    if (school === SCHOOL_DAYS) break;
    date = addDays(date, 1);
  }
  const calendar = dayDelta(START, date) + 1;
  const weekdays = rangeOf(START, calendar).filter(isWeekday).length;
  return { end: date, calendar, weekdays, off: off.length };
};

/** The weeks pages the school year page links: the first of the family, the year and the month. */
export const schoolYearSiblings: readonly Weeks[] = WEEKS.slice(0, NEIGHBORS);

/** Its link on the hours calculator, after the weeks pages. */
export const SCHOOL_YEAR_LINK = { href: SCHOOL_YEAR_PATH, label: H1 } as const;

const buildPage = (): LongTailPage => {
  const withDays = SCHOOL_YEAR_STATES.filter(({ days }) => days !== undefined);
  const exactly = withDays.filter(({ days }) => days === SCHOOL_DAYS);
  const fewer = withDays.filter(({ days }) => (days ?? 0) < SCHOOL_DAYS);
  const more = withDays.filter(({ days }) => (days ?? 0) > SCHOOL_DAYS);
  const lowest = [...withDays].sort((a, b) => (a.days ?? 0) - (b.days ?? 0))[0];
  const highest = [...withDays].sort((a, b) => (b.days ?? 0) - (a.days ?? 0))[0];
  if (lowest?.days === undefined || highest?.days === undefined) {
    throw new Error('the school year table must hold day counts');
  }
  const hoursOnly = namesOf(({ daysText }) => daysText === 'None');
  const boards = namesOf(({ daysText }) => daysText.startsWith('Set by'));
  const either = namesOf(({ either: flag }) => flag === true);
  const hours1080 = namesOf(({ hours }) => hours === '1,080');
  const { end, calendar, weekdays, off } = calendarOf();
  const summer = 52 - Math.round(calendar / 7);

  const lead = `A US school year is usually 180 days, which is 36 weeks of five school days. ${String(exactly.length)} of the 50 states and DC set a minimum of exactly 180 days (NCES, ${String(SCHOOL_YEAR_TABLE_YEAR)}), from ${n(lowest.days)} in ${lowest.name} to ${n(highest.days)} in ${highest.name}, and with holidays and breaks the calendar spans about ${String(Math.round(calendar / 7))} weeks, late August to early June.`;

  const rows = [
    { key: '180', label: 'A 180-day school year', value: schoolWeeksOf(180) },
    { key: '175', label: 'A 175-day year (Vermont, Wyoming)', value: schoolWeeksOf(175) },
    { key: '186', label: 'A 186-day year (Kansas, grades 1-11)', value: schoolWeeksOf(186) },
    {
      key: 'calendar',
      label: 'The calendar a 180-day year spans, with breaks',
      value: calendarWeeksOf(calendar),
    },
    { key: 'hours', label: '180 days of 6 hours', value: `${n(180 * 6)} hours` },
  ];

  const missouri = quotient(1044, 6);
  const wisconsin = quotient(1050, 6);
  const sections: LongTailSection[] = [
    {
      id: 'worked',
      heading: WORKED.en,
      paragraphs: [],
      steps: [
        `A school week is five days, Monday to Friday, so the weeks of a school year are its days divided by 5: 180 ÷ 5 = 36 weeks.`,
        `175 days: 175 ÷ 5 = 35 weeks, the minimum in Vermont and Wyoming.`,
        `186 days: 186 ÷ 5 = ${ratio(186, 5)} weeks, or ${schoolWeeksOf(186).replace(/ \(.*\)$/, '')}, the minimum in Kansas for grades 1-11 (grade 12: 181 days, ${ratio(181, 5)} weeks).`,
        `A state that sets hours divides them by the length of its school day: Texas asks for 1,260 hours and a 7-hour day, 1,260 ÷ 7 = 180 days, and 180 ÷ 5 = 36 weeks.`,
        `Back to hours: 180 days of 6 hours are 180 × 6 = 1,080 hours, the yearly minimum in ${listOf(hours1080)}.`,
      ],
    },
    {
      id: 'states',
      heading: 'Minimum school days and hours by state',
      paragraphs: [
        `The minimum school year of each state and DC, from the National Center for Education Statistics (State Education Practices, Table 1.1, ${String(SCHOOL_YEAR_TABLE_YEAR)}, the newest edition of the table, which NCES compiled from the Education Commission of the States). Hours are by grade where the state splits them (K is kindergarten), and the weeks are the days divided by 5:`,
      ],
      table: {
        caption: `Minimum instructional days, hours and weeks by state, ${String(SCHOOL_YEAR_TABLE_YEAR)}`,
        head: ['State', 'Minimum days', 'Minimum hours a year', 'Weeks of school'],
        rows: SCHOOL_YEAR_STATES.map((state) => [
          state.name,
          state.daysText,
          state.hours,
          weeksCellOf(state),
        ]),
      },
      after: [
        `Of the 50 states and DC, ${String(exactly.length)} set exactly 180 days, ${String(fewer.length)} set fewer (${listOf(fewer.map(({ name, days }) => `${name} ${String(days)}`))}), ${String(more.length)} set more (${listOf(more.map(({ name, days }) => `${name} ${String(days)}`))}), ${String(hoursOnly.length)} set hours and no day count (${listOf(hoursOnly)}), and ${String(boards.length)} leave the days to a state or local board (${listOf(boards)}).`,
        `${listOf(either)} let a district meet either the hours or the days. Elsewhere, a state that sets both requires both.`,
        'What counts as a day differs: Alaska, Colorado, Georgia, Idaho, Iowa, Maine, Nevada, New Mexico, North Dakota, Ohio, Oklahoma, Oregon, South Dakota and Utah may count in-service and staff development days or parent-teacher conferences toward the minimum, while Hawaii, Kentucky, Montana, South Carolina, Tennessee and Vermont may leave them out.',
        "The table's footnotes add exceptions: California charter schools and some districts need 175 days; Massachusetts schools must schedule at least 185 days, and its grade 12 may graduate up to 12 days early; Oklahoma has had to fit its hours into 165 days of instruction since the 2021-22 school year; Hawaii's minimum does not apply to charter and multi-track schools; Maine and New Hampshire may let grade 12 graduate up to five days early.",
      ],
    },
    {
      id: 'hours',
      heading: 'States that count hours instead of days',
      paragraphs: [
        `${listOf(hoursOnly)} set yearly hours and no day count. Where the table also gives a minimum school day for the same grades, the hours divide into days, and the days into weeks of five:`,
      ],
      table: {
        caption: 'Hours-based minimums in days and weeks',
        head: ['Grades', 'Hours a year', 'Hours a day', 'Days', 'Weeks'],
        rows: HOURS_BASED.map(({ label, hours, perDay }) => {
          const days = quotient(hours, perDay);
          return [
            label,
            n(hours),
            n(perDay),
            hoursText(days),
            hoursText(days.div(Rational.of(SCHOOL_WEEK))),
          ];
        }),
      },
      after: [
        `The others give no school day to divide by: Delaware's day is at least 3.5 hours and Missouri's 3, Nebraska leaves the day to its State Board of Education, and Oregon and Wisconsin set no minimum day (Oregon sets a maximum, 8 hours through grade 8 and 8.5 in high school). At a 6-hour day, Missouri's 1,044 hours for grades 1-12 are ${hoursText(missouri)} days, ${hoursText(missouri.div(Rational.of(SCHOOL_WEEK)))} weeks, and Wisconsin's 1,050 for grades 1-6 are ${hoursText(wisconsin)} days, ${hoursText(wisconsin.div(Rational.of(SCHOOL_WEEK)))} weeks.`,
      ],
    },
    {
      id: 'calendar',
      heading: `Why a 180-day school year spans about ${String(Math.round(calendar / 7))} weeks`,
      paragraphs: [
        `A school year's weeks of calendar hold more than its school days: weekends, holidays and breaks. An example calendar, not that of any district, that starts on ${fullOf(START)}, and closes for Labor Day, three days at Thanksgiving, two weeks of winter break, Martin Luther King Jr. Day, Presidents' Day, a week of spring break and Memorial Day reaches its 180th school day on ${fullOf(end)}:`,
      ],
      table: {
        caption: 'An example 180-day school calendar, 2026-27',
        head: ['Days', 'Count'],
        rows: [
          [`Calendar days, ${monthDayOf(START, 'en')} to ${monthDayOf(end, 'en')}`, n(calendar)],
          ['Weekend days', n(calendar - weekdays)],
          ['Weekdays', n(weekdays)],
          ['Holidays and breaks on weekdays', n(off)],
          ['School days', n(weekdays - off)],
        ],
      },
      after: [
        `${n(calendar)} days are ${calendarWeeksOf(calendar)}: 36 weeks of school, ${ratio(off, SCHOOL_WEEK)} weeks of holidays and breaks, and the weekends between. The rest of the year, 52 weeks less about ${String(Math.round(calendar / 7))}, is a summer break of about ${String(summer)} weeks.`,
        'Some states fix the dates: Michigan and Minnesota start after Labor Day, Maryland no earlier than the Tuesday after it and finishes by June 15, Iowa starts no sooner than August 23, Wisconsin no earlier than September 1, and Texas after the fourth Monday in August.',
      ],
      questions: [
        {
          question: 'How many weeks of school are in a year?',
          answer: `36 weeks of five days in a 180-day year, the minimum in ${String(exactly.length)} of the 50 states and DC; ${ratio(lowest.days, SCHOOL_WEEK)} to ${ratio(highest.days, SCHOOL_WEEK)} weeks across the states that set a day count, from ${n(lowest.days)} days in ${lowest.name} to ${n(highest.days)} in ${highest.name}.`,
        },
        {
          question: 'How many days are in a school year?',
          answer:
            'Usually 180. The state minimums are the least a district may schedule, so a district calendar may hold more; Maryland, for one, lets a county board run up to 5 days past its June 15 finish without State Board approval.',
        },
        {
          question: 'How many weeks is summer break?',
          answer: `About ${String(summer)} weeks when the school year spans about ${String(Math.round(calendar / 7))} of the 52 weeks of the year, as the example calendar does; a district that starts in early August or ends in late June has a shorter one.`,
        },
      ],
    },
  ];

  return {
    kicker: HOURS_TEXTS.en.kicker,
    h1: H1,
    title: titleOf('A school year is 180 days, 36 weeks, in most US states'),
    description: descriptionOf(lead),
    lead,
    figure: ratio(180, SCHOOL_WEEK),
    figureLabel: 'Weeks of school in a 180-day year',
    breakdown: 'Weeks of school in a 180-day year',
    rows,
    calculator: {
      href: HOURS_PATHS.en,
      label: 'Count the hours between two times',
      title: HOURS_TEXTS.en.title,
    },
    note: `The state minimums are those of the NCES table of ${String(SCHOOL_YEAR_TABLE_YEAR)}; a district may schedule more, and a state may change its law, so a school's own calendar has the final count.`,
    paths: { en: SCHOOL_YEAR_PATH },
    others: {
      heading: 'Other weeks questions',
      links: schoolYearSiblings.map((job) => ({
        href: pathOf(job, 'en'),
        label: weeksQuestionOf(job, 'en'),
      })),
    },
    sections,
    sources: [SCHOOL_YEAR_SOURCE],
  };
};

/** The page, built once: every figure worked out from the NCES table and the example calendar. */
export const schoolYearPage: LongTailPage = buildPage();
