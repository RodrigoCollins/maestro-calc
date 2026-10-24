import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  alternatesOf,
  LOCALE_TAGS,
  LOCALES,
  localeOfPath,
  NOT_FOUND_ID,
  notFoundPathOf,
  pathOf,
  ROUTES,
  routeProblems,
  staticPaths,
  urlOf,
} from './routes.ts';

const fixture = {
  about: { en: '/about', es: '/es/sobre-nosotros' },
  methodology: { en: '/methodology', es: '/es/metodologia' },
} as const;

describe('locale of a path (site-routing-i18n › [SR11], [SR12])', () => {
  it.each([
    ['/', 'en'],
    ['/about', 'en'],
    ['/essay', 'en'],
    ['/does-not-exist', 'en'],
    ['/es', 'es'],
    ['/es/', 'es'],
    ['/es/metodologia', 'es'],
    ['/es/a/b/c', 'es'],
  ] as const)('%s belongs to %s', (path, locale) => {
    expect(localeOfPath(path)).toBe(locale);
  });
});

describe('route table (site-routing-i18n › Route table)', () => {
  it('lists the locales once, in tag order, and names the not-found page', () => {
    expect(LOCALES).toEqual(['en', 'es']);
    expect(LOCALES).toEqual(Object.keys(LOCALE_TAGS));
    expect(NOT_FOUND_ID).toBe('notFound');
    expect(Object.hasOwn(ROUTES, NOT_FOUND_ID)).toBe(false);
  });

  it('puts each locale not-found page next to its home, outside the table', () => {
    expect(notFoundPathOf('en')).toBe('/404');
    expect(notFoundPathOf('es')).toBe('/es/404');
    expect(
      routeProblems({ [NOT_FOUND_ID]: { en: notFoundPathOf('en'), es: notFoundPathOf('es') } }),
    ).toEqual([]);
  });

  it('tags the locales with their BCP 47 region', () => {
    expect(LOCALE_TAGS).toEqual({ en: 'en-US', es: 'es-US' });
  });

  it('places the home page at / and /es', () => {
    expect(ROUTES.home).toEqual({ en: '/', es: '/es' });
  });

  // spec: site-routing-i18n › Table invariants hold
  it('accepts the real table and the fixture', () => {
    expect(routeProblems(ROUTES)).toEqual([]);
    expect(routeProblems(fixture)).toEqual([]);
  });

  it.each([
    [
      'duplicate path',
      { a: { en: '/x', es: '/es/x' }, b: { en: '/x', es: '/es/y' } },
      ['b.en: duplicate path /x'],
    ],
    ['uppercase', { a: { en: '/About', es: '/es/a' } }, ['a.en: invalid path /About']],
    ['trailing slash', { a: { en: '/x/', es: '/es/x' } }, ['a.en: invalid path /x/']],
    [
      'non-ASCII',
      { a: { en: '/a', es: '/es/metodología' } },
      ['a.es: invalid path /es/metodología'],
    ],
    ['English under /es', { a: { en: '/es/a', es: '/es/b' } }, ['a.en: English path under /es']],
    ['Spanish outside /es', { a: { en: '/a', es: '/b' } }, ['a.es: Spanish path outside /es']],
  ] as const)('rejects a %s', (_name, table, problems) => {
    expect(routeProblems(table)).toEqual(problems);
  });

  it('treats /essay as English and /es as Spanish', () => {
    expect(routeProblems({ a: { en: '/essay', es: '/es' } })).toEqual([]);
    expect(routeProblems({ a: { en: '/a', es: '/esx' } })).toEqual([
      'a.es: Spanish path outside /es',
    ]);
  });
});

describe('route helpers (site-routing-i18n › Paths, URLs and alternates)', () => {
  it('resolves the path of a page per locale', () => {
    expect(pathOf('home', 'es')).toBe('/es');
    expect(pathOf('home', 'en')).toBe('/');
    expect(pathOf('methodology', 'es', fixture)).toBe('/es/metodologia');
    expect(() => pathOf('nope', 'en', fixture)).toThrow('unknown page id: nope');
  });

  it('builds absolute URLs on the site origin', () => {
    expect(urlOf('/')).toBe('https://maestrocalc.com/');
    expect(urlOf('/es')).toBe('https://maestrocalc.com/es');
    expect(urlOf('/es/metodologia')).toBe('https://maestrocalc.com/es/metodologia');
  });

  // spec: site-routing-i18n › [SR8, SR9] unit side
  it('lists the two locales and x-default (English) as alternates', () => {
    expect(alternatesOf('home')).toEqual([
      { hreflang: 'en-US', href: 'https://maestrocalc.com/' },
      { hreflang: 'es-US', href: 'https://maestrocalc.com/es' },
      { hreflang: 'x-default', href: 'https://maestrocalc.com/' },
    ]);
    expect(alternatesOf('about', fixture)).toEqual([
      { hreflang: 'en-US', href: 'https://maestrocalc.com/about' },
      { hreflang: 'es-US', href: 'https://maestrocalc.com/es/sobre-nosotros' },
      { hreflang: 'x-default', href: 'https://maestrocalc.com/about' },
    ]);
  });

  it('maps the table to static paths, the root with an undefined segment', () => {
    expect(staticPaths()).toEqual([
      { params: { path: undefined }, props: { id: 'home', locale: 'en' } },
      { params: { path: 'es' }, props: { id: 'home', locale: 'es' } },
    ]);
    expect(staticPaths()).toHaveLength(2 * Object.keys(ROUTES).length);
    expect(staticPaths(fixture).map(({ params }) => params.path)).toEqual([
      'about',
      'es/sobre-nosotros',
      'methodology',
      'es/metodologia',
    ]);
  });

  it('imports the i18n package for types only, so Node can strip the file', () => {
    const source = readFileSync(new URL('./routes.ts', import.meta.url), 'utf8');
    const imports = source.split('\n').filter((line) => /^import\b/.test(line));
    expect(imports.length).toBeGreaterThan(0);
    for (const line of imports.filter((entry) => entry.includes('@maestro-calc/i18n'))) {
      expect(line).toMatch(/^import type /);
    }
  });
});
