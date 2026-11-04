import { headOf } from './seo/head.ts';
import { jsonLdOf, pageKindOf } from './seo/json-ld.ts';
import { pagePaths, sitemapXml } from './seo/sitemap.ts';
import { SITE } from './site.config.ts';

// The page files, as `pages/sitemap.xml.ts` lists them (`./methodology.astro`).
const paths = pagePaths(
  Object.keys(import.meta.glob('./pages/*.astro')).map((file) => file.replace('/pages/', '/')),
);
const pathOf = (url: string): string => new URL(url).pathname;

/** What the growth contract (apps/web/src/contract/growth.contract.test.ts) reads of Pool Figures. */
export const GROWTH = {
  origin: SITE.origin,
  indexNowKey: SITE.indexNowKey,
  sitemapXml: sitemapXml(paths, SITE.origin),
  pages: paths.map((path) => ({ url: new URL(path, SITE.origin).href, kind: pageKindOf(path) })),
  headOf: (url: string | undefined, text: { title: string; description: string }) =>
    url === undefined ? headOf('/404', text, false) : headOf(pathOf(url), text, true),
  jsonLdOf: (url: string, text: { title: string; description: string }) =>
    jsonLdOf(pathOf(url), text, SITE.origin),
};
