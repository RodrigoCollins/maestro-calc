import type { Locale } from '@maestro-calc/i18n';
import { createTranslator } from '@maestro-calc/i18n';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';

/**
 * Looks a `site` catalog message up for one locale; the key is checked against the catalog, and
 * each `{name}` of the message is filled from `params` (a missing one throws).
 */
export type SiteText = (
  key: keyof typeof enSite,
  params?: Readonly<Record<string, string | number>>,
) => string;

const translators = { en: createTranslator(enSite), es: createTranslator(esSite) };

/**
 * The `site` catalog of one locale as a lookup. There is no fallback: a key that is missing in the
 * locale throws, and the key is checked against the English module at compile time.
 */
export const siteText = (locale: Locale): SiteText => {
  const translate = translators[locale];
  return (key, params) => translate(key, params);
};
