import type { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { describe, expectTypeOf, it } from 'vitest';
import type { PageId, ShellPageId } from './routes.ts';

describe('route ids against the site catalog (site-seo › Titles and descriptions)', () => {
  it('has a title and a description key in the English site module for every page id', () => {
    expectTypeOf<`page.${PageId}.title`>().toExtend<keyof typeof enSite>();
    expectTypeOf<`page.${PageId}.description`>().toExtend<keyof typeof enSite>();
    expectTypeOf<'page.notFound.title' | 'page.notFound.description'>().toExtend<
      keyof typeof enSite
    >();
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
