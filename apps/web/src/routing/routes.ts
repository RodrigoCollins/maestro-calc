import type { Locale } from '@maestro-calc/i18n';
import { SITE } from '../site.config.ts';

/** The BCP 47 tag of each locale: the value of `<html lang>` and of every `hreflang`. */
export const LOCALE_TAGS = { en: 'en-US', es: 'es-US' } as const satisfies Record<Locale, string>;

/**
 * Page id to the path of the page in each locale. Pages enter the table only when they exist.
 *
 * To add a page, make four edits: (1) a `ROUTES` entry (`routeProblems` and the routes tests catch a
 * bad path); (2) its body: `pages/index.astro` and `pages/es.astro` render the home, and
 * `pages/[...path].astro` renders a calculator id (`CALCULATOR_PAGES`) with `CalculatorView`, a job id
 * (`JOBS`, `routing/jobs.ts`) with `JobPageView` and every other id with `TrustPageView`, so a Markdown
 * page needs the id in `TRUST_IDS` (`content/schema.ts`) and `content/pages/{en,es}/<id>.md` (the
 * content contract test names a missing entry), and a calculator page needs its entries in
 * `content/calculators/` and a row in `SCRIPTS` (`views/CalculatorView.astro`); (3) `page.<id>.title` and `page.<id>.description` in both site catalogs (the route/catalog
 * agreement contract test); (4) optionally the id in `HEADER_PAGES` or `FOOTER_PAGES` plus its
 * `site.nav.<id>` or `site.footer.<id>` key (a type error in `BaseLayout.astro` when the key is missing).
 */
