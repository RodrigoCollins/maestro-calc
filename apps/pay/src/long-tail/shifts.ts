import { encode, Rational, toDecimalParts } from '@maestro-calc/core';
import { hoursBetween } from '@maestro-calc/pay-core/hours';
import { decimalHoursText, hoursMinutesText, hoursText } from '../format.ts';
import { HOURS_PATHS, HOURS_TEXTS } from '../hours/texts.ts';
import { descriptionOf, titleOf } from '../seo/meta.ts';
import type { Lang } from '../time-card/receipt.ts';
import type { CommonLinks, LongTailPage } from './jobs.ts';
import { nearestOf } from './nearest.ts';
import { pathOf, SHIFTS, type Shift } from './routes.ts';

/** The days of the work week the weekly rows count. */
const DAYS = 5;

/** The unpaid breaks of the rows, in minutes. */
const BREAKS = [30, 60] as const;

/** `9 am`, `8:30 am`, `12 pm`: a time as people search it, the same in both languages. */
const clockOf = (minutes: number): string => {
  const hour = Math.floor(minutes / 60);
  const clock = String(hour % 12 === 0 ? 12 : hour % 12);
  const time = minutes % 60 === 0 ? clock : `${clock}:${String(minutes % 60).padStart(2, '0')}`;
  return `${time} ${hour < 12 ? 'am' : 'pm'}`;
};

/** Minutes from midnight to noon: a morning time is before it. */
const NOON = 720;

/**
 * The start and end as people type them in a search: `9 AM` and `5 PM` in English; in Spanish a
 * day shift from a morning to an afternoon drops the am and pm (`de 9 a 5`), and every other shift
 * keeps them, so 7 pm to 7 am never reads as 7 am to 7 pm.
 */
const searchedOf = (shift: Shift, lang: Lang): { readonly start: string; readonly end: string } => {
  const start = clockOf(shift.start);
  const end = clockOf(shift.end);
  if (lang === 'en') return { start: start.toUpperCase(), end: end.toUpperCase() };
  const day = shift.start < NOON && shift.end >= NOON && shift.end > shift.start;
  const bare = (clock: string): string => clock.replace(/ [ap]m$/, '');
  return day ? { start: bare(start), end: bare(end) } : { start, end };
};

/** A time as the hours calculator reads it, on a 24-hour clock: `17:00`. */
const fieldOf = (minutes: number): string =>
  `${String(Math.floor(minutes / 60))}:${String(minutes % 60).padStart(2, '0')}`;

/** Hours and whole minutes of `hours`, to the nearest minute. */
const partsOf = (hours: Rational): { readonly h: number; readonly min: number } => {
  const minutes = Number(toDecimalParts(hours.mul(Rational.of(60)), 0).integer);
  return { h: Math.floor(minutes / 60), min: minutes % 60 };
};

const WORDS = {
  en: {
    question: (start: string, end: string): string => `How many hours is ${start} to ${end}?`,
    headline: (start: string, end: string, hours: string): string =>
      `${start} to ${end} is ${hours}`,
    hours: (hours: Rational): string => {
      const { h, min } = partsOf(hours);
      const whole = `${String(h)} hour${h === 1 ? '' : 's'}`;
      return min === 0 ? whole : `${whole} ${String(min)} minutes`;
    },
    answer: (start: string, end: string, hours: string, decimal: string): string =>
      `${start} to ${end} is ${hours}, or ${decimal} decimal hours.`,
    overnight: (end: string): string =>
      `The shift crosses midnight and ends at ${end} the next day.`,
    week: (hours: string, decimal: string, week: string): string =>
      `With a 30-minute unpaid break you work ${hours}, or ${decimal} hours, and five of these shifts come to ${week} hours a week.`,
    figure: 'From start to end, with no break',
    breakdown: 'The hours with a break, by day and by week',
    rows: {
      decimal: 'In decimal hours',
      break30: 'With a 30-minute unpaid break',
      break60: 'With a 60-minute unpaid break',
      week: '5 days a week, no break',
      week30: '5 days, 30-minute breaks',
      week60: '5 days, 60-minute breaks',
    },
    edit: 'Change the times or add your break in the hours calculator',
    others: 'Other common shifts',
    common: 'Hours of common shifts',
  },
  es: {
    question: (start: string, end: string): string => `¿Cuántas horas son de ${start} a ${end}?`,
    headline: (start: string, end: string, hours: string): string =>
      `De ${start} a ${end} son ${hours}`,
    hours: (hours: Rational): string => {
      const { h, min } = partsOf(hours);
      const whole = `${String(h)} hora${h === 1 ? '' : 's'}`;
      return min === 0 ? whole : `${whole} y ${String(min)} minutos`;
    },
    answer: (start: string, end: string, hours: string, decimal: string): string =>
      `De ${start} a ${end} son ${hours}, o ${decimal} horas decimales.`,
    overnight: (end: string): string =>
      `El turno cruza la medianoche y termina a las ${end} del día siguiente.`,
    week: (hours: string, decimal: string, week: string): string =>
      `Con un descanso sin pago de 30 minutos trabajas ${hours}, o ${decimal} horas, y cinco de estos turnos suman ${week} horas a la semana.`,
    figure: 'De la entrada a la salida, sin descanso',
    breakdown: 'Las horas con descanso, por día y por semana',
    rows: {
      decimal: 'En horas decimales',
      break30: 'Con 30 minutos de descanso sin pago',
      break60: 'Con 60 minutos de descanso sin pago',
      week: '5 días a la semana, sin descanso',
      week30: '5 días, descansos de 30 minutos',
      week60: '5 días, descansos de 60 minutos',
    },
    edit: 'Cambia las horas o agrega tu descanso en la calculadora de horas',
    others: 'Otros turnos comunes',
    common: 'Horas de turnos comunes',
  },
} as const;

