import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DESCRIPTION, TITLE_MAX } from '../seo/meta.ts';
import { chartOf } from './chart.ts';
import { MILITARY_CONVERTER_PATHS, MILITARY_TIME_ROUTES } from './routes.ts';

const pageOf = (href: string): string =>
  resolve(import.meta.dirname, '../pages', `${href.slice(1)}.astro`);

describe('the military time chart', () => {
  it('lists all 24 hours on both clocks, said aloud, from the engine', () => {
    const table = chartOf('en').sections.find(({ id }) => id === 'chart')?.table;
    expect(table?.head).toEqual([
      'Military time',
      '12-hour time',
      '24-hour with a colon',
      'How it is said',
    ]);
    expect(table?.rows).toHaveLength(24);
    expect(table?.rows[0]).toEqual(['0000', '12:00 AM', '00:00', 'zero hundred hours']);
    expect(table?.rows[15]).toEqual(['1500', '3:00 PM', '15:00', 'fifteen hundred hours']);
    expect(table?.rows[23]).toEqual(['2300', '11:00 PM', '23:00', 'twenty-three hundred hours']);
    const es = chartOf('es').sections.find(({ id }) => id === 'chart')?.table;
    expect(es?.rows[13]).toEqual(['1300', '1:00 p. m.', '13:00', 'las trece horas']);
  });

  it('shows how minutes are read: 1345 thirteen forty-five, 0005 zero zero zero five', () => {
    const minutes = chartOf('en').sections.find(({ id }) => id === 'minutes');
    expect(minutes?.table?.rows).toContainEqual(['1345', '1:45 PM', 'thirteen forty-five']);
    expect(minutes?.table?.rows).toContainEqual(['0005', '12:05 AM', 'zero zero zero five']);
    expect(minutes?.paragraphs.join(' ')).toContain('oh five');
  });

  for (const lang of ['en', 'es'] as const) {
    it(`notes 0000 against 2400 and links the converter and real pages (${lang})`, () => {
      const page = chartOf(lang);
      const { title, description } = page;
      expect(title.length).toBeLessThanOrEqual(TITLE_MAX);
      expect(description.length).toBeGreaterThanOrEqual(DESCRIPTION.min);
      expect(description.length).toBeLessThanOrEqual(DESCRIPTION.max);
      const midnight = page.sections.find(({ id }) => id === 'midnight');
      expect(midnight?.paragraphs.join(' ')).toMatch(/0000.*2400/);
      const links = page.sections.flatMap((section) => section.links ?? []);
      expect(links.map(({ href }) => href)).toContain(MILITARY_CONVERTER_PATHS[lang]);
      for (const { href } of links) {
        const built = href.startsWith('/military-time/')
          ? MILITARY_TIME_ROUTES.some(({ en }) => en === href)
          : existsSync(pageOf(href));
        expect(built, href).toBe(true);
        if (lang === 'es') expect(href.startsWith('/es/'), href).toBe(true);
      }
    });
  }

  it('links the page of every hour and half hour from the English chart', () => {
    const links = chartOf('en').sections.flatMap((section) => section.links ?? []);
    for (const { en } of MILITARY_TIME_ROUTES) expect(links.map(({ href }) => href)).toContain(en);
  });
});
