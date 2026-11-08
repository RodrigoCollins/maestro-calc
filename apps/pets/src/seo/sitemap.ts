import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { sitemapXml as sitemapOf } from '@maestro-calc/site-kit/sitemap';
import type { Route } from '../routes.ts';

/** The public path of a page as the build names it: `/methodology.html` is `/methodology`, `/index.html` is `/`. */
export const canonicalPath = (pathname: string): string =>
  pathname
    .replace(/\.html$/, '')
    .replace(/(^|\/)index$/, '/')
    .replace(/^\/\/$/, '/');

/** The sitemap of the site, from the route table, sorted by address. */
export const sitemapXml = (routes: readonly Route[], origin: string): string =>
  sitemapOf(
    [...routes]
      .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
      .map(({ path }) => ({ loc: canonicalUrl(path, origin) })),
  );
