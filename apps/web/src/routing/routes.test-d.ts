import type { Locale } from '@maestro-calc/i18n';
import type { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { describe, expectTypeOf, it } from 'vitest';
import type { LOCALES, PageId, ShellPageId } from './routes.ts';

describe('route ids against the site catalog (site-seo › Titles and descriptions)', () => {
  it('has a title and a description key in the English site module for every page id', () => {
    expectTypeOf<`page.${PageId}.title`>().toExtend<keyof typeof enSite>();
    expectTypeOf<`page.${PageId}.description`>().toExtend<keyof typeof enSite>();
    expectTypeOf<'page.notFound.title' | 'page.notFound.description'>().toExtend<
      keyof typeof enSite
    >();
  });

  it('lists the trust pages as ids, so their catalog keys are required', () => {
    expectTypeOf<'methodology' | 'about' | 'privacy' | 'terms' | 'contact'>().toExtend<PageId>();
    expectTypeOf<
      | 'page.methodology.title'
      | 'page.methodology.description'
      | 'page.about.title'
      | 'page.about.description'
      | 'page.privacy.title'
      | 'page.terms.description'
      | 'page.contact.title'
    >().toExtend<keyof typeof enSite>();
  });

  it('keeps the page id a literal union rather than string', () => {
    expectTypeOf<string>().not.toExtend<PageId>();
    expectTypeOf<'home'>().toExtend<PageId>();
  });

  it('adds exactly the not-found page to the routable ids for the shell', () => {
    expectTypeOf<ShellPageId>().toEqualTypeOf<PageId | 'notFound'>();
    expectTypeOf<string>().not.toExtend<ShellPageId>();
  });
});

describe('the locale list (G1 review carry-over: no cast)', () => {
  it('is a readonly tuple of exactly the locales, so a new locale is a type error until it is listed', () => {
    expectTypeOf<typeof LOCALES>().toEqualTypeOf<readonly ['en', 'es']>();
    expectTypeOf<(typeof LOCALES)[number]>().toEqualTypeOf<Locale>();
  });
});
