import type { Locale } from '@maestro-calc/i18n';
import { isJobPage } from './jobs.ts';
import { NOT_FOUND_ID, pathOf, staticPaths } from './routes.ts';
import type { PageId, RouteTable } from './routes.ts';

/**
 * The route ids rendered with the calculator page template: the page id is the calculator id.
 * `PAGELESS` holds the registry calculators that have no page, and the two lists never overlap.
 */
export const CALCULATOR_PAGES = [
  'concrete',
  'rectangle-area',
  'gravel',
  'mulch',
  'topsoil',
  'paint',
  'drywall',
  'roof-pitch',
  'roofing',
  'feet-inches',
] as const satisfies readonly PageId[];

/** The id of a page that uses the calculator template. */
export type CalculatorPageId = (typeof CALCULATOR_PAGES)[number];

/** Whether `id` is a calculator page id (a type guard for the route files). */
export const isCalculatorPage = (id: string): id is CalculatorPageId =>
  CALCULATOR_PAGES.some((page) => page === id);

/**
 * `getStaticPaths` of the calculator route file of a locale: `pages/[calculator].astro` (en) and
 * `pages/es/[calculator].astro` (es). The calculator pages have route files of their own because Astro
 * bundles the scoped CSS of every component a route file imports: rendered from the catch-all, they
 * would carry the trust, job, glossary and guide styles they never use.
 */
export const calculatorPaths = (locale: Locale) =>
  staticPaths().flatMap(({ props: { id, locale: of } }) =>
    of === locale && isCalculatorPage(id)
      ? [{ params: { calculator: pathOf(id, locale).split('/').at(-1) }, props: { id, locale } }]
      : [],
  );

/** Registry calculators without a page (site-routing-i18n › Calculator pages in the route table). */
export const PAGELESS: readonly string[] = [];

/** The page templates: `check:site` and the browser lists derive their rules from them. */
export type Template = 'home' | 'trust' | 'calculator' | 'job' | 'notFound';

/** The template of a page id: never guessed from the HTML. */
export const templateOf = (
  id: string,
  calculatorPages: readonly string[] = CALCULATOR_PAGES,
): Template => {
  if (id === NOT_FOUND_ID) return 'notFound';
  if (id === 'home') return 'home';
  if (isJobPage(id)) return 'job';
  return calculatorPages.includes(id) ? 'calculator' : 'trust';
};

/** What is wrong with the two lists against the table and the registry, one line each, naming the id. */
export const templateProblems = (
  routes: RouteTable,
  calculatorPages: readonly string[],
  pageless: readonly string[],
  registry: readonly string[],
): string[] => [
  ...calculatorPages.flatMap((id) => [
    ...(Object.hasOwn(routes, id) ? [] : [`${id}: page id is not in the route table`]),
    ...(registry.includes(id) ? [] : [`${id}: page id is not a registry calculator`]),
  ]),
  ...registry.flatMap((id) => {
    const page = calculatorPages.includes(id);
    const none = pageless.includes(id);
    if (page && none) return [`${id}: id is in both the page list and PAGELESS`];
    return page || none
      ? []
      : [`${id}: registry calculator is in neither the page list nor PAGELESS`];
  }),
  ...pageless
    .filter((id) => !registry.includes(id))
    .map((id) => `${id}: PAGELESS id is not in the registry`),
];
