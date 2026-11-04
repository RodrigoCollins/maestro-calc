import { encode, type Money } from '@maestro-calc/core';
import { payConverter } from '@maestro-calc/pay-core/pay-converter';
import { moneyText } from '../format.ts';
import { PATHS, PAY_CONVERTER_TEXTS } from '../pay-converter/texts.ts';
import type { Route } from '../routes.ts';
import type { Lang } from '../time-card/receipt.ts';

/**
 * One common search the pay converter answers (plans/growth/PLAN.md, lever 1): an hourly rate
 * people ask the yearly pay of, or a salary they ask the hourly rate of. Only the amount is given;
 * every figure of the page is the engine's, at 40 hours a week and 52 paid weeks.
 */
export interface Job {
  readonly amount: string;
  readonly per: 'hour' | 'year';
  readonly slug: Readonly<Record<Lang, string>>;
}

const hourly = (amount: string): Job => ({
  amount,
  per: 'hour',
  slug: { en: `${amount}-an-hour-is-how-much-a-year`, es: `${amount}-la-hora-cuanto-es-al-ano` },
});

const salary = (amount: string): Job => ({
  amount,
  per: 'year',
  slug: { en: `${amount}-a-year-is-how-much-an-hour`, es: `${amount}-al-ano-cuanto-es-por-hora` },
});

export const JOBS: readonly Job[] = [
  hourly('15'),
  hourly('17'),
  hourly('18'),
  hourly('20'),
  hourly('25'),
  salary('50000'),
  salary('60000'),
  salary('100000'),
];

const pathOf = (job: Job, lang: Lang): string =>
  lang === 'en' ? `/pay/${job.slug.en}` : `/es/pago/${job.slug.es}`;

export const LONG_TAIL_ROUTES: readonly Route[] = JOBS.map((job) => ({
  id: `pay-${job.slug.en}`,
  kind: 'article',
  en: pathOf(job, 'en'),
  es: pathOf(job, 'es'),
}));

/** `$41,600.00` reads `$41,600` in a sentence; cents stay when there are any. */
const short = (text: string): string => text.replace(/\.00$/, '');

/** The words of each language around the engine's figures. */
const WORDS = {
  en: {
    per: { hour: 'an hour', year: 'a year' },
    ask: { hour: 'a year', year: 'an hour' },
    question: (given: string, ask: string): string => `${given} is how much ${ask}?`,
    answer: (given: string, figure: string, ask: string): string =>
      `At 40 hours a week and 52 paid weeks, ${given} comes to ${figure} ${ask}, before taxes.`,
    edit: 'Change the hours or the weeks in the calculator',
    others: 'Other common amounts',
    common: 'Common amounts',
  },
  es: {
    per: { hour: 'la hora', year: 'al año' },
    ask: { hour: 'al año', year: 'por hora' },
    question: (given: string, ask: string): string => `¿${given} cuánto es ${ask}?`,
    answer: (given: string, figure: string, ask: string): string =>
      `Con 40 horas por semana y 52 semanas pagadas, ${given} son ${figure} ${ask}, antes de impuestos.`,
    edit: 'Cambia las horas o las semanas en la calculadora',
    others: 'Otras cantidades comunes',
    common: 'Cantidades comunes',
  },
} as const;

export interface LongTailPage {
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly figure: string;
  readonly figureLabel: string;
  /** Every other pay period, as the engine gives it. */
  readonly rows: readonly {
    readonly key: string;
    readonly label: string;
    readonly value: string;
  }[];
  readonly calculator: { readonly href: string; readonly label: string };
  readonly paths: Readonly<Record<Lang, string>>;
  readonly others: CommonLinks;
}

export interface CommonLinks {
  readonly heading: string;
  readonly links: readonly { readonly href: string; readonly label: string }[];
}

/** The long-tail pages of one kind, as links: on their calculator, and on each other but `except`. */
export const commonLinksOf = (per: Job['per'], lang: Lang, except?: Job): CommonLinks => {
  const w = WORDS[lang];
  return {
    heading: except === undefined ? w.common : w.others,
    links: JOBS.filter((job) => job !== except && job.per === per).map((job) => ({
      href: pathOf(job, lang),
      label: w.question(`$${Number(job.amount).toLocaleString('en-US')} ${w.per[per]}`, w.ask[per]),
    })),
  };
};

/** The page of one job in one language, its figures run through the pay converter at build time. */
export const longTailPageOf = (job: Job, lang: Lang): LongTailPage => {
  const validated = payConverter.validate({ amount: job.amount, per: job.per });
  const ran = payConverter.run({ amount: job.amount, per: job.per });
  if (!validated.ok || !ran.ok) throw new Error(`the job ${job.amount} must run`);
  const out = new Map<string, Money>(ran.value.outputs.map(({ key, value }) => [key, value]));
  const text = (key: string): string => {
    const value = out.get(key);
    if (value === undefined) throw new Error(`no output ${key}`);
    return moneyText(value);
  };
  const w = WORDS[lang];
  const t = PAY_CONVERTER_TEXTS[lang];
  const variant = job.per === 'hour' ? 'hourly' : 'salary';
  const figureKey = job.per === 'hour' ? 'annual' : 'hourly';
  const givenKey = job.per === 'hour' ? 'hourly' : 'annual';
  const given = `${short(text(givenKey))} ${w.per[job.per]}`;
  const figure = text(figureKey);
  const question = w.question(given, w.ask[job.per]);
  const rows = Object.entries(t.outputs)
    .filter(([key]) => key !== figureKey && key !== givenKey)
    .map(([key, label]) => ({ key, label, value: text(key) }));
  const answer = w.answer(given, short(figure), w.ask[job.per]);
  return {
    title: `${question} ${short(figure)} | Cuenta Horas`,
    description: `${answer} ${rows.map(({ label, value }) => `${label}: ${short(value)}`).join('; ')}.`,
    h1: question,
    lead: answer,
    figure,
    figureLabel: t.outputs[figureKey],
    rows,
    calculator: {
      href: `${PATHS[variant][lang]}?${encode(payConverter, validated.value)}`,
      label: w.edit,
    },
    paths: { en: pathOf(job, 'en'), es: pathOf(job, 'es') },
    others: commonLinksOf(job.per, lang, job),
  };
};
