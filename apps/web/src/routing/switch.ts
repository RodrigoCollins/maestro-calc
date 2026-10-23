import type { Locale } from '@maestro-calc/i18n';
import { LOCALE_TAGS, NOT_FOUND_ID, pathOf, ROUTES } from './routes.ts';
import type { RouteTable, ShellPageId } from './routes.ts';

export interface LanguageSwitch {
  readonly href: string;
  readonly lang: Locale;
  readonly hreflang: (typeof LOCALE_TAGS)[Locale];
}

/**
 * The link to the same page in the other locale. The not-found page has no counterpart of its
 * own, so it points at the home page of the other locale. No query string or fragment is carried.
 */
export function switchFor(id: ShellPageId, locale: Locale): LanguageSwitch;
export function switchFor(id: string, locale: Locale, table: RouteTable): LanguageSwitch;
export function switchFor(id: string, locale: Locale, table: RouteTable = ROUTES): LanguageSwitch {
  const lang: Locale = locale === 'en' ? 'es' : 'en';
  return {
    href: pathOf(id === NOT_FOUND_ID ? 'home' : id, lang, table),
    lang,
    hreflang: LOCALE_TAGS[lang],
  };
}
