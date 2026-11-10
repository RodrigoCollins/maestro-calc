import { describe, expect, it } from 'vitest';
import { DESCRIPTION, TITLE_MAX } from '../seo/meta.ts';
import { countdownPageOf, DATE_SOURCES } from './countdowns.ts';
import { COUNTDOWNS, countdownPathOf, DAYS_BETWEEN_PATH, type CountdownSlug } from './routes.ts';

const page = (slug: CountdownSlug) => countdownPageOf({ kind: 'countdown', slug });
const section = (slug: CountdownSlug, id: string) => {
  const found = page(slug).sections.find((each) => each.id === id);
  if (found === undefined) throw new Error(`no section ${id} on ${slug}`);
  return found;
};

const shingles = (text: string): Set<string> => {
  const words = text.toLowerCase().match(/[\p{L}\p{N}'’.,/×-]+/gu) ?? [];
  return new Set(words.slice(0, -5).map((_, index) => words.slice(index, index + 6).join(' ')));
};

/** Everything a page shows in its main content, in reading order. */
const prose = (slug: CountdownSlug): string => {
  const view = page(slug);
  return [
    view.kicker,
    view.h1,
    view.lead,
    view.figureLabel,
    ...Object.values(view.fallback),
    view.note,
    view.calculator.label,
    ...view.sections.flatMap((each) => [
      each.heading,
      ...each.paragraphs,
      ...(each.steps ?? []),
      ...(each.table === undefined
        ? []
        : [each.table.caption, ...each.table.head, ...each.table.rows.flat()]),
      ...(each.links ?? []).map(({ label }) => label),
    ]),
    ...view.others.links.map(({ label }) => label),
  ].join(' ');
};

const words = (text: string): string[] => text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];

describe('the countdown pages', () => {
  it('fit a search result, and carry the numbers of their path in the title and description', () => {
    for (const { slug } of COUNTDOWNS) {
      const view = page(slug);
      expect(view.title.length, slug).toBeLessThanOrEqual(TITLE_MAX);
      expect(view.description.length, slug).toBeGreaterThanOrEqual(DESCRIPTION.min);
      expect(view.description.length, slug).toBeLessThanOrEqual(DESCRIPTION.max);
      for (const number of slug.match(/\d+/g) ?? []) {
        expect(view.title, slug).toContain(number);
        expect(view.description, slug).toContain(number);
      }
      expect(view.paths.es).toBe(countdownPathOf({ kind: 'countdown', slug }));
      expect(view.calculator.href).toBe(DAYS_BETWEEN_PATH);
    }
  });

  it('show the date with no script, never a count from the day they were built', () => {
    const view = page('cuantos-dias-faltan-para-navidad');
    expect(view.fallback.days).toBe('El 25 de diciembre');
    expect(view.data).toEqual({ rule: 'fixed', m: '12', d: '25' });
    expect(page('cuantos-dias-faltan-para-semana-santa').data).toEqual({
      rule: 'easter',
      offset: '-7',
    });
  });

  it('date each year with its weekday, read off a printed calendar', () => {
    const rows = section('cuantos-dias-faltan-para-navidad', 'years').table?.rows ?? [];
    expect(rows[0]).toEqual(['2026', '25 de diciembre', 'viernes']);
    expect(rows[1]).toEqual(['2027', '25 de diciembre', 'sábado']);
    expect(rows).toHaveLength(7);
  });

  it('date Semana Santa from the computus: Easter 2026 is 5 April, 2027 is 28 March', () => {
    const rows = section('cuantos-dias-faltan-para-semana-santa', 'years').table?.rows ?? [];
    expect(rows[0]).toEqual(['2026', '29 de marzo', '2 de abril', '3 de abril', '5 de abril']);
    expect(rows[1]).toEqual(['2027', '21 de marzo', '25 de marzo', '26 de marzo', '28 de marzo']);
    expect(rows.at(-1)?.[0]).toBe('2035');
  });

  it("date Spain's Mother's Day on the first Sunday of May: 3 May 2026, 2 May 2027", () => {
    const rows = section('cuantos-dias-faltan-para-el-dia-de-las-madres', 'years').table?.rows;
    expect(rows?.[0]).toEqual(['2026', 'domingo', '3 de mayo']);
    expect(rows?.[1]).toEqual(['2027', 'lunes', '2 de mayo']);
  });

  it('count from the 1st of each month of 2027', () => {
    const rows = section('cuantos-dias-faltan-para-navidad', 'months').table?.rows ?? [];
    // 1 Dec to 25 Dec is 24 days; 1 Jan 2027 to 25 Dec 2027 is 358 (a 365-day year less 7)
    expect(rows[11]).toEqual([
      '1 de diciembre',
      'sábado 25 de diciembre de 2027',
      '24',
      '3 semanas y 3 días',
    ]);
    expect(rows[0]?.[2]).toBe('358');
    const newYear = section('cuantos-dias-faltan-para-ano-nuevo', 'months').table?.rows ?? [];
    // from 1 Jan it is today; from 1 Feb it is the next year's
    expect(newYear[0]?.slice(1, 3)).toEqual(['viernes 1 de enero de 2027', '0']);
    expect(newYear[1]?.slice(1, 3)).toEqual(['sábado 1 de enero de 2028', '334']);
  });

  it('say which days are mandatory rest days in Mexico, and pay those three times over', () => {
    const mandatory: CountdownSlug[] = [
      'cuantos-dias-faltan-para-ano-nuevo',
      'cuantos-dias-faltan-para-el-16-de-septiembre',
      'cuantos-dias-faltan-para-navidad',
    ];
    for (const { slug } of COUNTDOWNS) {
      const mexico = section(slug, 'mexico').paragraphs.join(' ');
      const pay = section(slug, 'pay');
      if (mandatory.includes(slug)) {
        expect(mexico, slug).toContain('es uno de ellos');
        expect(pay.table?.rows[0]).toEqual(['$300.00', '$300.00', '$600.00', '$900.00']);
        expect(pay.table?.rows[3]).toEqual(['$800.00', '$800.00', '$1,600.00', '$2,400.00']);
      } else {
        expect(mexico, slug).toMatch(/no está en esa lista|están en esa lista/);
        expect(pay.table, slug).toBeUndefined();
        expect(pay.paragraphs.join(' '), slug).toContain('un día laboral normal');
      }
    }
  });

  it('cite the federal labor law of Mexico and the BOE', () => {
    for (const { slug } of COUNTDOWNS)
      expect(page(slug).sources).toEqual(Object.values(DATE_SOURCES));
  });

  it('each say well over 120 words of their own', () => {
    // the lead and the story are written for the one day; the tables add its own figures
    for (const { slug } of COUNTDOWNS) {
      const own = [page(slug).lead, ...section(slug, 'story').paragraphs].join(' ');
      expect(words(own).length, slug).toBeGreaterThan(130);
    }
  });

  it('are no near-duplicates of one another', () => {
    const sets = COUNTDOWNS.map(({ slug }) => shingles(prose(slug)));
    let most = 0;
    for (const [i, a] of sets.entries())
      for (const [j, b] of sets.entries()) {
        if (j <= i) continue;
        const both = [...a].filter((each) => b.has(each)).length;
        const similarity = both / new Set([...a, ...b]).size;
        most = Math.max(most, similarity);
        expect(similarity, `${String(i)} and ${String(j)}`).toBeLessThan(0.35);
      }
    console.log(`countdown pages: most similar pair ${most.toFixed(3)}`);
  });

  it('link their nearest countdowns and the calculator', () => {
    const links = page('cuantos-dias-faltan-para-navidad').others.links.map(({ href }) => href);
    expect(links).toContain('/es/fechas/cuantos-dias-faltan-para-el-dia-de-muertos');
    expect(links).not.toContain('/es/fechas/cuantos-dias-faltan-para-navidad');
    expect(links.at(-1)).toBe(DAYS_BETWEEN_PATH);
  });
});
