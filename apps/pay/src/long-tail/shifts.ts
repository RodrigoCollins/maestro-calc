import { encode, Rational, toDecimalParts, usd, type Money } from '@maestro-calc/core';
import { hoursBetween } from '@maestro-calc/pay-core/hours';
import { shiftPay } from '@maestro-calc/pay-core/shift-pay';
import {
  clockFieldText,
  decimalHoursText,
  hoursMinutesText,
  hoursText,
  moneyText,
} from '../format.ts';
import { FULL_TIME_GUIDE_PATHS } from '../guide/paths.ts';
import { HOURS_PATHS, HOURS_TEXTS } from '../hours/texts.ts';
import { OVERTIME_PATHS } from '../overtime/texts.ts';
import { descriptionOf, titleOf } from '../seo/meta.ts';
import type { Lang } from '../time-card/receipt.ts';
import type { CommonLinks, LongTailPage, ShiftTool } from './jobs.ts';
import { clockOf, fieldOf } from './clock.ts';
import { nearestOf } from './nearest.ts';
import { pathOf, SHIFTS, type Shift } from './routes.ts';
import type { LongTailSection } from './sections.ts';
import { shiftSectionsOf } from './shift-sections.ts';

/** The days of the work week the weekly rows count. */
const DAYS = 5;

/** The unpaid breaks of the rows, in minutes. */
const BREAKS = [30, 60] as const;

/** Minutes from midnight to noon: a morning time is before it. */
const NOON = 720;

/** The tool opens on the lunch the lead works with, at the hourly rate of the pay table. */
const TOOL_BREAK = BREAKS[0];
const TOOL_RATE = usd(20);

/** A title gets the tool cue only while the whole name fits a search result, about 60 characters. */
const CUED_MAX = 60;

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

/**
 * The short form an English search types for a day shift, `9 to 5` and `9-5`: only from a morning
 * start to an afternoon end whose clock number is the smaller, so `9 to 5` can only mean 9 am to
 * 5 pm; `9 am to 9 pm`, `7 pm to 7 am` and every overnight shift keep their am and pm.
 */
const shortOf = (shift: Shift): { readonly to: string; readonly dash: string } | undefined => {
  const hour12 = (minutes: number): number => Math.floor(minutes / 60) % 12 || 12;
  const day = shift.start < NOON && shift.end > NOON && shift.end > shift.start;
  if (!day || hour12(shift.end) >= hour12(shift.start)) return undefined;
  const bare = (minutes: number): string => clockOf(minutes).replace(/ [ap]m$/, '');
  return {
    to: `${bare(shift.start)} to ${bare(shift.end)}`,
    dash: `${bare(shift.start)}-${bare(shift.end)}`,
  };
};

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
    week: (hours: string, decimal: string, figure: string, out: string): string =>
      `With a 30-minute unpaid lunch you work ${hours}, or ${decimal} hours; to be paid the full ${figure}, clock out at ${out}.`,
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
    cue: ' — with lunch & pay calculator',
    tool: {
      heading: 'Your shift, your lunch and your pay',
      rate: 'Hourly rate ($)',
      figures: 'Your shift, the day and the week',
      lines: {
        shiftHours: 'Shift, start to end',
        hours: 'Paid hours after the break',
        decimal: 'Paid hours in decimal',
        dayPay: 'Pay for the day',
        weekHours: 'The week, 5 shifts',
        overtimeHours: 'Overtime past 40 hours',
        weekPay: 'Pay for the week, overtime at 1.5×',
      },
    },
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
    week: (hours: string, decimal: string, figure: string, out: string): string =>
      `Con un descanso sin pago de 30 minutos trabajas ${hours}, o ${decimal} horas; para cobrar las ${figure} completas, sal ${/^1[: ]/.test(out) ? 'a la' : 'a las'} ${out}.`,
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
    cue: ' — calcula descanso y pago',
    tool: {
      heading: 'Tu turno, tu descanso y tu pago',
      rate: 'Pago por hora ($)',
      figures: 'Tu turno, el día y la semana',
      lines: {
        shiftHours: 'Turno, de la entrada a la salida',
        hours: 'Horas pagadas después del descanso',
        decimal: 'Horas pagadas en decimales',
        dayPay: 'Pago del día',
        weekHours: 'La semana, 5 turnos',
        overtimeHours: 'Horas extra después de 40',
        weekPay: 'Pago de la semana, horas extra a 1.5 veces',
      },
    },
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

