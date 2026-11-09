import { describe, expect, it } from 'vitest';
import type { LongTailSection } from '../long-tail/sections.ts';
import { HOURS_SUM_TEXTS, hoursSectionsOf } from './sum.ts';

const LANGS = ['en', 'es'] as const;

const sectionOf = (id: string, lang: 'en' | 'es'): LongTailSection => {
  const section = hoursSectionsOf(lang).find((each) => each.id === id);
  if (section === undefined) throw new Error(`no section ${id}`);
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

describe('the sections of the hours calculator', () => {
  it('put the time arithmetic in order: adding and subtracting, a week, then the two clocks', () => {
    for (const lang of LANGS) {
      expect(hoursSectionsOf(lang).map(({ id }) => id)).toEqual([
        'sum-worked',
        'sum-examples',
        'sum-week',
        'clock',
      ]);
    }
  });

  it('work 7 h 45 min + 3 h 30 min and 10 h 15 min − 2 h 50 min by hand', () => {
    // 45 + 30 = 75 min = 1 h 15 min; 7 + 3 + 1 = 11 h. 15 < 50: borrow, 75 − 50 = 25, 9 − 2 = 7
    expect(sectionOf('sum-worked', 'en').steps).toEqual([
      'Add the minutes: 45 + 30 = 75 minutes, which is 1 hour and 15 minutes.',
      'Add the hours, with the hour carried: 7 + 3 + 1 = 11 hours. So 7 h 45 min + 3 h 30 min = 11 h 15 min, or 11.25 decimal hours.',
      'To subtract 2 h 50 min from 10 h 15 min, there are fewer minutes (15) than to take away (50), so borrow 1 hour: 10 h 15 min is 9 h 75 min.',
      'Then 75 − 50 = 25 minutes and 9 − 2 = 7 hours: 10 h 15 min − 2 h 50 min = 7 h 25 min, or 7.42 decimal hours.',
    ]);
    expect(sectionOf('sum-worked', 'es').steps).toEqual([
      'Suma los minutos: 45 + 30 = 75 minutos, que son 1 hora y 15 minutos.',
      'Suma las horas, con la hora que se lleva: 7 + 3 + 1 = 11 horas. Así, 7 h 45 min + 3 h 30 min = 11 h 15 min, o 11.25 horas decimales.',
      'Para restar 2 h 50 min de 10 h 15 min, hay menos minutos (15) de los que hay que quitar (50), así que pide prestada 1 hora: 10 h 15 min son 9 h 75 min.',
      'Luego 75 − 50 = 25 minutos y 9 − 2 = 7 horas: 10 h 15 min − 2 h 50 min = 7 h 25 min, o 7.42 horas decimales.',
    ]);
  });

  it('give the hand-verified sums and differences', () => {
    expect(sectionOf('sum-examples', 'es').table?.rows).toEqual([
      ['7 h 45 min + 3 h 30 min', '11 h 15 min', '11.25'],
      ['8 h 50 min + 1 h 25 min', '10 h 15 min', '10.25'],
      ['2 h 40 min + 2 h 40 min', '5 h 20 min', '5.33'],
      ['0 h 45 min + 0 h 45 min', '1 h 30 min', '1.5'],
      ['7 h 45 min − 3 h 30 min', '4 h 15 min', '4.25'],
      ['10 h 15 min − 2 h 50 min', '7 h 25 min', '7.42'],
      ['8 h 0 min − 0 h 45 min', '7 h 15 min', '7.25'],
      ['1 h 20 min − 2 h 45 min', '−1 h 25 min', '−1.42'],
    ]);
  });

  it('add up a week day by day, with the running total', () => {
    // 8:15 + 7:50 = 16:05; + 8:05 = 24:10; + 9:30 = 33:40; + 6:45 = 40:25 = 40.42
    const week = sectionOf('sum-week', 'en');
    expect(week.table?.rows).toEqual([
      ['Monday', '8 h 15 min', '8 h 15 min'],
      ['Tuesday', '7 h 50 min', '16 h 5 min'],
      ['Wednesday', '8 h 5 min', '24 h 10 min'],
      ['Thursday', '9 h 30 min', '33 h 40 min'],
      ['Friday', '6 h 45 min', '40 h 25 min'],
    ]);
    expect(textOf(week)).toContain('40 h 25 min');
    expect(textOf(week)).toContain('40.42');
    expect(sectionOf('sum-week', 'es').table?.rows[0]).toEqual([
      'lunes',
      '8 h 15 min',
      '8 h 15 min',
    ]);
  });

  it('write each time on both clocks, the Spanish one in the a. m. and p. m. style', () => {
    expect(sectionOf('clock', 'es').table?.rows).toEqual([
      ['0:00', '12:00 a. m.', '0'],
      ['6:00', '6:00 a. m.', '360'],
      ['9:30', '9:30 a. m.', '570'],
      ['12:00', '12:00 p. m.', '720'],
      ['13:00', '1:00 p. m.', '780'],
      ['14:30', '2:30 p. m.', '870'],
      ['17:30', '5:30 p. m.', '1,050'],
      ['20:00', '8:00 p. m.', '1,200'],
      ['22:15', '10:15 p. m.', '1,335'],
      ['23:59', '11:59 p. m.', '1,439'],
    ]);
    expect(sectionOf('clock', 'en').table?.rows[5]).toEqual(['14:30', '2:30 pm', '870']);
    const es = textOf(sectionOf('clock', 'es'));
    expect(es).toContain('España');
    expect(es).toContain('México');
  });

  it('say that the Spanish page writes decimals with a point, as Mexico does, and Spain a comma', () => {
    expect(HOURS_SUM_TEXTS.es.decimalNote).toContain('8,25');
    expect(HOURS_SUM_TEXTS.es.decimalNote).toContain('México');
  });

  it('leave no broken figure', () => {
    for (const lang of LANGS) {
      for (const section of hoursSectionsOf(lang)) {
        expect(textOf(section)).not.toMatch(/undefined|NaN|Infinity/);
      }
    }
  });
});
