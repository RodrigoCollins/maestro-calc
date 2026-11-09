import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DESCRIPTION, TITLE_MAX } from '../seo/meta.ts';
import { converterOf, CONVERTER_DEFAULT } from './converter.ts';
import { MILITARY_CHART_PATHS, MILITARY_TIME_ROUTES } from './routes.ts';

const pageOf = (href: string): string =>
  resolve(import.meta.dirname, '../pages', `${href.slice(1)}.astro`);

describe('the military time converter', () => {
  it('opens on 1500, worked by the engine: 3:00 PM, fifteen hundred hours', () => {
    expect(CONVERTER_DEFAULT).toBe('1500');
    const en = converterOf('en');
    expect(en.result.figure).toBe('1500 = 3:00 PM');
    expect(en.result.rows.map(({ key, value }) => [key, value])).toEqual([
      ['twelve', '3:00 PM'],
      ['colon', '15:00'],
      ['spoken', 'fifteen hundred hours'],
    ]);
    const es = converterOf('es');
    expect(es.result.figure).toBe('1500 = 3:00 p. m.');
    expect(es.result.rows.map(({ value }) => value)).toEqual([
      '3:00 p. m.',
      '15:00',
      'las quince horas',
    ]);
  });

  it('works the common conversions both ways through the engine', () => {
    const table = converterOf('en').sections.find(({ id }) => id === 'how-to-convert')?.table;
    expect(table?.head).toEqual(['12-hour time', 'Military time', 'How it is said']);
    expect(table?.rows).toContainEqual(['7:45 PM', '1945', 'nineteen forty-five']);
    expect(table?.rows).toContainEqual(['12:00 AM', '0000', 'zero hundred hours']);
    expect(table?.rows).toContainEqual(['12:30 PM', '1230', 'twelve thirty']);
    const back = converterOf('en').sections.find(({ id }) => id === 'how-to-convert-back');
    expect(back?.steps?.join(' ')).toContain('1845 is 18 − 12 = 6:45 PM');
    const es = converterOf('es').sections.find(({ id }) => id === 'how-to-convert')?.table;
    expect(es?.rows).toContainEqual([
      '7:45 p. m.',
      '1945',
      'las diecinueve horas y cuarenta y cinco minutos',
    ]);
  });

  for (const lang of ['en', 'es'] as const) {
    it(`has a title and a description a result shows whole (${lang})`, () => {
      const { title, description } = converterOf(lang);
      expect(title.length).toBeLessThanOrEqual(TITLE_MAX);
      expect(description.length).toBeGreaterThanOrEqual(DESCRIPTION.min);
      expect(description.length).toBeLessThanOrEqual(DESCRIPTION.max);
    });

    it(`explains 0000 and 2400, and links the chart and real pages of its language (${lang})`, () => {
      const page = converterOf(lang);
      const midnight = page.sections.find(({ id }) => id === 'midnight');
      expect(midnight?.paragraphs.join(' ')).toContain('2400');
      const links = page.sections.flatMap((section) => section.links ?? []);
      expect(links.map(({ href }) => href)).toContain(MILITARY_CHART_PATHS[lang]);
      for (const { href } of links) {
        const built = href.startsWith('/military-time/')
          ? MILITARY_TIME_ROUTES.some(({ en }) => en === href)
          : existsSync(pageOf(href));
        expect(built, href).toBe(true);
        if (lang === 'es') expect(href.startsWith('/es/'), href).toBe(true);
      }
    });
  }

  it('links every hour and half hour page from the English converter', () => {
    const links = converterOf('en').sections.flatMap((section) => section.links ?? []);
    for (const { en } of MILITARY_TIME_ROUTES) expect(links.map(({ href }) => href)).toContain(en);
    expect(links.find(({ href }) => href === '/military-time/1500')?.label).toBe(
      '1500 in military time',
    );
  });

  it('speaks to the Spanish reader as tú', () => {
    const page = converterOf('es');
    const copy = [page.lead, page.hint, ...page.sections.flatMap((s) => s.paragraphs)].join(' ');
    expect(copy).toMatch(/Escribe/);
    expect(copy).not.toMatch(/\b(escriba|usted|ingrese)\b/i);
  });
});
