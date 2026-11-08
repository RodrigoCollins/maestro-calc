import { encode, type Rational } from '@maestro-calc/core';
import { ptoAccrual } from '@maestro-calc/pay-core/pto-accrual';
import { decimalHoursText, hoursText, rateText } from '../format.ts';
import { PTO_PATHS, PTO_TEXTS, type PtoOutput } from '../pto/texts.ts';
import { descriptionOf, titleOf } from '../seo/meta.ts';
import type { Lang } from '../time-card/receipt.ts';
import type { CommonLinks, LongTailPage } from './jobs.ts';
import { ptoSectionsOf } from './time-sections.ts';
import { nearestOf } from './nearest.ts';
import { pathOf, PTOS, type Pto } from './routes.ts';

/** The rows of a page, in the order the engine declares them, each written as the calculator does. */
const ROWS: readonly (readonly [PtoOutput, (value: Rational) => string])[] = [
  ['weekly', decimalHoursText],
  ['semimonthly', decimalHoursText],
  ['monthly', decimalHoursText],
  ['perHourWorked', rateText],
  ['hoursPerPtoHour', hoursText],
  ['annualHours', hoursText],
];

const WORDS = {
  en: {
    question: (days: number): string =>
      `How much PTO do I earn per paycheck with ${String(days)} days a year?`,
    figure: (hours: string): string => `${hours} hours`,
    answer: (days: number, day: string, week: string, biweekly: string): string =>
      `With ${String(days)} paid days off a year of ${day} hours and a ${week}-hour week, you earn ${biweekly} PTO hours every two weeks.`,
    year: (annual: string, worked: string): string =>
      `That is ${annual} PTO hours a year over 26 biweekly paychecks, or 1 hour off for every ${worked} hours you work.`,
    edit: 'Change the days, the hours of a day off or your week in the PTO calculator',
    others: 'PTO with other days off',
    common: 'PTO per paycheck with common days off',
  },
  es: {
    question: (days: number): string =>
      `¿Cuánto PTO gano por cheque con ${String(days)} días libres al año?`,
    figure: (hours: string): string => `${hours} horas`,
    answer: (days: number, day: string, week: string, biweekly: string): string =>
      `Con ${String(days)} días libres pagados al año de ${day} horas y una semana de ${week} horas, ganas ${biweekly} horas de PTO cada dos semanas.`,
    year: (annual: string, worked: string): string =>
      `Son ${annual} horas de PTO al año en 26 cheques, o 1 hora libre por cada ${worked} horas que trabajas.`,
    edit: 'Cambia los días, las horas de un día libre o tu semana en la calculadora de PTO',
    others: 'PTO con otros días libres',
    common: 'PTO por cheque con días libres comunes',
  },
} as const;

const questionOf = (job: Pto, lang: Lang): string => WORDS[lang].question(job.days);

/** The PTO pages as links: every one on the PTO calculator, on a PTO page (`except`) its nearest. */
export const ptoLinksOf = (lang: Lang, except?: Pto): CommonLinks => {
  const w = WORDS[lang];
  const listed = except === undefined ? PTOS : nearestOf(PTOS, except);
  return {
    heading: except === undefined ? w.common : w.others,
    links: listed.map((job) => ({ href: pathOf(job, lang), label: questionOf(job, lang) })),
  };
};

/** The page of one PTO job in one language, every figure from the PTO calculator at build time. */
export const ptoPageOf = (job: Pto, lang: Lang): LongTailPage => {
  const w = WORDS[lang];
  const t = PTO_TEXTS[lang];
  // only the days are given: the hours of a day off and of a week are the calculator's defaults
  const raw = { ptoDays: String(job.days) };
  const validated = ptoAccrual.validate(raw);
  const ran = ptoAccrual.run(raw);
  if (!validated.ok || !ran.ok) throw new Error(`the PTO job of ${String(job.days)} must run`);
  const out = new Map(ran.value.outputs.map(({ key, value }) => [key, value]));
  const value = (key: PtoOutput | 'biweekly'): Rational => {
    const found = out.get(key);
    if (found === undefined) throw new Error(`no PTO output ${key}`);
    return found;
  };
  const figure = w.figure(decimalHoursText(value('biweekly')));
  const question = questionOf(job, lang);
  const lead = [
    w.answer(
      job.days,
      hoursText(validated.value.hoursPerDay),
      hoursText(validated.value.hoursPerWeek),
      decimalHoursText(value('biweekly')),
    ),
    w.year(hoursText(value('annualHours')), hoursText(value('hoursPerPtoHour'))),
  ].join(' ');
  const rows = ROWS.map(([key, text]) => ({ key, label: t.outputs[key], value: text(value(key)) }));
  const note = t.notes[1];
  if (note === undefined) throw new Error('the PTO calculator must say how it rounds');
  return {
    kicker: t.kicker,
    title: titleOf(`${question} ${figure}`),
    description: descriptionOf(lead),
    h1: question,
    lead,
    figure,
    figureLabel: t.figureLabel,
    breakdown: t.figures,
    rows,
    calculator: {
      href: `${PTO_PATHS[lang]}?${encode(ptoAccrual, validated.value)}`,
      label: w.edit,
      title: t.title,
    },
    note,
    paths: { en: pathOf(job, 'en'), es: pathOf(job, 'es') },
    others: ptoLinksOf(lang, job),
    ...ptoSectionsOf(job, lang),
  };
};
