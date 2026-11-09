import type { Locale } from '@maestro-calc/i18n';
import { createTranslator } from '@maestro-calc/i18n';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';

/** Looks a `site` catalog message up for one locale; the key is checked against the catalog. */
export type SiteText = (key: keyof typeof enSite) => string;

const translators = { en: createTranslator(enSite), es: createTranslator(esSite) };

/**
 * The `site` catalog of one locale as a lookup. There is no fallback: a key that is missing in the
 * locale throws, and the key is checked against the English module at compile time.
 */
export const siteText = (locale: Locale): SiteText => {
  const translate = translators[locale];
  return (key) => translate(key);
};
