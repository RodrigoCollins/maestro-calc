import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { pagePathOf } from '@maestro-calc/site-kit/embed';
import { linkPreviewOf } from '@maestro-calc/site-kit/link-preview';
import type { Alternate } from '@maestro-calc/site-kit/sitemap';
import { routeOf, ROUTES, type Route } from '../routes.ts';
import { SITE } from '../site.config.ts';

/**
 * The hreflang alternates of the page at `path`: en-US, es-US and x-default (the English page)
 * when its route has a Spanish twin, none otherwise, so no page names one that does not exist.
 */
export const alternatesOf = (
  path: string,
  origin: string,
  routes: readonly Route[] = ROUTES,
): Alternate[] => {
  const route = routeOf(path, routes);
  if (route?.es === undefined) return [];
  const en = canonicalUrl(route.en, origin);
  return [
    { hreflang: 'en-US', href: en },
    { hreflang: 'es-US', href: canonicalUrl(route.es, origin) },
    { hreflang: 'x-default', href: en },
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
  ...(site.indexable && indexed
    ? { canonical: canonicalUrl(path, site.origin) }
    : { robots: 'noindex' }),
  preview: linkPreviewOf(site.origin, text),
});

/**
 * What the layout writes about the embed at `path` (`src/embed.ts`): the full page it embeds as its
 * canonical, always `noindex` (search sees the full page only), and its link preview.
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
