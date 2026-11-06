import type { Locale } from '@maestro-calc/i18n';
import type { FaqItem } from '../content/faq-shape.ts';
import { siteText } from '../lib/site-text.ts';
import { LOCALE_TAGS, pathOf, ROUTES, urlOf } from '../routing/routes.ts';
import type { RouteTable } from '../routing/routes.ts';
import { SITE } from '../site.config.ts';

const ORGANIZATION_ID = `${SITE.url}/#organization`;

/** The `@graph` of a home page: the organization and the website in that locale. */
export const homeJsonLd = (locale: Locale) => ({
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': ORGANIZATION_ID, name: SITE.name, url: SITE.url },
    {
      '@type': 'WebSite',
      name: SITE.name,
      url: urlOf(pathOf('home', locale)),
      inLanguage: LOCALE_TAGS[locale],
      publisher: { '@id': ORGANIZATION_ID },
    },
  ],
});

/** A page between the home and the page itself on a breadcrumb: its page id and its h1. */
export interface Crumb {
  readonly id: string;
  readonly name: string;
}

/** The breadcrumb of a page: the home, each page of `trail` in order, then the page itself. */
const breadcrumbOf = (
  name: string,
  canonical: string,
  locale: Locale,
  routes: RouteTable,
  trail: readonly Crumb[] = [],
) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      name: siteText(locale)('site.calculator.breadcrumbHome'),
      item: urlOf(pathOf('home', locale, routes)),
    },
    ...trail.map((crumb) => ({ name: crumb.name, item: urlOf(pathOf(crumb.id, locale, routes)) })),
    { name, item: canonical },
  ].map((item, index) => ({ '@type': 'ListItem', position: index + 1, ...item })),
});

/** What the structured data of a calculator page needs: its page id and the text of its h1. */
export interface CalculatorPage {
  readonly id: string;
  readonly name: string;
}

/**
 * The `@graph` of a calculator page: the free web application, its two-item breadcrumb and one
 * `Question` per visible FAQ item. Never an offer, a rating, a review or an image.
 */
export const calculatorJsonLd = (
  { id, name }: CalculatorPage,
  locale: Locale,
  faq: readonly FaqItem[],
  routes: RouteTable = ROUTES,
) => {
  const canonical = urlOf(pathOf(id, locale, routes));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name,
        url: canonical,
        inLanguage: LOCALE_TAGS[locale],
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        isAccessibleForFree: true,
      },
      breadcrumbOf(name, canonical, locale, routes),
      {
        '@type': 'FAQPage',
        mainEntity: faq.map(({ question, answer }) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
    ],
  };
};

/** What the structured data of a guide needs: its page id, the text of its h1 and its `updated` day. */
export interface GuidePage {
  readonly id: string;
  readonly name: string;
  readonly updated: string;
}

/**
 * The `@graph` of a guide (guides): an `Article` written and published by the organization, and
 * its two-item breadcrumb. Never an image, a rating or a person.
 */
export const guideJsonLd = (
  { id, name, updated }: GuidePage,
  locale: Locale,
  routes: RouteTable = ROUTES,
) => {
  const canonical = urlOf(pathOf(id, locale, routes));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: name,
        url: canonical,
        inLanguage: LOCALE_TAGS[locale],
        dateModified: updated,
        author: { '@id': ORGANIZATION_ID },
        publisher: {
          '@type': 'Organization',
          '@id': ORGANIZATION_ID,
          name: SITE.name,
          url: SITE.url,
        },
      },
      breadcrumbOf(name, canonical, locale, routes),
    ],
  };
};

/** What the structured data of an index page needs: its id, its h1, its description and its items. */
export interface CollectionPage {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** The pages it lists, in order, each by its page id and the name the index shows. */
  readonly items: readonly Crumb[];
}

/**
 * The structured data of an index page (the data and charts index): a `CollectionPage` published
 * by the organization, whose `ItemList` is every page it links, each at its canonical. No
 * breadcrumb: a page that is neither a calculator, a guide nor a job declares none.
 */
export const collectionJsonLd = (
  { id, name, description, items }: CollectionPage,
  locale: Locale,
  routes: RouteTable = ROUTES,
) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name,
  description,
  url: urlOf(pathOf(id, locale, routes)),
  inLanguage: LOCALE_TAGS[locale],
  publisher: { '@type': 'Organization', '@id': ORGANIZATION_ID, name: SITE.name, url: SITE.url },
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: urlOf(pathOf(item.id, locale, routes)),
    })),
  },
});

/** What the `Dataset` of a reference chart needs beyond the page: see `isChartJob`. */
export interface JobDataset {
  /** The description of the page: its `page.<id>.description`. */
  readonly description: string;
  /** The day the figures were last checked. */
  readonly updated: string;
  /** The published source the figures rest on (a data sheet), or each of them when several. */
  readonly basedOn: string | readonly [string, string, ...string[]];
}

/** What the structured data of a job page needs: its page id, its h1 and the pages above it. */
export interface JobPage {
  readonly id: string;
  readonly name: string;
  /** The pages between the home and the job: its calculator's hub, then its calculator. */
  readonly trail: readonly Crumb[];
  /** A reference chart only: what its `Dataset` says. */
  readonly dataset?: JobDataset;
}

/**
 * The `@graph` of a job page (growth plan, lever 1): its breadcrumb, home → hub → calculator →
 * job; its table of figures is no FAQ, how-to or product. A reference chart adds a `Dataset`
 * created by the organization, named by its h1 at its canonical. Never a license, a rating or an
 * image.
 */
export const jobJsonLd = (
  { id, name, trail, dataset }: JobPage,
  locale: Locale,
  routes: RouteTable = ROUTES,
) => {
  const canonical = urlOf(pathOf(id, locale, routes));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbOf(name, canonical, locale, routes, trail),
      ...(dataset === undefined
        ? []
        : [
            {
              '@type': 'Dataset',
              name,
              description: dataset.description,
              url: canonical,
              inLanguage: LOCALE_TAGS[locale],
              dateModified: dataset.updated,
              isAccessibleForFree: true,
              isBasedOn: dataset.basedOn,
              creator: {
                '@type': 'Organization',
                '@id': ORGANIZATION_ID,
                name: SITE.name,
                url: SITE.url,
              },
            },
          ]),
    ],
  };
};

/** JSON for a `<script type="application/ld+json">`: `</script>` and entities cannot be injected. */
export const serializeJsonLd = (value: unknown): string =>
  JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026');
