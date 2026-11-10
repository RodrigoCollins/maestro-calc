import {
  CALENDAR_STATES,
  feedStatePathOf,
  seedStatePathOf,
  ZONE_INDEX_PATH,
  ZONE_LABELS,
  zonePathOf,
} from './calendar-paths.ts';
import { cityPathOf, FROST_CITIES } from './frost-cities.ts';
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
  { id: 'planting-guide', kind: 'article', path: '/when-to-plant-grass-seed' },
  { id: 'bermuda-seed', kind: 'article', path: '/bermuda-grass-seed' },
  { id: 'zoysia-seed', kind: 'article', path: '/zoysia-grass-seed' },
  { id: 'tall-fescue-seed', kind: 'article', path: '/tall-fescue-grass-seed' },
  { id: 'ryegrass-seed', kind: 'article', path: '/perennial-ryegrass-seed' },
  { id: 'bluegrass-seed', kind: 'article', path: '/kentucky-bluegrass-seed' },
  { id: 'fescue-seed', kind: 'article', path: '/fescue-grass-seed' },
  { id: 'centipede-seed', kind: 'article', path: '/centipede-grass-seed' },
  { id: 'buffalo-seed', kind: 'article', path: '/buffalo-grass-seed' },
  { id: 'st-augustine-seed', kind: 'article', path: '/st-augustine-grass-seed' },
  { id: 'best-seed', kind: 'article', path: '/best-grass-seed' },
  { id: 'methodology', kind: 'article', path: '/methodology' },
  { id: 'about', kind: 'article', path: '/about' },
  { id: 'editorial', kind: 'article', path: '/editorial-policy' },
  { id: 'privacy', kind: 'article', path: '/privacy' },
  { id: 'zone-index', kind: 'article', path: ZONE_INDEX_PATH },
  { id: 'uk-sowing-guide', kind: 'article', path: '/when-to-sow-grass-seed-uk' },
  { id: 'growing-guide', kind: 'article', path: '/how-long-does-grass-seed-take-to-grow' },
  { id: 'aeration-guide', kind: 'article', path: '/when-to-aerate-lawn' },
  { id: 'pre-emergent-guide', kind: 'article', path: '/when-to-apply-pre-emergent' },
];

/**
 * Every page: the page files, then the pages built from data: the frost pages
 * (`frost-dates/[...state].astro`), the planting zones (`planting-zones/[zone].astro`) and the seed
 * and fertilizer calendars of the states (`when-to-plant-grass-seed/[state].astro`,
 * `when-to-fertilize-lawn/[state].astro`), then the frost pages of the big cities
 * (`last-frost-date/[city].astro`).
 */
export const ROUTES: readonly Route[] = [
  ...PAGE_ROUTES,
  ...FROST_PAGES.map(({ state, part, path }) => ({
    id: `frost:${state.slug}${part === 1 ? '' : `:${String(part)}`}`,
    kind: 'article' as const,
    path,
  })),
  ...ZONE_LABELS.map((label) => ({
    id: `zone:${label}`,
    kind: 'article' as const,
    path: zonePathOf(label),
  })),
  ...CALENDAR_STATES.map(({ slug }) => ({
    id: `seed:${slug}`,
    kind: 'article' as const,
    path: seedStatePathOf(slug),
  })),
  ...CALENDAR_STATES.map(({ slug }) => ({
    id: `feed:${slug}`,
    kind: 'article' as const,
    path: feedStatePathOf(slug),
  })),
  ...FROST_CITIES.map(({ slug }) => ({
    id: `city:${slug}`,
    kind: 'article' as const,
    path: cityPathOf(slug),
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
