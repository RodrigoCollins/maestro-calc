import type { Locale } from '@maestro-calc/i18n';
import { LOCALE_TAGS, pathOf, urlOf } from '../routing/routes.ts';
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

/** JSON for a `<script type="application/ld+json">`: `</script>` and entities cannot be injected. */
export const serializeJsonLd = (value: unknown): string =>
  JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026');
