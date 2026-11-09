import { HOURS_PATHS, HOURS_TEXTS } from '../hours/texts.ts';
import { descriptionOf, titleOf } from '../seo/meta.ts';
import type { Lang } from '../time-card/receipt.ts';
import type { CommonLinks, LongTailPage } from './jobs.ts';
import { daysLink, WORKED } from './live-links.ts';
import { nearestOf } from './nearest.ts';
import { DAYS_FROM, liveGroupOf, pathOf, type DaysFrom } from './routes.ts';
import { SOURCES, type LongTailSection, type LongTailSource } from './sections.ts';
import { Rational } from '@maestro-calc/core';
import { hoursText } from '../format.ts';
import {
  addDays,
  addMonths,
  dayDelta,
  daysInMonth,
  weekdaysIn,
  type CivilDate,
} from './time-math.ts';

/*
 * The "28 days from today" pages. The date they answer is the visitor's, so the page as built
 * gives what holds on any day: the weeks and days of the span, the weekday it lands on, the date
 * from the first (or the last) of each month, and the workdays in between; `../client/time-now.ts`
 * fills today's date. The tables use 2027, not a leap year, and 2028, one.
 */

const n = (value: number): string => value.toLocaleString('en-US');
const range = (low: number, high: number, to: string): string =>
  low === high ? n(low) : `${n(low)} ${to} ${n(high)}`;

/** A date of the year with no year, in a language: `January 29`, `29 de enero`. */
const MONTHS = {
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  es: [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ],
} as const;
const WEEKDAYS = {
  en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  es: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
} as const;
const dateOf = ({ m, d }: CivilDate, lang: Lang): string =>
  lang === 'en'
    ? `${MONTHS.en[m - 1] ?? ''} ${String(d)}`
    : `${String(d)} de ${MONTHS.es[m - 1] ?? ''}`;
const weekdayOf = (index: number, lang: Lang): string =>
  WEEKDAYS[lang][((index % 7) + 7) % 7] ?? '';
/** The name of a weekday, 0 for Monday, any index counted round the week. */
export const weekdayNameOf = weekdayOf;
/** A date of the year with no year: `January 29`, `29 de enero`. */
export const monthDayOf = dateOf;

/** `June 15, 2027`, `15 de junio de 2027`. */
const fullDateOf = (date: CivilDate, lang: Lang): string =>
  lang === 'en'
    ? `${dateOf(date, lang)}, ${String(date.y)}`
    : `${dateOf(date, lang)} de ${String(date.y)}`;
/** A date with no year, and the next year named when the count reached it. */
const landingOf = (date: CivilDate, from: CivilDate, lang: Lang): string =>
  date.y > from.y
    ? `${dateOf(date, lang)}${lang === 'en' ? ' of the next year' : ' del año siguiente'}`
    : dateOf(date, lang);
/** `1 month`, `6 months`; `1 mes`, `6 meses`; and the days likewise. */
const unitOf = (job: DaysFrom, lang: Lang): string => {
  const one = job.amount === 1;
  if (job.unit === 'month')
    return lang === 'en' ? (one ? 'month' : 'months') : one ? 'mes' : 'meses';
  return lang === 'en' ? (one ? 'day' : 'days') : one ? 'día' : 'días';
};
const spanText = (job: DaysFrom, lang: Lang): string =>
  `${String(job.amount)} ${unitOf(job, lang)}`;
/** One decimal at most: `4.3`, `26`. */
const capital = (text: string): string => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
const oneDecimal = (value: number): string => String(Math.round(value * 10) / 10);

/** The span of a job in signed days or months. */
const signedOf = (job: DaysFrom): number => (job.direction === 'ago' ? -job.amount : job.amount);
const shiftOf = (job: DaysFrom, date: CivilDate): CivilDate =>
  job.unit === 'month' ? addMonths(date, signedOf(job)) : addDays(date, signedOf(job));

/** The date from `start` in a year that is not a leap year, and in one whose February counts. */
const pairOf = (job: DaysFrom, m: number, d: number): [CivilDate, CivilDate] => {
  const forward = signedOf(job) > 0;
  // forward the February crossed is of the start's year up to February, else of the next year
  const plain = forward ? (m <= 2 ? 2027 : 2026) : m >= 3 ? 2027 : 2028;
  const leap = forward ? (m <= 2 ? 2028 : 2027) : m >= 3 ? 2028 : 2029;
  return [shiftOf(job, { y: plain, m, d }), shiftOf(job, { y: leap, m, d })];
};

/** The fewest and most days of a months span over a four-year cycle. */
const daysSpanOf = (job: DaysFrom): [number, number] => {
  const spans: number[] = [];
  for (let day = 0; day < 1461; day += 1) {
    const start = addDays({ y: 2025, m: 1, d: 1 }, day);
    spans.push(dayDelta(start, shiftOf(job, start)));
  }
  return [Math.min(...spans), Math.max(...spans)];
};

/** The weekdays of the span from each starting weekday. */
const workdaysOf = (job: DaysFrom): number[] =>
  [0, 1, 2, 3, 4, 5, 6].map((start) => weekdaysIn(start, signedOf(job)));

