import type { Locale } from '@maestro-calc/i18n';
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

/** The home label of the breadcrumb, by locale (site-seo › Calculator structured data). */
const HOME_NAME = { en: 'Home', es: 'Inicio' } as const;

/** What the structured data of a calculator page needs: its page id and the text of its h1. */
export interface CalculatorPage {
  readonly id: string;
  readonly name: string;
}

/** One visible FAQ item: the question and the plain-text answer. */
export interface FaqEntry {
  readonly question: string;
  readonly answer: string;
}

/**
 * The `@graph` of a calculator page: the free web application, its two-item breadcrumb and one
 * `Question` per visible FAQ item. Never an offer, a rating, a review or an image.
 */
export const calculatorJsonLd = (
  { id, name }: CalculatorPage,
  locale: Locale,
  faq: readonly FaqEntry[],
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
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: HOME_NAME[locale],
            item: urlOf(pathOf('home', locale)),
          },
          { '@type': 'ListItem', position: 2, name, item: canonical },
        ],
      },
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

/** JSON for a `<script type="application/ld+json">`: `</script>` and entities cannot be injected. */
export const serializeJsonLd = (value: unknown): string =>
  JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026');
