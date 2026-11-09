import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { ROUTES } from './routes.ts';
import { headOf } from './seo/head.ts';
import { jsonLdOf } from './seo/json-ld.ts';
import { sitemapXml } from './seo/sitemap.ts';
import { SITE } from './site.config.ts';

const PAGES = ROUTES.flatMap((route) =>
  (['en', 'es'] as const).flatMap((lang) => {
    const path = route[lang];
    return path === undefined ? [] : [{ url: canonicalUrl(path, SITE.origin), route, lang }];
  }),
);
const pageOf = (url: string) => {
  const page = PAGES.find((each) => each.url === url);
  if (page === undefined) throw new Error(`${url} is not a page of ${SITE.name}`);
  return page;
};

/** What the growth contract (apps/web/src/contract/growth.contract.test.ts) reads of Cuenta Horas. */
export const GROWTH = {
  origin: SITE.origin,
  indexNowKey: SITE.indexNowKey,
  sitemapXml: sitemapXml(ROUTES, SITE.origin),
  pages: PAGES.map(({ url, route }) => ({ url, kind: route.kind })),
  headOf: (url: string | undefined, text: { title: string; description: string }) => {
    if (url === undefined) return headOf(undefined, 'en', text);
    const { route, lang } = pageOf(url);
    return headOf(route, lang, text);
  },
  jsonLdOf: (url: string, text: { title: string; description: string }) => {
    const { route, lang } = pageOf(url);
    return jsonLdOf(route, lang, text, SITE.origin);
  },
};
