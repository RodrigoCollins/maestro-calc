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
    const hours = Array.from({ length: 24 }, (_, hour) => hour * 60);
    const halves = Array.from({ length: 15 }, (_, i) => (7 + i) * 60 + 30);
    const quarters = [795, 825, 855, 885, 915, 945, 975, 1005];
    expect(UNTILS.map(({ minutes }) => minutes)).toEqual(
      [...hours, ...halves, ...quarters].toSorted((x, y) => x - y),
    );
    expect(untilOf(900).slug.en).toBe('how-long-until-3-00-pm');
    expect(untilOf(900).slug.es).toBe('cuanto-falta-para-las-3-00-pm');
    expect(untilOf(0).slug.es).toBe('cuanto-falta-para-las-12-00-am');
    expect(untilOf(450).slug.en).toBe('how-long-until-7-30-am');
    expect(untilOf(1005).slug.es).toBe('cuanto-falta-para-las-4-45-pm');
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

  it('pick examples before and after any time of the day', () => {
    // until 7:00 am: from 1:40 am it is 5 h 20 min; from 8:00 pm, 11 h, tomorrow
    const seven = longTailPageOf(untilOf(420), 'en');
    expect(seven.lead).toContain('From 1:40 am that is 5 h 20 min, or 5.33 hours');
    expect(seven.lead).toContain('from 8:00 pm it is 11 h 0 min');
    expect(rowOf(420, '9:00 am')).toEqual(['9:00 am', '22 h 0 min', '22.00', 'tomorrow']);
    // until 11:00 pm: from 11:30 pm the next one is 23 h 30 min away
    const eleven = textOf(sectionOf(1380, 'worked'));
    expect(eleven).toContain('1,380 + 1,440 − 1,410 = 1,410 minutes, 23 h 30 min');
    expect(textOf(sectionOf(1380, 'since'))).toContain('at 11:30 pm it is 0 h 30 min');
    expect(textOf(sectionOf(1380, 'since'))).toContain('at 9:00 am, 10 h 0 min');
    // until 2:00 am from midnight: 2 h; the time since yesterday's at 1:00 am, 23 h
    expect(textOf(sectionOf(120, 'worked'))).toContain('120 − 0 = 120 minutes, 2 h 0 min');
    expect(textOf(sectionOf(120, 'since'))).toContain('at 1:00 am, 23 h 0 min');
    expect(rowOf(1005, '9:00 am', 'es')).toEqual(['9:00 am', '7 h 45 min', '7.75', 'hoy']);
    for (const job of UNTILS) {
      for (const lang of LANGS) {
        const page = longTailPageOf(job, lang);
        const text = [
          page.lead,
          ...(page.sections ?? []).map((section) => section.paragraphs.join(' ')),
        ].join(' ');
        // no count of zero or of more than a day in the examples
        expect(text).not.toMatch(/(?<![\d,])0 h 0 min|\b(2[4-9]|[3-9]\d) h \d+ min/);
      }
    }
  });

  it('set the times with no text of their own in the shifts they start or end', () => {
    // 7:00 am ends the 11 pm and 7 pm night shifts and starts the 7 am to 3 pm one
    expect(sectionOf(420, 'work').links?.map(({ href }) => href)).toEqual([
      pathOf(shiftOf(1380, 420), 'en'),
      pathOf(shiftOf(1140, 420), 'en'),
      pathOf(shiftOf(420, 900), 'en'),
    ]);
    expect(textOf(sectionOf(420, 'work'))).toContain('12 h 0 min');
    expect(textOf(sectionOf(450, 'work'))).toContain('7:23 am to 7:37 am');
    expect(textOf(sectionOf(450, 'work', 'es'))).toContain('29 CFR 785.48');
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
