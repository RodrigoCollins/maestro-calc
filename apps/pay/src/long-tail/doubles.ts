import { encode, type Money, type Rational } from '@maestro-calc/core';
import { overtime } from '@maestro-calc/pay-core/overtime';
import { moneyText } from '../format.ts';
import { OVERTIME_PATHS, OVERTIME_TEXTS } from '../overtime/texts.ts';
import { descriptionOf, titleOf } from '../seo/meta.ts';
import type { Lang } from '../time-card/receipt.ts';
import type { CommonLinks, LongTailPage } from './jobs.ts';
import { nearestOf } from './nearest.ts';
import { DOUBLES, pathOf, type DoubleTime } from './routes.ts';

/** `$40.00` reads `$40` in a sentence; cents stay when there are any. */
const short = (text: string): string => text.replace(/\.00$/, '');

/** The hours past which California pays double time in a day. */
const DAY_HOURS = 12;

/** The double-time hours of the table, and the ones the lead and the calculator link use. */
const DOUBLE_HOURS = [1, 2, 4, 8] as const;
const MAIN_HOURS = 2;

const WORDS = {
  en: {
    question: (given: string): string => `What is double time for ${given}?`,
    answer: (given: string, rate: string, hours: number, pay: string, week: string): string =>
      `Double time for ${given} is ${rate} an hour. In California, hours past 12 in a day pay double: a ${String(DAY_HOURS + hours)}-hour day pays ${String(hours)} hours of double time, ${pay}, and a week of that day and four 8-hour days comes to ${week} before taxes.`,
    per: 'an hour',
    row: (hours: number): string =>
      `Pay for ${String(hours)} double-time ${hours === 1 ? 'hour' : 'hours'}`,
    breakdown: 'Double-time pay by hours',
    edit: 'Enter your own week in the overtime calculator',
    others: 'Double time at other rates',
    common: 'Double time at common rates',
  },
  es: {
    question: (given: string): string => `¿Cuánto es tiempo doble de ${given}?`,
    answer: (given: string, rate: string, hours: number, pay: string, week: string): string =>
      `Tiempo doble de ${given} es ${rate} la hora. En California, las horas después de 12 en un día se pagan al doble: un día de ${String(DAY_HOURS + hours)} horas paga ${String(hours)} horas dobles, ${pay}, y una semana con ese día y cuatro días de 8 horas suma ${week} antes de impuestos.`,
    per: 'la hora',
    row: (hours: number): string =>
      `Pago por ${String(hours)} ${hours === 1 ? 'hora doble' : 'horas dobles'}`,
    breakdown: 'Pago de horas dobles según las horas',
    edit: 'Anota tu propia semana en la calculadora de horas extra',
    others: 'Tiempo doble con otras tarifas',
    common: 'Tiempo doble con tarifas comunes',
  },
} as const;

/**
 * A week of the overtime calculator at `rate` with `hours` double-time hours under the California
 * rule: a Monday of 12 hours plus `hours`, Tuesday to Friday 8 hours each, no weekend.
 */
export const doubleWeekOf = (rate: string, hours: number): Readonly<Record<string, string>> => ({
  rate,
  rule: 'california',
  mon: String(DAY_HOURS + hours),
  tue: '8',
  wed: '8',
  thu: '8',
  fri: '8',
  sat: '0',
  sun: '0',
});

const questionOf = (job: DoubleTime, lang: Lang): string =>
  WORDS[lang].question(`$${job.amount} ${WORDS[lang].per}`);

/** The double-time pages as links: every one on the overtime calculator, on one its nearest. */
export const doubleLinksOf = (lang: Lang, except?: DoubleTime): CommonLinks => {
  const w = WORDS[lang];
  const listed = except === undefined ? DOUBLES : nearestOf(DOUBLES, except);
  return {
    heading: except === undefined ? w.common : w.others,
    links: listed.map((job) => ({ href: pathOf(job, lang), label: questionOf(job, lang) })),
  };
};

/** The money outputs of the overtime calculator on the California week with `hours` double. */
const doubleRun = (rate: string, hours: number): ((key: string) => string) => {
  const ran = overtime.run(doubleWeekOf(rate, hours));
  if (!ran.ok) throw new Error(`the double-time week of ${rate} must run`);
  const out = new Map<string, Money | Rational>(
    ran.value.outputs.map(({ key, value }) => [key, value]),
  );
  return (key) => {
    const value = out.get(key);
    if (value === undefined || !('currency' in value)) throw new Error(`no money output ${key}`);
    return moneyText(value);
  };
};

/** The page of one double-time job in one language, every figure from the overtime calculator. */
export const doublePageOf = (job: DoubleTime, lang: Lang): LongTailPage => {
  const w = WORDS[lang];
  const t = OVERTIME_TEXTS[lang];
  const figure = doubleRun(job.amount, 1)('doubleRate');
  const rows = DOUBLE_HOURS.map((hours) => ({
    key: String(hours),
    label: w.row(hours),
    value: doubleRun(job.amount, hours)('doublePay'),
  }));
  const main = doubleRun(job.amount, MAIN_HOURS);
  const question = questionOf(job, lang);
  const answer = w.answer(
    `$${job.amount} ${w.per}`,
    short(figure),
    MAIN_HOURS,
    short(main('doublePay')),
    short(main('pay')),
  );
  const validated = overtime.validate(doubleWeekOf(job.amount, MAIN_HOURS));
  if (!validated.ok) throw new Error(`the double-time week of ${job.amount} must validate`);
  const note = t.notes[1];
  if (note === undefined) throw new Error('the overtime calculator must state the California rule');
  return {
    kicker: t.kicker,
    title: titleOf(`${question} ${short(figure)}`),
    description: descriptionOf(
      answer,
      rows.map(({ label, value }) => `${label}: ${short(value)}`),
    ),
    h1: question,
    lead: answer,
    figure,
    figureLabel: t.doubleRate,
    breakdown: w.breakdown,
    rows,
    calculator: {
      href: `${OVERTIME_PATHS[lang]}?${encode(overtime, validated.value)}`,
      label: w.edit,
      title: t.title,
    },
    note,
    paths: { en: pathOf(job, 'en'), es: pathOf(job, 'es') },
    others: doubleLinksOf(lang, job),
  };
};
