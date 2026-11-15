import { Rational } from '@maestro-calc/core';
import { COUNTDOWNS, countdownPathOf } from '../dates/routes.ts';
import { hoursText } from '../format.ts';
import { HOURS_PATHS, HOURS_TEXTS } from '../hours/texts.ts';
import { descriptionOf, titleOf } from '../seo/meta.ts';
import type { Lang } from '../time-card/receipt.ts';
import { monthDayOf, monthNameOf, weekdayNameOf } from './days-from.ts';
import type { CommonLinks, LongTailPage } from './jobs.ts';
import { WORKED } from './live-links.ts';
import { nearestOf } from './nearest.ts';
import { pathOf, WEEKS, type Weeks } from './routes.ts';
import type { LongTailSection, LongTailSource } from './sections.ts';
import {
  addDays,
  addMonths,
  dayDelta,
  daysInMonth,
  isLeap,
  weekdayOf,
  type CivilDate,
} from './time-math.ts';

/*
 * The weeks pages: "how many weeks in a year", "how many months is 12 weeks", "how many weeks
 * left in 2026". Every figure is calendar arithmetic worked out at build time from the Gregorian
 * calendar: 146,097 days in a cycle of 400 years, or 4,800 months, so an average month is
 * 30.436875 days and an average year 52.1775 weeks. A table names its year, so it never goes
 * stale; the two counts from today (`WEEKS_LIVE`) are filled by `../client/time-now.ts` from the
 * visitor's own date, and the page as built gives only the rule.
 */

/** Days in 400 Gregorian years, and the months in them. */
const CYCLE_DAYS = 146_097;
const CYCLE_MONTHS = 4800;
/** The years of the year tables, and the year the month and calendar tables start in. */
const YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033];
const CALENDAR_YEAR = 2027;
/** The year the weeks-left and Christmas tables count in. */
const THIS_YEAR = 2026;
/** Weekdays, 0 for Monday: Thursday and Friday. */
const THURSDAY = 3;
const FRIDAY = 4;

/** Thousands grouped with commas, in both languages: `1,040`. */
const n = (value: number): string => value.toLocaleString('en-US');

/** `a / b` to two places at most: `2.76`, `4.6`, `4`. */
const ratio = (a: number, b: number): string => hoursText(Rational.of(a, b));

const at = (y: number, m: number, d: number): CivilDate => ({ y, m, d });

/** How many days of weekday `weekday` the `days` days from `from` (included) hold. */
const countOf = (from: CivilDate, days: number, weekday: number): number =>
  Array.from({ length: days }, (_, i) => addDays(from, i)).filter(
    (date) => weekdayOf(date) === weekday,
  ).length;

/** Monday to Friday among the `days` days from `from`, `from` included. */
const weekdaysOf = (from: CivilDate, days: number): number =>
  Array.from({ length: days }, (_, i) => addDays(from, i)).filter((date) => weekdayOf(date) < 5)
    .length;

const daysOfYear = (y: number): number => (isLeap(y) ? 366 : 365);

/** The ISO 8601 weeks of a year: 53 when it starts on a Thursday, or is a leap year starting on a Wednesday. */
const isoWeeksOf = (y: number): number => {
  const start = weekdayOf(at(y, 1, 1));
  return start === THURSDAY || (isLeap(y) && start === THURSDAY - 1) ? 53 : 52;
};

/** The ISO week number of a date: the week of its Thursday, counted from that Thursday's year. */
const isoWeekOf = (date: CivilDate): number => {
  const thursday = addDays(date, THURSDAY - weekdayOf(date));
  return Math.floor(dayDelta(at(thursday.y, 1, 1), thursday) / 7) + 1;
};

/** Thanksgiving, the fourth Thursday of November (5 U.S.C. 6103). */
const thanksgivingOf = (y: number): CivilDate => {
  const first = 1 + ((THURSDAY - weekdayOf(at(y, 11, 1)) + 7) % 7);
  return at(y, 11, first + 21);
};

/** The day a federal holiday is observed: the Friday before a Saturday, the Monday after a Sunday. */
const observedOf = (date: CivilDate): CivilDate => {
  const weekday = weekdayOf(date);
  return weekday === 5 ? addDays(date, -1) : weekday === 6 ? addDays(date, 1) : date;
};

/** Whole calendar months from `from` to `to`, and the days past them. */
const monthsAndDaysOf = (from: CivilDate, to: CivilDate): { months: number; days: number } => {
  let months = (to.y - from.y) * 12 + to.m - from.m;
  if (to.d < from.d) months -= 1;
  return { months, days: dayDelta(addMonths(from, months), to) };
};

/** The lowest and highest days in `months` calendar months, from the 1st of each month of the year. */
const monthsSpanOf = (months: number): readonly [number, number] => {
  const spans = Array.from({ length: 12 }, (_, i) => {
    const start = at(CALENDAR_YEAR, i + 1, 1);
    return dayDelta(start, addMonths(start, months));
  });
  return [Math.min(...spans), Math.max(...spans)];
};

/** The 1st of each month of a year. */
const firstsOf = (y: number): readonly CivilDate[] =>
  Array.from({ length: 12 }, (_, i) => at(y, i + 1, 1));

/** The day after the last of a year: the end of a count through December 31. */
const endOf = (y: number): CivilDate => at(y + 1, 1, 1);