const WORK = {
  en: {
    10: '10 days are 240 hours on the clock, but as working time they hold 6 to 8 weekdays, 48 to 64 hours at 8 a day, depending on the weekday you start: from a Monday the span takes in one weekend, from a Friday two. A deadline of 10 business days is another count: two full workweeks, which from a Monday end 14 calendar days later, on the Monday two weeks on.',
    28: '28 days are exactly 4 weeks, so they always hold 20 weekdays: 160 hours at 8 a day, four workweeks of 40, and two biweekly pay periods of 14 days. Federal overtime is counted week by week and never averaged over the 4 weeks: 50 hours one week and 30 the next is 10 hours of overtime, even though the two weeks average 40 (DOL Fact Sheet #23).',
    30: '30 days are 720 hours on the clock and hold 20 to 22 weekdays, 160 to 176 hours at 8 a day: 4 weeks and 2 days, the 2 extra days on a weekend or not depending on the start. A month is not always 30 days: 30 days from the 1st of a 31-day month land on its 31st, and from February 1 they land in March.',
    '30-ago':
      '30 days back hold 20 to 22 weekdays and reach into the month before, or two months back from early March. Looking back 30 days on your pay stubs covers two biweekly pay periods and 2 more days, or about two semimonthly periods, the 1st to the 15th and the 16th to the end of the month.',
    6: '6 months are half a year: about 26 weeks, which is 13 biweekly pay periods, or exactly 12 semimonthly ones. At 40 hours a week, 26 weeks are 1,040 hours of work, half of the 2,080-hour year the pay converters use, and a little more than 1,000 hours.',
  },
  es: {
    10: '10 días son 240 horas de reloj, pero como tiempo de trabajo tienen de 6 a 8 días hábiles, de 48 a 64 horas a 8 por día, según el día en que empiezas: desde un lunes el periodo incluye un fin de semana, desde un viernes dos. Un plazo de 10 días hábiles es otra cuenta: dos semanas laborales completas, que desde un lunes terminan 14 días de calendario después, el lunes de dos semanas más tarde.',
    28: '28 días son exactamente 4 semanas, así que siempre tienen 20 días hábiles: 160 horas a 8 por día, cuatro semanas laborales de 40 y dos periodos de pago quincenales de 14 días. Las horas extra federales se cuentan semana por semana y nunca se promedian en las 4 semanas: 50 horas una semana y 30 la siguiente son 10 horas extra, aunque las dos semanas promedien 40 (DOL Fact Sheet #23).',
    30: '30 días son 720 horas de reloj y tienen de 20 a 22 días hábiles, de 160 a 176 horas a 8 por día: 4 semanas y 2 días, con los 2 días de más en fin de semana o no según el inicio. Un mes no siempre tiene 30 días: 30 días desde el 1 de un mes de 31 días caen en su día 31, y desde el 1 de febrero caen en marzo.',
    '30-ago':
      '30 días hacia atrás tienen de 20 a 22 días hábiles y llegan al mes anterior, o a dos meses atrás desde principios de marzo. Mirar 30 días atrás en tus talones de pago cubre dos periodos de pago cada dos semanas y 2 días más, o cerca de dos periodos quincenales, del 1 al 15 y del 16 al final del mes.',
    6: '6 meses son medio año: unas 26 semanas, que son 13 periodos de pago cada dos semanas, o exactamente 12 quincenales. A 40 horas por semana, 26 semanas son 1,040 horas de trabajo, la mitad del año de 2,080 horas que usan los conversores de pago, y algo más de 1,000 horas.',
  },
} as const;

/** The hand-written working context of a job (`WORK`), when it has one. */
const workKeyOf = (job: DaysFrom): keyof (typeof WORK)['en'] | undefined => {
  if (job.direction === 'ago') return '30-ago';
  if (job.unit === 'month') return job.amount === 6 ? 6 : undefined;
  return ([10, 28, 30] as const).find((each) => each === job.amount);
};

/** The figures of the worked months steps. */
interface MonthsExample {
  readonly a: number;
  readonly span: string;
  readonly march: string;
  readonly clamp: string;
  readonly clampDay: number;
  readonly shortest: readonly [string, string];
  readonly longest: readonly [string, string];
  readonly low: number;
  readonly high: number;
  readonly weeks: number;
  readonly apart: number;
}

/** The figures of the working context of a days span. */
interface DaysWork {
  readonly a: number;
  readonly low: number;
  readonly high: number;
  readonly periods: number;
  readonly extra: number;
  readonly weeks: number;
  readonly business: number;
  readonly weekday: string;
}

/** The figures of the working context of a months span. */
interface MonthsWork {
  readonly one: boolean;
  readonly span: string;
  readonly weeks: string;
  readonly biweekly: string;
  readonly semimonthly: number;
  readonly hours: string;
  readonly share: string;
}

