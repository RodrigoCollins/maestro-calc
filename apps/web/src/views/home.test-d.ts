import type { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { describe, expectTypeOf, it } from 'vitest';
import { homeCards } from '../lib/home-directory.ts';
import type { HomeCard } from '../lib/home-directory.ts';
import type { CalculatorPageId } from '../routing/templates.ts';

type SiteKey = keyof typeof enSite;
type Part = 'title' | 'summary';
type CardKey<Id extends string, P extends Part = Part> = `page.home.cards.${Id}.${P}`;

describe('home card keys (trust-pages › [TP32])', () => {
  // spec: trust-pages › [TP32] a routed calculator needs its card keys, or the types fail naming the key
  it('has a title and a summary key for every routed calculator page', () => {
    expectTypeOf<CardKey<CalculatorPageId>>().toExtend<SiteKey>();
  });

  // one case per key, so a stray title or summary key alone for a pageless id is caught
  it('has no title key for a calculator that is not routed', () => {
    // @ts-expect-error rectangle-area is pageless, so its card title is not in the catalog
    expectTypeOf<CardKey<'rectangle-area', 'title'>>().toExtend<SiteKey>();
  });

  it('has no summary key for a calculator that is not routed', () => {
    // @ts-expect-error rectangle-area is pageless, so its card summary is not in the catalog
    expectTypeOf<CardKey<'rectangle-area', 'summary'>>().toExtend<SiteKey>();
  });
});

describe('home card ids (design: HomeCard.id)', () => {
  it('types the real cards by calculator page id', () => {
    expectTypeOf(homeCards('en')).toEqualTypeOf<readonly HomeCard[]>();
    expectTypeOf<HomeCard['id']>().toEqualTypeOf<CalculatorPageId>();
  });

  it('types the cards of a fixture by the fixture ids, with no cast', () => {
    const routes = { a: { en: '/a', es: '/es/a' } };
    const text = () => ({ title: '', summary: '', example: '' });
    expectTypeOf(homeCards('en', routes, ['a'] as const, text)).toEqualTypeOf<
      readonly HomeCard<'a'>[]
    >();
  });
});