/** The raw input of the hours calculator for `shift` less `unpaidBreak` minutes. */
const rawOf = (shift: Shift, unpaidBreak: number): Readonly<Record<string, string>> => ({
  start: fieldOf(shift.start),
  end: fieldOf(shift.end),
  unpaidBreak: String(unpaidBreak),
});

/** The hours calculator on `shift` less `unpaidBreak` minutes: the hours, and whether it is overnight. */
const runOf = (shift: Shift, unpaidBreak: number): { hours: Rational; overnight: boolean } => {
  const ran = hoursBetween.run(rawOf(shift, unpaidBreak));
  if (!ran.ok) throw new Error(`the shift ${shift.slug.en} must run`);
  const hours = ran.value.outputs.find(({ key }) => key === 'hours')?.value;
  if (hours === undefined) throw new Error(`no hours for ${shift.slug.en}`);
  const overnight = ran.value.warnings.some(({ code }) => code === 'overnight');
  return { hours, overnight };
};

const questionOf = (shift: Shift, lang: Lang): string =>
  WORDS[lang].question(clockOf(shift.start), clockOf(shift.end));

/** The shift pages as links: every one on the hours calculator, on a shift page (`except`) its nearest. */
export const shiftLinksOf = (lang: Lang, except?: Shift): CommonLinks => {
  const w = WORDS[lang];
  const listed = except === undefined ? SHIFTS : nearestOf(SHIFTS, except);
  return {
    heading: except === undefined ? w.common : w.others,
    links: listed.map((shift) => ({ href: pathOf(shift, lang), label: questionOf(shift, lang) })),
  };
};

/** `7 h 30 min (7.50)`: a row reads both ways. */
const bothOf = (hours: Rational): string =>
  `${hoursMinutesText(hours)} (${decimalHoursText(hours)})`;

/** The page of one shift in one language, every figure from the hours calculator at build time. */
export const shiftPageOf = (shift: Shift, lang: Lang): LongTailPage => {
  const w = WORDS[lang];
  const t = HOURS_TEXTS[lang];
  const { hours, overnight } = runOf(shift, 0);
  const [short, long] = BREAKS.map((unpaidBreak) => runOf(shift, unpaidBreak).hours);
  if (short === undefined || long === undefined) throw new Error('two breaks');
  const week = (day: Rational): Rational => day.mul(Rational.of(DAYS));
  const start = clockOf(shift.start);
  const end = clockOf(shift.end);
  const figure = w.hours(hours);
  const question = questionOf(shift, lang);
  const searched = searchedOf(shift, lang);
  const leadFrom = (from: string, to: string): string =>
    [
      w.answer(from, to, figure, decimalHoursText(hours)),
      ...(overnight ? [w.overnight(end)] : []),
      w.week(w.hours(short), decimalHoursText(short), hoursText(week(short))),
    ].join(' ');
  const lead = leadFrom(start, end);
  const rows = [
    { key: 'decimal', label: w.rows.decimal, value: decimalHoursText(hours) },
    { key: 'break30', label: w.rows.break30, value: bothOf(short) },
    { key: 'break60', label: w.rows.break60, value: bothOf(long) },
    { key: 'week', label: w.rows.week, value: bothOf(week(hours)) },
    { key: 'week30', label: w.rows.week30, value: bothOf(week(short)) },
    { key: 'week60', label: w.rows.week60, value: bothOf(week(long)) },
  ];
  const note = overnight ? t.warnings.overnight : t.notes[2];
  if (note === undefined) throw new Error('the hours calculator must say what a break does');
  const validated = hoursBetween.validate(rawOf(shift, 0));
  if (!validated.ok) throw new Error(`the shift ${shift.slug.en} must validate`);
  return {
    kicker: t.kicker,
    title: titleOf(w.headline(searched.start, searched.end, figure)),
    description: descriptionOf(
      leadFrom(searched.start, searched.end),
      rows.slice(1).map(({ label, value }) => `${label}: ${value}`),
    ),
    h1: question,
    lead,
    figure,
    figureLabel: w.figure,
    breakdown: w.breakdown,
    rows,
    calculator: {
      href: `${HOURS_PATHS[lang]}?${encode(hoursBetween, validated.value)}`,
      label: w.edit,
      title: t.title,
    },
    note,
    paths: { en: pathOf(shift, 'en'), es: pathOf(shift, 'es') },
    others: shiftLinksOf(lang, shift),
  };
};