export const ROUTES = {
  home: { en: '/', es: '/es' },
  methodology: { en: '/methodology', es: '/es/metodologia' },
  about: { en: '/about', es: '/es/sobre-nosotros' },
  privacy: { en: '/privacy', es: '/es/privacidad' },
  terms: { en: '/terms', es: '/es/terminos' },
  contact: { en: '/contact', es: '/es/contacto' },
  'embed-calculators': { en: '/embed-calculators', es: '/es/calculadoras-para-tu-sitio' },
  glossary: { en: '/construction-glossary', es: '/es/glosario-de-construccion' },
  guides: { en: '/guides', es: '/es/guias' },
  'guide-concrete-bags-or-truck': {
    en: '/guides/concrete-bags-or-truck',
    es: '/es/guias/concreto-en-bolsas-o-camion',
  },
  'guide-tape-measure-fractions': {
    en: '/guides/read-a-tape-measure-and-add-fractions',
    es: '/es/guias/leer-la-cinta-metrica-y-sumar-fracciones',
  },
  'guide-square-footage': {
    en: '/guides/how-to-calculate-square-footage',
    es: '/es/guias/como-calcular-pies-cuadrados',
  },
  'guide-drywall-estimate': {
    en: '/guides/how-to-estimate-a-drywall-job',
    es: '/es/guias/como-calcular-y-cotizar-un-trabajo-de-drywall',
  },
  'guide-roof-pitch': {
    en: '/guides/how-to-measure-roof-pitch',
    es: '/es/guias/como-medir-la-pendiente-de-un-techo',
  },
  'guide-concrete-quote': {
    en: '/guides/how-to-quote-a-concrete-job',
    es: '/es/guias/como-cotizar-un-trabajo-de-concreto',
  },
  'guide-contractor-license': {
    en: '/guides/how-to-get-a-contractor-license',
    es: '/es/guias/como-sacar-la-licencia-de-contratista',
  },
  'guide-paint-quote': {
    en: '/guides/how-to-quote-a-painting-job',
    es: '/es/guias/como-cotizar-un-trabajo-de-pintura',
  },
  'guide-gravel-driveway': {
    en: '/guides/how-much-gravel-for-a-driveway',
    es: '/es/guias/cuanta-grava-para-una-entrada-de-autos',
  },
  'guide-raised-bed-soil': {
    en: '/guides/how-much-soil-for-a-raised-bed',
    es: '/es/guias/cuanta-tierra-para-una-cama-elevada',
  },
  'guide-roofing-quote': {
    en: '/guides/how-to-quote-a-roofing-job',
    es: '/es/guias/como-cotizar-un-trabajo-de-techo',
  },
  'guide-fence-post-concrete': {
    en: '/guides/how-much-concrete-for-a-fence-post',
    es: '/es/guias/cuanto-concreto-para-un-poste-de-cerca',
  },
  'guide-mulch': {
    en: '/guides/how-much-mulch-do-i-need',
    es: '/es/guias/cuanto-mulch-necesito',
  },
  'guide-cubic-yards': {
    en: '/guides/how-to-calculate-cubic-yards',
    es: '/es/guias/como-calcular-yardas-cubicas',
  },
  'hub-concrete': { en: '/concrete', es: '/es/concreto' },
  'hub-roofing': { en: '/roofing', es: '/es/techos' },
  'hub-drywall': { en: '/drywall', es: '/es/drywall' },
  'hub-landscaping': { en: '/landscaping', es: '/es/jardineria' },
  'hub-measurement': { en: '/measurement', es: '/es/medidas' },
  'hub-paint': { en: '/painting', es: '/es/pintura' },
  'concrete-slab-10x10': { en: '/concrete/10x10-slab', es: '/es/concreto/losa-de-10x10' },
  'concrete-slab-10x12': { en: '/concrete/10x12-slab', es: '/es/concreto/losa-de-10x12' },
  'concrete-slab-12x12': { en: '/concrete/12x12-slab', es: '/es/concreto/losa-de-12x12' },
  'concrete-slab-20x20': { en: '/concrete/20x20-slab', es: '/es/concreto/losa-de-20x20' },
  'concrete-slab-24x24': { en: '/concrete/24x24-slab', es: '/es/concreto/losa-de-24x24' },
  'concrete-slab-500-sq-ft': {
    en: '/concrete/500-sq-ft-slab',
    es: '/es/concreto/losa-de-500-pies-cuadrados',
  },
  'concrete-slab-650-sq-ft': {
    en: '/concrete/650-sq-ft-slab',
    es: '/es/concreto/losa-de-650-pies-cuadrados',
  },
  'concrete-slab-1000-sq-ft': {
    en: '/concrete/1000-sq-ft-slab',
    es: '/es/concreto/losa-de-1000-pies-cuadrados',
  },
  'concrete-pad-4x4': { en: '/concrete/4x4-pad', es: '/es/concreto/base-de-4x4' },
  'concrete-tube-8': {
    en: '/concrete/8-inch-sonotube',
    es: '/es/concreto/sonotubo-de-8-pulgadas',
  },
  'concrete-tube-10': {
    en: '/concrete/10-inch-sonotube',
    es: '/es/concreto/sonotubo-de-10-pulgadas',
  },
  'concrete-tube-12': {
    en: '/concrete/12-inch-sonotube',
    es: '/es/concreto/sonotubo-de-12-pulgadas',
  },
  'roof-pitch-3-12': {
    en: '/roofing/3-12-roof-pitch',
    es: '/es/techos/pendiente-de-techo-3-12',
  },
  'roof-pitch-4-12': {
    en: '/roofing/4-12-roof-pitch',
    es: '/es/techos/pendiente-de-techo-4-12',
  },
  'roof-pitch-5-12': {
    en: '/roofing/5-12-roof-pitch',
    es: '/es/techos/pendiente-de-techo-5-12',
  },
  'roof-pitch-6-12': {
    en: '/roofing/6-12-roof-pitch',
    es: '/es/techos/pendiente-de-techo-6-12',
  },
  'roof-pitch-7-12': {
    en: '/roofing/7-12-roof-pitch',
    es: '/es/techos/pendiente-de-techo-7-12',
  },
  'roof-pitch-8-12': {
    en: '/roofing/8-12-roof-pitch',
    es: '/es/techos/pendiente-de-techo-8-12',
  },
  'roof-pitch-9-12': {
    en: '/roofing/9-12-roof-pitch',
    es: '/es/techos/pendiente-de-techo-9-12',
  },
  'roof-pitch-10-12': {
    en: '/roofing/10-12-roof-pitch',
    es: '/es/techos/pendiente-de-techo-10-12',
  },
  'roof-pitch-12-12': {
    en: '/roofing/12-12-roof-pitch',
    es: '/es/techos/pendiente-de-techo-12-12',
  },
  'square-feet-5x5': {
    en: '/measurement/5x5-square-feet',
    es: '/es/medidas/5x5-pies-cuadrados',
  },
  'square-feet-5x10': {
    en: '/measurement/5x10-square-feet',
    es: '/es/medidas/5x10-pies-cuadrados',
  },
  'square-feet-7x12': {
    en: '/measurement/7x12-square-feet',
    es: '/es/medidas/7x12-pies-cuadrados',
  },
  'square-feet-10x10': {
    en: '/measurement/10x10-square-feet',
    es: '/es/medidas/10x10-pies-cuadrados',
  },
  'square-feet-10x12': {
    en: '/measurement/10x12-square-feet',
    es: '/es/medidas/10x12-pies-cuadrados',
  },
  'square-feet-11x14': {
    en: '/measurement/11x14-square-feet',
    es: '/es/medidas/11x14-pies-cuadrados',
  },
  'square-feet-11x16': {
    en: '/measurement/11x16-square-feet',
    es: '/es/medidas/11x16-pies-cuadrados',
  },
  'square-feet-12x12': {
    en: '/measurement/12x12-square-feet',
    es: '/es/medidas/12x12-pies-cuadrados',
  },
  'square-feet-12x14': {
    en: '/measurement/12x14-square-feet',
    es: '/es/medidas/12x14-pies-cuadrados',
  },
  'square-feet-12x30': {
    en: '/measurement/12x30-square-feet',
    es: '/es/medidas/12x30-pies-cuadrados',
  },
  'square-feet-20x20': {
    en: '/measurement/20x20-square-feet',
    es: '/es/medidas/20x20-pies-cuadrados',
  },
  'mulch-bags-per-yard': {
    en: '/landscaping/bags-of-mulch-per-yard',
    es: '/es/jardineria/bolsas-de-mulch-por-yarda',
  },
  concrete: { en: '/concrete-calculator', es: '/es/calculadora-de-concreto' },
  'rectangle-area': {
    en: '/square-footage-calculator',
    es: '/es/calculadora-de-pies-cuadrados',
  },
  gravel: { en: '/gravel-calculator', es: '/es/calculadora-de-grava' },
  mulch: { en: '/mulch-calculator', es: '/es/calculadora-de-mulch' },
  topsoil: { en: '/topsoil-calculator', es: '/es/calculadora-de-tierra-para-jardin' },
  paint: { en: '/paint-calculator', es: '/es/calculadora-de-pintura' },
  drywall: { en: '/drywall-calculator', es: '/es/calculadora-de-drywall' },
  'roof-pitch': { en: '/roof-pitch-calculator', es: '/es/calculadora-de-pendiente-de-techo' },
  roofing: { en: '/roofing-calculator', es: '/es/calculadora-de-tejas' },
  'feet-inches': {
    en: '/feet-and-inches-calculator',
    es: '/es/calculadora-de-pies-y-pulgadas',
  },
} as const satisfies Record<string, Record<Locale, `/${string}`>>;

