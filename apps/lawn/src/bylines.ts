import { FROST_CHECKED } from './editorial.ts';
import { FROST_PAGES } from './frost.ts';
import { GUIDES } from './guide.ts';
import { NORMALS_SOURCES, type MethodSource } from './methodology.ts';

/**
 * A page that carries the byline of the editorial team: its address, the day its data says its
 * figures were last checked, and the sources its sources section lists.
 */
export interface BylinePage {
  readonly path: string;
  readonly checked: string;
  readonly sources: readonly MethodSource[];
}

/** The frost index and every frost page: the NOAA normals, checked the day the dataset was pulled. */
const FROST_BYLINES: readonly BylinePage[] = [
  '/frost-dates',
  ...FROST_PAGES.map(({ path }) => path),
].map((path) => ({ path, checked: FROST_CHECKED, sources: NORMALS_SOURCES }));

/** Every page with a byline: the guides, then the frost dates. */
export const BYLINE_PAGES: readonly BylinePage[] = [
  ...GUIDES.map(({ path, checked, sources }) => ({
    path,
    checked,
    sources: Object.values(sources),
  })),
  ...FROST_BYLINES,
];

/** The byline page at `path`; a page with no byline throws at build time. */
export const bylinePageOf = (path: string): BylinePage => {
  const page = BYLINE_PAGES.find((candidate) => candidate.path === path);
  if (page === undefined) throw new Error(`${path} has no byline`);
  return page;
};
