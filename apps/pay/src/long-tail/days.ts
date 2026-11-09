import { Rational } from '@maestro-calc/core';
import { clockBothText, clockFieldText, hoursText, rateText } from '../format.ts';
import { HOURS_PATHS, HOURS_TEXTS } from '../hours/texts.ts';
import { descriptionOf, titleOf } from '../seo/meta.ts';
import type { Lang } from '../time-card/receipt.ts';
import type { CommonLinks, LongTailPage } from './jobs.ts';
import { nearestOf } from './nearest.ts';
import { DAYS, pathOf, type Days } from './routes.ts';
import { SOURCES, type LongTailSection, type LongTailSource } from './sections.ts';

/*
 * The hours in days pages: "how many days is 72 hours". Every figure is plain arithmetic on the
 * hours of the page, exact in `Rational` and rounded only to be written: 24 hours a calendar day,
 * 168 a week, 8 a workday, 40 a workweek (the week past which the FLSA pays overtime), 2,080 a
 * work year (40 × 52, the year of the site's pay converters), 8,760 a calendar year of 365 days.
 */

const DAY = 24;
const WEEK = 168;
const WORKDAY = 8;
const WORKWEEK = 40;
const WORK_YEAR = 2080;
const CALENDAR_YEAR = 8760;
/** Monday at 9:00 am, in hours from Monday midnight: the start of the clock count. */
const START = 9;
/** The weekly hours of the weeks table, and the shift lengths of the shifts table. */
const WEEKLY = [40, 45, 50, 60] as const;
const SHIFTS = [8, 10, 12] as const;
/** The full-time lines of the work years table: IRS, BLS, and the 40-hour week. */
const LINES = [30, 35, 40] as const;
/** From this many hours a page also counts its hours in work years. */
const YEARS_FROM = 1000;

/** Thousands grouped with commas, in both languages: `10,000`. */
const n = (value: number): string => value.toLocaleString('en-US');

/** `hours / by` to two places at most: `4.17`, `1.8`, `25`. */
const ratio = (hours: number, by: number): string => hoursText(Rational.of(hours, by));

/** The overtime hours of `hours` worked in weeks of `weekly` hours, the last one shorter. */
const overtimeOf = (hours: number, weekly: number): number => {
  const full = Math.floor(hours / weekly);
  const rest = hours - full * weekly;
  return full * (weekly - WORKWEEK) + Math.max(0, rest - WORKWEEK);
};

/**
 * Working `hours` 8 hours a day Monday to Friday from a Monday: the workdays (the last may be
 * shorter), the hours of the last one, the calendar days from the first to the last, the week of
 * the last (0 is the first week) and its weekday (0 is Monday).
 */
const workSpanOf = (hours: number) => {
  const workdays = Math.ceil(hours / WORKDAY);
  const last = hours - (workdays - 1) * WORKDAY;
  const week = Math.floor((workdays - 1) / 5);
  const weekday = (workdays - 1) % 5;
  return { workdays, last, week, weekday, calendarDays: week * 7 + weekday + 1 };
};

/**
 * A time of day in the words of the page: `9:00 am` in English; in Spanish both clocks, for Spain
 * and Mexico at once, `21:00 (9:00 p. m.)`.
 */
const TIME_OF = {
  en: clockFieldText,
  es: clockBothText,
} as const satisfies Readonly<Record<Lang, (minutes: number) => string>>;

/** The end of `hours` on the clock from Monday at 9:00 am: days later, weekday, time of day. */
const clockEndOf = (hours: number, lang: Lang) => {
  const total = START + hours;
  const daysLater = Math.floor(total / DAY);
  return {
    daysLater,
    weekday: daysLater % 7,
    start: TIME_OF[lang](START * 60),
    time: TIME_OF[lang]((total % DAY) * 60),
  };
};

