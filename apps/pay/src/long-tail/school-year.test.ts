import { describe, expect, it } from 'vitest';
import { ROUTES } from '../routes.ts';
import { HOURS_PATHS } from '../hours/texts.ts';
import { commonLinksOf, longTailPageOf } from './jobs.ts';
import { pathOf, SCHOOL_YEAR_PATH, SCHOOL_YEAR_ROUTES, WEEKS } from './routes.ts';
import { SCHOOL_YEAR_SOURCE, SCHOOL_YEAR_STATES } from './school-year-data.ts';
import { schoolYearPage, schoolYearSiblings } from './school-year.ts';
import type { LongTailSection } from './sections.ts';

const sectionOf = (id: string): LongTailSection => {
  const section = schoolYearPage.sections?.find((each) => each.id === id);
  if (section === undefined) throw new Error(`no section ${id}`);
  return section;
};

const rowOf = (id: string, first: string): readonly string[] => {
  const row = sectionOf(id).table?.rows.find(([cell]) => cell === first);
  if (row === undefined) throw new Error(`no row ${first} in ${id}`);
  return row;
};

const stateOf = (name: string) => {
  const state = SCHOOL_YEAR_STATES.find((each) => each.name === name);
  if (state === undefined) throw new Error(`no state ${name}`);
  return state;
};

const textOf = (): string =>
  [
    schoolYearPage.lead,
    ...(schoolYearPage.sections ?? []).flatMap((section) => [
      ...section.paragraphs,
      ...(section.steps ?? []),
      ...(section.after ?? []),
      ...(section.questions ?? []).flatMap(({ question, answer }) => [question, answer]),
    ]),
  ].join(' ');

describe('the school year data (NCES State Education Practices, table 1.1, 2020)', () => {
  it('holds the 50 states and DC once, in alphabetical order', () => {
    const names = SCHOOL_YEAR_STATES.map(({ name }) => name);
    expect(names).toHaveLength(51);
    expect(new Set(names).size).toBe(51);
    expect([...names].sort((a, b) => a.localeCompare(b, 'en'))).toEqual(names);
    expect(names).toContain('District of Columbia');
  });

  it('copies the published minimums, days and hours', () => {
    expect(stateOf('Alabama')).toMatchObject({ days: 180, hours: '1,080', perDay: 6 });
    expect(stateOf('Colorado').days).toBe(160);
    expect(stateOf('Kansas')).toMatchObject({ days: 186, daysText: '186 (grade 12: 181)' });
    expect(stateOf('Illinois').days).toBe(185);
    expect(stateOf('North Carolina')).toMatchObject({ days: 185, hours: '1,025', either: true });
    expect(stateOf('Minnesota').days).toBe(165);
    expect(stateOf('Vermont').days).toBe(175);
    expect(stateOf('Texas')).toMatchObject({ daysText: 'None', hours: '1,260', perDay: 7 });
    expect(stateOf('Texas').days).toBeUndefined();
    expect(stateOf('Arkansas').days).toBeUndefined();
    expect(stateOf('Alaska').hours).toBe('K-3: 740; 4-12: 900');
    // 29 of the 51 set exactly 180 days; 8 set hours with no day count; 5 leave it to a board
    expect(SCHOOL_YEAR_STATES.filter(({ days }) => days === 180)).toHaveLength(29);
    expect(SCHOOL_YEAR_STATES.filter(({ daysText }) => daysText === 'None')).toHaveLength(8);
    expect(SCHOOL_YEAR_STATES.filter(({ daysText }) => daysText.startsWith('Set by'))).toHaveLength(
      5,
    );
  });

  it('cites the NCES table it was read from', () => {
    expect(SCHOOL_YEAR_SOURCE.href).toBe(
      'https://nces.ed.gov/programs/statereform/tab1_1-2020.asp',
    );
    expect(SCHOOL_YEAR_SOURCE.label).toMatch(/^National Center for Education Statistics/);
    expect(SCHOOL_YEAR_SOURCE.label).toMatch(/Table 1\.1/);
    expect(SCHOOL_YEAR_SOURCE.label).toMatch(/2020/);
  });
});

