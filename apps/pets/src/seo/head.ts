import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { linkPreviewOf } from '@maestro-calc/site-kit/link-preview';
import type { Alternate } from '@maestro-calc/site-kit/sitemap';
import { langOf, routeOf, ROUTES, TWINS, type Route, type Twin } from '../routes.ts';
import { SITE } from '../site.config.ts';

/** The switches a page's head reads: the site's origin, the launch switch and one per twin language. */
export interface IndexSwitches {
  readonly origin: string;
  readonly indexable: boolean;
  readonly deIndexable: boolean;
  readonly frIndexable: boolean;
}

/** Whether the pages of twin language `twin` are open to search engines on an open site. */
export const twinOpen = (twin: Twin, site: IndexSwitches = SITE): boolean =>
  site.indexable && (twin === 'de' ? site.deIndexable : site.frIndexable);

/**
 * Whether search engines may index the pages of `path`'s language: English with the site, German
 * and French each only once its own switch is open.
 */
export const languageOpen = (path: string, site: IndexSwitches = SITE): boolean => {
  const lang = langOf(path);
  return lang === 'en' ? site.indexable : twinOpen(lang, site);
};

/**
 * The hreflang alternates of the page at `path`: en, then each twin of its route whose language is
 * open (de, fr), then x-default (the English page); none when the page's own language is closed or
 * no twin of it is open, so no page names a twin that is closed to search engines or does not exist.
 */
export const alternatesOf = (
  path: string,
  site: IndexSwitches = SITE,
  routes: readonly Route[] = ROUTES,
): Alternate[] => {
  const route = routeOf(path, routes);
  if (route === undefined || !languageOpen(path, site)) return [];
  const twins = TWINS.flatMap((twin) => {
    const twinPath = route[twin];
    return twinPath !== undefined && twinOpen(twin, site)
      ? [{ hreflang: twin, href: canonicalUrl(twinPath, site.origin) }]
      : [];
  });
  if (twins.length === 0) return [];
  const en = canonicalUrl(route.path, site.origin);
  return [{ hreflang: 'en', href: en }, ...twins, { hreflang: 'x-default', href: en }];
};

/**
 * What the layout writes about the page at `path`: its canonical while the site and the page's
 * language are open and the page is `indexed` (never the 404), `noindex` otherwise, and its link
 * preview. The owner flips `SITE.indexable` (the site), `SITE.deIndexable` (German) and
 * `SITE.frIndexable` (French).
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
