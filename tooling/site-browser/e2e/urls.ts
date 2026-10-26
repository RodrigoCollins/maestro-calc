import { LOCALE_TAGS, localeOfPath, ROUTES } from '../../../apps/web/src/routing/routes.ts';
import { CALCULATOR_PAGES, templateOf } from '../../../apps/web/src/routing/templates.ts';

/** Every routable path, in both locales, derived from the route table. */
export const routable: string[] = Object.values(ROUTES).flatMap(({ en, es }) => [en, es]);

/** The paths of the pages that use the calculator template: one module script, a form. */
export const calculatorPaths: string[] = CALCULATOR_PAGES.flatMap((id) => [
  ROUTES[id].en,
  ROUTES[id].es,
]);

/** The paths of the home and trust pages: they carry no script at all. */
export const staticPaths: string[] = Object.entries(ROUTES).flatMap(([id, { en, es }]) =>
  templateOf(id) === 'calculator' ? [] : [en, es],
);

/** Paths no route builds: the nearest 404 page answers, by the language of the path prefix. */
export const unknown = {
  en: ['/does-not-exist', '/essay'],
  es: ['/es/does-not-exist', '/es/a/b/c'],
} as const;

/** The two 404 responses axe scans (one per locale). */
export const notFoundSamples: string[] = [unknown.en[0], unknown.es[0]];

/** `<html lang>` of a path, from the locale the route module assigns to it. */
export const langOf = (path: string): (typeof LOCALE_TAGS)[keyof typeof LOCALE_TAGS] =>
  LOCALE_TAGS[localeOfPath(path)];
