import { FOOD_HUB, FOOD_PAGES } from './can-dogs-eat.ts';
import { CAT_YEARS_PAGES } from './cat-years.ts';
import { CHARTS } from './charts.ts';
import { AGE_PAGES } from './dog-years.ts';
import { GUIDES, type PageSource } from './guides.ts';
import { CATS_HUB, DOGS_HUB, PLANT_PAGES, SAFE_HUB } from './toxic-plants.ts';

/**
 * A page that carries the byline of the editorial team: its address, the day its data says its
 * figures were last checked, and the sources its sources section lists.
 */
export interface BylinePage {
  readonly path: string;
  readonly checked: string;
  readonly sources: readonly PageSource[];
}

/** Every guide and data page, each with its byline data (`site-check` holds the built pages to it). */
export const BYLINE_PAGES: readonly BylinePage[] = [
  ...GUIDES,
  ...CHARTS,
  ...AGE_PAGES,
  ...CAT_YEARS_PAGES,
  FOOD_HUB,
  ...FOOD_PAGES,
  CATS_HUB,
  DOGS_HUB,
  SAFE_HUB,
  ...PLANT_PAGES,
].map(({ path, checked, sources }) => ({ path, checked, sources }));

/** The byline data of the page at `path`. */
export const bylinePageOf = (path: string): BylinePage => {
  const page = BYLINE_PAGES.find((candidate) => candidate.path === path);
  if (page === undefined) throw new Error(`no byline page ${path}`);
  return page;
};
