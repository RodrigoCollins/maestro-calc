import { encode, type Money, type Rational } from '@maestro-calc/core';
import { shiftDifferential } from '@maestro-calc/pay-core/shift-differential';
import { moneyText } from '../format.ts';
import { SHIFT_PATHS, SHIFT_TEXTS } from '../shift/texts.ts';
import type { Lang } from '../time-card/receipt.ts';
import type { CommonLinks, LongTailPage } from './jobs.ts';
import { nearestOf } from './nearest.ts';
import { DIFFERENTIALS, pathOf, type Differential } from './routes.ts';

/** `$22.00` reads `$22` in a sentence; cents stay when there are any. */
const short = (text: string): string => text.replace(/\.00$/, '');

/** The week of the page: 24 hours at the base rate and 24 on the shift, 8 of them over 40. */
const BASE_HOURS = 24;
const SHIFT_HOURS = 24;

/** The outputs of that week the page lists, in the engine's order, then the pay of the week. */
const ROW_KEYS = [
  'differentialPay',
  'straightPay',
  'regularRate',
  'overtimePremium',
  'pay',
] as const;

interface Figures {
  readonly base: string;
  readonly differential: string;
  readonly shiftRate: string;
  readonly regularRate: string;
  readonly premium: string;
  readonly pay: string;
}

const WORDS = {
  en: {
    question: (job: Differential): string =>
      job.source === 'percent'
        ? `What is a ${job.differential}% shift differential on $${job.amount} an hour?`
        : `What is $${job.amount} an hour with a $${job.differential} shift differential?`,
    answer: (job: Differential, f: Figures): string =>
      `${
        job.source === 'percent'
          ? `A ${job.differential}% shift differential on ${f.base} an hour adds ${f.differential} an hour, so the shift pays ${f.shiftRate} an hour.`
          : `${f.base} an hour with a ${f.differential} shift differential pays ${f.shiftRate} an hour on the shift.`
      } In a 48-hour week, 24 hours at ${f.base} and 24 on the shift, the differential counts in the regular rate for overtime: ${f.regularRate} an hour, so the 8 hours over 40 add ${f.premium} and the week pays ${f.pay} before taxes.`,
    breakdown: 'A 48-hour week, 24 hours on the shift',
    pay: 'Pay of the 48-hour week',
    edit: 'Enter your own week in the shift differential calculator',
    others: 'Other shift differentials',
    common: 'Shift differentials at common rates',
  },
  es: {
    question: (job: Differential): string =>
      job.source === 'percent'
        ? `¿Cuánto es un diferencial de turno del ${job.differential}% sobre $${job.amount} la hora?`
        : `¿Cuánto es $${job.amount} la hora con un diferencial de turno de $${job.differential}?`,
    answer: (job: Differential, f: Figures): string =>
      `${
        job.source === 'percent'
          ? `Un diferencial de turno del ${job.differential}% sobre ${f.base} la hora suma ${f.differential} la hora, así que el turno paga ${f.shiftRate} la hora.`
          : `${f.base} la hora con un diferencial de turno de ${f.differential} paga ${f.shiftRate} la hora en el turno.`
      } En una semana de 48 horas, 24 a ${f.base} y 24 en el turno, el diferencial cuenta en la tarifa regular para horas extra: ${f.regularRate} la hora, así que las 8 horas después de 40 suman ${f.premium} y la semana paga ${f.pay} antes de impuestos.`,
    breakdown: 'Una semana de 48 horas, 24 en el turno',
    pay: 'Pago de la semana de 48 horas',
    edit: 'Anota tu propia semana en la calculadora de diferencial de turno',
    others: 'Otros diferenciales de turno',
    common: 'Diferenciales de turno con tarifas comunes',
  },
} as const;

/**
 * The calculator's inputs for the job with `baseHours` at the base rate and `shiftHours` on the
 * shift; by default the week of the page.
 */
export const differentialWeekOf = (
  job: Differential,
  baseHours = BASE_HOURS,
  shiftHours = SHIFT_HOURS,
): Readonly<Record<string, string>> => ({
  rate: job.amount,
  source: job.source,
  [job.source]: job.differential,
  baseHours: String(baseHours),
  shiftHours: String(shiftHours),
});

/** The shift differential pages as links: every one on the calculator, on one its nearest. */
export const differentialLinksOf = (lang: Lang, except?: Differential): CommonLinks => {
  const w = WORDS[lang];
  const listed = except === undefined ? DIFFERENTIALS : nearestOf(DIFFERENTIALS, except);
  return {
    heading: except === undefined ? w.common : w.others,
    links: listed.map((job) => ({ href: pathOf(job, lang), label: w.question(job) })),
  };
};

/** The money outputs of the calculator on the job's week. */
const differentialRun = (
  job: Differential,
  baseHours: number,
  shiftHours: number,
): ((key: string) => string) => {
  const ran = shiftDifferential.run(differentialWeekOf(job, baseHours, shiftHours));
  if (!ran.ok) throw new Error(`the shift differential week of ${job.slug.en} must run`);
  const out = new Map<string, Money | Rational>(
    ran.value.outputs.map(({ key, value }) => [key, value]),
  );
  return (key) => {
    const value = out.get(key);
    if (value === undefined || !('currency' in value)) throw new Error(`no money output ${key}`);
    return moneyText(value);
  };
};

/** The page of one shift differential job in one language, every figure from the calculator. */
export const differentialPageOf = (job: Differential, lang: Lang): LongTailPage => {
  const w = WORDS[lang];
  const t = SHIFT_TEXTS[lang];
  // one hour on the shift and none at the base rate: the shift rate and the differential an hour
  const hour = differentialRun(job, 0, 1);
  const week = differentialRun(job, BASE_HOURS, SHIFT_HOURS);
  const figure = hour('shiftRate');
  const rows = ROW_KEYS.map((key) => ({
    key,
    label: key === 'pay' ? w.pay : t.outputs[key],
    value: week(key),
  }));
  const question = w.question(job);
  const answer = w.answer(job, {
    base: `$${job.amount}`,
    differential: short(hour('differentialPay')),
    shiftRate: short(figure),
    regularRate: short(week('regularRate')),
    premium: short(week('overtimePremium')),
    pay: short(week('pay')),
  });
  const validated = shiftDifferential.validate(differentialWeekOf(job));
  if (!validated.ok) throw new Error(`the shift differential week of ${job.slug.en} must validate`);
  const note = t.notes[2];
  if (note === undefined) throw new Error('the shift differential calculator must state the law');
  return {
    kicker: t.kicker,
    title: `${question} ${short(figure)} | Cuenta Horas`,
    description: `${answer} ${rows.map(({ label, value }) => `${label}: ${short(value)}`).join('; ')}.`,
    h1: question,
    lead: answer,
    figure,
    figureLabel: t.outputs.shiftRate,
    breakdown: w.breakdown,
    rows,
    calculator: {
      href: `${SHIFT_PATHS[lang]}?${encode(shiftDifferential, validated.value)}`,
      label: w.edit,
    },
    note,
    paths: { en: pathOf(job, 'en'), es: pathOf(job, 'es') },
    others: differentialLinksOf(lang, job),
  };
};
