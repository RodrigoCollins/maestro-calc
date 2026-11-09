import { describe, expect, it } from 'vitest';
import { HOURS_PATHS } from '../hours/texts.ts';
import { commonLinksOf, LONG_TAIL_ROUTES, longTailPageOf } from './jobs.ts';
import { DAYS_FROM, DAYS_FROM_TODAY, MONTHS_FROM_TODAY, pathOf, type DaysFrom } from './routes.ts';
import type { LongTailSection } from './sections.ts';

const LANGS = ['en', 'es'] as const;

const jobOf = (slug: string): DaysFrom => {
  const job = DAYS_FROM.find((candidate) => candidate.slug.en === slug);
  if (job === undefined) throw new Error(`no days-from job ${slug}`);
  return job;
};

const sectionOf = (slug: string, id: string, lang: 'en' | 'es' = 'en'): LongTailSection => {
  const section = longTailPageOf(jobOf(slug), lang).sections?.find((each) => each.id === id);
  if (section === undefined) throw new Error(`no section ${id} on ${slug}`);
  return section;
};

const textOf = (section: LongTailSection): string =>
  [
    ...section.paragraphs,
    ...(section.steps ?? []),
    ...(section.after ?? []),
    section.table?.caption ?? '',
    ...(section.table?.rows.flat() ?? []),
  ].join(' ');

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

