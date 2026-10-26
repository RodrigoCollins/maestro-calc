import { readFileSync } from 'node:fs';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { describe, expect, it } from 'vitest';
import { ROUTES } from '../routing/routes.ts';
import { fromRoot } from './root.ts';
import { routeCatalogProblems } from './route-catalog.ts';

const ids = Object.keys(ROUTES);
const catalogs = { en: enSite, es: esSite };

const pageMetadataKeys = (module: Readonly<Record<string, string>>): string[] =>
  Object.keys(module).filter((key) => /^page\.[^.]+\.(title|description)$/.test(key));

describe('route table and site catalog agree (i18n-catalog › [ICW1, ICW4, ICW7])', () => {
  // spec: i18n-catalog › [ICW4]
  it('has no problem for the real table and catalogs', () => {
    expect(routeCatalogProblems(ids, catalogs)).toEqual([]);
  });

  // spec: i18n-catalog › [ICW1], derived form of the pinned count
  it('holds a title and a description per page id and per not-found page, in both locales', () => {
    expect(ids.length).toBeGreaterThan(0);
    for (const [locale, module] of Object.entries(catalogs)) {
      expect(pageMetadataKeys(module), locale).toHaveLength((ids.length + 1) * 2);
    }
  });

  // spec: i18n-catalog › [ICW7]
  it('names a description removed from one locale', () => {
    const withoutDescription = Object.fromEntries(
      Object.entries(esSite).filter(([key]) => key !== 'page.home.description'),
    );
    expect(routeCatalogProblems(ids, { en: enSite, es: withoutDescription })).toEqual([
      'es: missing page.home.description',
    ]);
    expect(routeCatalogProblems([...ids, 'pricing'], catalogs)).toEqual([
      'en: missing page.pricing.title',
      'en: missing page.pricing.description',
      'es: missing page.pricing.title',
      'es: missing page.pricing.description',
    ]);
  });

  it('names a page key for an id outside the table', () => {
    expect(
      routeCatalogProblems(ids, {
        en: { ...enSite, 'page.ghost.title': 'Ghost' },
        es: esSite,
      }),
    ).toEqual(['en: unexpected page.ghost.title']);
  });
});

describe('site modules stay independent (i18n-catalog › [ICW6] groundwork)', () => {
  it.each(['en', 'es'])('%s/site.ts imports no other catalog module', (locale) => {
    const source = readFileSync(fromRoot('packages/i18n/src/catalogs', locale, 'site.ts'), 'utf8');
    const specifiers = Array.from(source.matchAll(/from\s+'([^']+)'/g), (match) => match[1] ?? '');
    // `es` may only import the type of its `en` source; nothing else
    const allowed = locale === 'es' ? ['../../translate.ts', '../en/site.ts'] : [];
    expect(specifiers.filter((specifier) => !allowed.includes(specifier))).toEqual([]);
  });
});

describe('concrete page metadata (i18n-catalog › [ICW16], site-seo › [SE1])', () => {
  const EXPECTED = {
    en: {
      title: ['Concrete Calculator: Cubic Yards and Bags | Maestro Calc', 56],
      description: [
        'Estimate the cubic yards and bags of concrete for a slab, footing, column or steps. Free, instant, in feet, inches or meters.',
        125,
      ],
    },
    es: {
      title: ['Calculadora de concreto en yardas y bolsas | Maestro Calc', 57],
      description: [
        'Calcula las yardas cúbicas y las bolsas de concreto para una losa, zapata, columna o escalones. Gratis, al instante, en pies, pulgadas o metros.',
        144,
      ],
    },
  } as const;

  // spec: i18n-catalog › [ICW16] exact strings and lengths
  it.each(['en', 'es'] as const)('writes the %s title and description exactly', (locale) => {
    const catalog = catalogs[locale];
    for (const field of ['title', 'description'] as const) {
      const [text, length] = EXPECTED[locale][field];
      expect(catalog[`page.concrete.${field}`]).toBe(text);
      expect(text).toHaveLength(length);
    }
  });

  // spec: i18n-catalog › [ICW16], site-seo › [SE1] all four values are unique among the pages of the locale
  it.each(['en', 'es'] as const)(
    'keeps every page title and description unique in %s',
    (locale) => {
      const values = Object.entries(catalogs[locale])
        .filter(([key]) => /^page\.[^.]+\.(title|description)$/.test(key))
        .map(([, value]) => value);
      expect(new Set(values).size).toBe(values.length);
    },
  );
});
