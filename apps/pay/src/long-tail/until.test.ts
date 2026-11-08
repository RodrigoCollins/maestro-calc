import { describe, expect, it } from 'vitest';
import { HOURS_PATHS } from '../hours/texts.ts';
import { commonLinksOf, LONG_TAIL_ROUTES, longTailPageOf } from './jobs.ts';
import { pathOf, SHIFTS, UNTILS, type Until } from './routes.ts';
import type { LongTailSection } from './sections.ts';

const LANGS = ['en', 'es'] as const;

const untilOf = (minutes: number): Until => {
  const job = UNTILS.find((candidate) => candidate.minutes === minutes);
  if (job === undefined) throw new Error(`no until job at ${String(minutes)}`);
  return job;
};

const sectionOf = (minutes: number, id: string, lang: 'en' | 'es' = 'en'): LongTailSection => {
  const section = longTailPageOf(untilOf(minutes), lang).sections?.find((each) => each.id === id);
  if (section === undefined) throw new Error(`no section ${id} at ${String(minutes)}`);
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

const rowOf = (minutes: number, first: string, lang: 'en' | 'es' = 'en'): readonly string[] => {
  const row = sectionOf(minutes, 'hours', lang).table?.rows.find(([cell]) => cell === first);
  if (row === undefined) throw new Error(`no row ${first} at ${String(minutes)}`);
  return row;
};

const shiftOf = (start: number, end: number) => {
  const shift = SHIFTS.find((each) => each.start === start && each.end === end);
  if (shift === undefined) throw new Error('no such shift');
  return shift;
};

describe('how long until a time of day long-tail pages', () => {
  it('cover the times people count down to, in the order of the day', () => {
    expect(UNTILS.map(({ slug }) => slug.en)).toEqual([
      'how-long-until-12-00-am',
      'how-long-until-12-00-pm',
      'how-long-until-2-15-pm',
      'how-long-until-2-30-pm',
      'how-long-until-2-45-pm',
      'how-long-until-3-00-pm',
      'how-long-until-3-30-pm',
      'how-long-until-4-00-pm',
      'how-long-until-5-00-pm',
    ]);
    expect(untilOf(900).slug.es).toBe('cuanto-falta-para-las-3-00-pm');
    expect(untilOf(0).slug.es).toBe('cuanto-falta-para-las-12-00-am');
    for (const job of UNTILS) {
      expect(LONG_TAIL_ROUTES.map(({ en }) => en)).toContain(pathOf(job, 'en'));
    }
  });

  it('answer first with the subtraction that holds at any time', () => {
    const three = longTailPageOf(untilOf(900), 'en');
    expect(three.h1).toBe('How long until 3:00 pm?');
    expect(three.title).toMatch(/^How long until 3:00 pm: 15:00 minus the time on your clock/);
    expect(three.figure).toBe('15:00 − now');
    expect(three.lead).toContain('From 9:00 am that is 6 h 0 min, or 6.00 hours');
    const tres = longTailPageOf(untilOf(900), 'es');
    expect(tres.h1).toBe('¿Cuánto falta para las 3:00 pm?');
    expect(tres.figure).toBe('15:00 − ahora');
    expect(longTailPageOf(untilOf(0), 'en').figure).toBe('24:00 − now');
    expect(longTailPageOf(untilOf(0), 'en').title).toMatch(/^How long until 12:00 am: 24:00 minus/);
  });

  it('give the client script the target and a sentence for today and for tomorrow', () => {
    for (const job of UNTILS) {
      for (const lang of LANGS) {
        const { live } = longTailPageOf(job, lang);
        expect(live?.kind).toBe('until');
        expect(live?.data['amount']).toBe(String(job.minutes));
        expect(live?.data['today']).toContain('{duration}');
        expect(live?.data['tomorrow']).toContain('{duration}');
        expect(live?.fallback).not.toMatch(/\d{4}/);
      }
    }
  });

  it('give the hand-verified counts from each hour of the day', () => {
    expect(sectionOf(900, 'hours').table?.rows).toHaveLength(24);
    // until 3:00 pm from 9:00 am: 6 h; from 8:00 pm: 19 h, tomorrow
    expect(rowOf(900, '9:00 am')).toEqual(['9:00 am', '6 h 0 min', '6.00', 'today']);
    expect(rowOf(900, '8:00 pm')).toEqual(['8:00 pm', '19 h 0 min', '19.00', 'tomorrow']);
    // until 12:00 am from 6:00 pm: 6 h, at midnight
    expect(rowOf(0, '6:00 pm')).toEqual(['6:00 pm', '6 h 0 min', '6.00', 'tonight']);
    // until 2:15 pm from 9:00 am: 5 h 15 min = 5.25
    expect(rowOf(855, '9:00 am')).toEqual(['9:00 am', '5 h 15 min', '5.25', 'today']);
    // until 2:45 pm from 3:00 pm: 23 h 45 min
    expect(rowOf(885, '3:00 pm', 'es')).toEqual(['3:00 pm', '23 h 45 min', '23.75', 'mañana']);
    expect(rowOf(1020, '9:00 am')).toEqual(['9:00 am', '8 h 0 min', '8.00', 'today']);
  });

  it('work the figures out step by step', () => {
    const worked = textOf(sectionOf(900, 'worked'));
    expect(worked).toContain('15:00, which is 900 minutes after midnight');
    expect(worked).toContain('900 − 580 = 320 minutes, 5 h 20 min');
    expect(worked).toContain('900 + 1,440 − 1,200 = 1,140 minutes');
    expect(textOf(sectionOf(0, 'worked'))).toContain('1,440 minutes');
  });

  it('set each time in a working day of its own, linking the shift it ends or starts', () => {
    expect(textOf(sectionOf(1020, 'work'))).toContain('9-to-5');
    expect(sectionOf(1020, 'work').links?.map(({ href }) => href)).toContain(
      pathOf(shiftOf(540, 1020), 'en'),
    );
    expect(sectionOf(960, 'work').links?.map(({ href }) => href)).toContain(
      pathOf(shiftOf(480, 960), 'en'),
    );
    expect(sectionOf(0, 'work', 'es').links?.map(({ href }) => href)).toContain(
      pathOf(shiftOf(960, 0), 'es'),
    );
    const contexts = UNTILS.map((job) => textOf(sectionOf(job.minutes, 'work')));
    expect(new Set(contexts).size).toBe(UNTILS.length);
  });

  it('give every page its sections with no broken figure, in both languages', () => {
    for (const job of UNTILS) {
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

  it('link the hours calculator and the six nearest times, and are all linked from it', () => {
    for (const job of UNTILS) {
      for (const lang of LANGS) {
        const page = longTailPageOf(job, lang);
        expect(page.calculator.href).toBe(HOURS_PATHS[lang]);
        expect(page.others.links).toHaveLength(6);
        expect(page.others.links.map(({ href }) => href)).not.toContain(page.paths[lang]);
      }
    }
    for (const lang of LANGS) {
      expect(commonLinksOf('until', lang).links.map(({ href }) => href)).toEqual(
        UNTILS.map((job) => pathOf(job, lang)),
      );
    }
    const titles = UNTILS.flatMap((job) => LANGS.map((lang) => longTailPageOf(job, lang).title));
    expect(new Set(titles).size).toBe(titles.length);
  });
});
