import { describe, expect, it } from 'vitest';
import { ROUTES } from '../routes.ts';
import { checkedOf, dataCards, DATA_PAGES, dayText, isDataPage } from './pages.ts';

const LANGS = ['en', 'es'] as const;

/** Every citable table of the route table: a route whose id ends in `-states-guide`. */
const routed = ROUTES.filter(({ id }) => id.endsWith('-states-guide'));

describe('DATA_PAGES (the data index of Cuenta Horas)', () => {
  it('has tables to list', () => {
    expect(routed.length).toBeGreaterThan(0);
  });

  it('lists every citable table of the route table exactly once, in table order', () => {
    expect(DATA_PAGES.map(({ id }) => id)).toEqual(routed.map(({ id }) => id));
    expect(ROUTES.filter(({ id }) => isDataPage(id))).toEqual(routed);
  });

  it.each(LANGS)('gives each table its address, h1, description and checked day in %s', (lang) => {
    for (const [index, card] of dataCards(lang).entries()) {
      const page = DATA_PAGES[index];
      const route = routed[index];
      expect(card.href).toBe(route?.[lang]);
      expect(card.title).toBe(page?.texts[lang].h1);
      expect(card.summary).toBe(page?.texts[lang].description);
      expect(card.checked).toBe(dayText(page?.checked ?? '', lang));
    }
  });

  // the page shows the day in its byline (`src/editorial/bylines.test.ts`, `check:site`)
  it('gives the checked day of each table by its route id', () => {
    for (const { id, checked } of DATA_PAGES) expect(checkedOf(id), id).toBe(checked);
    expect(() => checkedOf('nothing')).toThrow(/no data page/);
  });

  it('names the U.S. Department of Labor first and counts the other sources of each table', () => {
    for (const { id, sources } of DATA_PAGES) {
      const [first, ...rest] = Object.values(sources);
      expect(first?.label, id).toMatch(/^U\.S\. Department of Labor, /);
      const card = dataCards('en').find((each) => each.id === id);
      expect(card?.sources, id).toBe(
        `U.S. Department of Labor (DOL) and ${String(rest.length)} state sources`,
      );
    }
  });

  it('writes a calendar day in the long form of each language, in UTC', () => {
    expect(dayText('2026-11-05', 'en')).toBe('November 5, 2026');
    expect(dayText('2026-11-05', 'es')).toBe('5 de noviembre de 2026');
  });
});
