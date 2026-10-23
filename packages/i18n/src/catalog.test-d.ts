import { describe, expectTypeOf, it } from 'vitest';
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
