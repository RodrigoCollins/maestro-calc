/*
 * The Mexico labor pages and their paths, with no import at all, as `../dates/routes.ts`: the
 * browser suites of `tooling/site-browser/e2e-pay` read the page list from here without the
 * workspace install. They are Spanish only (a search of Mexico), so no route has an `en`.
 */

/** The aguinaldo calculator. */
export const AGUINALDO_PATH = '/es/calculadora-de-aguinaldo';
/** The vacation and prima vacacional calculator. */
export const VACACIONES_PATH = '/es/calculadora-de-vacaciones-mexico';
/** The prima de antigüedad calculator. */
export const ANTIGUEDAD_PATH = '/es/calculadora-de-prima-de-antiguedad';
/** The salario diario integrado calculator. */
export const SDI_PATH = '/es/calculadora-de-salario-diario-integrado';
/** The ISR calculator of a salary: the monthly, biweekly and weekly tariffs of 2026. */
export const ISR_PATH = '/es/calculadora-isr';
/** The take-home pay calculator: ISR and the IMSS worker quotas of a monthly salary. */
export const SUELDO_NETO_PATH = '/es/calculadora-de-sueldo-neto';
/** The finiquito and liquidación calculator: what is owed on leaving a job, LFT and LISR. */
export const FINIQUITO_PATH = '/es/calculadora-de-finiquito-y-liquidacion';
/** The PTU calculator: a worker's share of the company profits, LFT arts. 117 to 131. */
export const PTU_PATH = '/es/calculadora-de-ptu';

export const MEXICO_SLUGS = [
  'cuantos-dias-de-aguinaldo-son-por-ley',
  'aguinaldo-2026',
  'cuantos-dias-de-vacaciones-son-por-ano',
  'prima-vacacional',
  'prima-dominical',
  'como-se-pagan-las-horas-extras',
] as const;

export type MexicoSlug = (typeof MEXICO_SLUGS)[number];

export const mexicoPathOf = (slug: MexicoSlug): string => `/es/mexico/${slug}`;

/** The Spanish-only routes: the calculators, then the answer pages. */
export const MEXICO_ROUTES: readonly {
  readonly id: string;
  readonly kind: 'calculator' | 'article';
  readonly es: string;
}[] = [
  { id: 'aguinaldo', kind: 'calculator', es: AGUINALDO_PATH },
  { id: 'vacaciones-mexico', kind: 'calculator', es: VACACIONES_PATH },
  { id: 'prima-antiguedad', kind: 'calculator', es: ANTIGUEDAD_PATH },
  { id: 'sdi-mexico', kind: 'calculator', es: SDI_PATH },
  { id: 'isr-mexico', kind: 'calculator', es: ISR_PATH },
  { id: 'sueldo-neto', kind: 'calculator', es: SUELDO_NETO_PATH },
  { id: 'finiquito', kind: 'calculator', es: FINIQUITO_PATH },
  { id: 'ptu', kind: 'calculator', es: PTU_PATH },
  ...MEXICO_SLUGS.map((slug) => ({
    id: `mexico-${slug}`,
    kind: 'article' as const,
    es: mexicoPathOf(slug),
  })),
];
