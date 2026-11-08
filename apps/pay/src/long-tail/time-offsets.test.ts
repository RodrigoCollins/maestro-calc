import { describe, expect, it } from 'vitest';
import { HOURS_PATHS } from '../hours/texts.ts';
import { commonLinksOf, LONG_TAIL_ROUTES, longTailPageOf } from './jobs.ts';
import { MINUTES, pathOf, SHIFTS, TIME_OFFSETS, type TimeOffset } from './routes.ts';
import { SOURCES, type LongTailSection } from './sections.ts';

const LANGS = ['en', 'es'] as const;

const offsetOf = (slug: string): TimeOffset => {
  const job = TIME_OFFSETS.find((candidate) => candidate.slug.en === slug);
  if (job === undefined) throw new Error(`no time offset ${slug}`);
  return job;
};

const sectionOf = (slug: string, id: string, lang: 'en' | 'es' = 'en'): LongTailSection => {
  const section = longTailPageOf(offsetOf(slug), lang).sections?.find((each) => each.id === id);
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

const rowOf = (slug: string, first: string, lang: 'en' | 'es' = 'en'): readonly string[] => {
  const row = sectionOf(slug, 'clock', lang).table?.rows.find(([cell]) => cell === first);
  if (row === undefined) throw new Error(`no row ${first} on ${slug}`);
  return row;
};

describe('hours ago and minutes from now long-tail pages', () => {
  it('cover the offsets people ask the time of', () => {
    expect(TIME_OFFSETS.map(({ slug }) => slug)).toEqual([
      { en: '8-hours-ago', es: 'hace-8-horas' },
      { en: '9-hours-ago', es: 'hace-9-horas' },
      { en: '13-hours-ago', es: 'hace-13-horas' },
      { en: '15-hours-ago', es: 'hace-15-horas' },
      { en: '15-minutes-from-now', es: 'dentro-de-15-minutos' },
      { en: '30-minutes-from-now', es: 'dentro-de-30-minutos' },
    ]);
    for (const job of TIME_OFFSETS) {
      expect(LONG_TAIL_ROUTES.map(({ en }) => en)).toContain(`/pay/${job.slug.en}`);
      expect(LONG_TAIL_ROUTES.map(({ es }) => es)).toContain(`/es/pago/${job.slug.es}`);
    }
  });

  it('answer first with the rule that holds at any time, never a time of the build', () => {
    const fifteen = longTailPageOf(offsetOf('15-hours-ago'), 'en');
    expect(fifteen.h1).toBe('What time was it 15 hours ago?');
    expect(fifteen.title).toMatch(
      /^15 hours ago: the clock minus 15 h, or plus 9 h the day before/,
    );
    expect(fifteen.figure).toBe('−15 h');
    expect(fifteen.lead).toContain('From 3:00 pm on, it is the same day');
    expect(fifteen.lead).toContain('at 6:00 am, 15 hours ago was 3:00 pm yesterday');
    const quince = longTailPageOf(offsetOf('15-hours-ago'), 'es');
    expect(quince.h1).toBe('¿Qué hora era hace 15 horas?');
    expect(quince.title).toMatch(/^Hace 15 horas: tu hora menos 15 h, o más 9 h el día anterior/);
    const thirty = longTailPageOf(offsetOf('30-minutes-from-now'), 'en');
    expect(thirty.h1).toBe('What time will it be 30 minutes from now?');
    expect(thirty.title).toMatch(/^30 minutes from now: the clock plus 30 min, 0.5 hours/);
    expect(thirty.figure).toBe('+30 min');
    expect(thirty.lead).toContain('at 11:45 pm, 30 minutes from now is 12:15 am tomorrow');
    expect(longTailPageOf(offsetOf('30-minutes-from-now'), 'es').h1).toBe(
      '¿Qué hora será dentro de 30 minutos?',
    );
  });

  it('give the client script the signed minutes and the sentences to fill', () => {
    const fifteen = longTailPageOf(offsetOf('15-hours-ago'), 'en');
    expect(fifteen.live?.kind).toBe('offset');
    expect(fifteen.live?.data['amount']).toBe('-900');
    expect(fifteen.live?.data['before']).toContain('{time}');
    expect(fifteen.live?.fallback).toContain('Subtract 15 hours');
    expect(longTailPageOf(offsetOf('15-minutes-from-now'), 'es').live?.data['amount']).toBe('15');
    for (const job of TIME_OFFSETS) {
      for (const lang of LANGS) {
        const { live } = longTailPageOf(job, lang);
        // no time or date of the build: the fallback is an instruction
        expect(live?.fallback).not.toMatch(/\d{4}/);
        for (const key of ['before', 'same', 'after']) expect(live?.data[key]).toContain('{time}');
      }
    }
  });

  it('give the hand-verified times from each hour of the day', () => {
    expect(sectionOf('15-hours-ago', 'clock').table?.rows).toHaveLength(24);
    // 5:00 pm - 15 h = 2:00 am, the same day; 3:00 am - 8 h = 7:00 pm, the day before
    expect(rowOf('15-hours-ago', '5:00 pm')).toEqual(['5:00 pm', '2:00 am', 'same day']);
    expect(rowOf('8-hours-ago', '3:00 am')).toEqual(['3:00 am', '7:00 pm', 'previous day']);
    expect(rowOf('8-hours-ago', '8:00 am')).toEqual(['8:00 am', '12:00 am', 'same day']);
    expect(rowOf('13-hours-ago', '12:00 am')).toEqual(['12:00 am', '11:00 am', 'previous day']);
    expect(rowOf('9-hours-ago', '3:00 am', 'es')).toEqual(['3:00 am', '6:00 pm', 'día anterior']);
    // 11:45 pm + 30 min = 12:15 am, the next day; 11:40 pm + 15 min = 11:55 pm
    expect(rowOf('30-minutes-from-now', '11:45 pm')).toEqual(['11:45 pm', '12:15 am', 'next day']);
    expect(rowOf('15-minutes-from-now', '11:40 pm')).toEqual(['11:40 pm', '11:55 pm', 'same day']);
    expect(rowOf('15-minutes-from-now', '11:45 pm')).toEqual(['11:45 pm', '12:00 am', 'next day']);
  });

  it('work the figures out step by step and cover the other direction', () => {
    const worked = textOf(sectionOf('15-hours-ago', 'worked'));
    expect(worked).toContain('17:00 − 15:00 = 2:00');
    expect(worked).toContain('6:00 + 24:00 − 15:00 = 15:00');
    expect(worked).toContain('24 − 15 = 9');
    expect(textOf(sectionOf('15-hours-ago', 'opposite'))).toContain('15 hours from now');
    expect(textOf(sectionOf('15-hours-ago', 'opposite'))).toContain('from 9:00 am on');
    expect(textOf(sectionOf('30-minutes-from-now', 'worked'))).toContain('2:45 pm + 30 min');
    expect(textOf(sectionOf('30-minutes-from-now', 'opposite'))).toContain('30 minutes ago');
  });

  it('set each amount in a working day of its own, with its sources', () => {
    expect(textOf(sectionOf('15-hours-ago', 'work'))).toContain('end of a 9-to-5 shift');
    expect(textOf(sectionOf('8-hours-ago', 'work'))).toContain('9:00 am');
    const nineToFive = SHIFTS.find(({ start, end }) => start === 540 && end === 1020);
    if (nineToFive === undefined) throw new Error('no 9-to-5 shift');
    expect(sectionOf('15-hours-ago', 'work').links?.map(({ href }) => href)).toContain(
      pathOf(nineToFive, 'en'),
    );
    expect(textOf(sectionOf('15-minutes-from-now', 'work'))).toContain('29 CFR 785.18');
    expect(textOf(sectionOf('30-minutes-from-now', 'work'))).toContain('29 CFR 785.19');
    const thirtyMinutes = MINUTES.find(({ minutes }) => minutes === 30);
    if (thirtyMinutes === undefined) throw new Error('no 30 minutes page');
    expect(sectionOf('30-minutes-from-now', 'work', 'es').links?.map(({ href }) => href)).toContain(
      pathOf(thirtyMinutes, 'es'),
    );
    expect(longTailPageOf(offsetOf('15-hours-ago'), 'en').sources).toEqual([SOURCES.factSheet23]);
    expect(longTailPageOf(offsetOf('15-minutes-from-now'), 'en').sources).toContain(SOURCES.ecfr48);
  });

  it('give every page its sections with no broken figure, in both languages', () => {
    for (const job of TIME_OFFSETS) {
      for (const lang of LANGS) {
        const page = longTailPageOf(job, lang);
        expect(page.sections?.[0]?.heading).toBe(
          lang === 'en' ? 'How the figures are worked out' : 'Cómo se calcula',
        );
        for (const section of page.sections ?? []) {
          expect(textOf(section)).not.toMatch(/undefined|NaN|Infinity/);
        }
      }
    }
  });

  it('link the hours calculator and the other offsets, and are all linked from it', () => {
    for (const job of TIME_OFFSETS) {
      for (const lang of LANGS) {
        const page = longTailPageOf(job, lang);
        expect(page.calculator.href).toBe(HOURS_PATHS[lang]);
        expect(page.others.links).toHaveLength(TIME_OFFSETS.length - 1);
        expect(page.others.links.map(({ href }) => href)).not.toContain(page.paths[lang]);
      }
    }
    for (const lang of LANGS) {
      expect(commonLinksOf('time-offset', lang).links.map(({ href }) => href)).toEqual(
        TIME_OFFSETS.map((job) => pathOf(job, lang)),
      );
    }
    const titles = TIME_OFFSETS.flatMap((job) =>
      LANGS.map((lang) => longTailPageOf(job, lang).title),
    );
    expect(new Set(titles).size).toBe(titles.length);
  });
});
