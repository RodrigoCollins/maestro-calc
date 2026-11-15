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

  const en = (id: string) => chartOf('en').sections.find((section) => section.id === id);

  it('prints every quarter hour of the day as a grid, one row an hour', () => {
    const table = en('quarter-hours')?.table;
    expect(table?.head).toEqual(['Hour', ':00', ':15', ':30', ':45']);
    expect(table?.rows).toHaveLength(24);
    expect(table?.rows[0]).toEqual(['12 AM', '0000', '0015', '0030', '0045']);
    expect(table?.rows[12]).toEqual(['12 PM', '1200', '1215', '1230', '1245']);
    expect(table?.rows[13]).toEqual(['1 PM', '1300', '1315', '1330', '1345']);
    expect(table?.rows[23]).toEqual(['11 PM', '2300', '2315', '2330', '2345']);
  });

  it('gives the military letter of each US zone, standard and daylight, from the zone offsets', () => {
    const rows = en('zone-letters')?.table?.rows ?? [];
    expect(rows[0]).toEqual(['Eastern Time (ET)', 'UTC−5 · R (Romeo)', 'UTC−4 · Q (Quebec)']);
    expect(rows[3]).toEqual(['Pacific Time (PT)', 'UTC−8 · U (Uniform)', 'UTC−7 · T (Tango)']);
    expect(rows[5]).toEqual(['Hawaii Time (HT)', 'UTC−10 · W (Whiskey)', 'No daylight time']);
    expect(rows).toHaveLength(6);
  });

  it('sets military time against 24-hour and Zulu time on one moment, 3:45 PM Eastern', () => {
    const section = en('zulu');
    const cells = section?.table?.rows.flat() ?? [];
    expect(cells).toEqual(expect.arrayContaining(['3:45 PM', '15:45', '1545', '1545R', '2045Z']));
    expect(section?.after?.join(' ')).toContain('1945Z');
  });

  it('says how to read a time aloud, rule by rule', () => {
    const steps = en('said')?.steps?.join(' ') ?? '';
    expect(steps).toContain('fifteen hundred');
    expect(steps).toContain('oh seven thirty');
    expect(steps).toContain('thousand');
  });

  it("corrects the common mistakes with the engine's own times", () => {
    const steps = en('mistakes')?.steps?.join(' ') ?? '';
    expect(steps).toContain('12:30 AM is 0030');
    expect(steps).toContain('12:45 PM is 1245');
    expect(steps).toContain('0730');
  });

  it('answers the questions people search, every figure from the engine', () => {
    const questions = en('faq')?.questions ?? [];
    const answer = (question: string) =>
      questions.find((each) => each.question === question)?.answer;
    expect(answer('What is 7 PM in military time?')).toContain('1900');
    expect(answer('What time is 1800 in military time?')).toContain('6:00 PM');
    expect(answer('Is midnight 0000 or 2400?')).toMatch(/0000.*2400/);
    expect(questions.length).toBeGreaterThanOrEqual(6);
  });

  it('names the search in its English title and promises the chart in its description', () => {
    const { title, description } = chartOf('en');
    expect(title).toMatch(/^Military Time Chart/);
    expect(description).toMatch(/15 minutes/);
    expect(description).toMatch(/Zulu/);
  });

  it('keeps the Spanish chart as it was', () => {
    expect(chartOf('es').sections.map(({ id }) => id)).toEqual([
      'chart',
      'minutes',
      'midnight',
      'related',
    ]);
  });
});