export type PageId = keyof typeof ROUTES;

/** The not-found page has a head and a layout but no route, so it never enters `ROUTES`. */
export const NOT_FOUND_ID = 'notFound';

/** The not-found file of each locale: `404.html` and `es/404.html`, which no route table lists. */
export const notFoundPathOf = (locale: Locale): `/${string}` =>
  locale === 'en' ? '/404' : '/es/404';

/** Every id the shell can render: the routable pages and the not-found page. */
export type ShellPageId = PageId | typeof NOT_FOUND_ID;

/** Any table of the same shape as `ROUTES`: tests and checks inject fixtures through it. */
export type RouteTable = Readonly<Record<string, Readonly<Record<Locale, string>>>>;

export interface Alternate {
  readonly hreflang: (typeof LOCALE_TAGS)[Locale] | 'x-default';
  readonly href: string;
}

export interface StaticPath<Id extends string = PageId> {
  readonly params: { readonly path: string | undefined };
  readonly props: { readonly id: Id; readonly locale: Locale };
}

/**
 * The locales, in `LOCALE_TAGS` order. Listed by hand rather than read from `Object.keys`, which is
 * typed `string[]`; `routes.test-d.ts` fails when the tuple and `Locale` disagree.
 */
export const LOCALES = ['en', 'es'] as const satisfies readonly Locale[];

