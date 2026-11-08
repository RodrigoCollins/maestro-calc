import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { OCCUPATIONS } from '../wages/occupations.ts';
import { CALCULATOR_PAGES, EMBED_PAGES, ROUTED_PAGES } from './pages.ts';

describe('calculator pages', () => {
  it('lists each trade page in both languages, and each embed', () => {
    expect(ROUTED_PAGES).toHaveLength(OCCUPATIONS.length * 2);
    expect(EMBED_PAGES).toHaveLength(OCCUPATIONS.length * 2);
    expect(CALCULATOR_PAGES).toContain('cuanto-cobrar-por-pintar-una-casa.html');
    expect(CALCULATOR_PAGES).toContain('en/how-much-to-charge-for-concrete.html');
    expect(CALCULATOR_PAGES).toContain('embed/en/how-much-to-charge-for-concrete.html');
  });

  // a calculator page loads exactly one script: every trade has an island and a client entry
  it('has a client entry and an island for every trade', () => {
    const src = resolve(import.meta.dirname, '..');
    const entries = readdirSync(resolve(src, 'client')).filter((file) => file !== 'run-quote.ts');
    const islands = readdirSync(resolve(src, 'islands'));
    expect(entries.sort()).toEqual(OCCUPATIONS.map(({ id }) => `${id}.ts`).sort());
    expect(islands).toHaveLength(OCCUPATIONS.length);
  });
});
