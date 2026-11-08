import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DATA_PAGES } from '../data/pages.ts';
import { ROUTES } from '../routes.ts';
import { STATE_FACTS, statePageOf } from '../states/pages.ts';
import { BYLINE_GUIDES, BYLINE_PAGES, uniqueSources } from './bylines.ts';

const LANGS = ['en', 'es'] as const;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const component = (name: string): string =>
  readFileSync(resolve(import.meta.dirname, '../components', `${name}.astro`), 'utf8');

describe('the byline pages', () => {
  // every guide, every table and every state page, in both languages; never an index or a calculator
  it('are every guide, table and state page of the route table, in both languages', () => {
    const expected = ROUTES.filter(
      ({ id }) => id.endsWith('-guide') || id.startsWith('state-'),
    ).flatMap(({ en, es }) => [en, es]);
    expect(BYLINE_PAGES.map(({ path }) => path).sort()).toEqual([...expected].sort());
  });

  it('each give a real day and the sources the page links', () => {
    for (const { path, checked, sources } of BYLINE_PAGES) {
      expect(checked, path).toMatch(DAY);
      expect(Number.isNaN(Date.parse(checked)), path).toBe(false);
      expect(sources.length, path).toBeGreaterThan(0);
      expect(new Set(sources).size, path).toBe(sources.length);
    }
  });

  it('give a guide the same day in both languages', () => {
    for (const { texts } of BYLINE_GUIDES) expect(texts.es.checked).toBe(texts.en.checked);
  });

  it('give a table the day the data index says it was checked', () => {
    for (const { paths, checked } of DATA_PAGES)
      for (const lang of LANGS)
        expect(BYLINE_PAGES.find(({ path }) => path === paths[lang])?.checked).toBe(checked);
  });

  // a state page holds a row of three tables: its review day is the oldest of their checked days,
  // so every figure on the page was checked on that day or later
  it('give a state page the oldest checked day of its three tables, and all its sources', () => {
    const oldest = DATA_PAGES.filter(({ id }) => id !== 'minimum-wage-2027-states-guide')
      .map(({ checked }) => checked)
      .sort()[0];
    for (const facts of STATE_FACTS)
      for (const lang of LANGS) {
        const page = statePageOf(facts, lang);
        expect(page.reviewed, page.h1).toBe(oldest);
        expect(page.sources.map(({ href }) => href)).toEqual([
          ...new Set(
            [...page.sections, ...page.context].flatMap(({ sources }) =>
              sources.map(({ href }) => href),
            ),
          ),
        ]);
      }
  });

  it('keep each source once, in the order the page cites them', () => {
    const a = { label: 'A', href: 'https://a.test/' };
    const b = { label: 'B', href: 'https://b.test/' };
    expect(uniqueSources([a, b, { ...a, label: 'A again' }])).toEqual([a, b]);
  });

  it('render the byline under the h1 of every page component that holds one', () => {
    for (const name of [
      'GuidePage',
      'StatePage',
      'MinimumWageStatesPage',
      'MinimumWage2027Page',
      'OvertimeStatesPage',
      'TippedStatesPage',
    ]) {
      expect(component(name), name).toMatch(/<\/h1>\s*<Byline\b/);
      expect(component(name), name).toContain('id="sources"');
    }
  });
});