const WORDS = {
  en: {
    h1: (job: DaysFrom): string =>
      job.direction === 'ago'
        ? `What was the date ${String(job.amount)} days ago?`
        : `What is the date ${spanText(job, 'en')} from today?`,
    weeks: (w: number, r: number): string => {
      if (w === 0) return 'less than a week';
      const weeks = `${String(w)} week${w === 1 ? '' : 's'}`;
      return r === 0 ? weeks : `${weeks} and ${String(r)} day${r === 1 ? '' : 's'}`;
    },
    headline: (job: DaysFrom, weeks: string, r: number, low: number, high: number): string => {
      const a = String(job.amount);
      if (job.unit === 'month')
        return `${spanText(job, 'en')} from today: the same day of the month, ${String(low)} to ${String(high)} days on`;
      if (job.direction === 'ago')
        return `${a} days ago: ${weeks} back, the weekday ${String(r)} back`;
      return r === 0
        ? `${a} days from today: ${weeks}, the same weekday`
        : `${a} days from today: ${weeks}, the weekday ${String(r)} on`;
    },
    figure: (job: DaysFrom): string =>
      `${job.direction === 'ago' ? '−' : '+'}${spanText(job, 'en')}`,
    figureLabel: "From today's date",
    leadDays: (job: DaysFrom, weeks: string, r: number, start: string, end: string): string => {
      const a = String(job.amount);
      if (job.direction === 'ago')
        return `${a} days ago is today's date minus ${a} days: ${weeks} back, so the weekday moves ${String(r)} back (from a Monday, a ${weekdayOf(-r, 'en')}). From ${start} in a year that is not a leap year, for instance, it is ${end}.`;
      const moves =
        r === 0
          ? 'so it is the same weekday as today'
          : `so the weekday moves ${String(r)} on (from a Monday, a ${weekdayOf(r, 'en')})`;
      return `${a} days from today is today's date plus ${a} days: ${weeks}, ${moves}. From ${start}, for instance, it is ${end}.`;
    },
    leadMonths: (job: DaysFrom, march: string, clamp: string): string =>
      job.amount % 12 === 0
        ? `${spanText(job, 'en')} from today keeps the day and the month and moves the year 1 on: from March 15 it is March 15 of the next year. The one date that cannot stay is February 29: from February 29 of a leap year, it is February 28.`
        : `${spanText(job, 'en')} from today keeps the day of the month and moves the month ${String(job.amount)} on: from March 15 it is ${march}. When the later month is shorter, the date is its last day: from ${clamp} it is February 28, or February 29 in a leap year.`,
    text: (job: DaysFrom): string =>
      job.direction === 'ago'
        ? `Today is {today}, so ${String(job.amount)} days ago was {date}.`
        : `Today is {today}, so ${spanText(job, 'en')} from today is {date}.`,
    fallback: (job: DaysFrom, weeks: string, r: number): string => {
      if (job.unit === 'month')
        return `Move the month of today's date ${String(job.amount)} ${job.amount === 1 ? 'place' : 'places'} on and keep the day; if that month is shorter, take its last day.`;
      if (job.direction === 'ago')
        return `Count back ${String(job.amount)} days from today's date: ${weeks}, so the weekday moves ${String(r)} back.`;
      return `Add ${String(job.amount)} days to today's date: ${weeks}, so ${r === 0 ? 'it is the same weekday as today' : `the weekday moves ${String(r)} on`}.`;
    },
    rows: {
      weeks: 'Weeks and days',
      weekday: 'From a Monday',
      workdays: 'Weekdays in between',
      hours: 'Hours on the clock',
      days: 'Days in between',
      weeksAbout: 'Weeks',
      work: 'Work hours at 40 a week',
      clampFrom: (date: string): string => `From ${date}`,
    },
    to: 'to',
    about: (weeks: string): string => `about ${weeks}`,
    clamp: 'February 28 or 29',
    clampLeap: 'February 28',
    breakdown: 'What holds from any day',
    stepsDays: (job: DaysFrom, w: number, r: number, weeks: string): string[] => {
      const a = String(job.amount);
      if (job.direction === 'ago')
        return [
          `${a} = ${String(w)} × 7 + ${String(r)}: ${weeks} back, so the weekday moves ${String(r)} back: from a Monday, a ${weekdayOf(-r, 'en')}.`,
          'Counting back from March 1 in a year that is not a leap year: 1 day reaches February 28, 28 days reach February 1, and 30 days reach January 30.',
          'In a leap year February has 29 days, so 30 days before March 1 is January 31.',
          'A leap year is one divisible by 4, except the century years not divisible by 400: 2028 is one, 2100 is not.',
        ];
      return [
        r === 0
          ? `${a} = ${String(w)} × 7: ${weeks}, so the weekday stays the same.`
          : `${a} = ${String(w)} × 7 + ${String(r)}: ${weeks}, so the weekday moves ${String(r)} on: from a Monday, a ${weekdayOf(r, 'en')}.`,
      ];
    },
    stepsLeft: (start: string, month: string, length: number, left: number): string =>
      `From ${start}: ${month} has ${String(length)} days, so ${String(left)} days are left after it, to ${month} ${String(length)}.`,
    stepsRest: (a: number, left: number, end: string): string =>
      `${String(a)} − ${String(left)} = ${String(a - left)}, so the date is ${end}.`,
    leapStep:
      'When the count crosses the end of February, the year matters: February has 28 days, and 29 in a leap year, one divisible by 4 except the century years not divisible by 400 (2028 is one, 2100 is not).',
    stepsMonths: (m: MonthsExample): string[] => [
      `Move the month ${String(m.a)} on and keep the day: March 15 + ${m.span} = ${m.march}.`,
      m.a % 12 === 0
        ? `February 29 comes only in a leap year: February 29, 2028 + ${m.span} would be February 29, 2029, which does not exist, so the date is February 28, 2029.`
        : `When the later month has fewer days, take its last day: ${m.clamp} + ${m.span} would be February ${String(m.clampDay)}, which does not exist, so the date is February 28, or February 29 in a leap year.`,
      `The days in between depend on the months crossed: from ${m.shortest[0]} to ${m.shortest[1]} are ${n(m.low)} days, and from ${m.longest[0]} to ${m.longest[1]}, ${n(m.high)}.`,
      `Over every start date, ${m.span} ${m.a === 1 ? 'is' : 'are'} ${n(m.low)} to ${n(m.high)} days, so ${m.span} and ${String(m.weeks)} weeks (${n(m.weeks * 7)} days) from today can land up to ${String(m.apart)} day${m.apart === 1 ? '' : 's'} apart.`,
    ],
    stepsYear: (doy: number, a: number, start: string): string =>
      `Count by the day of the year: ${start} is day ${String(doy)}, so ${String(doy)} + ${n(a)} = ${n(doy + a)}.`,
    stepsNewYear: (sum: number, days: number): string =>
      `Past day ${n(days)} the count runs into the next year: ${n(sum)} − ${n(days)} = ${n(sum - days)}.`,
    stepsDay: (k: number, next: boolean, end: string, before: number): string =>
      `Day ${n(k)}${next ? ' of the next year' : ''} is ${end}${before > 0 ? `: the months before it hold ${n(before)} days` : ''}.`,
    workDays: (d: DaysWork): string =>
      `${n(d.a)} days are ${n(d.a * 24)} hours on the clock; as working time they hold ${d.low === d.high ? `exactly ${n(d.low)}` : `${n(d.low)} to ${n(d.high)}`} weekdays, ${d.low === d.high ? n(d.low * 8) : `${n(d.low * 8)} to ${n(d.high * 8)}`} hours at 8 a day. They take in ${d.periods === 0 ? 'less than one biweekly pay period' : `${n(d.periods)} biweekly pay period${d.periods === 1 ? '' : 's'} of 14 days`}${d.extra > 0 && d.periods > 0 ? ` and ${n(d.extra)} day${d.extra === 1 ? '' : 's'} more` : ''}, and ${d.weeks === 0 ? 'no full workweek' : `${n(d.weeks)} full workweek${d.weeks === 1 ? '' : 's'}`}; overtime is counted week by week, for the hours past 40 in each (DOL Fact Sheet #23). A deadline of ${n(d.a)} business days is longer: from a Monday, it ends ${n(d.business)} calendar days later, on a ${d.weekday}.`,
    workMonths: (m: MonthsWork): string =>
      `${m.span} ${m.one ? 'is' : 'are'} about ${m.weeks} weeks: about ${m.biweekly} biweekly pay periods of 14 days, or exactly ${String(m.semimonthly)} semimonthly ones, the 1st to the 15th and the 16th to the end of the month. At 40 hours a week, that is about ${m.hours} hours of work, ${m.share === '100' ? 'the whole 2,080-hour year' : `${m.share}% of the 2,080-hour year`} the pay converters use.`,
    monthsHeading: (job: DaysFrom): string =>
      job.unit === 'month'
        ? `${spanText(job, 'en')} from the last day of each month`
        : `${String(job.amount)} days ${job.direction === 'ago' ? 'before' : 'from'} the 1st of each month`,
    months: (job: DaysFrom): string =>
      job.unit === 'month'
        ? 'The end of a month is where a months count is clamped. In a year that is not a leap year, and when the count reaches February of a leap year, with the days in between:'
        : 'In a year that is not a leap year, and in a leap year, which only changes the rows whose count crosses the end of February:',
    caption: (job: DaysFrom): string =>
      job.unit === 'month'
        ? `${spanText(job, 'en')} from each month end`
        : `${String(job.amount)} days ${job.direction === 'ago' ? 'before' : 'after'} each 1st`,
    head: ['Start', 'Date', 'In a leap year'],
    days: 'Days',
    weekdaysHeading: (job: DaysFrom): string =>
      `The weekday ${String(job.amount)} days ${job.direction === 'ago' ? 'back' : 'on'} and the workdays in between`,
    weekdays: (job: DaysFrom): string =>
      `The Monday to Friday days among the ${String(job.amount)} days ${job.direction === 'ago' ? 'before' : 'after'} the start, the start left out, and their working hours at 8 a day, before any holiday:`,
    weekdaysCaption: (job: DaysFrom): string => `${String(job.amount)} days by starting weekday`,
    weekdaysHead: ['Start', 'Lands on', 'Weekdays (Mon–Fri)', 'Hours at 8 a day'],
    workHeading: (job: DaysFrom): string => `${spanText(job, 'en')} of work and pay`,
    edit: 'Count the hours between two times',
    others: 'Other dates from today',
    common: 'Dates from today',
    note: 'The live date follows the calendar of your device. Holidays are not taken out of any count on this page.',
  },
  es: {
    h1: (job: DaysFrom): string =>
      job.direction === 'ago'
        ? `¿Qué fecha fue hace ${String(job.amount)} días?`
        : `¿Qué fecha es ${spanText(job, 'es')} a partir de hoy?`,
    weeks: (w: number, r: number): string => {
      if (w === 0) return 'menos de una semana';
      const weeks = `${String(w)} semana${w === 1 ? '' : 's'}`;
      return r === 0 ? weeks : `${weeks} y ${String(r)} día${r === 1 ? '' : 's'}`;
    },
    headline: (job: DaysFrom, weeks: string, r: number, low: number, high: number): string => {
      const a = String(job.amount);
      if (job.unit === 'month')
        return `${spanText(job, 'es')} a partir de hoy: el mismo día del mes, de ${String(low)} a ${String(high)} días`;
      if (job.direction === 'ago')
        return `Hace ${a} días: ${weeks} atrás, el día retrocede ${String(r)}`;
      return r === 0
        ? `${a} días a partir de hoy: ${weeks}, el mismo día de la semana`
        : `${a} días a partir de hoy: ${weeks}, el día avanza ${String(r)}`;
    },
    figure: (job: DaysFrom): string =>
      `${job.direction === 'ago' ? '−' : '+'}${spanText(job, 'es')}`,
    figureLabel: 'Desde la fecha de hoy',
    leadDays: (job: DaysFrom, weeks: string, r: number, start: string, end: string): string => {
      const a = String(job.amount);
      if (job.direction === 'ago')
        return `Hace ${a} días es la fecha de hoy menos ${a} días: ${weeks} atrás, así que el día de la semana retrocede ${String(r)} (desde un lunes, un ${weekdayOf(-r, 'es')}). Desde el ${start} de un año que no es bisiesto, por ejemplo, es el ${end}.`;
      const moves =
        r === 0
          ? 'así que es el mismo día de la semana que hoy'
          : `así que el día de la semana avanza ${String(r)} (desde un lunes, un ${weekdayOf(r, 'es')})`;
      return `${a} días a partir de hoy es la fecha de hoy más ${a} días: ${weeks}, ${moves}. Desde el ${start}, por ejemplo, es el ${end}.`;
    },
    leadMonths: (job: DaysFrom, march: string, clamp: string): string =>
      job.amount % 12 === 0
        ? `${spanText(job, 'es')} a partir de hoy mantiene el día y el mes y avanza el año 1 lugar: desde el 15 de marzo es el 15 de marzo del año siguiente. La única fecha que no puede quedar es el 29 de febrero: desde el 29 de febrero de un año bisiesto, es el 28 de febrero.`
        : `${spanText(job, 'es')} a partir de hoy mantiene el número del día y avanza el mes ${String(job.amount)} ${job.amount === 1 ? 'lugar' : 'lugares'}: desde el 15 de marzo es el ${march}. Cuando el mes de llegada es más corto, la fecha es su último día: desde el ${clamp} es el 28 de febrero, o el 29 de febrero en un año bisiesto.`,
    text: (job: DaysFrom): string =>
      job.direction === 'ago'
        ? `Hoy es {today}, así que hace ${String(job.amount)} días fue {date}.`
        : `Hoy es {today}, así que ${spanText(job, 'es')} a partir de hoy es {date}.`,
    fallback: (job: DaysFrom, weeks: string, r: number): string => {
      if (job.unit === 'month')
        return `Avanza ${String(job.amount)} ${job.amount === 1 ? 'lugar' : 'lugares'} el mes de la fecha de hoy y mantén el día; si ese mes es más corto, toma su último día.`;
      if (job.direction === 'ago')
        return `Cuenta ${String(job.amount)} días hacia atrás desde la fecha de hoy: ${weeks}, así que el día de la semana retrocede ${String(r)}.`;
      return `Suma ${String(job.amount)} días a la fecha de hoy: ${weeks}, así que ${r === 0 ? 'es el mismo día de la semana que hoy' : `el día de la semana avanza ${String(r)}`}.`;
    },
    rows: {
      weeks: 'Semanas y días',
      weekday: 'Desde un lunes',
      workdays: 'Días hábiles en medio',
      hours: 'Horas de reloj',
      days: 'Días en medio',
      weeksAbout: 'Semanas',
      work: 'Horas de trabajo a 40 por semana',
      clampFrom: (date: string): string => `Desde el ${date}`,
    },
    to: 'a',
    about: (weeks: string): string => `unas ${weeks}`,
    clamp: '28 o 29 de febrero',
    clampLeap: '28 de febrero',
    breakdown: 'Lo que vale desde cualquier día',
    stepsDays: (job: DaysFrom, w: number, r: number, weeks: string): string[] => {
      const a = String(job.amount);
      if (job.direction === 'ago')
        return [
          `${a} = ${String(w)} × 7 + ${String(r)}: ${weeks} atrás, así que el día de la semana retrocede ${String(r)}: desde un lunes, un ${weekdayOf(-r, 'es')}.`,
          'Hacia atrás desde el 1 de marzo de un año que no es bisiesto: 1 día llega al 28 de febrero, 28 días llegan al 1 de febrero y 30 días llegan al 30 de enero.',
          'En un año bisiesto febrero tiene 29 días, así que 30 días antes del 1 de marzo es el 31 de enero.',
          'Un año bisiesto es divisible por 4, salvo los años de siglo no divisibles por 400: 2028 lo es, 2100 no.',
        ];
      return [
        r === 0
          ? `${a} = ${String(w)} × 7: ${weeks}, así que el día de la semana no cambia.`
          : `${a} = ${String(w)} × 7 + ${String(r)}: ${weeks}, así que el día de la semana avanza ${String(r)}: desde un lunes, un ${weekdayOf(r, 'es')}.`,
      ];
    },
    stepsLeft: (start: string, month: string, length: number, left: number): string =>
      `Desde el ${start}: ${month} tiene ${String(length)} días, así que quedan ${String(left)} días después, hasta el ${String(length)} de ${month}.`,
    stepsRest: (a: number, left: number, end: string): string =>
      `${String(a)} − ${String(left)} = ${String(a - left)}, así que la fecha es el ${end}.`,
    leapStep:
      'Cuando la cuenta cruza el final de febrero, el año importa: febrero tiene 28 días, y 29 en un año bisiesto, uno divisible por 4 salvo los años de siglo no divisibles por 400 (2028 lo es, 2100 no).',
    stepsMonths: (m: MonthsExample): string[] => [
      `Avanza el mes ${String(m.a)} ${m.a === 1 ? 'lugar' : 'lugares'} y mantén el día: 15 de marzo + ${m.span} = ${m.march}.`,
      m.a % 12 === 0
        ? `El 29 de febrero solo existe en un año bisiesto: 29 de febrero de 2028 + ${m.span} sería el 29 de febrero de 2029, que no existe, así que la fecha es el 28 de febrero de 2029.`
        : `Cuando el mes de llegada tiene menos días, toma su último día: ${m.clamp} + ${m.span} sería el ${String(m.clampDay)} de febrero, que no existe, así que la fecha es el 28 de febrero, o el 29 de febrero en un año bisiesto.`,
      `Los días en medio dependen de los meses que cruzas: del ${m.shortest[0]} al ${m.shortest[1]} hay ${n(m.low)} días, y del ${m.longest[0]} al ${m.longest[1]}, ${n(m.high)}.`,
      `Para cualquier fecha de inicio, ${m.span} ${m.a === 1 ? 'es' : 'son'} de ${n(m.low)} a ${n(m.high)} días, así que ${m.span} y ${String(m.weeks)} semanas (${n(m.weeks * 7)} días) a partir de hoy pueden caer con hasta ${String(m.apart)} día${m.apart === 1 ? '' : 's'} de diferencia.`,
    ],
    stepsYear: (doy: number, a: number, start: string): string =>
      `Cuenta por el día del año: el ${start} es el día ${String(doy)}, así que ${String(doy)} + ${n(a)} = ${n(doy + a)}.`,
    stepsNewYear: (sum: number, days: number): string =>
      `Después del día ${n(days)} la cuenta pasa al año siguiente: ${n(sum)} − ${n(days)} = ${n(sum - days)}.`,
    stepsDay: (k: number, next: boolean, end: string, before: number): string =>
      `El día ${n(k)}${next ? ' del año siguiente' : ''} es el ${end}${before > 0 ? `: los meses anteriores suman ${n(before)} días` : ''}.`,
    workDays: (d: DaysWork): string =>
      `${n(d.a)} días son ${n(d.a * 24)} horas de reloj; como tiempo de trabajo tienen ${d.low === d.high ? `exactamente ${n(d.low)}` : `de ${n(d.low)} a ${n(d.high)}`} días hábiles, ${d.low === d.high ? n(d.low * 8) : `de ${n(d.low * 8)} a ${n(d.high * 8)}`} horas a 8 por día. Abarcan ${d.periods === 0 ? 'menos de un periodo de pago cada dos semanas' : `${n(d.periods)} periodo${d.periods === 1 ? '' : 's'} de pago cada dos semanas`}${d.extra > 0 && d.periods > 0 ? ` y ${n(d.extra)} día${d.extra === 1 ? '' : 's'} más` : ''}, y ${d.weeks === 0 ? 'ninguna semana laboral completa' : `${n(d.weeks)} semana${d.weeks === 1 ? '' : 's'} laboral${d.weeks === 1 ? '' : 'es'} completa${d.weeks === 1 ? '' : 's'}`}; las horas extra se cuentan semana por semana, por las horas después de 40 en cada una (DOL Fact Sheet #23). Un plazo de ${n(d.a)} días hábiles es más largo: desde un lunes, termina ${n(d.business)} días de calendario después, un ${d.weekday}.`,
    workMonths: (m: MonthsWork): string =>
      `${m.span} ${m.one ? 'es' : 'son'} unas ${m.weeks} semanas: unos ${m.biweekly} periodos de pago cada dos semanas, o exactamente ${String(m.semimonthly)} quincenales, del 1 al 15 y del 16 al final del mes. A 40 horas por semana, son unas ${m.hours} horas de trabajo, ${m.share === '100' ? 'todo el año de 2,080 horas' : `el ${m.share}% del año de 2,080 horas`} que usan los conversores de pago.`,
    monthsHeading: (job: DaysFrom): string =>
      job.unit === 'month'
        ? `${spanText(job, 'es')} desde el último día de cada mes`
        : `${String(job.amount)} días ${job.direction === 'ago' ? 'antes del' : 'desde el'} 1 de cada mes`,
    months: (job: DaysFrom): string =>
      job.unit === 'month'
        ? 'El final de un mes es donde una cuenta de meses se ajusta. En un año que no es bisiesto, y cuando la cuenta llega a febrero de un año bisiesto, con los días en medio:'
        : 'En un año que no es bisiesto, y en uno bisiesto, que solo cambia las filas cuya cuenta cruza el final de febrero:',
    caption: (job: DaysFrom): string =>
      job.unit === 'month'
        ? `${spanText(job, 'es')} desde cada fin de mes`
        : `${String(job.amount)} días ${job.direction === 'ago' ? 'antes de' : 'después de'} cada día 1`,
    head: ['Inicio', 'Fecha', 'En año bisiesto'],
    days: 'Días',
    weekdaysHeading: (job: DaysFrom): string =>
      `El día de la semana ${String(job.amount)} días ${job.direction === 'ago' ? 'antes' : 'después'} y los días hábiles en medio`,
    weekdays: (job: DaysFrom): string =>
      `Los días de lunes a viernes entre los ${String(job.amount)} días ${job.direction === 'ago' ? 'anteriores al' : 'posteriores al'} inicio, sin contar el inicio, y sus horas de trabajo a 8 por día, antes de feriados:`,
    weekdaysCaption: (job: DaysFrom): string => `${String(job.amount)} días según el día de inicio`,
    weekdaysHead: ['Inicio', 'Cae en', 'Días hábiles (lun–vie)', 'Horas a 8 por día'],
    workHeading: (job: DaysFrom): string => `${spanText(job, 'es')} de trabajo y pago`,
    edit: 'Cuenta las horas entre dos horas del día',
    others: 'Otras fechas desde hoy',
    common: 'Fechas desde hoy',
    note: 'La fecha en vivo sigue el calendario de tu dispositivo. Ninguna cuenta de esta página descuenta feriados.',
  },
} as const;

