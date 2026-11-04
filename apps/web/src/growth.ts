import { siteText } from './lib/site-text.ts';
import { guideOf } from './routing/guides.ts';
import { LOCALES, pathOf, ROUTES, urlOf } from './routing/routes.ts';
import type { PageId } from './routing/routes.ts';
import { templateOf } from './routing/templates.ts';
import { headFor, linkPreviewOf, notFoundHead } from './seo/head.ts';
import { calculatorJsonLd, guideJsonLd, homeJsonLd, serializeJsonLd } from './seo/json-ld.ts';
import { sitemapXml } from './seo/sitemap.ts';
import { SITE } from './site.config.ts';

interface Text {
  readonly title: string;
  readonly description: string;
}

/** The kind of a page: the views give the home, a calculator and a guide their JSON-LD. */
const kindOf = (id: PageId) => {
  const template = templateOf(id);
  if (template === 'home' || template === 'calculator') return template;
  return guideOf(id) === undefined ? 'page' : 'article';
};

const isPageId = (id: string): id is PageId => Object.hasOwn(ROUTES, id);
const PAGES = Object.keys(ROUTES)
  .filter(isPageId)
  .flatMap((id) =>
    LOCALES.map((locale) => ({ url: urlOf(pathOf(id, locale)), id, locale, kind: kindOf(id) })),
  );
const pageOf = (url: string) => {
  const page = PAGES.find((each) => each.url === url);
  if (page === undefined) throw new Error(`${url} is not a page of ${SITE.name}`);
  return page;
};

/** What the growth contract (apps/web/src/contract/growth.contract.test.ts) reads of Maestro Calc. */
export const GROWTH = {
  origin: SITE.url,
  indexNowKey: SITE.indexNowKey,
  sitemapXml: sitemapXml(),
  pages: PAGES.map(({ url, kind }) => ({ url, kind })),
  /** `SeoHead` writes the link preview only for a page with a canonical: the 404 has neither. */
  headOf: (url: string | undefined, text: Text) => {
    if (url === undefined) return { robots: notFoundHead(siteText('en')).robots, preview: {} };
    const { id, locale } = pageOf(url);
    return {
      canonical: headFor(id, locale, siteText(locale)).canonical,
      preview: linkPreviewOf(text),
    };
  },
  /** As `HomeView`, `CalculatorView` and `TrustPageView` build it; other pages have none. */
  jsonLdOf: (url: string, { title }: Text): string | undefined => {
    const { id, locale, kind } = pageOf(url);
    if (kind === 'page') return undefined;
    return serializeJsonLd(
      kind === 'home'
        ? homeJsonLd(locale)
        : kind === 'calculator'
          ? calculatorJsonLd({ id, name: title }, locale, [])
          : guideJsonLd({ id, name: title, updated: '2026-11-04' }, locale),
    );
  },
};