const WORDS = {
  en: {
    unit: {
      week: (count: number): string => `${n(count)} week${count === 1 ? '' : 's'}`,
      day: (count: number): string => `${n(count)} day${count === 1 ? '' : 's'}`,
      month: (count: number): string => `${n(count)} month${count === 1 ? '' : 's'}`,
    },
    and: ' and ',
    live: { week: 'week', weeks: 'weeks', day: 'day', days: 'days', and: ' and ' },
    to: 'to',
    full: (date: CivilDate): string => `${monthDayOf(date, 'en')}, ${String(date.y)}`,
    withYear: (date: CivilDate, from: number): string =>
      date.y === from ? monthDayOf(date, 'en') : `${monthDayOf(date, 'en')}, ${String(date.y)}`,
    weekdayDate: (date: CivilDate): string =>
      `${weekdayNameOf(weekdayOf(date), 'en')}, ${monthDayOf(date, 'en')}`,
    others: 'Other weeks questions',
    common: 'Weeks, months and years',
    edit: 'Count the hours between two times',
    note: 'Every figure on this page is calendar arithmetic: 7 days a week, the Gregorian calendar of 365 days and a leap day every 4 years, except century years not divisible by 400.',
    year: {
      h1: 'How many weeks are in a year?',
      headline: 'A year has 52 weeks and 1 day (52.14 weeks)',
      figureLabel: 'Weeks in a year of 365 days',
      lead: (thisIso: number): string =>
        `A year of 365 days has 52 weeks and 1 day, or 52.14 weeks: 365 divided by 7. A leap year of 366 days has 52 weeks and 2 days, or 52.29 weeks. ${String(THIS_YEAR)} is not a leap year, so it has 52 weeks and 1 day, and the ISO calendar numbers ${String(thisIso)} weeks in it.`,
      rows: {
        common: 'A year of 365 days',
        leap: 'A leap year of 366 days',
        average: 'The average year, 365.2425 days',
        iso: (y: number): string => `ISO weeks in ${String(y)}`,
        hours: 'Work hours, 40 a week for 52 weeks',
      },
      steps: [
        'A common year: 365 ÷ 7 = 52.142857… weeks. 52 whole weeks are 364 days (52 × 7), so 1 day is left.',
        'A leap year: 366 ÷ 7 = 52.285714… weeks, or 52 weeks and 2 days.',
        'The average year: 400 Gregorian years have 97 leap years, so 146,097 days. 146,097 ÷ 400 = 365.2425 days, and 365.2425 ÷ 7 = 52.1775 weeks.',
        'The day left over moves the calendar: a year ends on the weekday it began on (two weekdays on in a leap year), so the next year starts one weekday later, or two after a leap year.',
      ],
      yearsHeading: `Weeks in each year from ${String(YEARS[0])} to ${String(YEARS[YEARS.length - 1])}`,
      yearsIntro:
        'Each year with its days, its weeks and days, the weekday of January 1, the weeks the ISO calendar numbers and the Fridays it holds:',
      yearsCaption: 'Weeks, ISO weeks and Fridays by year',
      yearsHead: ['Year', 'Days', 'Weeks and days', 'January 1', 'ISO weeks', 'Fridays'],
      isoHeading: (y: number): string => `Why ${String(y)} has 53 weeks`,
      iso: (y: number, start: string, week1: string, week53: string, end53: string): string =>
        `The ISO 8601 calendar, used for week numbers in payroll and planning software, starts week 1 on the Monday of the week that holds the year's first Thursday. ${String(y)} starts on a ${start}, so its week 1 began on Monday, ${week1}, and its week 53 runs from Monday, ${week53}, to Sunday, ${end53}.`,
      isoRule: (years: string): string =>
        `A year has 53 ISO weeks when it starts on a Thursday, or when it is a leap year that starts on a Wednesday: in the table, ${years}. Every other year has 52.`,
      payHeading: 'A year of weekly and biweekly paydays',
      pay: (fridays: string, weekdays: string): string =>
        `A weekly payroll that pays every Friday has as many paydays as the year has Fridays: 52 in most years and 53 in ${fridays}. A biweekly payroll has 26 paydays, and 27 when its payday weekday comes 53 times and the first payday falls in the first week of January. A salary divided by 52 weekly checks is not the same check in a 53-payday year, which is why many employers divide by the paydays of the year. Counted Monday to Friday, ${weekdays}.`,
      weekdays: (pairs: string): string => pairs,
      hoursAfter:
        'The pay converters of this site use 52 weeks of 40 hours, 2,080 hours a year; the weekdays of a calendar year are 260 to 262, so 2,080 to 2,096 hours at 8 a day.',
      questions: (thisIso: number): readonly { question: string; answer: string }[] => [
        {
          question: 'Is a year 52 or 53 weeks?',
          answer: `A calendar year is 52 weeks and 1 or 2 days. It is 53 weeks only as ISO week numbers count it: ${String(THIS_YEAR)} has ${String(thisIso)} numbered weeks, ${String(THIS_YEAR + 1)} has ${String(isoWeeksOf(THIS_YEAR + 1))}.`,
        },
        {
          question: 'How many weeks are in a year without the weekends?',
          answer:
            'Still 52: taking out the weekends takes out days, not weeks. A year has 260 to 262 weekdays, or 52 workweeks of 5 days and 0 to 2 days more.',
        },
      ],
    },
    month: {
      h1: 'How many weeks are in a month?',
      headline: 'A month has 4.35 weeks on average (4 weeks and 2 to 3 days)',
      figureLabel: 'Weeks in an average month',
      lead: 'An average month has 4.35 weeks: 365.2425 days a year, divided by 12 months and by 7 days. Only February of a common year is exactly 4 weeks, 28 days; a 30-day month is 4 weeks and 2 days, and a 31-day month 4 weeks and 3 days.',
      rows: {
        feb: 'February, 28 days',
        leap: 'February of a leap year, 29 days',
        thirty: 'April, June, September, November, 30 days',
        thirtyOne: 'The seven 31-day months',
        payroll: 'Payroll weeks a month, 52 ÷ 12',
      },
      steps: [
        'An average month: 146,097 days in 400 years ÷ 4,800 months = 30.436875 days.',
        'In weeks: 30.436875 ÷ 7 = 4.348 weeks, written 4.35.',
        'A common year alone: 365 ÷ 12 = 30.42 days, and 30.42 ÷ 7 = 4.345 weeks.',
        'Payroll counts 52 weeks over 12 months: 52 ÷ 12 = 4.33 weeks a month, leaving out the 1 or 2 days a year has past 52 weeks.',
      ],
      monthsHeading: `Weeks and Fridays in each month of ${String(THIS_YEAR)} and ${String(THIS_YEAR + 1)}`,
      monthsIntro: `${String(THIS_YEAR)} and ${String(THIS_YEAR + 1)} are common years, so every month has the same days in both. A month has 4 or 5 Fridays, which is the number of paychecks a weekly Friday payroll pays in it:`,
      monthsCaption: `Weeks and Fridays by month, ${String(THIS_YEAR)} and ${String(THIS_YEAR + 1)}`,
      monthsHead: [
        'Month',
        'Days',
        'Weeks and days',
        'Weeks',
        `Fridays ${String(THIS_YEAR)}`,
        `Fridays ${String(THIS_YEAR + 1)}`,
      ],
      fives: (y: number, months: string): string =>
        `The months with 5 Fridays in ${String(y)}: ${months}.`,
      payHeading: 'Weekly pay to monthly pay',
      pay: 'A monthly figure from a weekly one multiplies by 52 and divides by 12, which is 4.33 weeks a month, not 4: $1,000 a week is $52,000 a year and $4,333.33 a month. Multiplying by 4 would leave out 4 weeks of the year. The same rule makes a 40-hour week 173.33 hours a month (40 × 52 ÷ 12).',
      payAfter:
        'A semimonthly payroll pays 24 checks a year, two a month; a biweekly one pays 26, so two months a year have a third check.',
      questions: [
        {
          question: 'Is a month 4 weeks?',
          answer:
            'Only February of a common year. Every other month is 4 weeks and 1 to 3 days, and 4 weeks is 28 days, 2 to 3 short of most months.',
        },
        {
          question: 'How many weeks are in 3 months?',
          answer: (span: string): string =>
            `3 months is ${span} days, 12 weeks and 5 days to 13 weeks and 1 day, or 13.04 weeks on average.`,
        },
      ],
    },
    monthsOfWeeks: {
      h1: (weeks: number): string => `How many months is ${n(weeks)} weeks?`,
      headline: (weeks: number, months: string, days: number): string =>
        `${n(weeks)} weeks is ${months} months (${n(days)} days)`,
      figureLabel: 'Average months of 30.44 days',
      lead: (weeks: number, months: string, days: number, whole: number, range: string): string =>
        `${n(weeks)} weeks is ${months} months on average: ${n(weeks)} × 7 = ${n(days)} days, divided by 30.44, the days of an average month. On the calendar it is ${n(whole)} months and ${range} days, depending on the month it starts in.`,
      rows: {
        days: 'Days',
        payroll: 'Months at 4.33 weeks (52 ÷ 12)',
        workdays: 'Workdays, Monday to Friday',
        hours: 'Work hours at 40 a week',
        clock: 'Hours on the clock',
      },
      steps: (weeks: number, days: number, exact: string, payroll: string): readonly string[] => [
        `Days: ${n(weeks)} × 7 = ${n(days)} days.`,
        `Average months: ${n(days)} ÷ 30.436875 = ${exact} months (146,097 days in 400 years over 4,800 months).`,
        `With the payroll month of 52 ÷ 12 = 4.33 weeks: ${n(weeks)} ÷ 4.33 = ${payroll} months.`,
        'On the calendar the months are not all the same length, so the table below counts from the 1st of each month.',
      ],
      calendarHeading: (weeks: number): string =>
        `${n(weeks)} weeks from the 1st of each month of ${String(CALENDAR_YEAR)}`,
      calendarIntro: (weeks: number, days: number): string =>
        `The date ${n(weeks)} weeks (${n(days)} days) after the 1st of each month, and the whole months and days in between:`,
      calendarCaption: (weeks: number): string => `${n(weeks)} weeks on the calendar`,
      calendarHead: ['Start', 'Date', 'Months and days'],
      compareHeading: (weeks: number, months: number): string =>
        `Is ${n(weeks)} weeks ${n(months)} months?`,
      compare: (
        weeks: number,
        days: number,
        months: number,
        low: number,
        high: number,
        diff: string,
      ): string =>
        `${n(months)} months on the calendar is ${n(low)} to ${n(high)} days, and ${n(weeks)} weeks is ${n(days)} days, so ${n(weeks)} weeks is ${diff}.`,
      shorter: (a: number, b: number): string =>
        a === b ? `${n(a)} day${a === 1 ? '' : 's'} shorter` : `${n(a)} to ${n(b)} days shorter`,
      longer: (a: number, b: number): string =>
        a === b ? `${n(a)} day${a === 1 ? '' : 's'} longer` : `${n(a)} to ${n(b)} days longer`,
      within: 'as long as some of them and not others',
      workHeading: (weeks: number): string => `${n(weeks)} weeks of work`,
      work: (weeks: number, workdays: number, hours: number, biweekly: string): string =>
        `${n(weeks)} weeks of full-time work are ${n(workdays)} workdays of 8 hours, ${n(hours)} hours at 40 a week, ${n(weeks)} weekly paychecks and ${biweekly} biweekly ones.`,
      fmla: 'Twelve weeks is also the leave of the Family and Medical Leave Act (FMLA): up to 12 workweeks of unpaid, job-protected leave in a 12-month period for an eligible employee, for the birth of a child, a serious health condition or the care of a family member, and up to 26 workweeks to care for a servicemember. The law counts workweeks, so 12 weeks of leave is the same 84 days on the calendar for a full-time schedule.',
    },
    weeksOfMonths: {
      h1: (months: number): string => `How many weeks is ${n(months)} months?`,
      headline: (months: number, weeks: string, low: number, high: number): string =>
        `${n(months)} months is ${weeks} weeks (${n(low)} to ${n(high)} days)`,
      figureLabel: 'Average weeks',
      lead: (months: number, weeks: string, low: number, high: number, a: string, b: string) =>
        `${n(months)} months is ${weeks} weeks on average: ${n(months)} average months of 30.44 days are 182.62 days, divided by 7. On the calendar ${n(months)} months is ${n(low)} to ${n(high)} days, which is ${a} to ${b}. The same question is asked as how many weeks are in ${n(months)} months.`,
      rows: {
        days: 'Days on the calendar',
        payroll: 'Weeks at 4.33 a month (52 ÷ 12)',
        weekly: 'Weekly paychecks',
        biweekly: 'Biweekly paychecks',
        hours: 'Work hours at 40 a week',
      },
      steps: (months: number, weeks: string): readonly string[] => [
        `Average days: ${n(months)} × 30.436875 = 182.62 days.`,
        `Average weeks: 182.62 ÷ 7 = ${weeks} weeks.`,
        `With the payroll month of 4.33 weeks: ${n(months)} × 52 ÷ 12 = 26 weeks exactly, half of 52.`,
        'On the calendar, 6 months that hold February are shorter than 6 that hold July and August, so the table counts from the 1st of each month.',
      ],
      calendarHeading: (months: number): string =>
        `${n(months)} months from the 1st of each month of ${String(CALENDAR_YEAR)}`,
      calendarIntro: (months: number): string =>
        `The date ${n(months)} months after the 1st of each month, the days in between and the weeks and days they make (${String(CALENDAR_YEAR + 1)} is a leap year, so a span that holds February 2028 has one day more):`,
      calendarCaption: (months: number): string => `${n(months)} months in weeks`,
      calendarHead: ['Start', 'Date', 'Days', 'Weeks and days'],
      workHeading: 'Half a year of work',
      work: 'Half a year of full-time work is 26 weeks of 40 hours, 1,040 hours: half of the 2,080 hours of a work year. It is 26 weekly paychecks, 13 biweekly ones, 12 semimonthly ones or 6 monthly ones.',
    },
    left: {
      h1: (y: number): string => `How many weeks are left in ${String(y)}?`,
      headline: (y: number): string =>
        `Weeks left in ${String(y)}, counted live from today to December 31`,
      figure: (y: number): string => `December 31, ${String(y)} − today`,
      figureLabel: 'Counted from your date',
      lead: (y: number, iso: number): string =>
        `The weeks left in ${String(y)} are the days from today through December 31, today included, divided by 7: the whole weeks and the days left over. ${String(y)} has 365 days, 52 weeks and 1 day, and ${String(iso)} ISO weeks; the table gives the weeks, workdays and Fridays left in the year from the 1st of each month.`,
      text: (y: number): string =>
        `Today is {today}, so ${String(y)} has {span} left, counting today: {total} days, or {decimal} weeks.`,
      past: (y: number, last: string): string =>
        `${String(y)} is over: its last day was ${last}. Today is {today}.`,
      fallback: (y: number): string =>
        `Count the days from today's date through December 31, ${String(y)}, today included, and divide by 7: the whole weeks and the days left over. All of ${String(y)} is 365 days, 52 weeks and 1 day.`,
      rows: {
        days: 'Days in the year',
        weeks: 'Weeks in the year',
        iso: 'ISO weeks',
        weekdays: 'Weekdays, Monday to Friday',
        fridays: 'Fridays',
        last: 'The last day',
      },
      steps: (y: number): readonly string[] => [
        `Days left: the days from today to January 1, ${String(y + 1)}, so today counts and December 31 is the last.`,
        'Weeks: the days ÷ 7, the whole weeks; the days over them are the remainder (days − weeks × 7).',
        `For instance, from November 1, ${String(y)}: 61 days, and 61 ÷ 7 = 8 weeks (56 days) and 5 days.`,
        'Workdays: the Mondays to Fridays among those days; holidays are not taken out.',
      ],
      monthsHeading: (y: number): string => `Weeks left in ${String(y)} from the 1st of each month`,
      monthsIntro: (y: number): string =>
        `From the 1st of each month of ${String(y)}, that day included: the days, the weeks and days, the weekdays and the Fridays left in the year, and the ISO week the day falls in:`,
      monthsCaption: (y: number): string => `What is left of ${String(y)}`,
      monthsHead: [
        'From',
        'Days left',
        'Weeks and days',
        'Weekdays left',
        'Fridays left',
        'ISO week',
      ],
      isoHeading: (y: number): string => `The weeks of ${String(y)} by number`,
      iso: (y: number, iso: number, start: string, end: string): string =>
        iso === 53
          ? `${String(y)} has 53 ISO weeks because it starts on a Thursday: week 53 runs from Monday, ${start}, to Sunday, ${end}, so the last days of the year are in week 53 and the first days of ${String(y + 1)} too.`
          : `${String(y)} has 52 ISO weeks; the last one ends on Sunday, ${end}.`,
      endHeading: (y: number): string => `The end of ${String(y)}`,
      end: (y: number, thanksgiving: string, christmas: string, last: string): string =>
        `Thanksgiving is ${thanksgiving}, Christmas ${christmas}, and the last day of the year ${last}. Christmas and New Year's Day are both federal holidays, so the last two weeks of ${String(y)} each have one weekday off for federal workers.`,
    },
    christmas: {
      h1: 'How many weeks until Christmas?',
      headline: 'Weeks until Christmas, counted live from today to December 25',
      figure: 'December 25 − today',
      figureLabel: 'Counted from your date',
      lead: (weekday: string): string =>
        `The weeks until Christmas are the days from today to December 25, divided by 7: the whole weeks and the days left over. Christmas ${String(THIS_YEAR)} falls on a ${weekday}; the tables give the weeks from the 1st of each month and the weekday of Christmas each year.`,
      text: 'Today is {today}, so Christmas, {date}, is {span} away: {total} days, or {decimal} weeks.',
      today: 'Today is Christmas, {date}. Merry Christmas!',
      fallback:
        'Count the days from today’s date to December 25, and divide by 7: the whole weeks and the days left over. Once December 25 has passed, count to next year’s.',
      rows: {
        christmas: (y: number): string => `Christmas ${String(y)}`,
        observed: (y: number): string => `Federal holiday, ${String(y)}`,
        gap: (y: number): string => `Thanksgiving to Christmas, ${String(y)}`,
        year: (y: number): string => `From January 1, ${String(y)}`,
      },
      steps: [
        'Days until Christmas: the days from today to December 25; once it has passed, to next year’s.',
        'Weeks: the days ÷ 7, the whole weeks; the days over them are the remainder.',
        `For instance, from December 1, ${String(THIS_YEAR)}: 24 days, and 24 ÷ 7 = 3 weeks (21 days) and 3 days.`,
        'Thanksgiving falls between November 22 and 28, so Christmas comes 27 to 33 days after it: 3 weeks and 6 days to 4 weeks and 5 days of holiday season.',
      ],
      yearsHeading: 'Christmas, Thanksgiving and the federal holiday each year',
      yearsIntro:
        'The weekday Christmas falls on, the day the federal holiday is observed when it falls on a weekend, Thanksgiving (the fourth Thursday of November) and the weeks between the two:',
      yearsCaption: 'Christmas by year',
      yearsHead: [
        'Year',
        'Christmas',
        'Federal holiday',
        'Thanksgiving',
        'Thanksgiving to Christmas',
      ],
      monthsHeading: `Weeks until Christmas ${String(THIS_YEAR)} from the 1st of each month`,
      monthsIntro: `From the 1st of each month of ${String(THIS_YEAR)} to Friday, December 25:`,
      monthsCaption: `Weeks until Christmas ${String(THIS_YEAR)}`,
      monthsHead: ['From', 'Days', 'Weeks and days'],
      payHeading: 'Christmas at work',
      pay: 'Christmas Day, December 25, is a federal holiday (5 U.S.C. 6103). When it falls on a Saturday, federal workers have the Friday before off, and when it falls on a Sunday, the Monday after (OPM). Private employers follow their own policy: federal law, the FLSA, does not require paid holidays or extra pay for working on one, so time and a half on Christmas is a company or union rule, not a federal one (DOL).',
    },
  },
  es: {
    unit: {
      week: (count: number): string => `${n(count)} semana${count === 1 ? '' : 's'}`,
      day: (count: number): string => `${n(count)} día${count === 1 ? '' : 's'}`,
      month: (count: number): string => `${n(count)} mes${count === 1 ? '' : 'es'}`,
    },
    and: ' y ',
    live: { week: 'semana', weeks: 'semanas', day: 'día', days: 'días', and: ' y ' },
    to: 'a',
    full: (date: CivilDate): string => `${monthDayOf(date, 'es')} de ${String(date.y)}`,
    withYear: (date: CivilDate, from: number): string =>
      date.y === from ? monthDayOf(date, 'es') : `${monthDayOf(date, 'es')} de ${String(date.y)}`,
    weekdayDate: (date: CivilDate): string =>
      `${weekdayNameOf(weekdayOf(date), 'es')} ${monthDayOf(date, 'es')}`,
    others: 'Otras preguntas de semanas',
    common: 'Semanas, meses y años',
    edit: 'Cuenta las horas entre dos horas del día',
    note: 'Cada cifra de esta página es aritmética del calendario: 7 días por semana, el calendario gregoriano de 365 días y un día bisiesto cada 4 años, salvo los años de siglo que no son divisibles por 400.',
    year: {
      h1: '¿Cuántas semanas tiene un año?',
      headline: 'Un año tiene 52 semanas y 1 día (52.14 semanas)',
      figureLabel: 'Semanas de un año de 365 días',
      lead: (thisIso: number): string =>
        `Un año de 365 días tiene 52 semanas y 1 día, o 52.14 semanas: 365 dividido por 7. Un año bisiesto de 366 días tiene 52 semanas y 2 días, o 52.29 semanas. ${String(THIS_YEAR)} no es bisiesto, así que tiene 52 semanas y 1 día, y el calendario ISO numera ${String(thisIso)} semanas en él.`,
      rows: {
        common: 'Un año de 365 días',
        leap: 'Un año bisiesto de 366 días',
        average: 'El año promedio, 365.2425 días',
        iso: (y: number): string => `Semanas ISO de ${String(y)}`,
        hours: 'Horas de trabajo, 40 por semana durante 52 semanas',
      },
      steps: [
        'Un año común: 365 ÷ 7 = 52.142857… semanas. 52 semanas enteras son 364 días (52 × 7), así que sobra 1 día.',
        'Un año bisiesto: 366 ÷ 7 = 52.285714… semanas, o 52 semanas y 2 días.',
        'El año promedio: 400 años gregorianos tienen 97 bisiestos, o sea 146,097 días. 146,097 ÷ 400 = 365.2425 días, y 365.2425 ÷ 7 = 52.1775 semanas.',
        'El día que sobra mueve el calendario: un año termina en el mismo día de la semana en que empezó (dos días después si es bisiesto), así que el año siguiente empieza un día de la semana más tarde, o dos después de un bisiesto.',
      ],
      yearsHeading: `Semanas de cada año de ${String(YEARS[0])} a ${String(YEARS[YEARS.length - 1])}`,
      yearsIntro:
        'Cada año con sus días, sus semanas y días, el día de la semana del 1 de enero, las semanas que numera el calendario ISO y los viernes que tiene:',
      yearsCaption: 'Semanas, semanas ISO y viernes por año',
      yearsHead: ['Año', 'Días', 'Semanas y días', '1 de enero', 'Semanas ISO', 'Viernes'],
      isoHeading: (y: number): string => `Por qué ${String(y)} tiene 53 semanas`,
      iso: (y: number, start: string, week1: string, week53: string, end53: string): string =>
        `El calendario ISO 8601, el de los números de semana en los sistemas de nómina y de planificación, empieza la semana 1 el lunes de la semana que tiene el primer jueves del año. ${String(y)} empieza en ${start}, así que su semana 1 empezó el lunes ${week1}, y su semana 53 va del lunes ${week53} al domingo ${end53}.`,
      isoRule: (years: string): string =>
        `Un año tiene 53 semanas ISO cuando empieza en jueves, o cuando es bisiesto y empieza en miércoles: en la tabla, ${years}. Todos los demás tienen 52.`,
      payHeading: 'Un año de pagos semanales y quincenales',
      pay: (fridays: string, weekdays: string): string =>
        `Una nómina semanal que paga cada viernes tiene tantos días de pago como viernes tiene el año: 52 casi todos los años y 53 en ${fridays}. Una nómina cada dos semanas tiene 26 pagos, y 27 cuando su día de pago se repite 53 veces y el primer pago cae en la primera semana de enero. Un sueldo dividido en 52 cheques semanales no da el mismo cheque en un año de 53 pagos, y por eso muchos empleadores dividen por los pagos del año. Contados de lunes a viernes, ${weekdays}.`,
      weekdays: (pairs: string): string => pairs,
      hoursAfter:
        'Los conversores de pago de este sitio usan 52 semanas de 40 horas, 2,080 horas al año; los días hábiles de un año de calendario son de 260 a 262, o sea de 2,080 a 2,096 horas a 8 por día.',
      questions: (thisIso: number): readonly { question: string; answer: string }[] => [
        {
          question: '¿Un año tiene 52 o 53 semanas?',
          answer: `Un año de calendario tiene 52 semanas y 1 o 2 días. Tiene 53 semanas solo como las cuentan los números de semana ISO: ${String(THIS_YEAR)} tiene ${String(thisIso)} semanas numeradas, ${String(THIS_YEAR + 1)} tiene ${String(isoWeeksOf(THIS_YEAR + 1))}.`,
        },
        {
          question: '¿Cuántas semanas tiene un año sin los fines de semana?',
          answer:
            'Siguen siendo 52: quitar los fines de semana quita días, no semanas. Un año tiene de 260 a 262 días hábiles, o 52 semanas laborales de 5 días y de 0 a 2 días más.',
        },
      ],
    },
    month: {
      h1: '¿Cuántas semanas tiene un mes?',
      headline: 'Un mes tiene 4.35 semanas en promedio (4 semanas y 2 o 3 días)',
      figureLabel: 'Semanas de un mes promedio',
      lead: 'Un mes promedio tiene 4.35 semanas: 365.2425 días al año, divididos en 12 meses y por 7 días. Solo febrero de un año común tiene 4 semanas exactas, 28 días; un mes de 30 días tiene 4 semanas y 2 días, y uno de 31 días, 4 semanas y 3 días.',
      rows: {
        feb: 'Febrero, 28 días',
        leap: 'Febrero de un año bisiesto, 29 días',
        thirty: 'Abril, junio, septiembre, noviembre, 30 días',
        thirtyOne: 'Los siete meses de 31 días',
        payroll: 'Semanas por mes de nómina, 52 ÷ 12',
      },
      steps: [
        'Un mes promedio: 146,097 días en 400 años ÷ 4,800 meses = 30.436875 días.',
        'En semanas: 30.436875 ÷ 7 = 4.348 semanas, o 4.35.',
        'Solo un año común: 365 ÷ 12 = 30.42 días, y 30.42 ÷ 7 = 4.345 semanas.',
        'La nómina cuenta 52 semanas en 12 meses: 52 ÷ 12 = 4.33 semanas por mes, sin el día o los dos días que tiene el año además de 52 semanas.',
      ],
      monthsHeading: `Semanas y viernes de cada mes de ${String(THIS_YEAR)} y ${String(THIS_YEAR + 1)}`,
      monthsIntro: `${String(THIS_YEAR)} y ${String(THIS_YEAR + 1)} son años comunes, así que cada mes tiene los mismos días en los dos. Un mes tiene 4 o 5 viernes, que son los cheques que paga en él una nómina semanal de los viernes:`,
      monthsCaption: `Semanas y viernes por mes, ${String(THIS_YEAR)} y ${String(THIS_YEAR + 1)}`,
      monthsHead: [
        'Mes',
        'Días',
        'Semanas y días',
        'Semanas',
        `Viernes ${String(THIS_YEAR)}`,
        `Viernes ${String(THIS_YEAR + 1)}`,
      ],
      fives: (y: number, months: string): string =>
        `Los meses con 5 viernes en ${String(y)}: ${months}.`,
      payHeading: 'De pago semanal a pago mensual',
      pay: 'Una cifra mensual a partir de una semanal se multiplica por 52 y se divide por 12, o sea 4.33 semanas por mes, no 4: $1,000 por semana son $52,000 al año y $4,333.33 al mes. Multiplicar por 4 dejaría fuera 4 semanas del año. La misma regla hace de una semana de 40 horas 173.33 horas al mes (40 × 52 ÷ 12).',
      payAfter:
        'Una nómina quincenal paga 24 cheques al año, dos por mes; una cada dos semanas paga 26, así que dos meses al año tienen un tercer cheque.',
      questions: [
        {
          question: '¿Un mes tiene 4 semanas?',
          answer:
            'Solo febrero de un año común. Todos los demás meses tienen 4 semanas y de 1 a 3 días, y 4 semanas son 28 días, de 2 a 3 menos que la mayoría de los meses.',
        },
        {
          question: '¿Cuántas semanas son 3 meses?',
          answer: (span: string): string =>
            `3 meses son ${span} días, de 12 semanas y 5 días a 13 semanas y 1 día, o 13.04 semanas en promedio.`,
        },
      ],
    },
    monthsOfWeeks: {
      h1: (weeks: number): string => `¿Cuántos meses son ${n(weeks)} semanas?`,
      headline: (weeks: number, months: string, days: number): string =>
        `${n(weeks)} semanas son ${months} meses (${n(days)} días)`,
      figureLabel: 'Meses promedio de 30.44 días',
      lead: (weeks: number, months: string, days: number, whole: number, range: string): string =>
        `${n(weeks)} semanas son ${months} meses en promedio: ${n(weeks)} × 7 = ${n(days)} días, divididos por 30.44, los días de un mes promedio. En el calendario son ${n(whole)} meses y ${range} días, según el mes en que empiecen.`,
      rows: {
        days: 'Días',
        payroll: 'Meses de 4.33 semanas (52 ÷ 12)',
        workdays: 'Días hábiles, de lunes a viernes',
        hours: 'Horas de trabajo a 40 por semana',
        clock: 'Horas de reloj',
      },
      steps: (weeks: number, days: number, exact: string, payroll: string): readonly string[] => [
        `Días: ${n(weeks)} × 7 = ${n(days)} días.`,
        `Meses promedio: ${n(days)} ÷ 30.436875 = ${exact} meses (146,097 días en 400 años entre 4,800 meses).`,
        `Con el mes de nómina de 52 ÷ 12 = 4.33 semanas: ${n(weeks)} ÷ 4.33 = ${payroll} meses.`,
        'En el calendario los meses no tienen todos el mismo largo, así que la tabla cuenta desde el día 1 de cada mes.',
      ],
      calendarHeading: (weeks: number): string =>
        `${n(weeks)} semanas desde el día 1 de cada mes de ${String(CALENDAR_YEAR)}`,
      calendarIntro: (weeks: number, days: number): string =>
        `La fecha ${n(weeks)} semanas (${n(days)} días) después del día 1 de cada mes, y los meses enteros y días que hay entre las dos:`,
      calendarCaption: (weeks: number): string => `${n(weeks)} semanas en el calendario`,
      calendarHead: ['Inicio', 'Fecha', 'Meses y días'],
      compareHeading: (weeks: number, months: number): string =>
        `¿${n(weeks)} semanas son ${n(months)} meses?`,
      compare: (
        weeks: number,
        days: number,
        months: number,
        low: number,
        high: number,
        diff: string,
      ): string =>
        `${n(months)} meses en el calendario son de ${n(low)} a ${n(high)} días, y ${n(weeks)} semanas son ${n(days)} días, así que ${n(weeks)} semanas son ${diff}.`,
      shorter: (a: number, b: number): string =>
        a === b ? `${n(a)} día${a === 1 ? '' : 's'} menos` : `de ${n(a)} a ${n(b)} días menos`,
      longer: (a: number, b: number): string =>
        a === b ? `${n(a)} día${a === 1 ? '' : 's'} más` : `de ${n(a)} a ${n(b)} días más`,
      within: 'tanto como algunos de ellos y no como otros',
      workHeading: (weeks: number): string => `${n(weeks)} semanas de trabajo`,
      work: (weeks: number, workdays: number, hours: number, biweekly: string): string =>
        `${n(weeks)} semanas de trabajo de tiempo completo son ${n(workdays)} jornadas de 8 horas, ${n(hours)} horas a 40 por semana, ${n(weeks)} cheques semanales y ${biweekly} cheques cada dos semanas.`,
      fmla: 'En EE. UU., doce semanas es también la licencia de la Ley de Licencia Familiar y Médica (FMLA): hasta 12 semanas laborales de licencia sin goce de sueldo y con el puesto protegido en un período de 12 meses para un empleado que califica, por el nacimiento de un hijo, una condición de salud grave o el cuidado de un familiar, y hasta 26 semanas laborales para cuidar a un miembro de las fuerzas armadas. La ley cuenta semanas laborales, así que 12 semanas de licencia son los mismos 84 días de calendario con un horario de tiempo completo.',
    },
    weeksOfMonths: {
      h1: (months: number): string => `¿Cuántas semanas son ${n(months)} meses?`,
      headline: (months: number, weeks: string, low: number, high: number): string =>
        `${n(months)} meses son ${weeks} semanas (de ${n(low)} a ${n(high)} días)`,
      figureLabel: 'Semanas promedio',
      lead: (months: number, weeks: string, low: number, high: number, a: string, b: string) =>
        `${n(months)} meses son ${weeks} semanas en promedio: ${n(months)} meses promedio de 30.44 días son 182.62 días, divididos por 7. En el calendario ${n(months)} meses son de ${n(low)} a ${n(high)} días, o sea de ${a} a ${b}. La misma pregunta se hace como cuántas semanas tienen ${n(months)} meses.`,
      rows: {
        days: 'Días de calendario',
        payroll: 'Semanas a 4.33 por mes (52 ÷ 12)',
        weekly: 'Cheques semanales',
        biweekly: 'Cheques cada dos semanas',
        hours: 'Horas de trabajo a 40 por semana',
      },
      steps: (months: number, weeks: string): readonly string[] => [
        `Días promedio: ${n(months)} × 30.436875 = 182.62 días.`,
        `Semanas promedio: 182.62 ÷ 7 = ${weeks} semanas.`,
        `Con el mes de nómina de 4.33 semanas: ${n(months)} × 52 ÷ 12 = 26 semanas exactas, la mitad de 52.`,
        'En el calendario, 6 meses que incluyen febrero son más cortos que 6 que incluyen julio y agosto, así que la tabla cuenta desde el día 1 de cada mes.',
      ],
      calendarHeading: (months: number): string =>
        `${n(months)} meses desde el día 1 de cada mes de ${String(CALENDAR_YEAR)}`,
      calendarIntro: (months: number): string =>
        `La fecha ${n(months)} meses después del día 1 de cada mes, los días entre las dos y las semanas y días que suman (${String(CALENDAR_YEAR + 1)} es bisiesto, así que un período que incluye febrero de 2028 tiene un día más):`,
      calendarCaption: (months: number): string => `${n(months)} meses en semanas`,
      calendarHead: ['Inicio', 'Fecha', 'Días', 'Semanas y días'],
      workHeading: 'Medio año de trabajo',
      work: 'Medio año de trabajo de tiempo completo son 26 semanas de 40 horas, 1,040 horas: la mitad de las 2,080 horas de un año de trabajo. Son 26 cheques semanales, 13 cada dos semanas, 12 quincenales o 6 mensuales.',
    },
    left: {
      h1: (y: number): string => `¿Cuántas semanas quedan en ${String(y)}?`,
      headline: (y: number): string =>
        `Semanas que quedan en ${String(y)}, contadas en vivo hasta el 31 de diciembre`,
      figure: (y: number): string => `31 de diciembre de ${String(y)} − hoy`,
      figureLabel: 'Contado desde tu fecha',
      lead: (y: number, iso: number): string =>
        `Las semanas que quedan en ${String(y)} son los días de hoy al 31 de diciembre, contando hoy, divididos por 7: las semanas enteras y los días que sobran. ${String(y)} tiene 365 días, 52 semanas y 1 día, y ${String(iso)} semanas ISO; la tabla da las semanas, los días hábiles y los viernes que quedan en el año desde el día 1 de cada mes.`,
      text: (y: number): string =>
        `Hoy es {today}, así que a ${String(y)} le quedan {span}, contando hoy: {total} días, o {decimal} semanas.`,
      past: (y: number, last: string): string =>
        `${String(y)} ya terminó: su último día fue el ${last}. Hoy es {today}.`,
      fallback: (y: number): string =>
        `Cuenta los días desde la fecha de hoy hasta el 31 de diciembre de ${String(y)}, contando hoy, y divide por 7: las semanas enteras y los días que sobran. Todo ${String(y)} son 365 días, 52 semanas y 1 día.`,
      rows: {
        days: 'Días del año',
        weeks: 'Semanas del año',
        iso: 'Semanas ISO',
        weekdays: 'Días hábiles, de lunes a viernes',
        fridays: 'Viernes',
        last: 'El último día',
      },
      steps: (y: number): readonly string[] => [
        `Días que quedan: los días de hoy al 1 de enero de ${String(y + 1)}, así que hoy cuenta y el 31 de diciembre es el último.`,
        'Semanas: los días ÷ 7, las semanas enteras; los días que sobran son el resto (días − semanas × 7).',
        `Por ejemplo, desde el 1 de noviembre de ${String(y)}: 61 días, y 61 ÷ 7 = 8 semanas (56 días) y 5 días.`,
        'Días hábiles: los lunes a viernes entre esos días; no se descuentan los feriados.',
      ],
      monthsHeading: (y: number): string =>
        `Semanas que quedan en ${String(y)} desde el día 1 de cada mes`,
      monthsIntro: (y: number): string =>
        `Desde el día 1 de cada mes de ${String(y)}, ese día incluido: los días, las semanas y días, los días hábiles y los viernes que quedan en el año, y la semana ISO en que cae ese día:`,
      monthsCaption: (y: number): string => `Lo que queda de ${String(y)}`,
      monthsHead: [
        'Desde',
        'Días que quedan',
        'Semanas y días',
        'Días hábiles',
        'Viernes',
        'Semana ISO',
      ],
      isoHeading: (y: number): string => `Las semanas de ${String(y)} por número`,
      iso: (y: number, iso: number, start: string, end: string): string =>
        iso === 53
          ? `${String(y)} tiene 53 semanas ISO porque empieza en jueves: la semana 53 va del lunes ${start} al domingo ${end}, así que los últimos días del año y los primeros de ${String(y + 1)} están en la semana 53.`
          : `${String(y)} tiene 52 semanas ISO; la última termina el domingo ${end}.`,
      endHeading: (y: number): string => `El final de ${String(y)}`,
      end: (y: number, thanksgiving: string, christmas: string, last: string): string =>
        `En EE. UU., el Día de Acción de Gracias es el ${thanksgiving}, Navidad el ${christmas} y el último día del año el ${last}. Navidad y Año Nuevo son feriados federales, así que las dos últimas semanas de ${String(y)} tienen cada una un día hábil libre para los trabajadores federales.`,
    },
    christmas: {
      h1: '¿Cuántas semanas faltan para Navidad?',
      headline: 'Semanas que faltan para Navidad, en vivo de hoy al 25 de diciembre',
      figure: '25 de diciembre − hoy',
      figureLabel: 'Contado desde tu fecha',
      lead: (weekday: string): string =>
        `Las semanas que faltan para Navidad son los días de hoy al 25 de diciembre, divididos por 7: las semanas enteras y los días que sobran. La Navidad de ${String(THIS_YEAR)} cae en ${weekday}; las tablas dan las semanas desde el día 1 de cada mes y el día de la semana de Navidad cada año.`,
      text: 'Hoy es {today}, así que para Navidad, el {date}, faltan {span}: {total} días, o {decimal} semanas.',
      today: 'Hoy es Navidad, {date}. ¡Feliz Navidad!',
      fallback:
        'Cuenta los días desde la fecha de hoy hasta el 25 de diciembre y divide por 7: las semanas enteras y los días que sobran. Si el 25 de diciembre ya pasó, cuenta hasta el del año siguiente.',
      rows: {
        christmas: (y: number): string => `Navidad de ${String(y)}`,
        observed: (y: number): string => `Feriado federal de EE. UU., ${String(y)}`,
        gap: (y: number): string => `De Acción de Gracias a Navidad, ${String(y)}`,
        year: (y: number): string => `Desde el 1 de enero de ${String(y)}`,
      },
      steps: [
        'Días que faltan para Navidad: los días de hoy al 25 de diciembre; si ya pasó, al del año siguiente.',
        'Semanas: los días ÷ 7, las semanas enteras; los días que sobran son el resto.',
        `Por ejemplo, desde el 1 de diciembre de ${String(THIS_YEAR)}: 24 días, y 24 ÷ 7 = 3 semanas (21 días) y 3 días.`,
        'En EE. UU., el Día de Acción de Gracias cae entre el 22 y el 28 de noviembre, así que Navidad llega de 27 a 33 días después: de 3 semanas y 6 días a 4 semanas y 5 días de temporada navideña.',
      ],
      yearsHeading: 'Navidad, Acción de Gracias y el feriado federal de EE. UU. cada año',
      yearsIntro:
        'El día de la semana en que cae Navidad, el día en que se observa el feriado federal de EE. UU. cuando cae en fin de semana, el Día de Acción de Gracias (el cuarto jueves de noviembre) y las semanas entre los dos:',
      yearsCaption: 'Navidad por año',
      yearsHead: [
        'Año',
        'Navidad',
        'Feriado federal',
        'Acción de Gracias',
        'De Acción de Gracias a Navidad',
      ],
      monthsHeading: `Semanas que faltan para la Navidad de ${String(THIS_YEAR)} desde el día 1 de cada mes`,
      monthsIntro: `Desde el día 1 de cada mes de ${String(THIS_YEAR)} hasta el viernes 25 de diciembre:`,
      monthsCaption: `Semanas que faltan para la Navidad de ${String(THIS_YEAR)}`,
      monthsHead: ['Desde', 'Días', 'Semanas y días'],
      payHeading: 'Navidad en el trabajo en EE. UU.',
      pay: 'En EE. UU., el 25 de diciembre es feriado federal (5 U.S.C. 6103). Cuando cae en sábado, los trabajadores federales descansan el viernes anterior, y cuando cae en domingo, el lunes siguiente (OPM). Los empleadores privados siguen su propia política: la ley federal, la FLSA, no exige feriados pagados ni un pago extra por trabajar en uno, así que el tiempo y medio en Navidad es una regla de la empresa o del sindicato, no federal (DOL).',
      countdown:
        'Para los días que faltan, con el descanso obligatorio en México y la fiesta nacional en España:',
    },
  },
} as const;

