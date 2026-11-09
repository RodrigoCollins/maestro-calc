/*
 * The date pages and their paths, with no import at all, as `../military/routes.ts`: the browser
 * suites of `tooling/site-browser/e2e-pay` read the page list from here without the workspace
 * install. They are Spanish only (a search of Mexico and Spain), so no route has an `en`.
 */

/** The calculator of the days between two dates. */
export const DAYS_BETWEEN_PATH = '/es/calculadora-de-dias-entre-fechas';

const SLUGS = [
  'cuantos-dias-faltan-para-ano-nuevo',
  'cuantos-dias-faltan-para-el-dia-de-reyes',
  'cuantos-dias-faltan-para-el-14-de-febrero',
  'cuantos-dias-faltan-para-semana-santa',
  'cuantos-dias-faltan-para-el-dia-de-las-madres',
  'cuantos-dias-faltan-para-el-16-de-septiembre',
  'cuantos-dias-faltan-para-el-dia-de-muertos',
  'cuantos-dias-faltan-para-navidad',
] as const;

export type CountdownSlug = (typeof SLUGS)[number];

/** One dated day people count down to, "cuántos días faltan para Navidad". */
export interface CountdownJob {
  readonly kind: 'countdown';
  readonly slug: CountdownSlug;
}

/** Every countdown, in the order of the year: a page links its nearest. */
export const COUNTDOWNS: readonly CountdownJob[] = SLUGS.map((slug) => ({
  kind: 'countdown',
  slug,
}));

export const countdownPathOf = (job: CountdownJob): string => `/es/fechas/${job.slug}`;

/** The Spanish-only routes: the calculator, then the countdowns in the order of the year. */
export const DATE_ROUTES: readonly {
  readonly id: string;
  readonly kind: 'calculator' | 'article';
  readonly es: string;
}[] = [
  { id: 'days-between', kind: 'calculator', es: DAYS_BETWEEN_PATH },
  ...COUNTDOWNS.map((job) => ({
    id: `countdown-${job.slug}`,
    kind: 'article' as const,
    es: countdownPathOf(job),
  })),
];