/** The example of the lead and the steps: a start whose count crosses into the next month. */
const EXAMPLES: Readonly<Record<string, CivilDate>> = {
  '10-days-from-today': { y: 2027, m: 1, d: 25 },
  '28-days-from-today': { y: 2027, m: 1, d: 15 },
  '30-days-from-today': { y: 2027, m: 1, d: 15 },
  '30-days-ago-from-today': { y: 2027, m: 3, d: 1 },
};

/** The example of a days page: its own, or a late January day whose count crosses the month. */
const exampleOf = (job: DaysFrom): CivilDate =>
  EXAMPLES[job.slug.en] ??
  (job.amount < 28
    ? { y: 2027, m: 1, d: 31 - Math.floor(job.amount / 2) }
    : { y: 2027, m: 1, d: 15 });

/** The day of the year of a date, 1 for January 1. */
const dayOfYear = (date: CivilDate): number => dayDelta({ y: date.y, m: 1, d: 1 }, date) + 1;

/** The start of the months table a months span is clamped from, ending in February. */
const clampStartOf = (a: number): CivilDate => {
  const m = ((((2 - a - 1) % 12) + 12) % 12) + 1;
  return { y: m === 2 ? 2028 : 2027, m, d: m === 2 ? 29 : daysInMonth(2027, m) };
};