/** The Christmas sources: the holiday law, OPM's observance rule and DOL's holiday pay page. */
const CHRISTMAS_SOURCES: readonly LongTailSource[] = [
  {
    label: '5 U.S.C. 6103, Holidays (Legal Information Institute, Cornell Law School)',
    href: 'https://www.law.cornell.edu/uscode/text/5/6103',
  },
  {
    label: 'U.S. Office of Personnel Management, Federal Holidays',
    href: 'https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/',
  },
  {
    label: 'U.S. Department of Labor, Holiday Pay',
    href: 'https://www.dol.gov/general/topic/workhours/holidays',
  },
];

const FMLA_SOURCE: LongTailSource = {
  label: 'U.S. Department of Labor, Family and Medical Leave Act',
  href: 'https://www.dol.gov/agencies/whd/fmla',
};

type Words = (typeof WORDS)[Lang];

/** `days` as weeks and days, the zero part left out: `52 weeks and 1 day`, `4 weeks`. */
const spanOf = (days: number, lang: Lang): string => {
  const { unit, and } = WORDS[lang];
  const weeks = Math.floor(days / 7);
  const rest = days % 7;
  if (weeks === 0) return unit.day(rest);
  return rest === 0 ? unit.week(weeks) : `${unit.week(weeks)}${and}${unit.day(rest)}`;
};