// Lowercase ASCII segments joined by single slashes, no trailing slash; the root is `/`.
const PATH_SHAPE = /^\/([a-z0-9-]+(\/[a-z0-9-]+)*)?$/;

const isSpanishPath = (path: string): boolean => path === '/es' || path.startsWith('/es/');

/** The locale that owns a path: Spanish under `/es`, English everywhere else (unknown paths too). */
export const localeOfPath = (path: string): Locale => (isSpanishPath(path) ? 'es' : 'en');

/** What is wrong with a table, one line each: the invariants of site-routing-i18n. */
export const routeProblems = (table: RouteTable): string[] => {
  const seen = new Set<string>();
  return Object.entries(table).flatMap(([id, paths]) =>
    LOCALES.flatMap((locale) => {
      const path = paths[locale];
      const label = `${id}.${locale}`;
      const problems = [
        ...(seen.has(path) ? [`${label}: duplicate path ${path}`] : []),
        ...(PATH_SHAPE.test(path) ? [] : [`${label}: invalid path ${path}`]),
        ...(locale === 'en' && isSpanishPath(path) ? [`${label}: English path under /es`] : []),
        ...(locale === 'es' && !isSpanishPath(path) ? [`${label}: Spanish path outside /es`] : []),
      ];
      seen.add(path);
      return problems;
    }),
  );
};

/** The path of page `id` in `locale`; an id outside the table is a programming error. */
export function pathOf(id: PageId, locale: Locale): string;
export function pathOf(id: string, locale: Locale, table: RouteTable): string;
export function pathOf(id: string, locale: Locale, table: RouteTable = ROUTES): string {
  const paths = table[id];
  if (paths === undefined) throw new Error(`unknown page id: ${id}`);
  return paths[locale];
}

/** The absolute URL of a table path on the site origin (`/` gives `https://…/`). */
export const urlOf = (path: string): string => `${SITE.url}${path}`;

/** The hreflang entries of a page: one per locale and `x-default`, which is English. */
export function alternatesOf(id: PageId): readonly Alternate[];
export function alternatesOf(id: string, table: RouteTable): readonly Alternate[];
export function alternatesOf(id: string, table: RouteTable = ROUTES): readonly Alternate[] {
  const href = (locale: Locale): string => urlOf(pathOf(id, locale, table));
  return [
    ...LOCALES.map((locale) => ({ hreflang: LOCALE_TAGS[locale], href: href(locale) })),
    { hreflang: 'x-default', href: href('en') },
  ];
}

/** `getStaticPaths` of the catch-all route: one entry per page and locale; the root has no segment. */
export function staticPaths(): StaticPath[];
export function staticPaths(table: RouteTable): StaticPath<string>[];
export function staticPaths(table: RouteTable = ROUTES): StaticPath<string>[] {
  return Object.entries(table).flatMap(([id, paths]) =>
    LOCALES.map((locale) => ({
      params: { path: paths[locale].slice(1) || undefined },
      props: { id, locale },
    })),
  );
}
