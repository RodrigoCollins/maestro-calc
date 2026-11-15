import { describe, expect, it } from 'vitest';
import { HOURS_PATHS } from '../hours/texts.ts';
import { commonLinksOf, LONG_TAIL_ROUTES, longTailPageOf } from './jobs.ts';
import { CLOCK_JOBS, LIVE_JOBS, pathOf, WEEKS, WEEKS_LIVE, type Weeks } from './routes.ts';
import type { LongTailSection } from './sections.ts';
import { liveTextOf } from './time-math.ts';

const LANGS = ['en', 'es'] as const;

const jobOf = (slug: string): Weeks => {
  const job = WEEKS.find((candidate) => candidate.slug.en === slug);
  if (job === undefined) throw new Error(`no weeks job ${slug}`);
  return job;
};

const pageOf = (slug: string, lang: 'en' | 'es' = 'en') => longTailPageOf(jobOf(slug), lang);

const sectionOf = (slug: string, id: string, lang: 'en' | 'es' = 'en'): LongTailSection => {
  const section = pageOf(slug, lang).sections?.find((each) => each.id === id);
  if (section === undefined) throw new Error(`no section ${id} on ${slug}`);
  return section;
};

const rowOf = (
  slug: string,
  id: string,
  first: string,
  lang: 'en' | 'es' = 'en',
): readonly string[] => {
  const row = sectionOf(slug, id, lang).table?.rows.find(([cell]) => cell === first);
  if (row === undefined) throw new Error(`no row ${first} on ${slug}`);
  return row;
};

const textOf = (slug: string, lang: 'en' | 'es' = 'en'): string => {
  const page = pageOf(slug, lang);
  return [
    page.lead,
    ...(page.sections ?? []).flatMap((section) => [
      ...section.paragraphs,
      ...(section.steps ?? []),
      ...(section.after ?? []),
      ...(section.questions ?? []).flatMap(({ question, answer }) => [question, answer]),
    ]),
  ].join(' ');
};