/** The lines of the tool: each output of the shift pay calculator, the paid hours both ways. */
const LINES: readonly {
  readonly key: string;
  readonly label: keyof (typeof WORDS)['en']['tool']['lines'];
  readonly format?: 'hours-minutes' | 'decimal';
}[] = [
  { key: 'shiftHours', label: 'shiftHours', format: 'hours-minutes' },
  { key: 'hours', label: 'hours', format: 'hours-minutes' },
  { key: 'hours', label: 'decimal', format: 'decimal' },
  { key: 'dayPay', label: 'dayPay' },
  { key: 'weekHours', label: 'weekHours', format: 'hours-minutes' },
  { key: 'overtimeHours', label: 'overtimeHours', format: 'hours-minutes' },
  { key: 'weekPay', label: 'weekPay' },
];

const isMoney = (value: unknown): value is Money =>
  typeof value === 'object' && value !== null && 'currency' in value;

/** The tool of `shift`: its fields prefilled, and the shift pay calculator's figures for them. */
const toolOf = (shift: Shift, lang: Lang): ShiftTool => {
  const w = WORDS[lang].tool;
  const t = HOURS_TEXTS[lang];
  const { integer, fraction } = toDecimalParts(TOOL_RATE.amount, 2);
  const fields = [
    { key: 'start', label: t.start, value: clockFieldText(shift.start) },
    { key: 'end', label: t.end, value: clockFieldText(shift.end) },
    { key: 'unpaidBreak', label: t.unpaidBreak, value: String(TOOL_BREAK) },
    { key: 'rate', label: w.rate, value: `${String(integer)}.${fraction}` },
  ] as const;
  const ran = shiftPay.run(Object.fromEntries(fields.map(({ key, value }) => [key, value])));
  if (!ran.ok) throw new Error(`the tool of ${shift.slug.en} must run`);
  const outputs = new Map<string, unknown>(ran.value.outputs.map(({ key, value }) => [key, value]));
  const lines = LINES.map((line) => {
    const value = outputs.get(line.key);
    const label = w.lines[line.label];
    if (value instanceof Rational) {
      const text = line.format === 'decimal' ? decimalHoursText(value) : hoursMinutesText(value);
      return { key: line.key, format: line.format ?? 'hours-minutes', label, value: text };
    }
    if (!isMoney(value)) throw new Error(`the shift pay calculator has no ${line.key}`);
    return { key: line.key, label, value: moneyText(value) };
  });
  const codes = new Set<string>(ran.value.warnings.map(({ code }) => code));
  return {
    heading: w.heading,
    hint: t.timeHint,
    figures: w.figures,
    fields,
    lines,
    warnings: Object.entries(t.warnings).map(([code, text]) => ({
      code,
      text,
      hidden: !codes.has(code),
    })),
  };
};

/** `7 h 30 min (7.50)`: a row reads both ways. */
const bothOf = (hours: Rational): string =>
  `${hoursMinutesText(hours)} (${decimalHoursText(hours)})`;

/** The headline with the tool cue when both fit a search result; the headline alone otherwise. */
const cuedOf = (headline: string, cue: string): string =>
  `${headline}${cue}`.length <= CUED_MAX ? `${headline}${cue}` : headline;

/** The weeks of a year and the months they average over. */
const YEAR_WEEKS = 52;
const MONTHS = 12;

/** The hours a workweek holds before federal overtime (DOL Fact Sheet #23). */
const OVERTIME_LINE = 40;

/**
 * The English search result of a shift: the question as people type it, "9 to 5 is how many
 * hours", answered in the title with the hours and the hours after a 30-minute lunch; the
 * description adds the week, the pay period and the year.
 */
const englishResultOf = (
  shift: Shift,
  hours: Rational,
  lunch: Rational,
): { readonly title: string; readonly description: string } => {
  const typed = shortOf(shift);
  const searched = searchedOf(shift, 'en');
  const full = `${searched.start} to ${searched.end}`;
  const said = typed?.to ?? full;
  const days = Rational.of(DAYS);
  const answer = `${typed === undefined ? full : `${said} (${full})`} is ${WORDS.en.hours(hours)}, or ${hoursText(lunch)} hours with a 30-minute unpaid lunch.`;
  const weekly = hours.mul(days);
  const more = `${String(DAYS)} days: ${hoursText(weekly)} hours a week, ${hoursText(weekly.mul(Rational.of(2)))} biweekly, ${hoursText(weekly.mul(Rational.of(YEAR_WEEKS)))} a year; overtime math and a time card.`;
  return {
    title: titleOf(
      `${said} Is How Many Hours? ${hoursText(hours)} Hours, ${hoursText(lunch)} With Lunch`,
    ),
    description: descriptionOf(`${answer} ${more}`),
  };
};

