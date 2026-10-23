export { defaultLocale, locales } from './locales.ts';
export type { Locale } from './locales.ts';
export {
  createTranslator,
  hasStrayBraces,
  I18N_ERROR_CODES,
  I18nError,
  placeholdersOf,
} from './translate.ts';
export type { Catalog, CatalogOf, I18nErrorCode, ParamsOf, Translator } from './translate.ts';