/** Months and days, the zero days left out: `2 months and 25 days`, `6 months`. */
const monthsDaysText = ({ months, days }: { months: number; days: number }, lang: Lang): string => {
  const { unit, and } = WORDS[lang];
  return days === 0 ? unit.month(months) : `${unit.month(months)}${and}${unit.day(days)}`;
};

/** A list in a language: `a, b and c`, `a, b y c`. */
const listOf = (parts: readonly string[], lang: Lang): string =>
  parts.length <= 1
    ? (parts[0] ?? '')
    : `${parts.slice(0, -1).join(', ')}${WORDS[lang].and}${parts[parts.length - 1] ?? ''}`;

const range = (low: number, high: number, w: Words): string =>
  low === high ? n(low) : `${n(low)} ${w.to} ${n(high)}`;

const questionOf = (job: Weeks, lang: Lang): string => {
  const w = WORDS[lang];
  switch (job.topic) {
    case 'year':
      return w.year.h1;
    case 'month':
      return w.month.h1;
    case 'months-of-weeks':
      return w.monthsOfWeeks.h1(job.amount);
    case 'weeks-of-months':
      return w.weeksOfMonths.h1(job.amount);
    case 'left-in-year':
      return w.left.h1(job.amount);
    case 'until-christmas':
      return w.christmas.h1;
  }
};

