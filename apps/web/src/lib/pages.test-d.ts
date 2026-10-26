import { describe, expectTypeOf, it } from 'vitest';
import type { CalculatorPageId } from '../routing/templates.ts';
import { PAGES, type PageEntry } from './pages.ts';

describe('the per-id page table (calculator-web-core › [CWC26])', () => {
  // a page id without a row, or a row without a page id, is a type error
  it('has one row for each calculator page id and no other', () => {
    expectTypeOf<keyof typeof PAGES>().toEqualTypeOf<CalculatorPageId>();
    expectTypeOf(PAGES).toExtend<Record<CalculatorPageId, PageEntry>>();
  });

  it('refuses a table with a missing row, naming the id', () => {
    // @ts-expect-error property 'concrete' is missing in type '{}'
    const missing: Record<CalculatorPageId, PageEntry> = {};
    expectTypeOf(missing).toExtend<Record<CalculatorPageId, PageEntry>>();
  });
});
