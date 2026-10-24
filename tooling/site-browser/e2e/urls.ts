import { ROUTES } from '../../../apps/web/src/routing/routes.ts';

/** Every routable path, in both locales, derived from the route table. */
export const routable: string[] = Object.values(ROUTES).flatMap(({ en, es }) => [en, es]);

/** Paths no route builds: the nearest 404 page answers, by the language of the path prefix. */
export const unknown = {
  en: ['/does-not-exist', '/essay'],
  es: ['/es/does-not-exist', '/es/a/b/c'],
} as const;

/** The two 404 responses axe scans (one per locale). */
export const notFoundSamples: string[] = [unknown.en[0], unknown.es[0]];

/** `<html lang>` of a path: the Spanish site lives under `/es`. */
export const langOf = (path: string): 'en-US' | 'es-US' =>
  path === '/es' || path.startsWith('/es/') ? 'es-US' : 'en-US';
