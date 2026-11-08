import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { ROUTES, routeOf } from './routes.ts';
import { headOf } from './seo/head.ts';
import { jsonLdOf } from './seo/json-ld.ts';
import { sitemapXml } from './seo/sitemap.ts';
import { hrefOf, langOf } from './routes.ts';
import { SITE } from './site.config.ts';

const pathOf = (url: string): string => new URL(url).pathname;

/** The site as it will be once the owner flips `SITE.indexable`: the head the contract holds it to. */
const LAUNCHED = { origin: SITE.origin, indexable: true } as const;

/**
 * What the growth contract (apps/web/src/contract/growth.contract.test.ts) reads of Cuánto Le Cobro.
 * Its pages are read as launched, because the closed site is `noindex` by design until then.
 */
export const GROWTH = {
  origin: SITE.origin,
  indexNowKey: SITE.indexNowKey,
  sitemapXml: sitemapXml(ROUTES, SITE.origin),
  pages: ROUTES.flatMap((route) =>
    [route.es, route.en].map((path) => ({
      url: canonicalUrl(path, SITE.origin),
      kind: route.kind,
    })),
  ),
  headOf: (url: string | undefined, text: { title: string; description: string }) =>
    url === undefined
      ? headOf('/404', text, false, LAUNCHED)
      : headOf(pathOf(url), text, true, LAUNCHED),
  jsonLdOf: (url: string, text: { title: string; description: string }) => {
    const path = pathOf(url);
    const route = routeOf(path);
    if (route === undefined) throw new Error(`${url} is not a page of ${SITE.name}`);
    return jsonLdOf(route, langOf(path), text, SITE.origin, hrefOf('editorial', 'en'));
  },
};
