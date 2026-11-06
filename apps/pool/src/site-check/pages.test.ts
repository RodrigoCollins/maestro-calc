import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { pathsOf, routeOf, ROUTES } from '../routes.ts';
import { CALCULATOR_PAGES, EMBED_PAGES, ROUTED_PAGES } from './pages.ts';

describe('CALCULATOR_PAGES', () => {
  // a calculator page left out would fail the zero-JavaScript rule, so the list is the route table
  it('names the built page of every calculator route in each language, and no other', () => {
    const calculators = ROUTES.filter(({ kind }) => kind === 'calculator').flatMap(pathsOf);
    expect([...ROUTED_PAGES].sort()).toEqual(
      calculators.map((path) => `${path.slice(1)}.html`).sort(),
    );
  });

  it('holds every *-calculator source page among the calculator routes', () => {
    const sources = readdirSync(resolve(import.meta.dirname, '../pages'))
      .filter((name) => name.endsWith('-calculator.astro'))
      .map((name) => `/${name.replace(/\.astro$/, '')}`);
    expect(sources).toHaveLength(10);
    for (const path of sources) expect(routeOf(path)?.kind, path).toBe('calculator');
  });

  it('adds the embed of each, and nothing else', () => {
    expect(EMBED_PAGES).toEqual(ROUTED_PAGES.map((page) => `embed/${page}`));
    expect(CALCULATOR_PAGES).toEqual([...ROUTED_PAGES, ...EMBED_PAGES]);
  });
});
