import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { localizedUrls, sitemapXml as sitemapOf } from '@maestro-calc/site-kit/sitemap';
import type { Route } from '../routes.ts';
import { SITE } from '../site.config.ts';
import { alternatesOf, type IndexSwitches } from './head.ts';

/** The public path of a page as the build names it: `/methodology.html` is `/methodology`, `/index.html` is `/`. */
export const canonicalPath = (pathname: string): string =>
  pathname
    .replace(/\.html$/, '')
    .replace(/(^|\/)index$/, '/')
    .replace(/^\/\/$/, '/');

/**
 * The sitemap of the site, from the route table, sorted by English address. While German is
 * closed (`SITE.deIndexable`) it lists the English pages only, plain; once open, a page with a
 * German twin gives both addresses, each with the pair and x-default at English, and a page with
 * no twin is one plain `<loc>`.
 */
export const sitemapXml = (
  routes: readonly Route[],
  origin: string,
  switches: IndexSwitches = { ...SITE, origin },
): string =>
  sitemapOf(
    [...routes]
      .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
      .flatMap((route) => {
        const alternates = alternatesOf(route.path, { ...switches, origin }, [route]);
        return alternates.length === 0
          ? [{ loc: canonicalUrl(route.path, origin) }]
          : localizedUrls(alternates);
      }),
  );