describe('weeks long-tail pages', () => {
  it('cover the measured weeks questions, in both languages', () => {
    expect(WEEKS.map(({ slug }) => slug.en)).toEqual([
      'how-many-weeks-in-a-year',
      'how-many-weeks-in-a-month',
      ...[12, 14, 16, 18, 20, 24].map((weeks) => `how-many-months-is-${String(weeks)}-weeks`),
      'how-many-weeks-is-6-months',
      'how-many-weeks-left-in-2026',
      'how-many-weeks-until-christmas',
    ]);
    expect(jobOf('how-many-weeks-in-a-year').slug.es).toBe('cuantas-semanas-tiene-un-ano');
    expect(jobOf('how-many-months-is-12-weeks').slug.es).toBe('cuantos-meses-son-12-semanas');
    expect(jobOf('how-many-weeks-until-christmas').slug.es).toBe(
      'cuantas-semanas-faltan-para-navidad',
    );
    for (const job of WEEKS) {
      expect(LONG_TAIL_ROUTES.map(({ en }) => en)).toContain(pathOf(job, 'en'));
      expect(LONG_TAIL_ROUTES.map(({ es }) => es)).toContain(pathOf(job, 'es'));
    }
  });

  it('load the clock script only on the two counts from today', () => {
    expect(CLOCK_JOBS).toEqual([...LIVE_JOBS, ...WEEKS_LIVE]);
    for (const job of WEEKS) {
      for (const lang of LANGS) {
        const live = longTailPageOf(job, lang).live;
        expect(live !== undefined).toBe(WEEKS_LIVE.includes(job));
      }
    }
  });

  it('answer in the title, the heading and the figure, every page its own', () => {
    for (const lang of LANGS) {
      const pages = WEEKS.map((job) => longTailPageOf(job, lang));
      expect(new Set(pages.map(({ title }) => title)).size).toBe(WEEKS.length);
      expect(new Set(pages.map(({ description }) => description)).size).toBe(WEEKS.length);
      for (const page of pages) {
        expect(page.title.length).toBeLessThanOrEqual(70);
        expect(page.description.length).toBeGreaterThanOrEqual(70);
        expect(page.description.length).toBeLessThanOrEqual(160);
        expect(page.calculator.href).toBe(HOURS_PATHS[lang]);
        expect(page.others.links.length).toBeGreaterThan(0);
      }
    }
    expect(pageOf('how-many-weeks-in-a-year').h1).toBe('How many weeks are in a year?');
    expect(pageOf('how-many-weeks-in-a-year').figure).toBe('52.14');
    expect(pageOf('how-many-weeks-in-a-year').title).toMatch(/^A year has 52 weeks and 1 day/);
    expect(pageOf('how-many-weeks-in-a-year', 'es').h1).toBe('¿Cuántas semanas tiene un año?');
    expect(pageOf('how-many-weeks-in-a-month').figure).toBe('4.35');
    expect(pageOf('how-many-months-is-12-weeks').figure).toBe('2.76');
    expect(pageOf('how-many-months-is-12-weeks').h1).toBe('How many months is 12 weeks?');
    expect(pageOf('how-many-months-is-12-weeks', 'es').h1).toBe('¿Cuántos meses son 12 semanas?');
    expect(pageOf('how-many-months-is-14-weeks').figure).toBe('3.22');
    expect(pageOf('how-many-months-is-16-weeks').figure).toBe('3.68');
    expect(pageOf('how-many-months-is-18-weeks').figure).toBe('4.14');
    expect(pageOf('how-many-months-is-20-weeks').figure).toBe('4.6');
    expect(pageOf('how-many-months-is-24-weeks').figure).toBe('5.52');
    expect(pageOf('how-many-weeks-is-6-months').figure).toBe('26.09');
  });

  it('give each year its days, its weeks, the weekday it starts on, its ISO weeks and its Fridays', () => {
    const slug = 'how-many-weeks-in-a-year';
    expect(rowOf(slug, 'years', '2026')).toEqual([
      '2026',
      '365',
      '52 weeks and 1 day',
      'Thursday',
      '53',
      '52',
    ]);
    expect(rowOf(slug, 'years', '2027')).toEqual([
      '2027',
      '365',
      '52 weeks and 1 day',
      'Friday',
      '52',
      '53',
    ]);
    expect(rowOf(slug, 'years', '2028')).toEqual([
      '2028',
      '366',
      '52 weeks and 2 days',
      'Saturday',
      '52',
      '52',
    ]);
    expect(rowOf(slug, 'years', '2032')).toEqual([
      '2032',
      '366',
      '52 weeks and 2 days',
      'Thursday',
      '53',
      '53',
    ]);
    expect(rowOf(slug, 'years', '2027', 'es')).toEqual([
      '2027',
      '365',
      '52 semanas y 1 día',
      'viernes',
      '52',
      '53',
    ]);
    // the 53rd ISO week of 2026 runs into 2027
    expect(textOf(slug)).toContain('December 28, 2026');
    expect(textOf(slug)).toContain('January 3, 2027');
  });

  it('give each month its days, its weeks and its Fridays in 2026 and 2027', () => {
    const slug = 'how-many-weeks-in-a-month';
    expect(rowOf(slug, 'months', 'January')).toEqual([
      'January',
      '31',
      '4 weeks and 3 days',
      '4.43',
      '5',
      '5',
    ]);
    expect(rowOf(slug, 'months', 'February')).toEqual(['February', '28', '4 weeks', '4', '4', '4']);
    expect(rowOf(slug, 'months', 'April')).toEqual([
      'April',
      '30',
      '4 weeks and 2 days',
      '4.29',
      '4',
      '5',
    ]);
    expect(rowOf(slug, 'months', 'abril', 'es')).toEqual([
      'abril',
      '30',
      '4 semanas y 2 días',
      '4.29',
      '4',
      '5',
    ]);
    // a monthly figure from a weekly one is 52 weeks over 12 months
    expect(textOf(slug)).toContain('4.33');
    expect(textOf(slug)).toContain('$4,333.33');
    expect(textOf(slug)).toContain('173.33');
  });

  it('land some weeks on the calendar from the 1st of each month', () => {
    const slug = 'how-many-months-is-12-weeks';
    expect(rowOf(slug, 'calendar', 'January 1')).toEqual([
      'January 1',
      'March 26',
      '2 months and 25 days',
    ]);
    expect(rowOf(slug, 'calendar', 'March 1')).toEqual([
      'March 1',
      'May 24',
      '2 months and 23 days',
    ]);
    expect(rowOf(slug, 'calendar', '1 de marzo', 'es')).toEqual([
      '1 de marzo',
      '24 de mayo',
      '2 meses y 23 días',
    ]);
    expect(rowOf('how-many-months-is-24-weeks', 'calendar', 'January 1')).toEqual([
      'January 1',
      'June 18',
      '5 months and 17 days',
    ]);
    expect(textOf(slug)).toContain('84 days');
    expect(textOf(slug)).toContain('480 hours');
    // the FMLA leave is 12 workweeks
    expect(textOf(slug)).toContain('FMLA');
    expect(textOf('how-many-months-is-16-weeks')).not.toContain('FMLA');
  });

  it('give 6 months in days and weeks from the 1st of each month', () => {
    const slug = 'how-many-weeks-is-6-months';
    expect(rowOf(slug, 'calendar', 'January 1')).toEqual([
      'January 1',
      'July 1',
      '181',
      '25 weeks and 6 days',
    ]);
    expect(rowOf(slug, 'calendar', 'July 1')).toEqual([
      'July 1',
      'January 1, 2028',
      '184',
      '26 weeks and 2 days',
    ]);
    expect(rowOf(slug, 'calendar', 'September 1')).toEqual([
      'September 1',
      'March 1, 2028',
      '182',
      '26 weeks',
    ]);
    expect(textOf(slug)).toContain('1,040 hours');
  });

  it('count the weeks left in 2026 from the 1st of each month', () => {
    const slug = 'how-many-weeks-left-in-2026';
    expect(rowOf(slug, 'months', 'January 1')).toEqual([
      'January 1',
      '365',
      '52 weeks and 1 day',
      '261',
      '52',
      '1',
    ]);
    expect(rowOf(slug, 'months', 'December 1')).toEqual([
      'December 1',
      '31',
      '4 weeks and 3 days',
      '23',
      '4',
      '49',
    ]);
    const page = pageOf(slug);
    expect(page.live?.kind).toBe('weeks');
    expect(page.live?.data).toMatchObject({ y: '2027', m: '1', d: '1' });
    const formats = {
      time: () => '',
      weekday: () => '',
      date: (moment: Date) => moment.toDateString(),
    };
    const data = page.live?.data ?? {};
    expect(liveTextOf('weeks', data, new Date(2026, 10, 15), formats)).toContain(
      '6 weeks and 5 days',
    );
    expect(liveTextOf('weeks', data, new Date(2027, 0, 2), formats)).toContain('2026 is over');
    // the page as built never states a count that depends on the day it was built
    expect(page.live?.fallback).not.toMatch(/\b\d+ weeks? left\b/);
  });

  it('count the weeks until Christmas and give its weekday and federal holiday each year', () => {
    const slug = 'how-many-weeks-until-christmas';
    expect(rowOf(slug, 'years', '2026')).toEqual([
      '2026',
      'Friday',
      'Friday, December 25',
      'November 26',
      '4 weeks and 1 day',
    ]);
    expect(rowOf(slug, 'years', '2027')).toEqual([
      '2027',
      'Saturday',
      'Friday, December 24',
      'November 25',
      '4 weeks and 2 days',
    ]);
    expect(rowOf(slug, 'years', '2033')).toEqual([
      '2033',
      'Sunday',
      'Monday, December 26',
      'November 24',
      '4 weeks and 3 days',
    ]);
    expect(rowOf(slug, 'months', 'January 1')).toEqual(['January 1', '358', '51 weeks and 1 day']);
    expect(rowOf(slug, 'months', 'December 1')).toEqual(['December 1', '24', '3 weeks and 3 days']);
    const page = pageOf(slug);
    expect(page.live?.data).toMatchObject({ m: '12', d: '25' });
    expect(page.live?.data).not.toHaveProperty('y');
    // the Spanish page links the Spanish days-to-Christmas countdown
    const links = (pageOf(slug, 'es').sections ?? []).flatMap((each) => each.links ?? []);
    expect(links.map(({ href }) => href)).toContain('/es/fechas/cuantos-dias-faltan-para-navidad');
  });

  it('are linked from the hours calculator, and each links its nearest', () => {
    for (const lang of LANGS) {
      expect(commonLinksOf('weeks', lang).links.map(({ href }) => href)).toEqual(
        WEEKS.map((job) => pathOf(job, lang)),
      );
      for (const job of WEEKS) {
        const links = longTailPageOf(job, lang).others.links.map(({ href }) => href);
        expect(links).not.toContain(pathOf(job, lang));
        expect(links.length).toBe(6);
      }
    }
  });
});
