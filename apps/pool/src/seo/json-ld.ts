import {
  articleLd,
  breadcrumbListLd,
  graphLd,
  serializeJsonLd,
  webApplicationLd,
  webSiteLd,
} from '@maestro-calc/site-kit/json-ld';
import { SITE } from '../site.config.ts';
import type { Crumb } from './breadcrumb.ts';

/** What a page is to search engines and link previews: the home, a calculator or an article. */
export type PageKind = 'home' | 'calculator' | 'article';

/** The home is `/`, a calculator is a `*-calculator` page (as `CALCULATOR_PAGES`), any other page is an article. */
export const pageKindOf = (path: string): PageKind =>
  path === '/' ? 'home' : path.endsWith('-calculator') ? 'calculator' : 'article';

/** The `og:type` of a page: an article (a guide, the methodology) is an Open Graph article. */
export const ogTypeOf = (kind: PageKind): 'website' | 'article' =>
  kind === 'article' ? 'article' : 'website';

const SCHEMA_TYPES = { home: 'WebSite', calculator: 'WebApplication', article: 'Article' } as const;

/** The schema.org type of the one JSON-LD node a page of this kind carries. */
export const schemaTypeOf = (kind: PageKind): string => SCHEMA_TYPES[kind];

/** The page name without the ` | Pool Figures` suffix of its title. */
const nameOf = (title: string): string => title.replace(/\s*\|\s*Pool Figures$/, '');

/**
 * The JSON-LD of the page at `path` (`@maestro-calc/site-kit/json-ld`), ready for its script
 * element; a page with a `trail` (a job page, `breadcrumb.ts`) also carries its `BreadcrumbList`,
 * both nodes in one `@graph`.
 */
export const jsonLdOf = (
  path: string,
  page: { readonly title: string; readonly description: string },
  origin: string,
  trail?: readonly Crumb[],
): string => {
  const url = new URL(path, origin).href;
  const inLanguage = 'en-US';
  const { description } = page;
  const kind = pageKindOf(path);
  const node =
    kind === 'home'
      ? webSiteLd({ name: SITE.name, url, inLanguage })
      : kind === 'calculator'
        ? webApplicationLd({
            name: nameOf(page.title),
            description,
            url,
            inLanguage,
            applicationCategory: 'UtilitiesApplication',
          })
        : articleLd({
            headline: nameOf(page.title),
            description,
            url,
            inLanguage,
            publisher: SITE.name,
          });
  if (trail === undefined) return serializeJsonLd(node);
  const items = trail.map(({ name, path: at }) => ({ name, url: new URL(at, origin).href }));
  return serializeJsonLd(graphLd(node, breadcrumbListLd(items)));
};
