import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { localizedUrls, sitemapXml as sitemapOf } from '@maestro-calc/site-kit/sitemap';
import type { Route } from '../routes.ts';

/**
 * The sitemap: every route in both languages, each URL with its en-US, es-US and x-default pair; an
 * English-only route (no `es`) is one plain `<loc>`, with no alternates.
 */
export const sitemapXml = (routes: readonly Route[], origin: string): string =>
  sitemapOf(
    routes.flatMap((route) =>
      route.es === undefined
        ? [{ loc: canonicalUrl(route.en, origin) }]
        : localizedUrls([
            { hreflang: 'en-US', href: canonicalUrl(route.en, origin) },
            { hreflang: 'es-US', href: canonicalUrl(route.es, origin) },
            { hreflang: 'x-default', href: canonicalUrl(route.en, origin) },
          ]),
    ),
  );