describe('days and months from today long-tail pages', () => {
  it('cover the spans people ask the date of', () => {
    expect(DAYS_FROM_TODAY.map(({ slug }) => slug.en)).toEqual([
      ...[5, 7, 10, 14, 15, 20, 21, 25, 28, 30].map((days) => `${String(days)}-days-from-today`),
      '30-days-ago-from-today',
      ...[40, 45, 50, 60, 75, 90, 100, 120, 180, 365].map(
        (days) => `${String(days)}-days-from-today`,
      ),
    ]);
    expect(MONTHS_FROM_TODAY.map(({ amount }) => amount)).toEqual(
      Array.from({ length: 12 }, (_, i) => i + 1),
    );
    expect(DAYS_FROM).toEqual([...DAYS_FROM_TODAY, ...MONTHS_FROM_TODAY]);
    expect(jobOf('30-days-ago-from-today').slug.es).toBe('hace-30-dias');
    expect(jobOf('90-days-from-today').slug.es).toBe('90-dias-a-partir-de-hoy');
    expect(jobOf('1-month-from-today').slug.es).toBe('1-mes-a-partir-de-hoy');
    expect(jobOf('6-months-from-today').slug.es).toBe('6-meses-a-partir-de-hoy');
    for (const job of DAYS_FROM) {
      expect(LONG_TAIL_ROUTES.map(({ es }) => es)).toContain(pathOf(job, 'es'));
    }
  });

  it('answer first with what holds on any day', () => {
    const twentyEight = longTailPageOf(jobOf('28-days-from-today'), 'en');
    expect(twentyEight.h1).toBe('What is the date 28 days from today?');
    expect(twentyEight.title).toMatch(/^28 days from today: 4 weeks, the same weekday/);
    expect(twentyEight.figure).toBe('+28 days');
    const ago = longTailPageOf(jobOf('30-days-ago-from-today'), 'en');
    expect(ago.h1).toBe('What was the date 30 days ago?');
    expect(ago.figure).toBe('−30 days');
    expect(ago.title).toMatch(/^30 days ago: 4 weeks and 2 days back/);
    const six = longTailPageOf(jobOf('6-months-from-today'), 'es');
    expect(six.h1).toBe('¿Qué fecha es 6 meses a partir de hoy?');
    expect(six.figure).toBe('+6 meses');
    expect(longTailPageOf(jobOf('30-days-ago-from-today'), 'es').h1).toBe(
      '¿Qué fecha fue hace 30 días?',
    );
  });

  it('give the client script the signed span and its unit', () => {
    expect(longTailPageOf(jobOf('30-days-ago-from-today'), 'en').live?.data).toMatchObject({
      amount: '-30',
      unit: 'day',
    });
    expect(longTailPageOf(jobOf('6-months-from-today'), 'en').live?.data).toMatchObject({
      amount: '6',
      unit: 'month',
    });
    for (const job of DAYS_FROM) {
      for (const lang of LANGS) {
        const { live } = longTailPageOf(job, lang);
        expect(live?.kind).toBe('date');
        expect(live?.data['text']).toContain('{date}');
        expect(live?.fallback).not.toMatch(/\d{4}/);
      }
    }
  });

  it('give the hand-verified dates from the first of each month', () => {
    expect(sectionOf('28-days-from-today', 'months').table?.rows).toHaveLength(12);
    // 28 days from Jan 1 is Jan 29; from Feb 1, Mar 1 (Feb 29 in a leap year)
    expect(rowOf('28-days-from-today', 'months', 'January 1')).toEqual([
      'January 1',
      'January 29',
      'January 29',
    ]);
    expect(rowOf('28-days-from-today', 'months', 'February 1')).toEqual([
      'February 1',
      'March 1',
      'February 29',
    ]);
    // 30 days ago from Mar 1 is Jan 30, Jan 31 in a leap year
    expect(rowOf('30-days-ago-from-today', 'months', 'March 1')).toEqual([
      'March 1',
      'January 30',
      'January 31',
    ]);
    expect(rowOf('10-days-from-today', 'months', '1 de diciembre', 'es')).toEqual([
      '1 de diciembre',
      '11 de diciembre',
      '11 de diciembre',
    ]);
    // 6 months from the last day of August is February 28, 29 in a leap year
    expect(rowOf('6-months-from-today', 'months', 'August 31')).toEqual([
      'August 31',
      'February 28',
      'February 29',
      '181',
    ]);
    expect(rowOf('6-months-from-today', 'months', 'March 31')).toEqual([
      'March 31',
      'September 30',
      'September 30',
      '183',
    ]);
  });

  it('count the weekday it lands on and the workdays of the span by starting weekday', () => {
    expect(sectionOf('28-days-from-today', 'weekdays').table?.rows).toHaveLength(7);
    expect(rowOf('28-days-from-today', 'weekdays', 'Monday')).toEqual([
      'Monday',
      'Monday',
      '20',
      '160',
    ]);
    // 10 days from a Monday land on a Thursday, with 8 weekdays; from a Friday, a Monday with 6
    expect(rowOf('10-days-from-today', 'weekdays', 'Monday')).toEqual([
      'Monday',
      'Thursday',
      '8',
      '64',
    ]);
    expect(rowOf('10-days-from-today', 'weekdays', 'Friday')).toEqual([
      'Friday',
      'Monday',
      '6',
      '48',
    ]);
    // 30 days before a Wednesday is a Monday, with 22 weekdays
    expect(rowOf('30-days-ago-from-today', 'weekdays', 'miércoles', 'es')).toEqual([
      'miércoles',
      'lunes',
      '22',
      '176',
    ]);
  });

  it('work the figures out step by step', () => {
    const ago = textOf(sectionOf('30-days-ago-from-today', 'worked'));
    expect(ago).toContain('March 1');
    expect(ago).toContain('January 30');
    expect(textOf(sectionOf('6-months-from-today', 'worked'))).toContain('February 28');
    expect(textOf(sectionOf('6-months-from-today', 'worked'))).toContain('February 29');
    expect(textOf(sectionOf('28-days-from-today', 'worked'))).toContain('28 = 4 × 7');
  });

  it('read a week, less than a week and one month in their own words', () => {
    expect(longTailPageOf(jobOf('7-days-from-today'), 'en').title).toMatch(
      /^7 days from today: 1 week, the same weekday/,
    );
    expect(longTailPageOf(jobOf('7-days-from-today'), 'es').title).toMatch(
      /^7 días a partir de hoy: 1 semana, el mismo día de la semana/,
    );
    expect(longTailPageOf(jobOf('5-days-from-today'), 'en').lead).toContain(
      'less than a week, so the weekday moves 5 on (from a Monday, a Saturday)',
    );
    const one = longTailPageOf(jobOf('1-month-from-today'), 'en');
    expect(one.h1).toBe('What is the date 1 month from today?');
    expect(one.figure).toBe('+1 month');
    expect(longTailPageOf(jobOf('1-month-from-today'), 'es').h1).toBe(
      '¿Qué fecha es 1 mes a partir de hoy?',
    );
    for (const job of DAYS_FROM) {
      for (const lang of LANGS) {
        const page = longTailPageOf(job, lang);
        const text = [page.title, page.lead, ...(page.sections ?? []).map(textOf)].join(' ');
        expect(text).not.toMatch(/\b1 (weeks|months|semanas|meses)\b|\b0 weeks|\b0 semanas/);
      }
    }
  });

  it('give the hand-verified dates of the longer spans', () => {
    // 90 days from January 1 is April 1, March 31 in a leap year
    expect(rowOf('90-days-from-today', 'months', 'January 1')).toEqual([
      'January 1',
      'April 1',
      'March 31',
    ]);
    // 365 days from January 1 is January 1 of the next year, December 31 when it is a leap year
    expect(rowOf('365-days-from-today', 'months', 'January 1')).toEqual([
      'January 1',
      'January 1',
      'December 31',
    ]);
    expect(longTailPageOf(jobOf('365-days-from-today'), 'en').lead).toContain(
      'it is January 15 of the next year',
    );
    // January 15 is day 15: 15 + 45 = 60, March 1
    const fortyFive = textOf(sectionOf('45-days-from-today', 'worked'));
    expect(fortyFive).toContain('15 + 45 = 60');
    expect(fortyFive).toContain('March 1');
    // 5 days from January 29: 2 days left in January, 5 - 2 = 3, February 3
    expect(textOf(sectionOf('5-days-from-today', 'worked'))).toContain(
      '5 − 2 = 3, so the date is February 3',
    );
    // a month from January 31 is February 28, 29 in a leap year, 28 days on
    expect(rowOf('1-month-from-today', 'months', 'January 31')).toEqual([
      'January 31',
      'February 28',
      'February 29',
      '28',
    ]);
    expect(rowOf('3-months-from-today', 'months', 'November 30')).toEqual([
      'November 30',
      'February 28',
      'February 29',
      '90',
    ]);
    expect(rowOf('12-months-from-today', 'months', 'January 31')).toEqual([
      'January 31',
      'January 31',
      'January 31',
      '365',
    ]);
    const three = longTailPageOf(jobOf('3-months-from-today'), 'en');
    expect(three.rows.find(({ key }) => key === 'days')?.value).toBe('89 to 92');
    expect(three.rows.find(({ key }) => key === 'clamp')?.label).toBe('From November 30');
    expect(three.rows.find(({ key }) => key === 'work')?.value).toBe('520');
    expect(longTailPageOf(jobOf('12-months-from-today'), 'en').rows).toContainEqual({
      key: 'clamp',
      label: 'From February 29',
      value: 'February 28',
    });
    expect(textOf(sectionOf('3-months-from-today', 'worked'))).toContain(
      'March 15 + 3 months = June 15',
    );
    expect(textOf(sectionOf('3-months-from-today', 'work'))).toContain('about 13 weeks');
    // 14 days from a Monday hold 10 weekdays, always
    expect(rowOf('14-days-from-today', 'weekdays', 'Thursday')).toEqual([
      'Thursday',
      'Thursday',
      '10',
      '80',
    ]);
  });

  it('give every page its sections with no broken figure, and its own context', () => {
    const contexts = new Set<string>();
    for (const job of DAYS_FROM) {
      for (const lang of LANGS) {
        const page = longTailPageOf(job, lang);
        expect(page.sections?.[0]?.heading).toBe(
          lang === 'en' ? 'How the figures are worked out' : 'Cómo se calcula',
        );
        for (const section of page.sections ?? []) {
          expect(textOf(section)).not.toMatch(/undefined|NaN|Infinity/);
        }
        contexts.add(textOf(sectionOf(job.slug.en, 'work', lang)));
      }
    }
    expect(contexts.size).toBe(DAYS_FROM.length * 2);
    expect(textOf(sectionOf('6-months-from-today', 'work'))).toContain('1,040 hours');
  });

  it('link the hours calculator and the other spans, and are all linked from it', () => {
    for (const job of DAYS_FROM) {
      for (const lang of LANGS) {
        const page = longTailPageOf(job, lang);
        expect(page.calculator.href).toBe(HOURS_PATHS[lang]);
        expect(page.others.links).toHaveLength(6);
        const group = job.unit === 'month' ? MONTHS_FROM_TODAY : DAYS_FROM_TODAY;
        const hrefs = new Set(group.map((each) => pathOf(each, lang)));
        for (const { href } of page.others.links) expect(hrefs.has(href)).toBe(true);
      }
    }
    for (const lang of LANGS) {
      expect(commonLinksOf('days-from', lang).links.map(({ href }) => href)).toEqual(
        DAYS_FROM.map((job) => pathOf(job, lang)),
      );
    }
    const titles = DAYS_FROM.flatMap((job) => LANGS.map((lang) => longTailPageOf(job, lang).title));
    expect(new Set(titles).size).toBe(titles.length);
  });
});