/** The first start, from 2027 on, whose months span is `days` long. */
const spanExampleOf = (job: DaysFrom, days: number): [CivilDate, CivilDate] => {
  for (let day = 0; day < 1461; day += 1) {
    const start = addDays({ y: 2027, m: 1, d: 1 }, day);
    const end = shiftOf(job, start);
    if (dayDelta(start, end) === days) return [start, end];
  }
  throw new Error(`no start of ${String(days)} days for ${job.slug.en}`);
};

/** The calendar days from a Monday to the end of `count` business days, Monday to Friday. */
const businessSpanOf = (count: number): number => {
  let days = 0;
  for (let done = 0; done < count;) {
    days += 1;
    if (days % 7 < 5) done += 1;
  }
  return days;
};

export const daysFromLinksOf = (lang: Lang, except?: DaysFrom): CommonLinks => {
  const w = WORDS[lang];
  return {
    heading: except === undefined ? w.common : w.others,
    links: (except === undefined ? DAYS_FROM : nearestOf(liveGroupOf(except), except)).map(
      (job) => ({
        href: pathOf(job, lang),
        label: w.h1(job),
      }),
    ),
  };
};

/** The figures of the months steps of a months span. */
const monthsExampleOf = (job: DaysFrom, lang: Lang, low: number, high: number): MonthsExample => {
  const a = job.amount;
  const march = { y: 2027, m: 3, d: 15 };
  const clamp = clampStartOf(a);
  const weeks = Math.round((a * 52) / 12);
  const pair = (days: number): [string, string] => {
    const [start, end] = spanExampleOf(job, days);
    return [fullDateOf(start, lang), fullDateOf(end, lang)];
  };
  return {
    a,
    span: spanText(job, lang),
    march: landingOf(addMonths(march, a), march, lang),
    clamp: dateOf(clamp, lang),
    clampDay: clamp.d,
    shortest: pair(low),
    longest: pair(high),
    low,
    high,
    weeks,
    apart: Math.max(Math.abs(low - weeks * 7), Math.abs(high - weeks * 7)),
  };
};

