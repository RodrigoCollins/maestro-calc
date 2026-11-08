import {
  articleLd,
  breadcrumbListLd,
  graphLd,
  organizationLd,
  serializeJsonLd,
  webApplicationLd,
  webSiteLd,
} from '@maestro-calc/site-kit/json-ld';
import { hrefOf, routeOf, type PageKind } from '../routes.ts';
import { SITE } from '../site.config.ts';
import type { Crumb } from './breadcrumb.ts';

export type { PageKind } from '../routes.ts';

/** The kind of the route at `path` (`src/routes.ts`); any other path is an article. */
export const pageKindOf = (path: string): PageKind => routeOf(path)?.kind ?? 'article';

/** The `og:type` of a page: an article (a guide, the methodology) is an Open Graph article. */
export const ogTypeOf = (kind: PageKind): 'website' | 'article' =>
  kind === 'article' ? 'article' : 'website';

const SCHEMA_TYPES = { home: 'WebSite', calculator: 'WebApplication', article: 'Article' } as const;

/** The schema.org type of the first JSON-LD node a page of this kind carries. */
export const schemaTypeOf = (kind: PageKind): string => SCHEMA_TYPES[kind];

/** The page name without the ` | Lawn Figures` suffix of its title. */
const nameOf = (title: string): string => title.replace(/\s*\|\s*Lawn Figures$/, '');

/**
 * Lawn Figures as the organization that writes and publishes every article (its editorial team,
 * never a person): its home and the editorial policy as its publishing principles.
 */
const organizationOf = (origin: string) => ({
  name: SITE.name,
  url: new URL('/', origin).href,
  publishingPrinciples: new URL(hrefOf('editorial'), origin).href,
});

/** What a page tells the JSON-LD beyond its title and description. */
export interface LdPage {
  readonly title: string;
  readonly description: string;
  /** The day the page's data says it was last checked (`YYYY-MM-DD`), when it carries one. */
  readonly modified?: string;
}

/**
 * The JSON-LD of the page at `path`, ready for its script element: the home is the `WebSite` with
 * the `Organization`, a calculator a `WebApplication`, any other page an `Article` by the
 * organization. A page with a `trail` also carries its `BreadcrumbList`, in one `@graph`.
 */
export const jsonLdOf = (
  path: string,
  page: LdPage,
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
            author: organizationOf(origin),
            publisher: organizationOf(origin),
            ...(page.modified === undefined ? {} : { dateModified: page.modified }),
          });
  const items = trail?.map(({ name, path: at }) => ({ name, url: new URL(at, origin).href }));
  const nodes = [
    node,
    ...(kind === 'home' ? [organizationLd(organizationOf(origin))] : []),
    ...(items === undefined ? [] : [breadcrumbListLd(items)]),
  ];
  return serializeJsonLd(nodes.length === 1 ? node : graphLd(...nodes));
};
