import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { localizedUrls, sitemapXml as sitemapOf } from '@maestro-calc/site-kit/sitemap';
import type { Route } from '../routes.ts';
import { alternatesOf } from './head.ts';

/** The public path of a page as the build names it: `/methodology.html` is `/methodology`, `/index.html` is `/`. */
export const canonicalPath = (pathname: string): string =>
  pathname
    .replace(/\.html$/, '')
    .replace(/(^|\/)index$/, '/')
    .replace(/^\/\/$/, '/');

/**
 * The sitemap of the site, from the route table, sorted by English address: a page with a Spanish
 * twin gives both addresses, each with the pair and x-default at English; a page with no twin yet
 * is one plain `<loc>`, so the sitemap never names a page that does not exist.
 */
export const sitemapXml = (routes: readonly Route[], origin: string): string =>
  sitemapOf(
    [...routes]
      .sort((a, b) => (a.en < b.en ? -1 : a.en > b.en ? 1 : 0))
      .flatMap((route) => {
        const alternates = alternatesOf(route.en, origin, [route]);
        return alternates.length === 0
          ? [{ loc: canonicalUrl(route.en, origin) }]
          : localizedUrls(alternates);
      }),
  );