const WORDS = {
  en: {
    hours: (h: number): string => `${n(h)} hours`,
    question: (h: number): string => `How many days is ${n(h)} hours?`,
    unit: {
      week: (count: number): string => `${n(count)} week${count === 1 ? '' : 's'}`,
      day: (count: number): string => `${n(count)} day${count === 1 ? '' : 's'}`,
      hour: (count: number): string => `${n(count)} hour${count === 1 ? '' : 's'}`,
    },
    list: (parts: readonly string[]): string =>
      parts.length <= 1
        ? (parts[0] ?? '')
        : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1] ?? ''}`,
    headline: (h: number, days: string, exact: boolean, whole: string, rest: string): string =>
      exact
        ? `${n(h)} hours is ${days} day${days === '1' ? '' : 's'}`
        : `${n(h)} hours is ${days} days (${whole} ${rest})`,
    answer: (h: number, days: string, exact: boolean, split: string): string =>
      exact
        ? `${n(h)} hours is exactly ${days} day${days === '1' ? '' : 's'}: the hours divided by 24, the hours of a calendar day.`
        : `${n(h)} hours is ${days} days, or ${split}: the hours divided by 24, rounded to two places.`,
    working: (workdays: string, workweeks: string): string =>
      `As working time, it is ${workdays} workdays of 8 hours, or ${workweeks} workweeks of 40 hours.`,
    figure: 'Calendar days, 24 hours each',
    breakdown: 'The same hours in other units',
    rows: {
      split: 'Weeks, days and hours',
      minutes: 'Minutes',
      workdays: '8-hour workdays',
      workweeks: '40-hour workweeks',
      years: 'Work years of 2,080 hours',
    },
    edit: 'Count the hours between two times',
    others: 'Other hours in days',
    common: 'Hours in days',
    note: 'A calendar day is 24 hours and a week 168. A workday here is 8 hours and a workweek 40, the week past which federal law pays overtime.',
    heading: 'How the figures are worked out',
    steps: {
      days: (h: number, exact: string, cut: boolean): string =>
        `Days: ${n(h)} ÷ 24 = ${exact}${cut ? '…' : ''} days.`,
      split: (h: number, whole: number, rest: number): string =>
        rest === 0
          ? `That is ${n(whole)} whole day${whole === 1 ? '' : 's'}: ${n(whole)} × 24 = ${n(h)} hours, with no hours left.`
          : `${n(whole)} whole ${whole === 1 ? 'day is' : 'days are'} ${n(whole * DAY)} hours (${n(whole)} × 24), and ${n(h)} − ${n(whole * DAY)} = ${n(rest)} hours are left.`,
      weeks: (h: number, weeks: number, days: string): string =>
        h === weeks * WEEK
          ? `Weeks: ${n(h)} ÷ 168 = ${n(weeks)} whole week${weeks === 1 ? '' : 's'} (${n(weeks * WEEK)} hours), with no hours left.`
          : `Weeks: ${n(h)} ÷ 168 = ${n(weeks)} whole week${weeks === 1 ? '' : 's'} (${n(weeks * WEEK)} hours); the ${n(h - weeks * WEEK)} hours left are ${days}.`,
      minutes: (h: number): string =>
        `Minutes: ${n(h)} × 60 = ${n(h * 60)} minutes, or ${n(h * 3600)} seconds.`,
      work: (h: number, workdays: string, workweeks: string): string =>
        `Working time: ${n(h)} ÷ 8 = ${workdays} workdays, and ${n(h)} ÷ 40 = ${workweeks} workweeks.`,
    },
    leftDays: (days: number, hours: number): string =>
      hours === 0
        ? `${n(days)} day${days === 1 ? '' : 's'} (${n(days * DAY)} hours)`
        : `${n(days)} day${days === 1 ? '' : 's'} (${n(days * DAY)} hours) and ${n(hours)} hour${hours === 1 ? '' : 's'}`,
    weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    calendarHeading: (h: number): string => `${n(h)} hours on the clock and as working time`,
    clock: (
      h: number,
      split: string,
      later: number,
      weekday: string,
      start: string,
      time: string,
    ): string =>
      `Counted on the clock, day and night, ${n(h)} hours pass in ${split}: from a Monday at ${start}, they end ${n(later)} day${later === 1 ? '' : 's'} later, on ${weekday} at ${time}.`,
    work: (
      h: number,
      workdays: number,
      last: number,
      calendarDays: number,
      week: number,
      weekday: string,
    ): string => {
      const shorter = last < WORKDAY ? `, the last one of ${n(last)} hours,` : '';
      const where =
        week === 0
          ? `the ${weekday} of the same week`
          : week === 1
            ? `the ${weekday} of the next week`
            : `the ${weekday} of week ${n(week + 1)}`;
      const weekends = week === 0 ? '' : week === 1 ? ' with the weekend' : ' with the weekends';
      return `Counted as working time, 8 hours a day from Monday to Friday, the same ${n(h)} hours are ${n(workdays)} workdays${shorter} and take ${n(calendarDays)} calendar days${weekends}: from a Monday to ${where}.`;
    },
    times: (span: string, ratioText: string): string =>
      `The working count takes ${ratioText} times as long as the clock count (${span}), and more once holidays or days off fall in between.`,
    weeksHeading: (h: number): string => `${n(h)} hours at 40, 45, 50 and 60 hours a week`,
    underWeek: (h: number): string =>
      `${n(h)} hours fit in one workweek of 40 hours, so none of them is overtime: federal law, the FLSA, pays time and a half only for the hours past 40 in a workweek (DOL Fact Sheet #23). Spread over weeks of different lengths:`,
    oneWeek: (h: number, over: number): string =>
      `Worked in a single workweek, ${n(h)} hours means ${n(over)} hours of overtime: federal law, the FLSA, pays time and a half for every hour past 40 in a workweek (DOL Fact Sheet #23). Spread over weeks of different lengths:`,
    manyWeeks: (h: number): string =>
      `${n(h)} hours are more than one week holds (168 hours), so they spread over several workweeks. The FLSA pays time and a half for every hour past 40 in a workweek (DOL Fact Sheet #23), so the length of the week decides how many of them are overtime:`,
    weeksCaption: (h: number): string => `${n(h)} hours of work`,
    weeksHead: ['Hours a week', 'Weeks', 'Overtime hours'],
    weeksAfter:
      'The last week is the shorter one when the hours do not divide evenly, and it has overtime only if it passes 40 hours.',
    shiftsHeading: (h: number): string => `${n(h)} hours in 8, 10 and 12-hour shifts`,
    shiftsIntro: (h: number): string =>
      `The same ${n(h)} hours, counted in shifts and in weeks of five shifts:`,
    shiftsCaption: (h: number): string => `${n(h)} hours in shifts`,
    shiftsHead: ['Shift (hours)', 'Shifts', 'Weeks of 5 shifts'],
    yearsHeading: (h: number): string => `${n(h)} hours in work years`,
    years: (h: number, years: string, calendar: string): string =>
      `A full-time year of 40 hours a week for 52 weeks is 2,080 hours, the year our pay converters use. ${n(h)} hours is ${years} of those years, and ${calendar} calendar years of 8,760 hours (365 days).`,
    yearsCaption: (h: number): string => `${n(h)} hours in years of work`,
    yearsHead: ['Hours a week', 'Hours a year (52 weeks)', 'Years'],
    line: { 30: '30 (IRS full time)', 35: '35 (BLS full time)', 40: '40' },
    yearsAfter:
      'The IRS counts 30 hours a week, or 130 a month, as full time for employer health coverage, and the Bureau of Labor Statistics counts 35 or more as full time in its job statistics. Weeks off are not taken out: with two unpaid weeks, a year of 40-hour weeks is 2,000 hours.',
  },
  es: {
    hours: (h: number): string => `${n(h)} horas`,
    question: (h: number): string => `¿Cuántos días son ${n(h)} horas?`,
    unit: {
      week: (count: number): string => `${n(count)} semana${count === 1 ? '' : 's'}`,
      day: (count: number): string => `${n(count)} día${count === 1 ? '' : 's'}`,
      hour: (count: number): string => `${n(count)} hora${count === 1 ? '' : 's'}`,
    },
    list: (parts: readonly string[]): string =>
      parts.length <= 1
        ? (parts[0] ?? '')
        : `${parts.slice(0, -1).join(', ')} y ${parts[parts.length - 1] ?? ''}`,
    headline: (h: number, days: string, exact: boolean, whole: string, rest: string): string =>
      exact
        ? `${n(h)} horas son ${days} día${days === '1' ? '' : 's'}`
        : `${n(h)} horas son ${days} días (${whole} y ${rest})`,
    answer: (h: number, days: string, exact: boolean, split: string): string =>
      exact
        ? `${n(h)} horas son exactamente ${days} día${days === '1' ? '' : 's'}: las horas divididas por 24, las horas de un día de calendario.`
        : `${n(h)} horas son ${days} días, o ${split}: las horas divididas por 24, redondeadas a dos decimales.`,
    working: (workdays: string, workweeks: string): string =>
      `Como tiempo de trabajo, son ${workdays} jornadas de 8 horas, o ${workweeks} semanas laborales de 40 horas.`,
    figure: 'Días de calendario, de 24 horas cada uno',
    breakdown: 'Las mismas horas en otras unidades',
    rows: {
      split: 'Semanas, días y horas',
      minutes: 'Minutos',
      workdays: 'Jornadas de 8 horas',
      workweeks: 'Semanas laborales de 40 horas',
      years: 'Años de trabajo de 2,080 horas',
    },
    edit: 'Cuenta las horas entre dos horas del día',
    others: 'Otras horas en días',
    common: 'Horas en días',
    note: 'Un día de calendario tiene 24 horas y una semana 168. Aquí una jornada es de 8 horas y una semana laboral de 40, la semana a partir de la cual la ley federal de EE. UU. paga horas extra.',
    heading: 'Cómo se calcula',
    steps: {
      days: (h: number, exact: string, cut: boolean): string =>
        `Días: ${n(h)} ÷ 24 = ${exact}${cut ? '…' : ''} días.`,
      split: (h: number, whole: number, rest: number): string =>
        rest === 0
          ? `${whole === 1 ? 'Es 1 día entero' : `Son ${n(whole)} días enteros`}: ${n(whole)} × 24 = ${n(h)} horas, sin horas de sobra.`
          : `${n(whole)} ${whole === 1 ? 'día entero' : 'días enteros'} son ${n(whole * DAY)} horas (${n(whole)} × 24), y quedan ${n(h)} − ${n(whole * DAY)} = ${n(rest)} horas.`,
      weeks: (h: number, weeks: number, days: string): string =>
        h === weeks * WEEK
          ? `Semanas: ${n(h)} ÷ 168 = ${n(weeks)} semana${weeks === 1 ? '' : 's'} entera${weeks === 1 ? '' : 's'} (${n(weeks * WEEK)} horas), sin horas de sobra.`
          : `Semanas: ${n(h)} ÷ 168 = ${n(weeks)} semana${weeks === 1 ? '' : 's'} entera${weeks === 1 ? '' : 's'} (${n(weeks * WEEK)} horas); las ${n(h - weeks * WEEK)} horas que quedan son ${days}.`,
      minutes: (h: number): string =>
        `Minutos: ${n(h)} × 60 = ${n(h * 60)} minutos, o ${n(h * 3600)} segundos.`,
      work: (h: number, workdays: string, workweeks: string): string =>
        `Tiempo de trabajo: ${n(h)} ÷ 8 = ${workdays} jornadas, y ${n(h)} ÷ 40 = ${workweeks} semanas laborales.`,
    },
    leftDays: (days: number, hours: number): string =>
      hours === 0
        ? `${n(days)} día${days === 1 ? '' : 's'} (${n(days * DAY)} horas)`
        : `${n(days)} día${days === 1 ? '' : 's'} (${n(days * DAY)} horas) y ${n(hours)} hora${hours === 1 ? '' : 's'}`,
    weekdays: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
    calendarHeading: (h: number): string => `${n(h)} horas de reloj y de trabajo`,
    clock: (
      h: number,
      split: string,
      later: number,
      weekday: string,
      start: string,
      time: string,
    ): string =>
      `Contadas en el reloj, de día y de noche, ${n(h)} horas pasan en ${split}: desde un lunes a las ${start}, terminan ${n(later)} día${later === 1 ? '' : 's'} después, el ${weekday} a las ${time}.`,
    work: (
      h: number,
      workdays: number,
      last: number,
      calendarDays: number,
      week: number,
      weekday: string,
    ): string => {
      const shorter = last < WORKDAY ? `, la última de ${n(last)} horas,` : '';
      const where =
        week === 0
          ? `el ${weekday} de la misma semana`
          : week === 1
            ? `el ${weekday} de la semana siguiente`
            : `el ${weekday} de la semana ${n(week + 1)}`;
      const weekends =
        week === 0 ? '' : week === 1 ? ' con el fin de semana' : ' con los fines de semana';
      return `Contadas como tiempo de trabajo, 8 horas al día de lunes a viernes, las mismas ${n(h)} horas son ${n(workdays)} jornadas${shorter} y llevan ${n(calendarDays)} días de calendario${weekends}: desde un lunes hasta ${where}.`;
    },
    times: (span: string, ratioText: string): string =>
      `La cuenta de trabajo lleva ${ratioText} veces más que la del reloj (${span}), y más si en medio caen feriados o días libres.`,
    weeksHeading: (h: number): string =>
      `Horas extra en EE. UU.: ${n(h)} horas a 40, 45, 50 y 60 horas por semana`,
    underWeek: (h: number): string =>
      `En EE. UU., ${n(h)} horas caben en una semana laboral de 40 horas, así que ninguna es hora extra: la ley federal, la FLSA, paga tiempo y medio solo por las horas después de 40 en la semana laboral (DOL Fact Sheet #23). Repartidas en semanas de distinto largo:`,
    oneWeek: (h: number, over: number): string =>
      `En EE. UU., trabajadas en una sola semana laboral, ${n(h)} horas son ${n(over)} horas extra: la ley federal, la FLSA, paga tiempo y medio por cada hora después de 40 en la semana laboral (DOL Fact Sheet #23). Repartidas en semanas de distinto largo:`,
    manyWeeks: (h: number): string =>
      `${n(h)} horas son más de lo que cabe en una semana (168 horas), así que se reparten en varias semanas laborales. En EE. UU., la FLSA paga tiempo y medio por cada hora después de 40 en la semana laboral (DOL Fact Sheet #23), así que el largo de la semana decide cuántas son horas extra:`,
    weeksCaption: (h: number): string => `${n(h)} horas de trabajo`,
    weeksHead: ['Horas por semana', 'Semanas', 'Horas extra'],
    weeksAfter:
      'La última semana es la más corta cuando las horas no se dividen exacto, y tiene horas extra solo si pasa de 40 horas.',
    shiftsHeading: (h: number): string => `${n(h)} horas en turnos de 8, 10 y 12 horas`,
    shiftsIntro: (h: number): string =>
      `Las mismas ${n(h)} horas, contadas en turnos y en semanas de cinco turnos:`,
    shiftsCaption: (h: number): string => `${n(h)} horas en turnos`,
    shiftsHead: ['Turno (horas)', 'Turnos', 'Semanas de 5 turnos'],
    yearsHeading: (h: number): string => `${n(h)} horas en años de trabajo`,
    years: (h: number, years: string, calendar: string): string =>
      `Un año de tiempo completo de 40 horas por semana durante 52 semanas son 2,080 horas, el año que usan nuestros conversores de pago. ${n(h)} horas son ${years} de esos años, y ${calendar} años de calendario de 8,760 horas (365 días).`,
    yearsCaption: (h: number): string => `${n(h)} horas en años de trabajo`,
    yearsHead: ['Horas por semana', 'Horas al año (52 semanas)', 'Años'],
    line: { 30: '30 (tiempo completo del IRS)', 35: '35 (tiempo completo de la BLS)', 40: '40' },
    yearsAfter:
      'En EE. UU., el IRS cuenta 30 horas por semana, o 130 al mes, como tiempo completo para la cobertura médica del empleador, y la Oficina de Estadísticas Laborales (BLS) cuenta 35 o más como tiempo completo en sus estadísticas de empleo. No se descuentan semanas libres: con dos semanas sin pago, un año de semanas de 40 horas son 2,000 horas.',
  },
} as const;

