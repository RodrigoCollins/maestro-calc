import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { ROUTES, TWINS } from './routes.ts';
import { headOf, twinOpen } from './seo/head.ts';
import { jsonLdOf } from './seo/json-ld.ts';
import { sitemapXml } from './seo/sitemap.ts';
import { SITE } from './site.config.ts';

const pathOf = (url: string): string => new URL(url).pathname;

/** The site as it is once the owner flips `SITE.indexable`: the growth contract holds that state. */
const OPEN = {
  origin: SITE.origin,
  indexable: true,
  deIndexable: SITE.deIndexable,
  frIndexable: SITE.frIndexable,
  esIndexable: SITE.esIndexable,
} as const;

/** What the growth contract (apps/web/src/contract/growth.contract.test.ts) reads of Bowl Figures. */
export const GROWTH = {
  origin: SITE.origin,
  indexNowKey: SITE.indexNowKey,
  sitemapXml: sitemapXml(ROUTES, SITE.origin),
  // every English page and each twin in a language open to search engines, as the sitemap lists them
  pages: ROUTES.flatMap((route) =>
    [
      route.path,
      ...TWINS.flatMap((twin) => {
        const twinPath = route[twin];
        return twinPath !== undefined && twinOpen(twin, OPEN) ? [twinPath] : [];
      }),
    ].map((path) => ({ url: canonicalUrl(path, SITE.origin), kind: route.kind })),
  ),
  headOf: (url: string | undefined, text: { title: string; description: string }) =>
    url === undefined ? headOf('/404', text, false, OPEN) : headOf(pathOf(url), text, true, OPEN),
  jsonLdOf: (url: string, text: { title: string; description: string }) =>
    jsonLdOf(pathOf(url), text, SITE.origin),
};
