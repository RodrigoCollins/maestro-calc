import { describe, expect, it } from 'vitest';
import { HOURS_PATHS } from '../hours/texts.ts';
import { commonLinksOf, LONG_TAIL_ROUTES, longTailPageOf } from './jobs.ts';
import {
  HOURS_AGO,
  HOURS_FROM_NOW,
  MINUTES,
  MINUTES_FROM_NOW,
  pathOf,
  SHIFTS,
  TIME_OFFSETS,
  type TimeOffset,
} from './routes.ts';
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
    const hours = [...Array.from({ length: 24 }, (_, i) => i + 1), 36, 48, 72];
    expect(HOURS_AGO.map(({ amount }) => amount)).toEqual(hours);
    expect(HOURS_FROM_NOW.map(({ amount }) => amount)).toEqual(hours);
    expect(MINUTES_FROM_NOW.map(({ amount }) => amount)).toEqual([
      5, 10, 15, 20, 25, 30, 40, 45, 50, 90,
    ]);
    expect(TIME_OFFSETS).toEqual([...HOURS_AGO, ...HOURS_FROM_NOW, ...MINUTES_FROM_NOW]);
    expect(offsetOf('15-hours-ago').slug.es).toBe('hace-15-horas');
    expect(offsetOf('1-hour-ago').slug.es).toBe('hace-1-hora');
    expect(offsetOf('5-hours-from-now').slug.es).toBe('dentro-de-5-horas');
    expect(offsetOf('1-hour-from-now').slug.es).toBe('dentro-de-1-hora');
    expect(offsetOf('30-minutes-from-now').slug.es).toBe('dentro-de-30-minutos');
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

  it('read one hour in the singular', () => {
    const one = longTailPageOf(offsetOf('1-hour-ago'), 'en');
    expect(one.h1).toBe('What time was it 1 hour ago?');
    expect(one.lead).toContain('at 12:30 am, 1 hour ago was 11:30 pm yesterday');
    expect(longTailPageOf(offsetOf('1-hour-ago'), 'es').h1).toBe('¿Qué hora era hace 1 hora?');
    expect(longTailPageOf(offsetOf('1-hour-from-now'), 'en').h1).toBe(
      'What time will it be 1 hour from now?',
    );
    expect(longTailPageOf(offsetOf('1-hour-from-now'), 'es').h1).toBe(
      '¿Qué hora será dentro de 1 hora?',
    );
    for (const lang of LANGS) {
      for (const slug of ['1-hour-ago', '1-hour-from-now']) {
        const page = longTailPageOf(offsetOf(slug), lang);
        const text = [page.title, page.lead, ...(page.sections ?? []).map(textOf)].join(' ');
        expect(text).not.toMatch(/\b1 (hours|horas)\b/);
      }
    }
  });

  it('give the hand-verified hours ago past the examples of the first pages', () => {
    // 1 hour before 12:00 am is 11:00 pm the day before
    expect(rowOf('1-hour-ago', '12:00 am')).toEqual(['12:00 am', '11:00 pm', 'previous day']);
    expect(rowOf('1-hour-ago', '1:00 am')).toEqual(['1:00 am', '12:00 am', 'same day']);
    // 5:00 pm - 20 h = 9:00 pm the day before
    expect(rowOf('20-hours-ago', '5:00 pm')).toEqual(['5:00 pm', '9:00 pm', 'previous day']);
    const twenty = textOf(sectionOf('20-hours-ago', 'worked'));
    expect(twenty).toContain('23:00 − 20:00 = 3:00');
    expect(twenty).toContain('6:00 + 24:00 − 20:00 = 10:00');
    expect(textOf(sectionOf('3-hours-ago', 'worked'))).toContain('2:30 + 24:00 − 3:00 = 23:30');
    // 36 hours: 5:00 pm - 36 h = 5:00 am the day before; 9:00 am - 36 h = 9:00 pm 2 days before
    expect(rowOf('36-hours-ago', '5:00 pm')).toEqual(['5:00 pm', '5:00 am', 'previous day']);
    expect(rowOf('36-hours-ago', '9:00 am')).toEqual(['9:00 am', '9:00 pm', '2 days before']);
    expect(rowOf('36-hours-ago', '9:00 am', 'es')).toEqual(['9:00 am', '9:00 pm', '2 días antes']);
    // whole days keep the time and move the weekday: 48 hours before Monday is Saturday
    expect(sectionOf('48-hours-ago', 'clock').table?.rows).toEqual([
      ['Monday 5:00 pm', 'Saturday 5:00 pm'],
      ['Tuesday 5:00 pm', 'Sunday 5:00 pm'],
      ['Wednesday 5:00 pm', 'Monday 5:00 pm'],
      ['Thursday 5:00 pm', 'Tuesday 5:00 pm'],
      ['Friday 5:00 pm', 'Wednesday 5:00 pm'],
      ['Saturday 5:00 pm', 'Thursday 5:00 pm'],
      ['Sunday 5:00 pm', 'Friday 5:00 pm'],
    ]);
    expect(longTailPageOf(offsetOf('48-hours-ago'), 'en').figure).toBe('−48 h');
    expect(textOf(sectionOf('48-hours-ago', 'work'))).toContain('8 hours of overtime');
  });

  it('give the hand-verified hours from now', () => {
    const five = longTailPageOf(offsetOf('5-hours-from-now'), 'en');
    expect(five.h1).toBe('What time will it be 5 hours from now?');
    expect(five.figure).toBe('+5 h');
    expect(five.live?.data['amount']).toBe('300');
    expect(five.lead).toContain('at 9:00 pm, 5 hours from now is 2:00 am tomorrow');
    // 8:00 pm + 5 h = 1:00 am the next day; 6:00 pm + 5 h = 11:00 pm
    expect(rowOf('5-hours-from-now', '8:00 pm')).toEqual(['8:00 pm', '1:00 am', 'next day']);
    expect(rowOf('5-hours-from-now', '6:00 pm')).toEqual(['6:00 pm', '11:00 pm', 'same day']);
    expect(rowOf('5-hours-from-now', '7:00 pm', 'es')).toEqual([
      '7:00 pm',
      '12:00 am',
      'día siguiente',
    ]);
    const worked = textOf(sectionOf('5-hours-from-now', 'worked'));
    expect(worked).toContain('9:00 + 5:00 = 14:00');
    expect(worked).toContain('21:00 + 5:00 = 26:00');
    expect(longTailPageOf(offsetOf('1-hour-from-now'), 'en').lead).toContain(
      'at 11:30 pm, 1 hour from now is 12:30 am tomorrow',
    );
    // 72 hours after Friday is Monday
    expect(sectionOf('72-hours-from-now', 'clock').table?.rows[4]).toEqual([
      'Friday 5:00 pm',
      'Monday 5:00 pm',
    ]);
    expect(rowOf('36-hours-from-now', '1:00 pm')).toEqual(['1:00 pm', '1:00 am', '2 days later']);
    // each direction links the other
    expect(sectionOf('5-hours-from-now', 'opposite').links?.map(({ href }) => href)).toEqual([
      pathOf(offsetOf('5-hours-ago'), 'en'),
    ]);
    expect(sectionOf('5-hours-ago', 'opposite', 'es').links?.map(({ href }) => href)).toEqual([
      pathOf(offsetOf('5-hours-from-now'), 'es'),
    ]);
  });

  it('count the other way with examples of its own, never the words of the other page', () => {
    // 15 hours after 12:00 pm is 3:00 am the next day; after 10:00 pm, 1:00 pm the next day
    const forward = textOf(sectionOf('15-hours-ago', 'opposite'));
    expect(forward).toContain('on the next day from 9:00 am on');
    expect(forward).toContain('from 12:00 pm it is 3:00 am tomorrow');
    expect(forward).toContain('from 10:00 pm, 1:00 pm tomorrow');
    // 5 hours before 12:00 pm is 7:00 am; before 2:00 am, 9:00 pm the day before
    expect(textOf(sectionOf('5-hours-from-now', 'opposite'))).toContain(
      'from 12:00 pm it was 7:00 am the same day, and from 2:00 am, 9:00 pm yesterday',
    );
    expect(textOf(sectionOf('48-hours-ago', 'opposite', 'es'))).toContain(
      'desde las 12:00 pm serán las 12:00 pm de dentro de 2 días',
    );
    for (const job of HOURS_AGO) {
      for (const lang of LANGS) {
        const opposite = TIME_OFFSETS.find(
          (each) => each.unit === 'hour' && each.amount === job.amount && each !== job,
        );
        if (opposite === undefined) throw new Error('no opposite');
        const lead = longTailPageOf(opposite, lang).lead;
        expect(textOf(sectionOf(job.slug.en, 'opposite', lang))).not.toContain(lead);
      }
    }
  });

  it('give the whole days the date from the turn of each month', () => {
    // 48 hours before March 1 is February 27, February 28 in a leap year
    expect(sectionOf('48-hours-ago', 'months').table?.rows[2]).toEqual([
      'March 1',
      'February 27',
      'February 28',
    ]);
    // 24 hours after February 28 is March 1, February 29 in a leap year
    expect(sectionOf('24-hours-from-now', 'months').table?.rows[1]).toEqual([
      'February 28',
      'March 1',
      'February 29',
    ]);
    expect(sectionOf('72-hours-from-now', 'months', 'es').table?.rows[11]).toEqual([
      '28 de diciembre',
      '31 de diciembre',
      '31 de diciembre',
    ]);
    expect(
      longTailPageOf(offsetOf('36-hours-ago'), 'en').sections?.map(({ id }) => id),
    ).not.toContain('months');
  });

  it('give the hand-verified minutes from now, up to an hour and a half', () => {
    const ninety = longTailPageOf(offsetOf('90-minutes-from-now'), 'en');
    expect(ninety.title).toMatch(/^90 minutes from now: the clock plus 90 min, 1.5 hours/);
    expect(ninety.lead).toContain('an hour and a half');
    expect(textOf(sectionOf('90-minutes-from-now', 'worked'))).toContain(
      '2:45 pm + 90 min = 3:75, which is 4:15 pm',
    );
    expect(rowOf('90-minutes-from-now', '10:30 pm')).toEqual(['10:30 pm', '12:00 am', 'next day']);
    expect(rowOf('90-minutes-from-now', '10:25 pm')).toEqual(['10:25 pm', '11:55 pm', 'same day']);
    expect(textOf(sectionOf('5-minutes-from-now', 'opposite'))).toContain(
      '12:00 am − 5 min = 11:55 pm yesterday',
    );
    expect(longTailPageOf(offsetOf('20-minutes-from-now'), 'en').lead).toContain('1/3 of an hour');
    // a quarter-hour clock rounds 20 minutes down to 15 and 25 up to 30
    expect(textOf(sectionOf('20-minutes-from-now', 'work'))).toContain('0.25 hours');
    expect(textOf(sectionOf('25-minutes-from-now', 'work'))).toContain('0.5 hours');
    expect(textOf(sectionOf('45-minutes-from-now', 'work', 'es'))).toContain('29 CFR 785.19');
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

  it('link the hours calculator and the six nearest of their kind, and are all linked from it', () => {
    for (const job of TIME_OFFSETS) {
      for (const lang of LANGS) {
        const page = longTailPageOf(job, lang);
        expect(page.calculator.href).toBe(HOURS_PATHS[lang]);
        expect(page.others.links).toHaveLength(6);
        expect(page.others.links.map(({ href }) => href)).not.toContain(page.paths[lang]);
        const group = [HOURS_AGO, HOURS_FROM_NOW, MINUTES_FROM_NOW].find((each) =>
          each.includes(job),
        );
        const hrefs = new Set(group?.map((each) => pathOf(each, lang)));
        for (const { href } of page.others.links) expect(hrefs.has(href)).toBe(true);
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
