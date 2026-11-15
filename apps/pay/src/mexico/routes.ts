/*
 * The Mexico labor pages and their paths, with no import at all, as `../dates/routes.ts`: the
 * browser suites of `tooling/site-browser/e2e-pay` read the page list from here without the
 * workspace install. They are Spanish only (a search of Mexico), so no route has an `en`.
 */

/** The aguinaldo calculator. */
export const AGUINALDO_PATH = '/es/calculadora-de-aguinaldo';
/** The vacation and prima vacacional calculator. */
export const VACACIONES_PATH = '/es/calculadora-de-vacaciones-mexico';

export const MEXICO_SLUGS = [
  'cuantos-dias-de-aguinaldo-son-por-ley',
  'aguinaldo-2026',
  'cuantos-dias-de-vacaciones-son-por-ano',
] as const;

export type MexicoSlug = (typeof MEXICO_SLUGS)[number];

export const mexicoPathOf = (slug: MexicoSlug): string => `/es/mexico/${slug}`;

/** The Spanish-only routes: the two calculators, then the answer pages. */
export const MEXICO_ROUTES: readonly {
  readonly id: string;
  readonly kind: 'calculator' | 'article';
  readonly es: string;
}[] = [
  { id: 'aguinaldo', kind: 'calculator', es: AGUINALDO_PATH },
  { id: 'vacaciones-mexico', kind: 'calculator', es: VACACIONES_PATH },
  ...MEXICO_SLUGS.map((slug) => ({
    id: `mexico-${slug}`,
    kind: 'article' as const,
    es: mexicoPathOf(slug),
  })),
];