/** The working context of a span with no text of its own (`WORK`): figures of its own. */
const workTextOf = (job: DaysFrom, lang: Lang): string => {
  const w = WORDS[lang];
  const key = workKeyOf(job);
  if (key !== undefined) return WORK[lang][key];
  const a = job.amount;
  if (job.unit === 'month')
    return w.workMonths({
      one: a === 1,
      span: capital(spanText(job, lang)),
      weeks: oneDecimal((a * 52) / 12),
      biweekly: oneDecimal((a * 26) / 12),
      semimonthly: 2 * a,
      hours: n(Math.round((a * 2080) / 12)),
      share: hoursText(Rational.of(a * 100, 12)),
    });
  const days = workdaysOf(job);
  const business = businessSpanOf(a);
  return w.workDays({
    a,
    low: Math.min(...days),
    high: Math.max(...days),
    periods: Math.floor(a / 14),
    extra: a % 14,
    weeks: Math.floor(a / 7),
    business,
    weekday: weekdayOf(business, lang),
  });
};

const sectionsOf = (job: DaysFrom, lang: Lang, low: number, high: number): LongTailSection[] => {
  const w = WORDS[lang];
  const a = job.amount;
  const weeks = w.weeks(Math.floor(a / 7), a % 7);
  const monthly = job.unit === 'month';
  const worked = (): string[] => {
    if (monthly) return w.stepsMonths(monthsExampleOf(job, lang, low, high));
    const first = w.stepsDays(job, Math.floor(a / 7), a % 7, weeks);
    if (job.direction === 'ago') return first;
    const example = exampleOf(job);
    const end = shiftOf(job, example);
    const length = daysInMonth(example.y, example.m);
    const left = length - example.d;
    if (end.y === example.y && end.m === example.m + 1)
      return [
        ...first,
        w.stepsLeft(dateOf(example, lang), MONTHS[lang][example.m - 1] ?? '', length, left),
        w.stepsRest(a, left, dateOf(end, lang)),
        w.leapStep,
      ];
    const doy = dayOfYear(example);
    const yearDays = dayDelta({ y: example.y, m: 1, d: 1 }, { y: example.y + 1, m: 1, d: 1 });
    const k = dayOfYear(end);
    return [
      ...first,
      w.stepsYear(doy, a, dateOf(example, lang)),
      ...(doy + a > yearDays ? [w.stepsNewYear(doy + a, yearDays)] : []),
      w.stepsDay(k, end.y > example.y, dateOf(end, lang), k - end.d),
      w.leapStep,
    ];
  };
  const starts = monthly
    ? Array.from({ length: 12 }, (_, i) => ({ m: i + 1, d: daysInMonth(2027, i + 1) }))
    : Array.from({ length: 12 }, (_, i) => ({ m: i + 1, d: 1 }));
  const sections: LongTailSection[] = [
    { id: 'worked', heading: WORKED[lang], paragraphs: [], steps: worked() },
    {
      id: 'months',
      heading: w.monthsHeading(job),
      paragraphs: [w.months(job)],
      table: {
        caption: w.caption(job),
        head: monthly ? [...w.head, w.days] : w.head,
        rows: starts.map(({ m, d }) => {
          const [plain, leap] = pairOf(job, m, d);
          const start = dateOf({ y: 2027, m, d }, lang);
          const cells = [start, dateOf(plain, lang), dateOf(leap, lang)];
          if (!monthly) return cells;
          // a months span is forward: its plain start is in 2027 up to February, else in 2026
          return [...cells, n(dayDelta({ y: m <= 2 ? 2027 : 2026, m, d }, plain))];
        }),
      },
    },
  ];
  if (!monthly) {
    const days = workdaysOf(job);
    sections.push({
      id: 'weekdays',
      heading: w.weekdaysHeading(job),
      paragraphs: [w.weekdays(job)],
      table: {
        caption: w.weekdaysCaption(job),
        head: w.weekdaysHead,
        rows: days.map((count, start) => [
          weekdayOf(start, lang),
          weekdayOf(start + signedOf(job), lang),
          n(count),
          n(count * 8),
        ]),
      },
    });
  }
  sections.push({
    id: 'work',
    heading: w.workHeading(job),
    paragraphs: [workTextOf(job, lang)],
    ...(monthly && a === 6 ? { links: [daysLink(1000, lang)] } : {}),
  });
  return sections;
};

