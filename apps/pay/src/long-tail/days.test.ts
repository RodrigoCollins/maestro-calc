import { describe, expect, it } from 'vitest';
import { HOURS_PATHS } from '../hours/texts.ts';
import { commonLinksOf, LONG_TAIL_ROUTES, longTailPageOf } from './jobs.ts';
import { DAYS, type Days } from './routes.ts';
import { SOURCES, type LongTailSection } from './sections.ts';

const LANGS = ['en', 'es'] as const;

const daysOf = (hours: number): Days => {
  const job = DAYS.find((candidate) => candidate.hours === hours);
  if (job === undefined) throw new Error(`no days job of ${String(hours)}`);
  return job;
};

const rowOf = (hours: number, key: string, lang: 'en' | 'es' = 'en'): string => {
  const row = longTailPageOf(daysOf(hours), lang).rows.find((r) => r.key === key);
  if (row === undefined) throw new Error(`no row ${key}`);
  return row.value;
};

const sectionOf = (hours: number, id: string, lang: 'en' | 'es' = 'en'): LongTailSection => {
  const section = longTailPageOf(daysOf(hours), lang).sections?.find((each) => each.id === id);
  if (section === undefined) throw new Error(`no section ${id} on ${String(hours)} hours`);
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

describe('hours in days long-tail pages', () => {
  it('cover the hours people ask the days of, in ascending order', () => {
    expect(DAYS.map(({ hours }) => hours)).toEqual([
      24, 36, 48, 72, 96, 100, 120, 168, 200, 300, 400, 500, 1000, 1500, 2000, 3000, 10000,
    ]);
  });

  it('write their paths in the style of the other long-tail pages', () => {
    expect(longTailPageOf(daysOf(72), 'en').paths).toEqual({
      en: '/pay/how-many-days-is-72-hours',
      es: '/es/pago/cuantos-dias-son-72-horas',
    });
    for (const job of DAYS) {
      expect(LONG_TAIL_ROUTES.map(({ en }) => en)).toContain(longTailPageOf(job, 'en').paths.en);
    }
  });

  it('answer first, in the title, the heading and the lead', () => {
    const seventyTwo = longTailPageOf(daysOf(72), 'en');
    expect(seventyTwo.h1).toBe('How many days is 72 hours?');
    expect(seventyTwo.title).toBe('72 hours is 3 days | Cuenta Horas');
    expect(seventyTwo.figure).toBe('3');
    expect(seventyTwo.lead).toBe(
      '72 hours is exactly 3 days: the hours divided by 24, the hours of a calendar day. As working time, it is 9 workdays of 8 hours, or 1.8 workweeks of 40 hours.',
    );
    const setentaYDos = longTailPageOf(daysOf(72), 'es');
    expect(setentaYDos.h1).toBe('¿Cuántos días son 72 horas?');
    expect(setentaYDos.title).toBe('72 horas son 3 días | Cuenta Horas');
    expect(setentaYDos.lead).toBe(
      '72 horas son exactamente 3 días: las horas divididas por 24, las horas de un día de calendario. Como tiempo de trabajo, son 9 jornadas de 8 horas, o 1.8 semanas laborales de 40 horas.',
    );
    // 100 / 24 = 4.1666..., 4 days and 4 hours
    const hundred = longTailPageOf(daysOf(100), 'en');
    expect(hundred.title).toBe('100 hours is 4.17 days (4 days 4 hours) | Cuenta Horas');
    expect(hundred.figure).toBe('4.17');
    expect(hundred.lead).toBe(
      '100 hours is 4.17 days, or 4 days and 4 hours: the hours divided by 24, rounded to two places. As working time, it is 12.5 workdays of 8 hours, or 2.5 workweeks of 40 hours.',
    );
    expect(longTailPageOf(daysOf(100), 'es').title).toBe(
      '100 horas son 4.17 días (4 días y 4 horas) | Cuenta Horas',
    );
    // 10,000 / 24 = 416.666...
    expect(longTailPageOf(daysOf(10000), 'en').title).toBe(
      '10,000 hours is 416.67 days (416 days 16 hours) | Cuenta Horas',
    );
    expect(longTailPageOf(daysOf(3000), 'en').title).toBe('3,000 hours is 125 days | Cuenta Horas');
  });

  it('give the hand-verified rows', () => {
    expect(rowOf(72, 'split')).toBe('3 days');
    expect(rowOf(72, 'minutes')).toBe('4,320');
    expect(rowOf(72, 'workdays')).toBe('9');
    expect(rowOf(72, 'workweeks')).toBe('1.8');
    // 72 / 2,080 = 0.0346
    expect(rowOf(72, 'years')).toBe('0.03');
    // 1,000 = 5 x 168 + 6 x 24 + 16
    expect(rowOf(1000, 'split')).toBe('5 weeks, 6 days and 16 hours');
    expect(rowOf(1000, 'split', 'es')).toBe('5 semanas, 6 días y 16 horas');
    expect(rowOf(1000, 'workdays')).toBe('125');
    expect(rowOf(1000, 'workweeks')).toBe('25');
    expect(rowOf(1000, 'years')).toBe('0.48');
    // 10,000 = 59 x 168 + 3 x 24 + 16; 10,000 / 2,080 = 4.8077
    expect(rowOf(10000, 'split')).toBe('59 weeks, 3 days and 16 hours');
    expect(rowOf(10000, 'years')).toBe('4.81');
    expect(rowOf(10000, 'minutes')).toBe('600,000');
    // 3,000 = 17 x 168 + 6 x 24
    expect(rowOf(3000, 'split')).toBe('17 weeks and 6 days');
    expect(rowOf(2000, 'years')).toBe('0.96');
    expect(rowOf(200, 'split')).toBe('1 week, 1 day and 8 hours');
    expect(rowOf(200, 'split', 'es')).toBe('1 semana, 1 día y 8 horas');
  });

  it('work the figures out step by step', () => {
    const hundred = textOf(sectionOf(100, 'worked'));
    expect(hundred).toContain('100 ÷ 24 = 4.1667… days');
    expect(hundred).toContain(
      '4 whole days are 96 hours (4 × 24), and 100 − 96 = 4 hours are left',
    );
    expect(hundred).toContain('100 × 60 = 6,000 minutes, or 360,000 seconds');
    expect(hundred).toContain('100 ÷ 8 = 12.5 workdays');
    expect(hundred).toContain('100 ÷ 40 = 2.5 workweeks');
    expect(textOf(sectionOf(72, 'worked'))).toContain('72 ÷ 24 = 3 days');
    const thousand = textOf(sectionOf(1000, 'worked'));
    expect(thousand).toContain('1,000 ÷ 168 = 5 whole weeks (840 hours)');
    expect(thousand).toContain('the 160 hours left are 6 days (144 hours) and 16 hours');
    expect(textOf(sectionOf(72, 'worked'))).not.toContain('÷ 168');
  });

  it('count the same hours on the clock and as working time', () => {
    // Monday 9:00 am + 72 h = Thursday 9:00 am; 9 workdays from a Monday end on the next Thursday
    const seventyTwo = textOf(sectionOf(72, 'calendar'));
    expect(seventyTwo).toContain(
      'from a Monday at 9:00 am, they end 3 days later, on Thursday at 9:00 am',
    );
    expect(seventyTwo).toContain('9 workdays');
    expect(seventyTwo).toContain('take 11 calendar days with the weekend');
    expect(seventyTwo).toContain('to the Thursday of the next week');
    // 9 + 100 = 109 = 4 x 24 + 13: Friday 1:00 pm; 13 workdays, the last of 4 hours, 17 days
    const hundred = textOf(sectionOf(100, 'calendar'));
    expect(hundred).toContain('they end 4 days later, on Friday at 1:00 pm');
    expect(hundred).toContain('13 workdays, the last one of 4 hours');
    expect(hundred).toContain('take 17 calendar days');
    expect(hundred).toContain('to the Wednesday of week 3');
    // 125 workdays: 24 full weeks and 5 days, 173 calendar days
    expect(textOf(sectionOf(1000, 'calendar'))).toContain('take 173 calendar days');
    // 9 + 10,000 = 10,009 = 417 x 24 + 1; 417 days from a Monday is a Friday
    expect(textOf(sectionOf(10000, 'calendar'))).toContain(
      'they end 417 days later, on Friday at 1:00 am',
    );
    expect(textOf(sectionOf(72, 'calendar', 'es'))).toContain(
      'desde un lunes a las 9:00 a. m., terminan 3 días después, el jueves a las 9:00 a. m.',
    );
    expect(textOf(sectionOf(100, 'calendar', 'es'))).toContain(
      'el viernes a las 13:00 (1:00 p. m.)',
    );
  });

  it('price the hours as weeks of work and their overtime under the federal rule', () => {
    // one week of 72 hours: 32 past 40
    expect(textOf(sectionOf(72, 'weeks'))).toContain('32 hours of overtime');
    // 72 at 45 a week: 1 week of 45 (5 over) and 27; at 50: 1 of 50 (10 over) and 22
    expect(sectionOf(72, 'weeks').table?.rows).toEqual([
      ['40', '1.8', '0'],
      ['45', '1.6', '5'],
      ['50', '1.44', '10'],
      ['60', '1.2', '20'],
    ]);
    // 1,000 at 45: 22 weeks (110 over) and 10 hours; at 60: 16 weeks (320 over) and 40 hours
    expect(sectionOf(1000, 'weeks').table?.rows).toEqual([
      ['40', '25', '0'],
      ['45', '22.22', '110'],
      ['50', '20', '200'],
      ['60', '16.67', '320'],
    ]);
    expect(textOf(sectionOf(1000, 'weeks'))).toContain('more than one week holds (168 hours)');
  });

  it('count the shifts that make the hours', () => {
    expect(sectionOf(72, 'shifts').table?.rows).toEqual([
      ['8', '9', '1.8'],
      ['10', '7.2', '1.44'],
      ['12', '6', '1.2'],
    ]);
  });

  it('give the large amounts in work years at the full-time lines', () => {
    // 10,000 / 1,560 = 6.41; / 1,820 = 5.49; / 2,080 = 4.81; / 8,760 = 1.14
    const years = sectionOf(10000, 'years');
    expect(years.table?.rows).toEqual([
      ['30 (IRS full time)', '1,560', '6.41'],
      ['35 (BLS full time)', '1,820', '5.49'],
      ['40', '2,080', '4.81'],
    ]);
    expect(textOf(years)).toContain('10,000 hours is 4.81 of those years');
    expect(textOf(years)).toContain('1.14 calendar years of 8,760 hours');
    expect(longTailPageOf(daysOf(10000), 'en').sources).toEqual([
      SOURCES.factSheet23,
      SOURCES.irsFullTime,
      SOURCES.blsCps,
    ]);
    for (const hours of [1000, 1500, 2000, 3000, 10000]) {
      expect(longTailPageOf(daysOf(hours), 'en').sections?.map(({ id }) => id)).toContain('years');
    }
    for (const hours of [48, 72, 500]) {
      const page = longTailPageOf(daysOf(hours), 'en');
      expect(page.sections?.map(({ id }) => id)).not.toContain('years');
      expect(page.sources).toEqual([SOURCES.factSheet23]);
    }
  });

  it('write one day, one week and the hours under a workweek in good grammar', () => {
    // 24 / 24 = 1; 9 + 24 = 33 = 24 + 9: Tuesday 9:00 am; 3 workdays from a Monday: Wednesday
    const one = longTailPageOf(daysOf(24), 'en');
    expect(one.title).toBe('24 hours is 1 day | Cuenta Horas');
    expect(one.lead).toMatch(/^24 hours is exactly 1 day: /);
    expect(longTailPageOf(daysOf(24), 'es').title).toBe('24 horas son 1 día | Cuenta Horas');
    const clock = textOf(sectionOf(24, 'calendar'));
    expect(clock).toContain('they end 1 day later, on Tuesday at 9:00 am');
    expect(clock).toContain(
      'take 3 calendar days: from a Monday to the Wednesday of the same week',
    );
    expect(textOf(sectionOf(24, 'calendar', 'es'))).toContain(
      'llevan 3 días de calendario: desde un lunes hasta el miércoles de la misma semana',
    );
    // 36 / 24 = 1.5, 1 day and 12 hours; 9 + 36 = 45 = 24 + 21: Tuesday 9:00 pm
    const half = longTailPageOf(daysOf(36), 'en');
    expect(half.title).toBe('36 hours is 1.5 days (1 day 12 hours) | Cuenta Horas');
    expect(textOf(sectionOf(36, 'calendar'))).toContain('on Tuesday at 9:00 pm');
    expect(textOf(sectionOf(36, 'calendar', 'es'))).toContain(
      'terminan 1 día después, el martes a las 21:00 (9:00 p. m.)',
    );
    // 36 is under 40: no overtime in one week
    const weeks = textOf(sectionOf(36, 'weeks'));
    expect(weeks).toContain('none of them is overtime');
    expect(weeks).not.toMatch(/−|-\d/);
    expect(sectionOf(36, 'weeks').table?.rows).toEqual([
      ['40', '0.9', '0'],
      ['45', '0.8', '0'],
      ['50', '0.72', '0'],
      ['60', '0.6', '0'],
    ]);
    expect(textOf(sectionOf(24, 'worked'))).toContain(
      'That is 1 whole day: 1 × 24 = 24 hours, with no hours left.',
    );
    expect(textOf(sectionOf(24, 'worked', 'es'))).toContain(
      'Es 1 día entero: 1 × 24 = 24 horas, sin horas de sobra.',
    );
    expect(textOf(sectionOf(36, 'worked'))).toContain(
      '1 whole day is 24 hours (1 × 24), and 36 − 24 = 12 hours are left.',
    );
    expect(textOf(sectionOf(36, 'worked', 'es'))).toContain(
      '1 día entero son 24 horas (1 × 24), y quedan 36 − 24 = 12 horas.',
    );
    // 168 = 1 week exactly
    const week = textOf(sectionOf(168, 'worked'));
    expect(week).toContain('168 ÷ 168 = 1 whole week (168 hours), with no hours left');
    expect(rowOf(168, 'split')).toBe('1 week');
    expect(longTailPageOf(daysOf(168), 'en').title).toBe('168 hours is 7 days | Cuenta Horas');
    expect(longTailPageOf(daysOf(120), 'es').title).toBe('120 horas son 5 días | Cuenta Horas');
  });

  it('count the time first and leave the US overtime rule for last, labelled in Spanish', () => {
    for (const job of DAYS) {
      const ids = longTailPageOf(job, 'es').sections?.map(({ id }) => id) ?? [];
      expect(ids.slice(0, 4)).toEqual(['worked', 'calendar', 'shifts', 'weeks']);
    }
    const es = longTailPageOf(daysOf(72), 'es');
    expect(es.note).toContain('ley federal de EE. UU.');
    expect(sectionOf(72, 'weeks', 'es').heading).toBe(
      'Horas extra en EE. UU.: 72 horas a 40, 45, 50 y 60 horas por semana',
    );
    expect(textOf(sectionOf(72, 'weeks', 'es'))).toMatch(/^En EE\. UU\., /);
    expect(textOf(sectionOf(1000, 'weeks', 'es'))).toContain('En EE. UU., la FLSA');
    expect(textOf(sectionOf(1000, 'years', 'es'))).toContain('En EE. UU., el IRS');
  });

  it('give every page its sections with no broken figure, in both languages', () => {
    for (const job of DAYS) {
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

  it('link the hours calculator and the six nearest other amounts', () => {
    for (const job of DAYS) {
      for (const lang of LANGS) {
        const page = longTailPageOf(job, lang);
        expect(page.calculator.href).toBe(HOURS_PATHS[lang]);
        expect(page.others.links).toHaveLength(6);
        expect(page.others.links.map(({ href }) => href)).not.toContain(page.paths[lang]);
      }
    }
    expect(longTailPageOf(daysOf(24), 'en').others.links.map(({ href }) => href)).toEqual(
      [36, 48, 72, 96, 100, 120].map((h) => `/pay/how-many-days-is-${String(h)}-hours`),
    );
  });

  it('are all linked from the hours calculator, and each has its own title', () => {
    for (const lang of LANGS) {
      expect(commonLinksOf('days', lang).links.map(({ href }) => href)).toEqual(
        DAYS.map((job) => longTailPageOf(job, lang).paths[lang]),
      );
    }
    const titles = DAYS.flatMap((job) => LANGS.map((lang) => longTailPageOf(job, lang).title));
    expect(new Set(titles).size).toBe(titles.length);
  });
});
