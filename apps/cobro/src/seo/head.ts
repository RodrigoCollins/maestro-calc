import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { pagePathOf } from '@maestro-calc/site-kit/embed';
import { linkPreviewOf } from '@maestro-calc/site-kit/link-preview';
import type { Alternate } from '@maestro-calc/site-kit/sitemap';
import { routeOf, ROUTES, type Route } from '../routes.ts';
import { SITE } from '../site.config.ts';

/**
 * The hreflang alternates of the page at `path`: es-US, en-US and x-default (the Spanish page, the
 * primary language of the site). Every route has both languages, so every page names its twin.
 */
export const alternatesOf = (
  path: string,
  origin: string,
  routes: readonly Route[] = ROUTES,
): Alternate[] => {
  const route = routeOf(path, routes);
  if (route === undefined) return [];
  const es = canonicalUrl(route.es, origin);
  return [
    { hreflang: 'es-US', href: es },
    { hreflang: 'en-US', href: canonicalUrl(route.en, origin) },
    { hreflang: 'x-default', href: es },
  ];
};

/**
 * What the layout writes about the page at `path`: its canonical while the site is indexable and
 * the page is `indexed` (never the 404), `noindex` otherwise, and its link preview.
 */
export const headOf = (
  path: string,
  text: { readonly title: string; readonly description: string },
  indexed: boolean,
  site: { readonly origin: string; readonly indexable: boolean } = SITE,
): {
  readonly canonical?: string;
  readonly robots?: string;
  readonly preview: ReturnType<typeof linkPreviewOf>;
} => ({
  // the canonical is written even before launch (a noindex page still names itself)
  ...(indexed ? { canonical: canonicalUrl(path, site.origin) } : {}),
  ...(site.indexable && indexed ? {} : { robots: 'noindex' }),
  preview: linkPreviewOf(site.origin, text),
});

/**
 * What the layout writes about the embed at `path` (`src/embed/embeds.ts`): the full page it embeds
 * as its canonical, always `noindex` (search sees the full page only), and its link preview.
 */
export const embedHeadOf = (
  path: string,
  text: { readonly title: string; readonly description: string },
  site: { readonly origin: string } = SITE,
): {
  readonly page: string;
  readonly canonical: string;
  readonly robots: string;
  readonly preview: ReturnType<typeof linkPreviewOf>;
} => {
  const page = pagePathOf(path);
  if (page === undefined) throw new Error(`not an embed: ${path}`);
  return {
    page,
    canonical: canonicalUrl(page, site.origin),
    robots: 'noindex',
    preview: linkPreviewOf(site.origin, text),
  };
};
