import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { localizedUrls, sitemapXml as sitemapOf } from '@maestro-calc/site-kit/sitemap';
import type { Route } from '../routes.ts';

/**
 * The sitemap: every route in both languages, each URL with its en-US, es-US and x-default pair; a
 * one-language route (no `es` or no `en`) is one plain `<loc>`, with no alternates.
 */
export const sitemapXml = (routes: readonly Route[], origin: string): string =>
  sitemapOf(
    routes.flatMap((route) =>
      route.en === undefined
        ? [{ loc: canonicalUrl(route.es, origin) }]
        : route.es === undefined
          ? [{ loc: canonicalUrl(route.en, origin) }]
          : localizedUrls([
              { hreflang: 'en-US', href: canonicalUrl(route.en, origin) },
              { hreflang: 'es-US', href: canonicalUrl(route.es, origin) },
              { hreflang: 'x-default', href: canonicalUrl(route.en, origin) },
            ]),
    ),
  );
