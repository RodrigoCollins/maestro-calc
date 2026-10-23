import { describe, expect, it } from 'vitest';
import { alternatesOf, pathOf, ROUTES, urlOf } from '../routing/routes.ts';
import { headFor, notFoundHead } from './head.ts';

// Echoes the key so the test sees which catalog entry each field came from.
const text = (key: string): string => `«${key}»`;

describe('head data (site-seo › Titles, descriptions and canonicals)', () => {
  // spec: site-seo › [SE2] source, [SR8, SR9]
  it('builds the English home head from the catalog keys, canonical and alternates', () => {
    expect(headFor('home', 'en', text)).toEqual({
      title: '«page.home.title»',
      description: '«page.home.description»',
      canonical: 'https://maestrocalc.com/',
      alternates: [
        { hreflang: 'en-US', href: 'https://maestrocalc.com/' },
        { hreflang: 'es-US', href: 'https://maestrocalc.com/es' },
        { hreflang: 'x-default', href: 'https://maestrocalc.com/' },
      ],
    });
  });

  it('points the Spanish canonical at its own URL and keeps the same alternates', () => {
    const head = headFor('home', 'es', text);
    expect(head.canonical).toBe('https://maestrocalc.com/es');
    expect(head.alternates).toEqual(alternatesOf('home'));
  });

  it('canonicalises every table page to its own clean URL', () => {
    const ids = Object.keys(ROUTES) as (keyof typeof ROUTES)[];
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) {
      for (const locale of ['en', 'es'] as const) {
        const { canonical } = headFor(id, locale, text);
        expect(canonical).toBe(urlOf(pathOf(id, locale)));
        expect(canonical).not.toMatch(/[?#]/);
      }
    }
  });

  // spec: site-routing-i18n › [SR14]
  it('marks the not-found head noindex, without canonical or alternates', () => {
    expect(notFoundHead('es', text)).toStrictEqual({
      title: '«page.notFound.title»',
      description: '«page.notFound.description»',
      robots: 'noindex',
    });
    expect(notFoundHead('en', (key) => key.toUpperCase())).toStrictEqual({
      title: 'PAGE.NOTFOUND.TITLE',
      description: 'PAGE.NOTFOUND.DESCRIPTION',
      robots: 'noindex',
    });
  });
});
