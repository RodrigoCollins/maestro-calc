import { encode, type Rational } from '@maestro-calc/core';
import { decimalHours } from '@maestro-calc/pay-core/decimal-hours';
import { decimalHoursText, hoursText, rateText } from '../format.ts';
import { DECIMAL_HOURS_PATHS, DECIMAL_HOURS_TEXTS } from '../hours/texts.ts';
import { descriptionOf, titleOf } from '../seo/meta.ts';
import type { Lang } from '../time-card/receipt.ts';
import type { CommonLinks, LongTailPage } from './jobs.ts';
import { nearestOf } from './nearest.ts';
import { MINUTES, pathOf, type Minutes } from './routes.ts';

/** The whole hours of the rows, each with the page's minutes, as a time card adds them. */
const HOURS = [1, 2, 4, 8] as const;

/** The hours of the lead's time card line. */
const DAY = 8;

const WORDS = {
  en: {
    question: (minutes: number): string => `What is ${String(minutes)} minutes in decimal hours?`,
    time: (hours: number, minutes: number): string =>
      `${String(hours)} hour${hours === 1 ? '' : 's'} ${String(minutes)} minutes`,
    answer: (minutes: number, decimal: string, rounded: boolean): string =>
      `${String(minutes)} minutes is ${decimal} decimal hours: the minutes divided by 60${rounded ? ', rounded to two places' : ''}.`,
    card: (time: string, decimal: string): string => `On a time card, ${time} is ${decimal} hours.`,
    figure: 'In decimal hours',
    breakdown: 'The minutes with whole hours, in decimal hours',
    edit: 'Convert your own hours and minutes',
    others: 'Other minutes in decimal hours',
    common: 'Common minutes in decimal hours',
  },
  es: {
    question: (minutes: number): string =>
      `¿Cuánto son ${String(minutes)} minutos en horas decimales?`,
    time: (hours: number, minutes: number): string =>
      `${String(hours)} hora${hours === 1 ? '' : 's'} y ${String(minutes)} minutos`,
    answer: (minutes: number, decimal: string, rounded: boolean): string =>
      `${String(minutes)} minutos son ${decimal} horas decimales: los minutos divididos por 60${rounded ? ', redondeados a dos decimales' : ''}.`,
    card: (time: string, decimal: string): string =>
      `En una tarjeta de horas, ${time} son ${decimal} horas.`,
    figure: 'En horas decimales',
    breakdown: 'Los minutos con horas enteras, en horas decimales',
    edit: 'Convierte tus propias horas y minutos',
    others: 'Otros minutos en horas decimales',
    common: 'Minutos comunes en horas decimales',
  },
} as const;

const questionOf = (job: Minutes, lang: Lang): string => WORDS[lang].question(job.minutes);

/** The minutes pages as links: every one on the converter, on a minutes page (`except`) its nearest. */
export const minutesLinksOf = (lang: Lang, except?: Minutes): CommonLinks => {
  const w = WORDS[lang];
  const listed = except === undefined ? MINUTES : nearestOf(MINUTES, except);
  return {
    heading: except === undefined ? w.common : w.others,
    links: listed.map((job) => ({ href: pathOf(job, lang), label: questionOf(job, lang) })),
  };
};

/** The raw input of the converter for `hours` hours and `minutes` minutes. */
const rawOf = (hours: number, minutes: number): Readonly<Record<string, string>> => ({
  hours: String(hours),
  minutes: String(minutes),
});

/** The converter's decimal hours of `hours` hours and `minutes` minutes. */
const decimalOf = (hours: number, minutes: number): Rational => {
  const ran = decimalHours.run(rawOf(hours, minutes));
  if (!ran.ok) throw new Error(`${String(hours)} h ${String(minutes)} min must run`);
  const value = ran.value.outputs.find(({ key }) => key === 'decimalHours')?.value;
  if (value === undefined) throw new Error('the converter must give decimal hours');
  return value;
};

/** The page of one minutes job in one language, every figure from the converter at build time. */
export const minutesPageOf = (job: Minutes, lang: Lang): LongTailPage => {
  const w = WORDS[lang];
  const t = DECIMAL_HOURS_TEXTS[lang];
  const exact = decimalOf(0, job.minutes);
  const figure = decimalHoursText(exact);
  // two places hold the value exactly when four places add nothing past them
  const rounded = rateText(exact) !== hoursText(exact);
  const question = questionOf(job, lang);
  const lead = [
    w.answer(job.minutes, figure, rounded),
    w.card(w.time(DAY, job.minutes), decimalHoursText(decimalOf(DAY, job.minutes))),
  ].join(' ');
  const rows = HOURS.map((hours) => ({
    key: String(hours),
    label: w.time(hours, job.minutes),
    value: decimalHoursText(decimalOf(hours, job.minutes)),
  }));
  const note = t.notes[1];
  if (note === undefined) throw new Error('the converter must say how it rounds');
  const validated = decimalHours.validate(rawOf(0, job.minutes));
  if (!validated.ok) throw new Error(`the minutes job of ${String(job.minutes)} must validate`);
  return {
    kicker: t.kicker,
    title: titleOf(`${question} ${figure}`),
    description: descriptionOf(
      lead,
      rows.map(({ label, value }) => `${label}: ${value}`),
    ),
    h1: question,
    lead,
    figure,
    figureLabel: w.figure,
    breakdown: w.breakdown,
    rows,
    calculator: {
      href: `${DECIMAL_HOURS_PATHS[lang]}?${encode(decimalHours, validated.value)}`,
      label: w.edit,
      title: t.title,
    },
    note,
    paths: { en: pathOf(job, 'en'), es: pathOf(job, 'es') },
    others: minutesLinksOf(lang, job),
  };
};