/** The weeks pages as links: every one on the hours calculator, on a weeks page (`except`) its nearest. */
export const weeksLinksOf = (lang: Lang, except?: Weeks): CommonLinks => {
  const w = WORDS[lang];
  const listed = except === undefined ? WEEKS : nearestOf(WEEKS, except);
  return {
    heading: except === undefined ? w.common : w.others,
    links: listed.map((job) => ({ href: pathOf(job, lang), label: questionOf(job, lang) })),
  };
};

/** What every weeks page shares: the kicker, the calculator, the note, the paths and the links. */
const frameOf = (job: Weeks, lang: Lang) => {
  const w = WORDS[lang];
  return {
    kicker: HOURS_TEXTS[lang].kicker,
    h1: questionOf(job, lang),
    calculator: { href: HOURS_PATHS[lang], label: w.edit, title: HOURS_TEXTS[lang].title },
    note: w.note,
    paths: { en: pathOf(job, 'en'), es: pathOf(job, 'es') },
    others: weeksLinksOf(lang, job),
  };
};

const yearPageOf = (job: Weeks, lang: Lang): LongTailPage => {
  const w = WORDS[lang];
  const t = w.year;
  const thisIso = isoWeeksOf(THIS_YEAR);
  const rows = [
    { key: 'common', label: t.rows.common, value: `${spanOf(365, lang)} (52.14)` },
    { key: 'leap', label: t.rows.leap, value: `${spanOf(366, lang)} (52.29)` },
    { key: 'average', label: t.rows.average, value: ratio(CYCLE_DAYS, 2800) },
    { key: 'iso', label: t.rows.iso(THIS_YEAR), value: String(thisIso) },
    { key: 'iso-next', label: t.rows.iso(THIS_YEAR + 1), value: String(isoWeeksOf(THIS_YEAR + 1)) },
    { key: 'hours', label: t.rows.hours, value: n(40 * 52) },
  ];
  const fridaysOf = (y: number): number => countOf(at(y, 1, 1), daysOfYear(y), FRIDAY);
  const isoYears = YEARS.filter((y) => isoWeeksOf(y) === 53).map(String);
  const fridayYears = YEARS.filter((y) => fridaysOf(y) === 53).map(String);
  const workdays = [THIS_YEAR, THIS_YEAR + 1, THIS_YEAR + 2].map(
    (y) =>
      `${String(y)} ${lang === 'en' ? 'has' : 'tiene'} ${n(weekdaysOf(at(y, 1, 1), daysOfYear(y)))}`,
  );
  // the 53-week year this page is about: the current one, or the next that has 53
  const isoYear = YEARS.find((y) => y >= THIS_YEAR && isoWeeksOf(y) === 53) ?? THIS_YEAR;
  const week1 = addDays(at(isoYear, 1, 1), -weekdayOf(at(isoYear, 1, 1)));
  const week53 = addDays(week1, 52 * 7);
  const sections: LongTailSection[] = [
    { id: 'worked', heading: WORKED[lang], paragraphs: [], steps: t.steps },
    {
      id: 'years',
      heading: t.yearsHeading,
      paragraphs: [t.yearsIntro],
      table: {
        caption: t.yearsCaption,
        head: t.yearsHead,
        rows: YEARS.map((y) => [
          String(y),
          String(daysOfYear(y)),
          spanOf(daysOfYear(y), lang),
          weekdayNameOf(weekdayOf(at(y, 1, 1)), lang),
          String(isoWeeksOf(y)),
          String(fridaysOf(y)),
        ]),
      },
      after: [t.isoRule(listOf(isoYears, lang))],
    },
    {
      id: 'iso',
      heading: t.isoHeading(isoYear),
      paragraphs: [
        t.iso(
          isoYear,
          weekdayNameOf(weekdayOf(at(isoYear, 1, 1)), lang),
          w.full(week1),
          w.full(week53),
          w.full(addDays(week53, 6)),
        ),
      ],
    },
    {
      id: 'pay',
      heading: t.payHeading,
      paragraphs: [t.pay(listOf(fridayYears, lang), listOf(workdays, lang)), t.hoursAfter],
      questions: t.questions(thisIso),
    },
  ];
  return {
    ...frameOf(job, lang),
    title: titleOf(t.headline),
    description: descriptionOf(t.lead(thisIso)),
    lead: t.lead(thisIso),
    figure: ratio(365, 7),
    figureLabel: t.figureLabel,
    breakdown: t.figureLabel,
    rows,
    sections,
  };
};

