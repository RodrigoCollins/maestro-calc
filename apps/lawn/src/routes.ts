import { FROST_PAGES } from './frost.ts';

/** What a page is to search engines and link previews: the home, a calculator or an article. */
export type PageKind = 'home' | 'calculator' | 'article';

/** A page of Lawn Figures (English only at launch, plans/lawn/PLAN.md). */
export interface Route {
  readonly id: string;
  readonly kind: PageKind;
  readonly path: string;
}

/** The page files of `src/pages` with a fixed address, in the order of the site. */
const PAGE_ROUTES: readonly Route[] = [
  { id: 'home', kind: 'home', path: '/' },
  { id: 'lawn-fertilizer', kind: 'calculator', path: '/lawn-fertilizer-calculator' },
  { id: 'grass-seed', kind: 'calculator', path: '/grass-seed-calculator' },
  { id: 'sod', kind: 'calculator', path: '/sod-calculator' },
  { id: 'lawn-lime', kind: 'calculator', path: '/lawn-lime-calculator' },
  { id: 'frost-index', kind: 'article', path: '/frost-dates' },
  { id: 'timing-guide', kind: 'article', path: '/when-to-fertilize-and-seed-your-lawn' },
  { id: 'methodology', kind: 'article', path: '/methodology' },
  { id: 'about', kind: 'article', path: '/about' },
  { id: 'editorial', kind: 'article', path: '/editorial-policy' },
  { id: 'privacy', kind: 'article', path: '/privacy' },
];

/** Every page: the page files, then the frost pages `frost-dates/[...state].astro` builds. */
export const ROUTES: readonly Route[] = [
  ...PAGE_ROUTES,
  ...FROST_PAGES.map(({ state, part, path }) => ({
    id: `frost:${state.slug}${part === 1 ? '' : `:${String(part)}`}`,
    kind: 'article' as const,
    path,
  })),
];

/** The route of an address, or `undefined` (the 404). */
export const routeOf = (path: string, routes: readonly Route[] = ROUTES): Route | undefined =>
  routes.find((route) => route.path === path);

/** The address of route `id`; an unknown id throws at build time. */
export const hrefOf = (id: string): string => {
  const route = ROUTES.find((candidate) => candidate.id === id);
  if (route === undefined) throw new Error(`no route ${id}`);
  return route.path;
};