const questionOf = (job: Days, lang: Lang): string => WORDS[lang].question(job.hours);

/** The days pages as links: every one on the hours calculator, on a days page (`except`) its nearest. */
export const daysLinksOf = (lang: Lang, except?: Days): CommonLinks => {
  const w = WORDS[lang];
  const listed = except === undefined ? DAYS : nearestOf(DAYS, except);
  return {
    heading: except === undefined ? w.common : w.others,
    links: listed.map((job) => ({ href: pathOf(job, lang), label: questionOf(job, lang) })),
  };
};

/** `hours` as weeks, days and hours, the zero parts left out: `5 weeks, 6 days and 16 hours`. */
const splitOf = (hours: number, lang: Lang, withWeeks: boolean): string => {
  const { unit, list } = WORDS[lang];
  const weeks = withWeeks ? Math.floor(hours / WEEK) : 0;
  const days = Math.floor((hours - weeks * WEEK) / DAY);
  const rest = hours % DAY;
  return list([
    ...(weeks > 0 ? [unit.week(weeks)] : []),
    ...(days > 0 ? [unit.day(days)] : []),
    ...(rest > 0 ? [unit.hour(rest)] : []),
  ]);
};

const sectionsOf = (
  job: Days,
  lang: Lang,
): { sections: readonly LongTailSection[]; sources: readonly LongTailSource[] } => {
  const w = WORDS[lang];
  const h = job.hours;
  const days = Rational.of(h, DAY);
  const whole = Math.floor(h / DAY);
  const rest = h % DAY;
  const weeks = Math.floor(h / WEEK);
  const left = h - weeks * WEEK;
  const workdays = ratio(h, WORKDAY);
  const workweeks = ratio(h, WORKWEEK);
  const span = workSpanOf(h);
  const end = clockEndOf(h, lang);
  const weekday = (index: number): string => w.weekdays[index] ?? '';
  const sections: LongTailSection[] = [
    {
      id: 'worked',
      heading: w.heading,
      paragraphs: [],
      steps: [
        w.steps.days(h, rateText(days), (h * 10_000) % DAY !== 0),
        w.steps.split(h, whole, rest),
        ...(weeks > 0
          ? [w.steps.weeks(h, weeks, w.leftDays(Math.floor(left / DAY), left % DAY))]
          : []),
        w.steps.minutes(h),
        w.steps.work(h, workdays, workweeks),
      ],
    },
    {
      id: 'calendar',
      heading: w.calendarHeading(h),
      paragraphs: [
        w.clock(
          h,
          splitOf(h, lang, false),
          end.daysLater,
          weekday(end.weekday),
          end.start,
          end.time,
        ),
        w.work(h, span.workdays, span.last, span.calendarDays, span.week, weekday(span.weekday)),
        w.times(splitOf(h, lang, false), hoursText(Rational.of(span.calendarDays * DAY, h))),
      ],
    },
    {
      id: 'shifts',
      heading: w.shiftsHeading(h),
      paragraphs: [w.shiftsIntro(h)],
      table: {
        caption: w.shiftsCaption(h),
        head: w.shiftsHead,
        rows: SHIFTS.map((shift) => [String(shift), ratio(h, shift), ratio(h, shift * 5)]),
      },
    },
    // The overtime rule is US law: after the time arithmetic, and labelled so in Spanish.
    {
      id: 'weeks',
      heading: w.weeksHeading(h),
      paragraphs: [
        h <= WORKWEEK ? w.underWeek(h) : h <= WEEK ? w.oneWeek(h, h - WORKWEEK) : w.manyWeeks(h),
      ],
      table: {
        caption: w.weeksCaption(h),
        head: w.weeksHead,
        rows: WEEKLY.map((weekly) => [String(weekly), ratio(h, weekly), n(overtimeOf(h, weekly))]),
      },
      after: [w.weeksAfter],
    },
  ];
  if (h < YEARS_FROM) return { sections, sources: [SOURCES.factSheet23] };
  sections.push({
    id: 'years',
    heading: w.yearsHeading(h),
    paragraphs: [w.years(h, ratio(h, WORK_YEAR), ratio(h, CALENDAR_YEAR))],
    table: {
      caption: w.yearsCaption(h),
      head: w.yearsHead,
      rows: LINES.map((weekly) => [w.line[weekly], n(weekly * 52), ratio(h, weekly * 52)]),
    },
    after: [w.yearsAfter],
  });
  return { sections, sources: [SOURCES.factSheet23, SOURCES.irsFullTime, SOURCES.blsCps] };
};

