import { LOCALE_TAGS, LOCALES, ROUTES } from '../../../apps/web/src/routing/routes.ts';

/** Every routable path, in both locales, derived from the route table. */
export const routable: string[] = Object.values(ROUTES).flatMap(({ en, es }) => [en, es]);

/** Paths no route builds: the nearest 404 page answers, by the language of the path prefix. */
export const unknown = {
  en: ['/does-not-exist', '/essay'],
  es: ['/es/does-not-exist', '/es/a/b/c'],
} as const;

/** The two 404 responses axe scans (one per locale). */
export const notFoundSamples: string[] = [unknown.en[0], unknown.es[0]];

/** `<html lang>` of a path: a locale owns the paths under its `/<locale>` prefix, English the rest. */
export const langOf = (path: string): (typeof LOCALE_TAGS)[keyof typeof LOCALE_TAGS] =>
  LOCALE_TAGS[
    LOCALES.find((locale) => path === `/${locale}` || path.startsWith(`/${locale}/`)) ?? 'en'
  ];
