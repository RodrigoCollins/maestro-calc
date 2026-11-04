/*
 * The long-tail jobs and their paths, with no import at all: the browser suites of
 * `tooling/site-browser/e2e-pay` read the page list from here without the workspace install, and
 * their typecheck loads even type-only imports (`../time-card/receipt.ts` reaches the core). The
 * two types below are structural copies; `../routes.ts` checks them by using `LONG_TAIL_ROUTES`
 * as its own `Route[]`.
 */

type Lang = 'en' | 'es';

interface Route {
  readonly id: string;
  readonly kind: 'calculator' | 'article';
  readonly en: string;
  readonly es: string;
}

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

/** Each kind in ascending order: the calculators list them in this order. */
export const JOBS: readonly Job[] = [
  hourly('15'),
  hourly('16'),
  hourly('17'),
  hourly('18'),
  hourly('20'),
  hourly('22'),
  hourly('25'),
  hourly('30'),
  salary('40000'),
  salary('45000'),
  salary('50000'),
  salary('60000'),
  salary('70000'),
  salary('80000'),
  salary('100000'),
];

export const pathOf = (job: Job, lang: Lang): string =>
  lang === 'en' ? `/pay/${job.slug.en}` : `/es/pago/${job.slug.es}`;

export const LONG_TAIL_ROUTES: readonly Route[] = JOBS.map((job) => ({
  id: `pay-${job.slug.en}`,
  kind: 'article',
  en: pathOf(job, 'en'),
  es: pathOf(job, 'es'),
}));