/** The page of one hours in days job in one language, every figure worked out at build time. */
export const daysPageOf = (job: Days, lang: Lang): LongTailPage => {
  const w = WORDS[lang];
  const h = job.hours;
  const days = Rational.of(h, DAY);
  const figure = hoursText(days);
  const exact = h % DAY === 0;
  const split = splitOf(h, lang, false);
  const whole = w.unit.day(Math.floor(h / DAY));
  const rest = w.unit.hour(h % DAY);
  const headline = w.headline(h, figure, exact, whole, rest);
  const workdays = ratio(h, WORKDAY);
  const workweeks = ratio(h, WORKWEEK);
  const lead = `${w.answer(h, figure, exact, split)} ${w.working(workdays, workweeks)}`;
  const rows = [
    { key: 'split', label: w.rows.split, value: splitOf(h, lang, true) },
    { key: 'minutes', label: w.rows.minutes, value: n(h * 60) },
    { key: 'workdays', label: w.rows.workdays, value: workdays },
    { key: 'workweeks', label: w.rows.workweeks, value: workweeks },
    { key: 'years', label: w.rows.years, value: ratio(h, WORK_YEAR) },
  ];
  return {
    kicker: HOURS_TEXTS[lang].kicker,
    title: titleOf(headline),
    description: descriptionOf(
      `${headline}. ${w.working(workdays, workweeks)}`,
      rows.map(({ label, value }) => `${label}: ${value}`),
    ),
    h1: questionOf(job, lang),
    lead,
    figure,
    figureLabel: w.figure,
    breakdown: w.breakdown,
    rows,
    calculator: { href: HOURS_PATHS[lang], label: w.edit, title: HOURS_TEXTS[lang].title },
    note: w.note,
    paths: { en: pathOf(job, 'en'), es: pathOf(job, 'es') },
    others: daysLinksOf(lang, job),
    ...sectionsOf(job, lang),
  };
};
