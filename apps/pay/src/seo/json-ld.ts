import {
  articleLd,
  serializeJsonLd,
  webApplicationLd,
  webSiteLd,
  withBreadcrumb,
} from '@maestro-calc/site-kit/json-ld';
import { dataCards } from '../data/pages.ts';
import type { Route } from '../routes.ts';
import { SITE } from '../site.config.ts';
import { statesIndexOf } from '../states/pages.ts';

/** The page name without the ` | Cuenta Horas` suffix of its title. */
const nameOf = (title: string): string => title.replace(/\s*\|\s*Cuenta Horas$/, '');

/** The name of a page in a breadcrumb: its name short of a `: subtitle`. */
const crumbOf = (title: string): string => nameOf(title).replace(/: .*$/, '');

/** The pages a collection lists, by route id: the data index its tables, the state index its states. */
const LISTS: Readonly<
  Record<string, (lang: 'en' | 'es') => readonly { name: string; href: string }[]>
> = {
  data: (lang) => dataCards(lang).map(({ title, href }) => ({ name: title, href })),
  states: (lang) => statesIndexOf(lang).items.map(({ name, href }) => ({ name, href })),
};

/**
 * A collection (the data index, the state index): a CollectionPage published by the site, whose
 * ItemList is every page it lists (`LISTS`), each at its canonical.
 */
const collectionLd = (
  id: string,
  name: string,
  description: string,
  url: string,
  inLanguage: string,
  lang: 'en' | 'es',
  origin: string,
) => {
  const list = LISTS[id];
  if (list === undefined) throw new Error(`no list for the collection ${id}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    inLanguage,
    publisher: { '@type': 'Organization', name: SITE.name },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: list(lang).map(({ name: item, href }, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item,
        url: new URL(href, origin).href,
      })),
    },
  };
};

/** The page a long-tail page answers for: the calculator's title and its path. */
export interface Parent {
  readonly title: string;
  readonly path: string;
}

/**
 * The schema.org description of a page (`@maestro-calc/site-kit/json-ld`): the home is the
 * WebSite, a calculator a free WebApplication, any other page an Article. Every page but a home
 * carries the BreadcrumbList of its trail: the home of its language, the calculator a long-tail
 * page answers for (`parent`), then the page.
 */
export const jsonLdOf = (
  route: Route,
  lang: 'en' | 'es',
  page: { readonly title: string; readonly description: string },
  origin: string,
  parent?: Parent,
): string => {
  const url = new URL(lang === 'en' ? route.en : route.es, origin).href;
  const inLanguage = lang === 'en' ? 'en-US' : 'es-US';
  const { description } = page;
  if (route.kind === 'home')
    return serializeJsonLd(webSiteLd({ name: SITE.name, url, inLanguage }));
  const node =
    route.kind === 'calculator'
      ? webApplicationLd({
          name: nameOf(page.title),
          description,
          url,
          inLanguage,
          applicationCategory: 'FinanceApplication',
        })
      : route.kind === 'collection'
        ? collectionLd(route.id, nameOf(page.title), description, url, inLanguage, lang, origin)
        : articleLd({
            headline: nameOf(page.title),
            description,
            url,
            inLanguage,
            publisher: SITE.name,
          });
  const home = { name: SITE.name, url: new URL(lang === 'en' ? '/' : '/es', origin).href };
  const above =
    parent === undefined
      ? []
      : [{ name: crumbOf(parent.title), url: new URL(parent.path, origin).href }];
  return serializeJsonLd(
    withBreadcrumb(node, [home, ...above, { name: crumbOf(page.title), url }]),
  );
};
