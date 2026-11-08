import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { ROUTES } from './routes.ts';
import { headOf } from './seo/head.ts';
import { jsonLdOf } from './seo/json-ld.ts';
import { sitemapXml } from './seo/sitemap.ts';
import { SITE } from './site.config.ts';

const pathOf = (url: string): string => new URL(url).pathname;

/** The site as it reads once the owner opens it: the growth contract checks the launched head. */
const LAUNCHED = { origin: SITE.origin, indexable: true } as const;

/** What the growth contract (apps/web/src/contract/growth.contract.test.ts) reads of Lawn Figures. */
export const GROWTH = {
  origin: SITE.origin,
  indexNowKey: SITE.indexNowKey,
  sitemapXml: sitemapXml(ROUTES, SITE.origin),
  pages: ROUTES.map((route) => ({
    url: canonicalUrl(route.path, SITE.origin),
    kind: route.kind,
  })),
  headOf: (url: string | undefined, text: { title: string; description: string }) =>
    url === undefined ? headOf('/404', text, false) : headOf(pathOf(url), text, true, LAUNCHED),
  jsonLdOf: (url: string, text: { title: string; description: string }) =>
    jsonLdOf(pathOf(url), text, SITE.origin),
};
