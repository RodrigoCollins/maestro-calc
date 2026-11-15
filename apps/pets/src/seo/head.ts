import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { linkPreviewOf } from '@maestro-calc/site-kit/link-preview';
import type { Alternate } from '@maestro-calc/site-kit/sitemap';
import { langOf, routeOf, ROUTES, type Route } from '../routes.ts';
import { SITE } from '../site.config.ts';

/** The switches a page's head reads: the site's origin, the launch switch and the German one. */
export interface IndexSwitches {
  readonly origin: string;
  readonly indexable: boolean;
  readonly deIndexable: boolean;
}

/** Whether search engines may index the pages of `path`'s language: German only once it is open. */
export const languageOpen = (path: string, site: IndexSwitches = SITE): boolean =>
  site.indexable && (langOf(path) === 'en' || site.deIndexable);

/**
 * The hreflang alternates of the page at `path`: en, de and x-default (the English page) when its
 * route has a German twin and German is open, none otherwise, so no page names a twin that is
 * closed to search engines or does not exist.
 */
export const alternatesOf = (
  path: string,
  site: IndexSwitches = SITE,
  routes: readonly Route[] = ROUTES,
): Alternate[] => {
  const route = routeOf(path, routes);
  if (route?.de === undefined || !site.indexable || !site.deIndexable) return [];
  const en = canonicalUrl(route.path, site.origin);
  return [
    { hreflang: 'en', href: en },
    { hreflang: 'de', href: canonicalUrl(route.de, site.origin) },
    { hreflang: 'x-default', href: en },
  ];
};

/**
 * What the layout writes about the page at `path`: its canonical while the site and the page's
 * language are open and the page is `indexed` (never the 404), `noindex` otherwise, and its link
 * preview. The owner flips `SITE.indexable` (the site) and `SITE.deIndexable` (German).
 */
export const headOf = (
  path: string,
  text: { readonly title: string; readonly description: string },
  indexed: boolean,
  site: IndexSwitches = SITE,
): {
  readonly canonical?: string;
  readonly robots?: string;
  readonly preview: ReturnType<typeof linkPreviewOf>;
} => ({
  ...(indexed && languageOpen(path, site)
    ? { canonical: canonicalUrl(path, site.origin) }
    : { robots: 'noindex' }),
  preview: linkPreviewOf(site.origin, text),
});
