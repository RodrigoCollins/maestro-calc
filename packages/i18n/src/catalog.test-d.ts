import { describe, expectTypeOf, it } from 'vitest';
import type { enSite } from './catalogs/en/site.ts';
import { esSite } from './catalogs/es/site.ts';
import type { CatalogOf } from './translate.ts';

// the shape of an `en` module: `typeof en` of a module declared `as const`
const en = { 'a.one': 'One', 'a.two': 'Two {n}' } as const;

describe('CatalogOf (i18n-catalog › Locales and catalog modules)', () => {
  // spec: Missing Spanish key is a compile error [IN2, IN9a]
  it('accepts an es module with exactly the keys of en', () => {
    const es = { 'a.one': 'Uno', 'a.two': 'Dos {n}' } as const satisfies CatalogOf<typeof en>;
    expectTypeOf(es).toHaveProperty('a.one');
    expectTypeOf(en).toHaveProperty('a.two');
    expectTypeOf<keyof CatalogOf<typeof en>>().toEqualTypeOf<'a.one' | 'a.two'>();
  });

  it('rejects an es module that lacks a key of en', () => {
    // @ts-expect-error `a.two` is missing in es
    const es = { 'a.one': 'Uno' } as const satisfies CatalogOf<typeof en>;
    expectTypeOf(es).toHaveProperty('a.one');
  });

  it('rejects an es module that adds a key absent from en', () => {
    const es = {
      'a.one': 'Uno',
      'a.two': 'Dos {n}',
      // @ts-expect-error `a.three` is not in en
      'a.three': 'Tres',
    } as const satisfies CatalogOf<typeof en>;
    expectTypeOf(es).toHaveProperty('a.one');
  });
});

describe('site catalog (i18n-catalog › Site scope)', () => {
  // spec: Missing Spanish key is a compile error [ICW3]
  it('rejects an es site module that lacks a key of en', () => {
    // @ts-expect-error `site.skipLink` is missing in es
    const missing = {} as Omit<typeof esSite, 'site.skipLink'> satisfies CatalogOf<typeof enSite>;
    expectTypeOf(missing).toHaveProperty('site.tagline');
  });

  it('rejects an es site module that adds a key absent from en', () => {
    const extra = {
      ...esSite,
      // @ts-expect-error `site.unknown` is not in en
      'site.unknown': 'Desconocido',
    } as const satisfies CatalogOf<typeof enSite>;
    expectTypeOf(extra).toHaveProperty('site.tagline');
  });

  it('types the shell keys the components read', () => {
    expectTypeOf<keyof typeof enSite>().toExtend<`site.${string}` | `page.${string}`>();
    expectTypeOf<'site.skipLink' | 'page.home.title'>().toExtend<keyof typeof enSite>();
  });
});