describe('how many weeks in a school year', () => {
  it('is an English-only page of the route table, so the sitemap lists it', () => {
    expect(SCHOOL_YEAR_PATH).toBe('/pay/how-many-weeks-in-a-school-year');
    expect(SCHOOL_YEAR_ROUTES).toEqual([
      { id: 'pay-how-many-weeks-in-a-school-year', kind: 'article', en: SCHOOL_YEAR_PATH },
    ]);
    for (const route of SCHOOL_YEAR_ROUTES) expect(ROUTES).toContainEqual(route);
    expect(schoolYearPage.paths).toEqual({ en: SCHOOL_YEAR_PATH });
  });

  it('answers first: 180 days, 36 weeks of five school days', () => {
    expect(schoolYearPage.h1).toBe('How many weeks are in a school year?');
    expect(schoolYearPage.lead).toMatch(
      /^A US school year is usually 180 days, which is 36 weeks of five school days\./,
    );
    expect(schoolYearPage.figure).toBe('36');
    expect(schoolYearPage.title.length).toBeLessThanOrEqual(70);
    expect(schoolYearPage.title).toMatch(/180 days/);
    expect(schoolYearPage.description.length).toBeGreaterThanOrEqual(70);
    expect(schoolYearPage.description.length).toBeLessThanOrEqual(160);
    expect(schoolYearPage.calculator.href).toBe(HOURS_PATHS.en);
    expect(schoolYearPage.live).toBeUndefined();
  });

  it('works out 180, 175 and 186 days in weeks', () => {
    const rows = Object.fromEntries(schoolYearPage.rows.map(({ key, value }) => [key, value]));
    expect(rows).toMatchObject({
      '180': '36 weeks',
      '175': '35 weeks',
      '186': '37 weeks and 1 day (37.2)',
    });
    const steps = sectionOf('worked').steps ?? [];
    expect(steps.join(' ')).toMatch(/180 ÷ 5 = 36 weeks/);
    expect(steps.join(' ')).toMatch(/186 ÷ 5 = 37\.2 weeks/);
  });

  it('lists every state with its days, hours and weeks of school', () => {
    const table = sectionOf('states').table;
    expect(table?.rows).toHaveLength(51);
    expect(table?.head).toEqual([
      'State',
      'Minimum days',
      'Minimum hours a year',
      'Weeks of school',
    ]);
    expect(rowOf('states', 'Alabama')).toEqual(['Alabama', '180', '1,080', '36']);
    expect(rowOf('states', 'Colorado')[3]).toBe('32');
    expect(rowOf('states', 'Kansas')[3]).toBe('37.2');
    expect(rowOf('states', 'Louisiana')[3]).toBe('35.4');
    expect(rowOf('states', 'Texas')).toEqual(['Texas', 'None', '1,260', '36 at 7 hours a day']);
    expect(rowOf('states', 'Arkansas')[3]).toBe('—');
  });

  it('turns the hours of the hours-based states into days and weeks', () => {
    const rows = sectionOf('hours').table?.rows ?? [];
    expect(rows).toContainEqual(['Texas', '1,260', '7', '180', '36']);
    expect(rows).toContainEqual(['New Mexico, grades 7-12', '1,080', '6', '180', '36']);
    expect(rows).toContainEqual(['North Dakota, high school', '1,050', '6', '175', '35']);
  });

  it('shows how breaks stretch 36 weeks of school over about 40 weeks of calendar', () => {
    const calendar = sectionOf('calendar');
    const rows = calendar.table?.rows ?? [];
    const total = rows.find(([cell]) => cell === 'School days');
    expect(total?.[1]).toBe('180');
    expect(calendar.paragraphs.join(' ')).toMatch(/Monday, August 24, 2026/);
    expect(textOf()).toMatch(/40 weeks/);
  });

  it('cites NCES and links the hours calculator and its nearest weeks pages', () => {
    expect(schoolYearPage.sources).toEqual([SCHOOL_YEAR_SOURCE]);
    expect(schoolYearSiblings).toEqual(WEEKS.slice(0, 6));
    expect(schoolYearPage.others.links.map(({ href }) => href)).toEqual(
      schoolYearSiblings.map((job) => pathOf(job, 'en')),
    );
    expect(schoolYearPage.others.links.map(({ label }) => label)).toEqual(
      schoolYearSiblings.map((job) => longTailPageOf(job, 'en').h1),
    );
  });

  it('is linked from the English year and days in a year pages, never from their Spanish twins', () => {
    const linksOf = (slug: string, lang: 'en' | 'es'): readonly string[] => {
      const job = WEEKS.find((each) => each.slug.en === slug);
      if (job === undefined) throw new Error(`no weeks job ${slug}`);
      return (longTailPageOf(job, lang).sections ?? []).flatMap((section) =>
        (section.links ?? []).map(({ href }) => href),
      );
    };
    for (const slug of ['how-many-weeks-in-a-year', 'how-many-days-in-a-year']) {
      expect(linksOf(slug, 'en')).toContain(SCHOOL_YEAR_PATH);
      expect(linksOf(slug, 'es')).not.toContain(SCHOOL_YEAR_PATH);
    }
  });

  it('is listed in the English weeks section of the hours calculator only', () => {
    expect(commonLinksOf('weeks', 'en').links.map(({ href }) => href)).toEqual([
      ...WEEKS.map((job) => pathOf(job, 'en')),
      SCHOOL_YEAR_PATH,
    ]);
    expect(commonLinksOf('weeks', 'es').links.map(({ href }) => href)).toEqual(
      WEEKS.map((job) => pathOf(job, 'es')),
    );
  });
});
