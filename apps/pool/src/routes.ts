import { JOB_PAGES } from './jobs.ts';

/** The languages of Pool Figures: English, and Spanish under `/es` (plans/pool/SPANISH.md). */
export type Lang = 'en' | 'es';

/** What a page is to search engines and link previews: the home, a calculator or an article. */
export type PageKind = 'home' | 'calculator' | 'article';

/**
 * A page of Pool Figures: its English address and, once it is built, its Spanish twin. During the
 * Spanish rollout a route without `es` has no alternates, and the sitemap lists it plain.
 */
export interface Route {
  readonly id: string;
  readonly kind: PageKind;
  readonly en: string;
  readonly es?: string;
}

/** The page files of `src/pages` (the 404 and the embeds are not routes), in the order of the site. */
const PAGE_ROUTES: readonly Route[] = [
  { id: 'home', kind: 'home', en: '/', es: '/es' },
  {
    id: 'volume',
    kind: 'calculator',
    en: '/pool-volume-calculator',
    es: '/es/calculadora-de-volumen-de-piscina',
  },
  {
    id: 'salt',
    kind: 'calculator',
    en: '/pool-salt-calculator',
    es: '/es/calculadora-de-sal-para-piscina',
  },
  {
    id: 'chlorine',
    kind: 'calculator',
    en: '/pool-chlorine-calculator',
    es: '/es/calculadora-de-cloro-para-piscina',
  },
  {
    id: 'pump',
    kind: 'calculator',
    en: '/pool-pump-size-calculator',
    es: '/es/calculadora-de-bomba-para-piscina',
  },
  {
    id: 'ph',
    kind: 'calculator',
    en: '/pool-ph-calculator',
    es: '/es/calculadora-de-ph-para-piscina',
  },
  {
    id: 'alkalinity',
    kind: 'calculator',
    en: '/pool-alkalinity-calculator',
    es: '/es/calculadora-de-alcalinidad-para-piscina',
  },
  {
    id: 'stabilizer',
    kind: 'calculator',
    en: '/pool-stabilizer-calculator',
    es: '/es/calculadora-de-estabilizador-para-piscina',
  },
  {
    id: 'calcium',
    kind: 'calculator',
    en: '/pool-calcium-hardness-calculator',
    es: '/es/calculadora-de-dureza-de-calcio-para-piscina',
  },
  {
    id: 'heater',
    kind: 'calculator',
    en: '/pool-heater-size-calculator',
    es: '/es/calculadora-de-calentador-para-piscina',
  },
  {
    id: 'fill-time',
    kind: 'calculator',
    en: '/pool-fill-time-calculator',
    es: '/es/calculadora-de-tiempo-de-llenado-de-piscina',
  },
  { id: 'chemistry-chart', kind: 'article', en: '/pool-water-chemistry-chart' },
  { id: 'dosing-chart', kind: 'article', en: '/pool-chemical-dosing-chart' },
  { id: 'volume-chart', kind: 'article', en: '/pool-volume-chart' },
  { id: 'charts', kind: 'article', en: '/charts' },
  { id: 'opening-guide', kind: 'article', en: '/opening-your-pool' },
  { id: 'closing-guide', kind: 'article', en: '/closing-your-pool' },
  { id: 'pump-guide', kind: 'article', en: '/how-long-to-run-pool-pump' },
  { id: 'salt-guide', kind: 'article', en: '/salt-water-pool-vs-chlorine-pool' },
  { id: 'shock-guide', kind: 'article', en: '/how-to-shock-a-pool' },
  { id: 'ph-guide', kind: 'article', en: '/how-to-lower-ph-in-a-pool' },
  { id: 'calcium-guide', kind: 'article', en: '/how-to-raise-calcium-hardness-in-a-pool' },
  { id: 'swim-guide', kind: 'article', en: '/how-long-after-adding-chemicals-can-you-swim' },
  { id: 'methodology', kind: 'article', en: '/methodology' },
  { id: 'about', kind: 'article', en: '/about', es: '/es/acerca' },
  { id: 'privacy', kind: 'article', en: '/privacy', es: '/es/privacidad' },
  { id: 'embed', kind: 'article', en: '/embed-calculators', es: '/es/calculadoras-para-tu-sitio' },
];

/** Every page: the page files, then the job pages `[job].astro` builds (English only for now). */
export const ROUTES: readonly Route[] = [
  ...PAGE_ROUTES,
  ...JOB_PAGES.map(({ path }) => ({
    id: `job:${path.slice(1)}`,
    kind: 'article' as const,
    en: path,
  })),
];

/** The addresses of a route: the English page, then its Spanish twin when it has one. */
export const pathsOf = ({ en, es }: Route): string[] => (es === undefined ? [en] : [en, es]);

/** The route of an address in either language, or `undefined` (the 404). */
export const routeOf = (path: string, routes: readonly Route[] = ROUTES): Route | undefined =>
  routes.find(({ en, es }) => en === path || es === path);

/** The language of an address: `/es` and every page below it are Spanish. */
export const langOf = (path: string): Lang =>
  path === '/es' || path.startsWith('/es/') ? 'es' : 'en';

/** The page of route `id` in `lang`: its Spanish twin once it is built, the English page until then. */
export const hrefOf = (id: string, lang: Lang): string => {
  const route = ROUTES.find((candidate) => candidate.id === id);
  if (route === undefined) throw new Error(`no route ${id}`);
  return lang === 'es' ? (route.es ?? route.en) : route.en;
};
