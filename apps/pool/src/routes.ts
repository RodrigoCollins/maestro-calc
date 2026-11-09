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
  {
    id: 'chemistry-chart',
    kind: 'article',
    en: '/pool-water-chemistry-chart',
    es: '/es/tabla-de-quimica-del-agua-de-piscina',
  },
  {
    id: 'dosing-chart',
    kind: 'article',
    en: '/pool-chemical-dosing-chart',
    es: '/es/tabla-de-dosis-de-quimicos-para-piscina',
  },
  {
    id: 'volume-chart',
    kind: 'article',
    en: '/pool-volume-chart',
    es: '/es/tabla-de-volumen-de-piscina',
  },
  {
    id: 'gallons-guide',
    kind: 'article',
    en: '/how-many-gallons-is-my-pool',
    es: '/es/cuantos-galones-tiene-mi-piscina',
  },
  {
    id: 'olympic-guide',
    kind: 'article',
    en: '/how-many-gallons-in-an-olympic-pool',
    es: '/es/cuantos-galones-tiene-una-piscina-olimpica',
  },
  {
    id: 'charts',
    kind: 'article',
    en: '/charts',
    es: '/es/datos-y-tablas',
  },
  {
    id: 'opening-guide',
    kind: 'article',
    en: '/opening-your-pool',
    es: '/es/como-abrir-tu-piscina',
  },
  {
    id: 'closing-guide',
    kind: 'article',
    en: '/closing-your-pool',
    es: '/es/como-cerrar-tu-piscina',
  },
  {
    id: 'pump-guide',
    kind: 'article',
    en: '/how-long-to-run-pool-pump',
    es: '/es/cuantas-horas-prender-la-bomba-de-la-piscina',
  },
  {
    id: 'salt-guide',
    kind: 'article',
    en: '/salt-water-pool-vs-chlorine-pool',
    es: '/es/piscina-de-agua-salada-o-de-cloro',
  },
  {
    id: 'shock-guide',
    kind: 'article',
    en: '/how-to-shock-a-pool',
    es: '/es/como-hacer-un-tratamiento-de-choque-a-la-piscina',
  },
  {
    id: 'shock-often-guide',
    kind: 'article',
    en: '/how-often-to-shock-a-pool',
    es: '/es/cada-cuanto-hacer-un-tratamiento-de-choque',
  },
  {
    id: 'green-guide',
    kind: 'article',
    en: '/how-to-fix-a-green-pool',
    es: '/es/como-arreglar-una-piscina-verde',
  },
  {
    id: 'cloudy-guide',
    kind: 'article',
    en: '/why-is-my-pool-cloudy',
    es: '/es/por-que-esta-turbia-mi-piscina',
  },
  {
    id: 'ph-guide',
    kind: 'article',
    en: '/how-to-lower-ph-in-a-pool',
    es: '/es/como-bajar-el-ph-de-la-piscina',
  },
  {
    id: 'calcium-guide',
    kind: 'article',
    en: '/how-to-raise-calcium-hardness-in-a-pool',
    es: '/es/como-subir-la-dureza-de-calcio-de-la-piscina',
  },
  {
    id: 'swim-guide',
    kind: 'article',
    en: '/how-long-after-adding-chemicals-can-you-swim',
    es: '/es/cuanto-esperar-para-nadar-despues-de-agregar-quimicos',
  },
  { id: 'methodology', kind: 'article', en: '/methodology', es: '/es/metodologia' },
  { id: 'about', kind: 'article', en: '/about', es: '/es/acerca' },
  { id: 'editorial', kind: 'article', en: '/editorial-policy', es: '/es/politica-editorial' },
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

/**
 * An English link of the site in `lang`, its query or fragment kept: the Spanish twin of its page
 * once it is built, the English page until then.
 */
export const localHrefOf = (href: string, lang: Lang): string => {
  if (lang === 'en') return href;
  const at = href.search(/[?#]/);
  const path = at < 0 ? href : href.slice(0, at);
  return `${routeOf(path)?.es ?? path}${at < 0 ? '' : href.slice(at)}`;
};
