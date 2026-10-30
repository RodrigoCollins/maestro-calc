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

  // spec: site-routing-i18n › Route table (methodology and about enter with their pages)
  it('lists the trust pages with translated Spanish slugs', () => {
    expect(ROUTES.methodology).toEqual({ en: '/methodology', es: '/es/metodologia' });
    expect(ROUTES.about).toEqual({ en: '/about', es: '/es/sobre-nosotros' });
    expect(ROUTES.privacy).toEqual({ en: '/privacy', es: '/es/privacidad' });
    expect(ROUTES.terms).toEqual({ en: '/terms', es: '/es/terminos' });
    expect(ROUTES.contact).toEqual({ en: '/contact', es: '/es/contacto' });
    expect(ROUTES.concrete).toEqual({
      en: '/concrete-calculator',
      es: '/es/calculadora-de-concreto',
    });
  });

  // spec: site-routing-i18n › [SR24] the square footage row comes right after concrete (its title and
  // description keys are required by routes.test-d.ts, its URL keys by the released contract)
  it('lists square footage after concrete', () => {
    expect(ROUTES['rectangle-area']).toEqual({
      en: '/square-footage-calculator',
      es: '/es/calculadora-de-pies-cuadrados',
    });
    const ids = Object.keys(ROUTES);
    expect(ids.indexOf('rectangle-area')).toBe(ids.indexOf('concrete') + 1);
  });

  // spec: site-routing-i18n › the gravel row, published 2026-10-29: its two URLs are a public contract
  it('lists gravel after square footage, at its published URLs', () => {
    expect(ROUTES.gravel).toEqual({ en: '/gravel-calculator', es: '/es/calculadora-de-grava' });
    const ids = Object.keys(ROUTES);
    expect(ids.indexOf('gravel')).toBe(ids.indexOf('rectangle-area') + 1);
  });

  // spec: site-routing-i18n › the mulch row, published 2026-10-29: its two URLs are a public contract
  it('lists mulch after gravel, at its published URLs', () => {
    expect(ROUTES.mulch).toEqual({ en: '/mulch-calculator', es: '/es/calculadora-de-mulch' });
    const ids = Object.keys(ROUTES);
    expect(ids.indexOf('mulch')).toBe(ids.indexOf('gravel') + 1);
  });

  // spec: site-routing-i18n › the topsoil row, published 2026-10-29: its two URLs are a public contract
  it('lists topsoil after mulch, at its published URLs', () => {
    expect(ROUTES.topsoil).toEqual({
      en: '/topsoil-calculator',
      es: '/es/calculadora-de-tierra-para-jardin',
    });
    const ids = Object.keys(ROUTES);
    expect(ids.indexOf('topsoil')).toBe(ids.indexOf('mulch') + 1);
  });

  // spec: site-routing-i18n › the paint row, published 2026-10-30: its two URLs are a public contract
  it('lists paint after topsoil, at its published URLs', () => {
    expect(ROUTES.paint).toEqual({ en: '/paint-calculator', es: '/es/calculadora-de-pintura' });
    const ids = Object.keys(ROUTES);
    expect(ids.indexOf('paint')).toBe(ids.indexOf('topsoil') + 1);
  });

  // spec: site-routing-i18n › the drywall row, published 2026-10-30: its two URLs are a public contract
  it('lists drywall after paint, at its published URLs', () => {
    expect(ROUTES.drywall).toEqual({ en: '/drywall-calculator', es: '/es/calculadora-de-drywall' });
    const ids = Object.keys(ROUTES);
    expect(ids.indexOf('drywall')).toBe(ids.indexOf('paint') + 1);
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

  it('maps a table to static paths, the root with an undefined segment', () => {
    expect(staticPaths({ home: { en: '/', es: '/es' }, ...fixture })).toEqual([
      { params: { path: undefined }, props: { id: 'home', locale: 'en' } },
      { params: { path: 'es' }, props: { id: 'home', locale: 'es' } },
      { params: { path: 'about' }, props: { id: 'about', locale: 'en' } },
      { params: { path: 'es/sobre-nosotros' }, props: { id: 'about', locale: 'es' } },
      { params: { path: 'methodology' }, props: { id: 'methodology', locale: 'en' } },
      { params: { path: 'es/metodologia' }, props: { id: 'methodology', locale: 'es' } },
    ]);
  });

  // spec: site-routing-i18n › [SR23] derived: one static path per id and locale of the real table, in
  // table order, each the path of its row without the leading slash (the URLs are pinned above)
  it('maps every row of the route table to its two static paths', () => {
    expect(staticPaths()).toEqual(
      Object.entries(ROUTES).flatMap(([id, paths]) =>
        LOCALES.map((locale) => ({
          params: { path: id === 'home' && locale === 'en' ? undefined : paths[locale].slice(1) },
          props: { id, locale },
        })),
      ),
    );
    expect(staticPaths()).toHaveLength(2 * Object.keys(ROUTES).length);
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
