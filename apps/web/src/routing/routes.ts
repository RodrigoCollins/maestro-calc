import type { Locale } from '@maestro-calc/i18n';
import { SITE } from '../site.config.ts';

/** The BCP 47 tag of each locale: the value of `<html lang>` and of every `hreflang`. */
export const LOCALE_TAGS = { en: 'en-US', es: 'es-US' } as const satisfies Record<Locale, string>;

/**
 * Page id to the path of the page in each locale. Pages enter the table only when they exist.
 *
 * To add a page, make four edits: (1) a `ROUTES` entry (`routeProblems` and the routes tests catch a
 * bad path); (2) its body: `pages/index.astro` and `pages/es.astro` render the home, and
 * `pages/[...path].astro` renders a calculator id (`CALCULATOR_PAGES`) with `CalculatorView` and every
 * other id with `TrustPageView`, so a Markdown
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
