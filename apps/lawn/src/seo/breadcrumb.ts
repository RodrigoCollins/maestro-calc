import { SITE } from '../site.config.ts';

/** One step of a breadcrumb: what it is called and its canonical path. */
export interface Crumb {
  readonly name: string;
  readonly path: string;
}

const withoutSite = (title: string): string => title.replace(/\s*\|\s*Lawn Figures$/, '');

/** The trail of a frost page: the home, the frost dates index, then the state (or its part). */
export const frostTrailOf = (page: {
  readonly path: string;
  readonly title: string;
}): readonly Crumb[] => [
  { name: SITE.name, path: '/' },
  { name: 'Frost dates', path: '/frost-dates' },
  { name: withoutSite(page.title), path: page.path },
];

/** The trail of a page below the home: the home, then the page itself. */
export const pageTrailOf = (page: {
  readonly path: string;
  readonly title: string;
}): readonly Crumb[] => [
  { name: SITE.name, path: '/' },
  { name: withoutSite(page.title), path: page.path },
];
