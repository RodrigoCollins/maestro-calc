import {
  articleLd,
  graphLd,
  serializeJsonLd,
  webApplicationLd,
  webSiteLd,
  withBreadcrumb,
} from '@maestro-calc/site-kit/json-ld';
import type { Lang, Route } from '../routes.ts';
import { SITE } from '../site.config.ts';

/** The page name without the ` | Cuánto Le Cobro` suffix of its title. */
export const nameOf = (title: string): string => title.replace(/\s*\|\s*Cuánto Le Cobro$/, '');

/** The name of a page in a breadcrumb: its name short of a `: subtitle`. */
const crumbOf = (title: string): string => nameOf(title).replace(/: .*$/, '');

/** A page a trail or a list names: what it is called and its path. */
export interface Linked {
  readonly name: string;
  readonly path: string;
}

export interface Extras {
  /** The page this one belongs to, between the home and the page in its breadcrumb. */
  readonly parent?: Linked;
  /** The pages a collection lists. */
  readonly items?: readonly Linked[];
  /** The day the page's figures were last checked (`YYYY-MM-DD`). */
  readonly modified?: string;
}

/**
 * Cuánto Le Cobro as the organization that writes and publishes every article (its editorial
 * team, never a person): its home and the English editorial policy as its publishing principles.
 */
const organizationOf = (origin: string, editorial: string) => ({
  name: SITE.name,
  url: new URL('/', origin).href,
  publishingPrinciples: new URL(editorial, origin).href,
});

/** A collection: a CollectionPage whose ItemList is every page it lists, each at its canonical. */
const collectionLd = (
  name: string,
  description: string,
  url: string,
  inLanguage: string,
  origin: string,
  items: readonly Linked[],
  modified?: string,
) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name,
  description,
  url,
  inLanguage,
  publisher: { '@type': 'Organization', name: SITE.name },
  ...(modified === undefined ? {} : { dateModified: modified }),
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: items.map(({ name: item, path }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item,
      url: new URL(path, origin).href,
    })),
  },
});

/**
 * The schema.org description of a page (`@maestro-calc/site-kit/json-ld`): the home is the WebSite
 * (and the Organization that publishes it), a calculator a free WebApplication, a list a
 * CollectionPage, any other page an Article. Every page but the home carries the BreadcrumbList of
 * its trail. FAQPage markup is never published (`@maestro-calc/site-kit/seo-check` refuses it).
 */
export const jsonLdOf = (
  route: Route,
  lang: Lang,
  page: { readonly title: string; readonly description: string },
  origin: string,
  editorialPath: string,
  extras: Extras = {},
): string => {
  const url = new URL(route[lang], origin).href;
  const inLanguage = lang === 'en' ? 'en-US' : 'es-US';
  const { description } = page;
  const organization = organizationOf(origin, editorialPath);
  if (route.kind === 'home') {
    return serializeJsonLd(
      graphLd(webSiteLd({ name: SITE.name, url, inLanguage }), {
        '@type': 'Organization',
        ...organization,
      }),
    );
  }
  const node =
    route.kind === 'calculator'
      ? webApplicationLd({
          name: nameOf(page.title),
          description,
          url,
          inLanguage,
          applicationCategory: 'BusinessApplication',
        })
      : route.kind === 'collection'
        ? collectionLd(
            nameOf(page.title),
            description,
            url,
            inLanguage,
            origin,
            extras.items ?? [],
            extras.modified,
          )
        : articleLd({
            headline: nameOf(page.title),
            description,
            url,
            inLanguage,
            author: organization,
            publisher: organization,
            ...(extras.modified === undefined ? {} : { dateModified: extras.modified }),
          });
  const home = { name: SITE.name, url: new URL(lang === 'es' ? '/' : '/en', origin).href };
  const above =
    extras.parent === undefined
      ? []
      : [{ name: extras.parent.name, url: new URL(extras.parent.path, origin).href }];
  return serializeJsonLd(
    withBreadcrumb(node, [home, ...above, { name: crumbOf(page.title), url }]),
  );
};