const monthPageOf = (job: Weeks, lang: Lang): LongTailPage => {
  const w = WORDS[lang];
  const t = w.month;
  const fridaysIn = (y: number, m: number): number =>
    countOf(at(y, m, 1), daysInMonth(y, m), FRIDAY);
  const fives = (y: number): string =>
    listOf(
      Array.from({ length: 12 }, (_, i) => i + 1)
        .filter((m) => fridaysIn(y, m) === 5)
        .map((m) => monthNameOf(m, lang)),
      lang,
    );
  const [low3, high3] = monthsSpanOf(3);
  const [faq1, faq2] = t.questions;
  const rows = [
    { key: 'feb', label: t.rows.feb, value: spanOf(28, lang) },
    { key: 'leap', label: t.rows.leap, value: spanOf(29, lang) },
    { key: 'thirty', label: t.rows.thirty, value: `${spanOf(30, lang)} (${ratio(30, 7)})` },
    { key: 'thirty-one', label: t.rows.thirtyOne, value: `${spanOf(31, lang)} (${ratio(31, 7)})` },
    { key: 'payroll', label: t.rows.payroll, value: ratio(52, 12) },
  ];
  const sections: LongTailSection[] = [
    { id: 'worked', heading: WORKED[lang], paragraphs: [], steps: t.steps },
    {
      id: 'months',
      heading: t.monthsHeading,
      paragraphs: [t.monthsIntro],
      table: {
        caption: t.monthsCaption,
        head: t.monthsHead,
        rows: Array.from({ length: 12 }, (_, i) => {
          const m = i + 1;
          const days = daysInMonth(THIS_YEAR, m);
          return [
            monthNameOf(m, lang),
            String(days),
            spanOf(days, lang),
            ratio(days, 7),
            String(fridaysIn(THIS_YEAR, m)),
            String(fridaysIn(THIS_YEAR + 1, m)),
          ];
        }),
      },
      after: [t.fives(THIS_YEAR, fives(THIS_YEAR)), t.fives(THIS_YEAR + 1, fives(THIS_YEAR + 1))],
    },
    {
      id: 'pay',
      heading: t.payHeading,
      paragraphs: [t.pay, t.payAfter],
      questions: [
        { question: faq1.question, answer: faq1.answer },
        { question: faq2.question, answer: faq2.answer(range(low3, high3, w)) },
      ],
    },
  ];
  return {
    ...frameOf(job, lang),
    title: titleOf(t.headline),
    description: descriptionOf(t.lead),
    lead: t.lead,
    figure: ratio(CYCLE_DAYS, CYCLE_MONTHS * 7),
    figureLabel: t.figureLabel,
    breakdown: t.figureLabel,
    rows,
    sections,
  };
};

