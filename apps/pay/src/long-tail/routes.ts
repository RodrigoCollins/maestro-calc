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
 * One common search a calculator answers (plans/growth/PLAN.md, lever 1). A `convert` job is the
 * pay converter's: an hourly rate people ask the yearly pay of, or a salary they ask the hourly
 * rate of, at 40 hours a week and 52 paid weeks. An `overtime` job is the time card's: the time
 * and a half of an hourly rate, and the pay of common overtime hours past 40 in the week. Only the
 * amount is given; every figure of the page is the engine's.
 */
export interface Job {
  readonly kind: 'convert' | 'overtime';
  readonly amount: string;
  readonly per: 'hour' | 'year';
  readonly slug: Readonly<Record<Lang, string>>;
}

const hourly = (amount: string): Job => ({
  kind: 'convert',
  amount,
  per: 'hour',
  slug: { en: `${amount}-an-hour-is-how-much-a-year`, es: `${amount}-la-hora-cuanto-es-al-ano` },
});

const salary = (amount: string): Job => ({
  kind: 'convert',
  amount,
  per: 'year',
  slug: { en: `${amount}-a-year-is-how-much-an-hour`, es: `${amount}-al-ano-cuanto-es-por-hora` },
});

const overtime = (amount: string): Job => ({
  kind: 'overtime',
  amount,
  per: 'hour',
  slug: { en: `time-and-a-half-for-${amount}-an-hour`, es: `tiempo-y-medio-de-${amount}-la-hora` },
});

/** Each kind in ascending order: the calculators list them in this order. */
export const JOBS: readonly Job[] = [
  hourly('15'),
  hourly('16'),
  hourly('17'),
  hourly('18'),
  hourly('19'),
  hourly('20'),
  hourly('21'),
  hourly('22'),
  hourly('23'),
  hourly('24'),
  hourly('25'),
  hourly('26'),
  hourly('28'),
  hourly('30'),
  hourly('35'),
  hourly('40'),
  hourly('45'),
  hourly('50'),
  salary('30000'),
  salary('35000'),
  salary('40000'),
  salary('45000'),
  salary('50000'),
  salary('55000'),
  salary('60000'),
  salary('65000'),
  salary('70000'),
  salary('75000'),
  salary('80000'),
  salary('90000'),
  salary('100000'),
  salary('120000'),
  salary('150000'),
  overtime('15'),
  overtime('16'),
  overtime('17'),
  overtime('18'),
  overtime('19'),
  overtime('20'),
  overtime('22'),
  overtime('25'),
  overtime('30'),
];

export const pathOf = (job: Job, lang: Lang): string =>
  lang === 'en' ? `/pay/${job.slug.en}` : `/es/pago/${job.slug.es}`;

export const LONG_TAIL_ROUTES: readonly Route[] = JOBS.map((job) => ({
  id: `pay-${job.slug.en}`,
  kind: 'article',
  en: pathOf(job, 'en'),
  es: pathOf(job, 'es'),
}));
