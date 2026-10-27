import type { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { describe, expectTypeOf, it } from 'vitest';
import type { CalculatorPageId } from '../routing/templates.ts';

type SiteKey = keyof typeof enSite;
type CardKey<Id extends string> = `page.home.cards.${Id}.${'title' | 'summary'}`;

describe('home card keys (trust-pages › [TP32])', () => {
  // spec: trust-pages › [TP32] a routed calculator needs its card keys, or the types fail naming the key
  it('has a title and a summary key for every routed calculator page', () => {
    expectTypeOf<CardKey<CalculatorPageId>>().toExtend<SiteKey>();
  });

  it('has none for a calculator that is not routed', () => {
    // @ts-expect-error rectangle-area is pageless, so its card keys are not in the catalog
    expectTypeOf<CardKey<'rectangle-area'>>().toExtend<SiteKey>();
  });
});