const monthsOfWeeksPageOf = (job: Weeks, lang: Lang): LongTailPage => {
  const w = WORDS[lang];
  const t = w.monthsOfWeeks;
  const weeks = job.amount;
  const days = weeks * 7;
  const months = ratio(days * CYCLE_MONTHS, CYCLE_DAYS);
  const payroll = ratio(weeks * 12, 52);
  const calendar = firstsOf(CALENDAR_YEAR).map((start) => {
    const end = addDays(start, days);
    return { start, end, span: monthsAndDaysOf(start, end) };
  });
  const whole = Math.min(...calendar.map(({ span }) => span.months));
  const rests = calendar.filter(({ span }) => span.months === whole).map(({ span }) => span.days);
  const lead = t.lead(weeks, months, days, whole, range(Math.min(...rests), Math.max(...rests), w));
  // the whole months nearest to the weeks, and how their days compare
  const near = Math.round((days * CYCLE_MONTHS) / CYCLE_DAYS);
  const [low, high] = monthsSpanOf(near);
  const diff =
    days < low
      ? t.shorter(low - days, high - days)
      : days > high
        ? t.longer(days - high, days - low)
        : t.within;
  const rows = [
    { key: 'days', label: t.rows.days, value: n(days) },
    { key: 'payroll', label: t.rows.payroll, value: payroll },
    { key: 'workdays', label: t.rows.workdays, value: n(weeks * 5) },
    { key: 'hours', label: t.rows.hours, value: n(weeks * 40) },
    { key: 'clock', label: t.rows.clock, value: n(days * 24) },
  ];
  const fmla = weeks === 12;
  const sections: LongTailSection[] = [
    {
      id: 'worked',
      heading: WORKED[lang],
      paragraphs: [],
      steps: t.steps(weeks, days, hoursText(Rational.of(days * CYCLE_MONTHS, CYCLE_DAYS)), payroll),
    },
    {
      id: 'calendar',
      heading: t.calendarHeading(weeks),
      paragraphs: [t.calendarIntro(weeks, days)],
      table: {
        caption: t.calendarCaption(weeks),
        head: t.calendarHead,
        rows: calendar.map(({ start, end, span }) => [
          monthDayOf(start, lang),
          w.withYear(end, CALENDAR_YEAR),
          monthsDaysText(span, lang),
        ]),
      },
    },
    {
      id: 'compare',
      heading: t.compareHeading(weeks, near),
      paragraphs: [t.compare(weeks, days, near, low, high, diff)],
    },
    {
      id: 'work',
      heading: t.workHeading(weeks),
      paragraphs: [
        t.work(weeks, weeks * 5, weeks * 40, ratio(weeks, 2)),
        ...(fmla ? [t.fmla] : []),
      ],
    },
  ];
  return {
    ...frameOf(job, lang),
    title: titleOf(t.headline(weeks, months, days)),
    description: descriptionOf(lead),
    lead,
    figure: months,
    figureLabel: t.figureLabel,
    breakdown: t.figureLabel,
    rows,
    sections,
    ...(fmla ? { sources: [FMLA_SOURCE] } : {}),
  };
};

