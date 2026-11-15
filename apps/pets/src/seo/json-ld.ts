import {
  articleLd,
  breadcrumbListLd,
  graphLd,
  serializeJsonLd,
  webApplicationLd,
  webSiteLd,
} from '@maestro-calc/site-kit/json-ld';
import { hrefOf, langOf, routeOf, type Lang, type PageKind } from '../routes.ts';
import { SITE } from '../site.config.ts';

/** The kind of the route at `path` (`src/routes.ts`); any other path is an article. */
export const pageKindOf = (path: string): PageKind => routeOf(path)?.kind ?? 'article';

/** The `og:type` of a page: an article (a guide, the methodology) is an Open Graph article. */
export const ogTypeOf = (kind: PageKind): 'website' | 'article' =>
  kind === 'article' ? 'article' : 'website';

const SCHEMA_TYPES = { home: 'WebSite', calculator: 'WebApplication', article: 'Article' } as const;

/** The schema.org type of the first JSON-LD node a page of this kind carries. */
export const schemaTypeOf = (kind: PageKind): string => SCHEMA_TYPES[kind];

/** The page name without the ` | Bowl Figures` suffix of its title. */
export const nameOf = (title: string): string => title.replace(/\s*\|\s*Bowl Figures$/, '');

/**
 * Bowl Figures as the organization that writes and publishes every article (its editorial team,
 * never a person): its home and its editorial policy as its publishing principles.
 */
const organizationOf = (origin: string, lang: Lang) => ({
  name: SITE.name,
  url: new URL(hrefOf('home', lang), origin).href,
  publishingPrinciples: new URL(hrefOf('editorial', lang), origin).href,
});

/** The language of the JSON-LD: American English, or German for every German-speaking country. */
const IN_LANGUAGE: Readonly<Record<Lang, string>> = { en: 'en-US', de: 'de' };

/**
 * The JSON-LD of the page at `path`, ready for its script element. The home is the WebSite and the
 * Organization; a calculator a free WebApplication; any other page an Article by the editorial
 * team. Every page but the home also carries its `BreadcrumbList` (home, page).
 */
export const jsonLdOf = (
  path: string,
  page: {
    readonly title: string;
    readonly description: string;
    /** The day the page's data says it was last checked (`YYYY-MM-DD`), when it carries one. */
    readonly modified?: string;
  },
  origin: string,
): string => {
  const url = new URL(path, origin).href;
  const lang = langOf(path);
  const inLanguage = IN_LANGUAGE[lang];
  const { description } = page;
  const kind = pageKindOf(path);
  const organization = organizationOf(origin, lang);
  if (kind === 'home')
    return serializeJsonLd(
      graphLd(webSiteLd({ name: SITE.name, url, inLanguage }), {
        '@type': 'Organization',
        ...organization,
      }),
    );
  const name = nameOf(page.title);
  const node =
    kind === 'calculator'
      ? {
          ...webApplicationLd({
            name,
            description,
            url,
            inLanguage,
            applicationCategory: 'LifestyleApplication',
          }),
          ...(page.modified === undefined ? {} : { dateModified: page.modified }),
        }
      : articleLd({
          headline: name,
          description,
          url,
          inLanguage,
          author: organization,
          publisher: organization,
          ...(page.modified === undefined ? {} : { dateModified: page.modified }),
        });
  return serializeJsonLd(
    graphLd(
      node,
      breadcrumbListLd([
        { name: SITE.name, url: organization.url },
        { name, url },
      ]),
    ),
  );
};
