/*
 * Every page of Cuánto Le Cobro as a Spanish and English pair, with no import beyond the plain
 * state list: the browser suites of `tooling/site-browser/e2e-cobro` read the page list from here
 * without the workspace install. Spanish is the primary language and lives at the root; English
 * lives under `/en`. A published address never moves, so every path is written out or derived from
 * a slug written out here.
 */
import { AREAS } from './wages/areas.ts';
import { OEWS } from './wages/oews-2025.ts';
import { OCCUPATIONS, type TradeId } from './wages/occupations.ts';

export type Lang = 'es' | 'en';

/** What a page is to search engines and link previews. */
export type PageKind = 'home' | 'calculator' | 'article' | 'collection';

export interface Route {
  readonly id: string;
  readonly kind: PageKind;
  readonly es: string;
  readonly en: string;
}

export type { TradeId };

/** The five trades, in the order of the chips: the page of each quote calculator. */
export const TRADE_PATHS: Readonly<Record<TradeId, Readonly<Record<Lang, string>>>> = {
  cleaning: {
    es: '/cuanto-cobrar-por-limpiar-una-casa',
    en: '/en/how-much-to-charge-to-clean-a-house',
  },
  painting: {
    es: '/cuanto-cobrar-por-pintar-una-casa',
    en: '/en/how-much-to-charge-to-paint-a-house',
  },
  drywall: {
    es: '/cuanto-cobrar-por-instalar-drywall',
    en: '/en/how-much-to-charge-to-install-drywall',
  },
  concrete: {
    es: '/cuanto-cobrar-por-pie-cuadrado-de-concreto',
    en: '/en/how-much-to-charge-for-concrete',
  },
  landscaping: {
    es: '/cuanto-cobrar-por-jardineria',
    en: '/en/how-much-to-charge-for-landscaping',
  },
};

/** The state index of each trade's wages, and the stem of its state pages (`<stem>-en-texas`). */
export const WAGE_STEMS: Readonly<Record<TradeId, Readonly<Record<Lang, string>>>> = {
  cleaning: {
    es: '/cuanto-gana-un-trabajador-de-limpieza',
    en: '/en/how-much-does-a-house-cleaner-make',
  },
  painting: { es: '/cuanto-gana-un-pintor', en: '/en/how-much-does-a-painter-make' },
  drywall: {
    es: '/cuanto-gana-un-instalador-de-drywall',
    en: '/en/how-much-does-a-drywall-installer-make',
  },
  concrete: {
    es: '/cuanto-gana-un-albanil-de-concreto',
    en: '/en/how-much-does-a-concrete-finisher-make',
  },
  landscaping: { es: '/cuanto-gana-un-jardinero', en: '/en/how-much-does-a-landscaper-make' },
};

/** The page of a trade's wages in one state: `/cuanto-gana-un-pintor-en-texas`. */
export const wagePathOf = (trade: TradeId, fips: string, lang: Lang): string => {
  const area = AREAS.find((each) => each.fips === fips);
  if (area === undefined) throw new Error(`no area ${fips}`);
  return `${WAGE_STEMS[trade][lang]}${lang === 'es' ? '-en-' : '-in-'}${area.slug[lang]}`;
};

/** The states with both figures for a trade: only they get a page. */
export const wageAreasOf = (trade: TradeId): readonly (typeof AREAS)[number][] =>
  AREAS.filter(({ fips }) => OEWS[trade]?.[fips] !== undefined);

const pair = (id: string, kind: PageKind, es: string, en: string): Route => ({ id, kind, es, en });

/** The pages that are one file each, in the order of the site. */
const SITE_ROUTES: readonly Route[] = [
  pair('home', 'home', '/', '/en'),
  ...OCCUPATIONS.map(({ id }) => ({ id: `quote-${id}`, kind: 'calculator' as const, ...TRADE_PATHS[id] })),
  pair('quote-guide', 'article', '/como-armar-un-presupuesto', '/en/how-to-write-a-quote'),
  pair('markup-guide', 'article', '/recargo-o-margen', '/en/markup-vs-margin'),
  pair('rate-guide', 'article', '/como-fijar-tu-tarifa-por-hora', '/en/how-to-set-your-hourly-rate'),
  pair('wages', 'collection', '/salarios-por-oficio', '/en/trade-wages-by-state'),
  pair('methodology', 'article', '/metodologia', '/en/methodology'),
  pair('about', 'article', '/acerca', '/en/about'),
  pair('editorial', 'article', '/politica-editorial', '/en/editorial-policy'),
  pair('privacy', 'article', '/privacidad', '/en/privacy'),
  pair('embed', 'article', '/calculadoras-para-tu-sitio', '/en/embed-calculators'),
];

/** The wage pages: one index per trade, then one page per trade and state that has data. */
const WAGE_ROUTES: readonly Route[] = OCCUPATIONS.flatMap(({ id }) => [
  { id: `wages-${id}`, kind: 'collection' as const, ...WAGE_STEMS[id] },
  ...wageAreasOf(id).map(({ fips }) => ({
    id: `wage-${id}-${fips}`,
    kind: 'article' as const,
    es: wagePathOf(id, fips, 'es'),
    en: wagePathOf(id, fips, 'en'),
  })),
]);

export const ROUTES: readonly Route[] = [...SITE_ROUTES, ...WAGE_ROUTES];

/** The language of an address: `/en` and every page below it are English, embeds included. */
export const langOf = (path: string): Lang =>
  path === '/en' || path.startsWith('/en/') || path.startsWith('/embed/en/') ? 'en' : 'es';

/** The route of an address in either language, or `undefined` (the 404). */
export const routeOf = (path: string, routes: readonly Route[] = ROUTES): Route | undefined =>
  routes.find(({ es, en }) => es === path || en === path);

/** The page of route `id` in `lang`. */
export const hrefOf = (id: string, lang: Lang): string => {
  const route = ROUTES.find((candidate) => candidate.id === id);
  if (route === undefined) throw new Error(`no route ${id}`);
  return route[lang];
};