const weeksOfMonthsPageOf = (job: Weeks, lang: Lang): LongTailPage => {
  const w = WORDS[lang];
  const t = w.weeksOfMonths;
  const months = job.amount;
  const weeks = ratio(months * CYCLE_DAYS, CYCLE_MONTHS * 7);
  const [low, high] = monthsSpanOf(months);
  const lead = t.lead(months, weeks, low, high, spanOf(low, lang), spanOf(high, lang));
  const rows = [
    { key: 'days', label: t.rows.days, value: range(low, high, w) },
    { key: 'payroll', label: t.rows.payroll, value: ratio(months * 52, 12) },
    { key: 'weekly', label: t.rows.weekly, value: ratio(months * 52, 12) },
    { key: 'biweekly', label: t.rows.biweekly, value: ratio(months * 26, 12) },
    { key: 'hours', label: t.rows.hours, value: n((months * 2080) / 12) },
  ];
  const sections: LongTailSection[] = [
    { id: 'worked', heading: WORKED[lang], paragraphs: [], steps: t.steps(months, weeks) },
    {
      id: 'calendar',
      heading: t.calendarHeading(months),
      paragraphs: [t.calendarIntro(months)],
      table: {
        caption: t.calendarCaption(months),
        head: t.calendarHead,
        rows: firstsOf(CALENDAR_YEAR).map((start) => {
          const end = addMonths(start, months);
          const days = dayDelta(start, end);
          return [
            monthDayOf(start, lang),
            w.withYear(end, CALENDAR_YEAR),
            String(days),
            spanOf(days, lang),
          ];
        }),
      },
    },
    { id: 'work', heading: t.workHeading, paragraphs: [t.work] },
  ];
  return {
    ...frameOf(job, lang),
    title: titleOf(t.headline(months, weeks, low, high)),
    description: descriptionOf(lead),
    lead,
    figure: weeks,
    figureLabel: t.figureLabel,
    breakdown: t.figureLabel,
    rows,
    sections,
  };
};

const leftPageOf = (job: Weeks, lang: Lang): LongTailPage => {
  const w = WORDS[lang];
  const t = w.left;
  const y = job.amount;
  const end = endOf(y);
  const days = daysOfYear(y);
  const iso = isoWeeksOf(y);
  const last = at(y, 12, 31);
  const lastText =
    lang === 'en'
      ? `${weekdayNameOf(weekdayOf(last), lang)}, ${w.full(last)}`
      : `${weekdayNameOf(weekdayOf(last), lang)} ${w.full(last)}`;
  const lastMonday = addDays(last, -weekdayOf(last));
  const rows = [
    { key: 'days', label: t.rows.days, value: String(days) },
    { key: 'weeks', label: t.rows.weeks, value: spanOf(days, lang) },
    { key: 'iso', label: t.rows.iso, value: String(iso) },
    { key: 'weekdays', label: t.rows.weekdays, value: n(weekdaysOf(at(y, 1, 1), days)) },
    { key: 'fridays', label: t.rows.fridays, value: String(countOf(at(y, 1, 1), days, FRIDAY)) },
    { key: 'last', label: t.rows.last, value: lastText },
  ];
  const sections: LongTailSection[] = [
    { id: 'worked', heading: WORKED[lang], paragraphs: [], steps: t.steps(y) },
    {
      id: 'months',
      heading: t.monthsHeading(y),
      paragraphs: [t.monthsIntro(y)],
      table: {
        caption: t.monthsCaption(y),
        head: t.monthsHead,
        rows: firstsOf(y).map((start) => {
          const left = dayDelta(start, end);
          return [
            monthDayOf(start, lang),
            String(left),
            spanOf(left, lang),
            String(weekdaysOf(start, left)),
            String(countOf(start, left, FRIDAY)),
            String(isoWeekOf(start)),
          ];
        }),
      },
    },
    {
      id: 'iso',
      heading: t.isoHeading(y),
      paragraphs: [t.iso(y, iso, w.full(lastMonday), w.full(addDays(lastMonday, 6)))],
    },
    {
      id: 'end',
      heading: t.endHeading(y),
      paragraphs: [
        t.end(
          y,
          w.weekdayDate(thanksgivingOf(y)),
          w.weekdayDate(at(y, 12, 25)),
          w.weekdayDate(last),
        ),
      ],
    },
  ];
  return {
    ...frameOf(job, lang),
    title: titleOf(t.headline(y)),
    description: descriptionOf(t.lead(y, iso)),
    lead: t.lead(y, iso),
    figure: t.figure(y),
    figureLabel: t.figureLabel,
    breakdown: t.figureLabel,
    rows,
    sections,
    live: {
      kind: 'weeks',
      data: {
        y: String(end.y),
        m: String(end.m),
        d: String(end.d),
        ...w.live,
        text: t.text(y),
        past: t.past(y, lastText),
      },
      fallback: t.fallback(y),
    },
  };
};

const christmasPageOf = (job: Weeks, lang: Lang): LongTailPage => {
  const w = WORDS[lang];
  const t = w.christmas;
  const christmasOf = (y: number): CivilDate => at(y, 12, 25);
  const years = YEARS.filter((y) => y >= THIS_YEAR);
  const gapOf = (y: number): number => dayDelta(thanksgivingOf(y), christmasOf(y));
  const weekday = weekdayNameOf(weekdayOf(christmasOf(THIS_YEAR)), lang);
  const lead = t.lead(weekday);
  const countdown = COUNTDOWNS.find((each) => each.slug === 'cuantos-dias-faltan-para-navidad');
  const rows = [
    { key: 'christmas', label: t.rows.christmas(THIS_YEAR), value: weekday },
    {
      key: 'christmas-next',
      label: t.rows.christmas(THIS_YEAR + 1),
      value: weekdayNameOf(weekdayOf(christmasOf(THIS_YEAR + 1)), lang),
    },
    {
      key: 'observed',
      label: t.rows.observed(THIS_YEAR + 1),
      value: w.weekdayDate(observedOf(christmasOf(THIS_YEAR + 1))),
    },
    { key: 'gap', label: t.rows.gap(THIS_YEAR), value: spanOf(gapOf(THIS_YEAR), lang) },
    {
      key: 'year',
      label: t.rows.year(THIS_YEAR),
      value: spanOf(dayDelta(at(THIS_YEAR, 1, 1), christmasOf(THIS_YEAR)), lang),
    },
  ];
  const sections: LongTailSection[] = [
    { id: 'worked', heading: WORKED[lang], paragraphs: [], steps: t.steps },
    {
      id: 'years',
      heading: t.yearsHeading,
      paragraphs: [t.yearsIntro],
      table: {
        caption: t.yearsCaption,
        head: t.yearsHead,
        rows: years.map((y) => [
          String(y),
          weekdayNameOf(weekdayOf(christmasOf(y)), lang),
          w.weekdayDate(observedOf(christmasOf(y))),
          monthDayOf(thanksgivingOf(y), lang),
          spanOf(gapOf(y), lang),
        ]),
      },
    },
    {
      id: 'months',
      heading: t.monthsHeading,
      paragraphs: [t.monthsIntro],
      table: {
        caption: t.monthsCaption,
        head: t.monthsHead,
        rows: firstsOf(THIS_YEAR).map((start) => {
          const days = dayDelta(start, christmasOf(THIS_YEAR));
          return [monthDayOf(start, lang), String(days), spanOf(days, lang)];
        }),
      },
    },
    {
      id: 'pay',
      heading: t.payHeading,
      paragraphs: [
        t.pay,
        ...(lang === 'es' && countdown !== undefined ? [WORDS.es.christmas.countdown] : []),
      ],
      ...(lang === 'es' && countdown !== undefined
        ? {
            links: [
              {
                href: countdownPathOf(countdown),
                label: '¿Cuántos días faltan para Navidad?',
              },
            ],
          }
        : {}),
    },
  ];
  return {
    ...frameOf(job, lang),
    title: titleOf(t.headline),
    description: descriptionOf(lead),
    lead,
    figure: t.figure,
    figureLabel: t.figureLabel,
    breakdown: t.figureLabel,
    rows,
    sections,
    sources: CHRISTMAS_SOURCES,
    live: {
      kind: 'weeks',
      data: { m: '12', d: '25', ...w.live, text: t.text, today: t.today },
      fallback: t.fallback,
    },
  };
};

/** The page of one weeks question in one language, every figure worked out at build time. */
export const weeksPageOf = (job: Weeks, lang: Lang): LongTailPage => {
  switch (job.topic) {
    case 'year':
      return yearPageOf(job, lang);
    case 'month':
      return monthPageOf(job, lang);
    case 'months-of-weeks':
      return monthsOfWeeksPageOf(job, lang);
    case 'weeks-of-months':
      return weeksOfMonthsPageOf(job, lang);
    case 'left-in-year':
      return leftPageOf(job, lang);
    case 'until-christmas':
      return christmasPageOf(job, lang);
  }
};
