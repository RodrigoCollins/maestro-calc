import { describe, expect, it } from 'vitest';
import { HOURS_PATHS } from '../hours/texts.ts';
import { commonLinksOf, LONG_TAIL_ROUTES, longTailPageOf } from './jobs.ts';
import { DAYS_FROM, pathOf, type DaysFrom } from './routes.ts';
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
    expect(DAYS_FROM.map(({ slug }) => slug)).toEqual([
      { en: '10-days-from-today', es: '10-dias-a-partir-de-hoy' },
      { en: '28-days-from-today', es: '28-dias-a-partir-de-hoy' },
      { en: '30-days-from-today', es: '30-dias-a-partir-de-hoy' },
      { en: '30-days-ago-from-today', es: 'hace-30-dias' },
      { en: '6-months-from-today', es: '6-meses-a-partir-de-hoy' },
    ]);
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
        expect(page.others.links).toHaveLength(DAYS_FROM.length - 1);
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