/**
 * The English table of the shift at a glance: the hours a day, a week of five, a biweekly pay
 * period, an average month and a year, with no lunch and with an unpaid one of 30 or 60 minutes,
 * then the overtime of the week, all from the hours calculator.
 */
const glanceOf = (shift: Shift, days: readonly Rational[]): LongTailSection => {
  const typed = shortOf(shift);
  const start = clockOf(shift.start);
  const end = clockOf(shift.end);
  const name = typed?.dash ?? `${start} to ${end}`;
  const weekOf = (day: Rational): Rational => day.mul(Rational.of(DAYS));
  const rows = days.map((day, index) => {
    const weekly = weekOf(day);
    return [
      ['None', '30 minutes', '60 minutes'][index] ?? '',
      hoursText(day),
      hoursText(weekly),
      hoursText(weekly.mul(Rational.of(2))),
      hoursText(weekly.mul(Rational.of(YEAR_WEEKS, MONTHS))),
      hoursText(weekly.mul(Rational.of(YEAR_WEEKS))),
    ];
  });
  const [none, lunch] = days;
  if (none === undefined || lunch === undefined) throw new Error('the glance needs two days');
  const paid = weekOf(lunch);
  const over = paid.sub(Rational.of(OVERTIME_LINE));
  const overtime =
    over.compare(Rational.of(0)) > 0
      ? `Five shifts with a 30-minute lunch are ${hoursText(paid)} paid hours, so ${hoursText(over)} hours of overtime a week at time and a half under federal law; four are ${hoursText(lunch.mul(Rational.of(4)))}.`
      : `Five shifts with a 30-minute lunch are ${hoursText(paid)} paid hours, inside the 40 past which federal law pays time and a half, so no overtime.`;
  return {
    id: 'glance',
    heading: `${name} in hours: a day, a week, a month and a year`,
    paragraphs: [
      `${start} to ${end} five days a week is ${hoursText(weekOf(none))} hours on the clock and ${hoursText(weekOf(none).mul(Rational.of(YEAR_WEEKS)))} over 52 weeks. ${overtime}`,
    ],
    table: {
      caption: `Hours of ${start} to ${end}, by unpaid lunch`,
      head: [
        'Unpaid lunch',
        'Day',
        'Week, 5 days',
        'Two weeks',
        'Month, average',
        'Year, 52 weeks',
      ],
      rows,
    },
    links: [
      { href: HOURS_PATHS.en, label: 'Every shift and any two times: the hours calculator' },
      { href: FULL_TIME_GUIDE_PATHS.en, label: 'How many hours is full time?' },
      { href: OVERTIME_PATHS.en, label: 'Overtime calculator: time and a half past 40 hours' },
      { href: '/time-card-calculator', label: 'Time card calculator: a week, day by day' },
    ],
  };
};

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
      w.week(w.hours(short), decimalHoursText(short), figure, clockOf(shift.end + BREAKS[0])),
    ].join(' ');
  const typed = lang === 'en' ? shortOf(shift) : undefined;
  // `9-5, or 9 am to 5 pm, is 8 hours`: the short form first, as an English search types it
  const lead =
    typed === undefined ? leadFrom(start, end) : leadFrom(`${typed.dash}, or ${start}`, `${end},`);
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
  const result =
    lang === 'en'
      ? englishResultOf(shift, hours, short)
      : {
          title: titleOf(cuedOf(w.headline(searched.start, searched.end, figure), w.cue)),
          description: descriptionOf(
            leadFrom(searched.start, searched.end),
            rows.slice(1).map(({ label, value }) => `${label}: ${value}`),
          ),
        };
  const { sections, sources } = shiftSectionsOf(shift, lang, figure);
  return {
    kicker: t.kicker,
    ...result,
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
    tool: toolOf(shift, lang),
    // the English page opens its sections on the table at a glance; the Spanish one as it was
    sections: lang === 'en' ? [glanceOf(shift, [hours, short, long]), ...sections] : sections,
    sources,
  };
};