/** The page of one span from today in one language, and the live date's slot. */
export const daysFromPageOf = (job: DaysFrom, lang: Lang): LongTailPage => {
  const w = WORDS[lang];
  const a = job.amount;
  const r = a % 7;
  const weeks = w.weeks(Math.floor(a / 7), r);
  const monthly = job.unit === 'month';
  const [low, high] = monthly ? daysSpanOf(job) : [a, a];
  const march = { y: 2027, m: 3, d: 15 };
  const clamp = clampStartOf(a);
  const example = exampleOf(job);
  const end = shiftOf(job, example);
  const lead = monthly
    ? w.leadMonths(job, landingOf(addMonths(march, a), march, lang), dateOf(clamp, lang))
    : w.leadDays(job, weeks, r, dateOf(example, lang), landingOf(end, example, lang));
  const days = workdaysOf(job);
  const rows = monthly
    ? [
        { key: 'days', label: w.rows.days, value: range(low, high, w.to) },
        { key: 'weeks', label: w.rows.weeksAbout, value: w.about(oneDecimal((a * 52) / 12)) },
        { key: 'work', label: w.rows.work, value: n(Math.round((a * 2080) / 12)) },
        {
          key: 'clamp',
          label: w.rows.clampFrom(dateOf(clamp, lang)),
          value: a % 12 === 0 ? w.clampLeap : w.clamp,
        },
      ]
    : [
        { key: 'weeks', label: w.rows.weeks, value: weeks },
        {
          key: 'weekday',
          label: w.rows.weekday,
          value: `${weekdayOf(0, lang)} → ${weekdayOf(signedOf(job), lang)}`,
        },
        {
          key: 'workdays',
          label: w.rows.workdays,
          value: range(Math.min(...days), Math.max(...days), w.to),
        },
        { key: 'hours', label: w.rows.hours, value: n(a * 24) },
      ];
  const sources: LongTailSource[] =
    a === 28 || (!monthly && workKeyOf(job) === undefined) ? [SOURCES.factSheet23] : [];
  return {
    kicker: HOURS_TEXTS[lang].kicker,
    title: titleOf(w.headline(job, weeks, r, low, high)),
    description: descriptionOf(lead),
    h1: w.h1(job),
    lead,
    figure: w.figure(job),
    figureLabel: w.figureLabel,
    breakdown: w.breakdown,
    rows,
    calculator: { href: HOURS_PATHS[lang], label: w.edit, title: HOURS_TEXTS[lang].title },
    note: w.note,
    paths: { en: pathOf(job, 'en'), es: pathOf(job, 'es') },
    others: daysFromLinksOf(lang, job),
    sections: sectionsOf(job, lang, low, high),
    ...(sources.length > 0 ? { sources } : {}),
    live: {
      kind: 'date',
      data: { amount: String(signedOf(job)), unit: job.unit, text: w.text(job) },
      fallback: w.fallback(job, weeks, r),
    },
  };
};
