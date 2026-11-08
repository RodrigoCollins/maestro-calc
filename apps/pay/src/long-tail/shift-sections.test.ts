import { describe, expect, it } from 'vitest';
import { OVERTIME_STATES } from '../guide/overtime-states.ts';
import { appliesTo, MEAL_PERIODS, mealMinutesOf } from './meal-periods.ts';
import { longTailPageOf } from './jobs.ts';
import { SHIFTS, type Shift } from './routes.ts';
import { SOURCES, type LongTailSection } from './sections.ts';

const LANGS = ['en', 'es'] as const;

const clock = (minutes: number): string =>
  `${String(Math.floor(minutes / 60))}:${String(minutes % 60).padStart(2, '0')}`;
const shiftOf = (name: string): Shift => {
  const shift = SHIFTS.find((each) => `${clock(each.start)}-${clock(each.end)}` === name);
  if (shift === undefined) throw new Error(`no shift ${name}`);
  return shift;
};
const sectionOf = (name: string, id: string, lang: 'en' | 'es' = 'en'): LongTailSection => {
  const section = longTailPageOf(shiftOf(name), lang).sections?.find((each) => each.id === id);
  if (section === undefined) throw new Error(`no section ${id} on ${name}`);
  return section;
};
const textOf = (section: LongTailSection): string =>
  [
    ...section.paragraphs,
    ...(section.steps ?? []),
    ...(section.table?.rows.flat() ?? []),
    section.table?.caption ?? '',
  ].join(' ');

describe('the sections of a shift page', () => {
  it('work the hours out, give the week, the pay, the breaks and the sources on every page', () => {
    for (const shift of SHIFTS) {
      for (const lang of LANGS) {
        const page = longTailPageOf(shift, lang);
        expect(page.sections?.map(({ id }) => id)).toEqual([
          'worked',
          'clock-out',
          'week',
          'pay',
          'breaks',
        ]);
        expect(page.sections?.[0]?.heading).toMatch(
          lang === 'en' ? /^How the figures are worked out$/ : /^Cómo se calcula$/,
        );
        for (const section of page.sections ?? []) {
          expect(textOf(section)).not.toMatch(/undefined|NaN|\$-/);
        }
        const hrefs = page.sources?.map(({ href }) => href) ?? [];
        for (const source of [SOURCES.factSheet23, SOURCES.ecfr19, SOURCES.mealTable]) {
          expect(hrefs).toContain(source.href);
        }
      }
    }
  });

  it('work 9 am to 5 pm out step by step, by hand', () => {
    const steps = sectionOf('9:00-17:00', 'worked').steps ?? [];
    expect(steps[0]).toBe('On a 24-hour clock, 9 am is 9:00 and 5 pm is 17:00.');
    expect(steps[1]).toBe('17:00 − 9:00 = 8:00, so the shift lasts 8 hours: 480 minutes.');
    expect(steps.join(' ')).toContain('8:00 − 0:30 = 7:30, or 7.50 hours');
    expect(steps.join(' ')).toContain('8:00 − 1:00 = 7:00, or 7.00 hours');
    const es = sectionOf('9:00-17:00', 'worked', 'es').steps ?? [];
    expect(es[0]).toBe('En un reloj de 24 horas, las 9 am son las 9:00 y las 5 pm son las 17:00.');
  });

  it('add a day to a shift that crosses midnight, and split it at midnight', () => {
    // 22:00 to 6:00: 6:00 + 24:00 = 30:00, less 22:00 = 8:00; 2 h before midnight, 6 after
    const steps = (sectionOf('22:00-6:00', 'worked').steps ?? []).join(' ');
    expect(steps).toContain('30:00 − 22:00 = 8:00');
    expect(steps).toContain('2 hours fall before midnight');
    expect(steps).toContain('6 hours after it');
    // 8:00 to 16:30 has 30 extra minutes: 30 / 60 = 0.5
    expect((sectionOf('8:00-16:30', 'worked').steps ?? []).join(' ')).toContain('30 ÷ 60 = 0.5');
  });

  it('say when to clock out to be paid the whole shift with a lunch', () => {
    // 9 am to 5 pm plus 30 min is 5:30 pm, plus 60 is 6 pm; 10 pm to 6 am plus 60 is 7 am
    expect(sectionOf('9:00-17:00', 'clock-out').table?.rows).toEqual([
      ['30 min', '7 h 30 min (7.50)', '5:30 pm'],
      ['60 min', '7 h 0 min (7.00)', '6 pm'],
    ]);
    expect(sectionOf('22:00-6:00', 'clock-out').table?.rows[1]?.[2]).toBe('7 am');
  });

  it('give the week, the pay period and the month, and the federal overtime of the week', () => {
    // 5 x 8 = 40 h, 5 x 7.5 = 37.5 h; 80 and 75 every two weeks; 40 x 52 / 12 = 173.33
    const nine = textOf(sectionOf('9:00-17:00', 'week'));
    expect(nine).toContain('40 hours a week with no unpaid break and 37.5');
    expect(nine).toContain('80 or 75 hours');
    expect(nine).toContain('173.33 or 162.5 hours a month');
    // a sixth shift with lunch: 6 x 7.5 = 45 h, 5 of them overtime
    expect(nine).toContain('45 hours with lunches, 5 of them overtime');
    // 8 to 5 is 9 h: 45 h a week, 5 overtime; with lunch 42.5, 2.5 overtime
    const eight = textOf(sectionOf('8:00-17:00', 'week'));
    expect(eight).toContain('come to 45 hours, so 5 of them are overtime');
    expect(eight).toContain('2.5 hours are');
    // full time with lunch: 30 / 7.5 = 4 shifts, 35 / 7.5 = 4.67 so 5; 30 / 8.5 = 3.53 so 4
    expect(nine).toContain('4 a week reach the 30 hours the IRS counts');
    expect(nine).toContain('and 5 reach the 35 hours');
    expect(eight).toContain('4 a week reach the 30 hours');
    expect(textOf(sectionOf('9:00-17:00', 'week', 'es'))).toContain(
      '4 a la semana llegan a las 30 horas que cuenta el IRS',
    );
  });

  it('name the daily overtime states only when a shift with lunch passes 8 hours', () => {
    // 8 to 6 is 10 h, 9.5 with lunch: 1.5 h a day past 8, 7.5 h in the week under California
    const ten = textOf(sectionOf('8:00-18:00', 'week'));
    expect(ten).toContain('Alaska, California and Nevada');
    expect(ten).toContain('1.5 of each day');
    expect(ten).toContain("California's rule this five-day week has 7.5 overtime hours");
    expect(textOf(sectionOf('9:00-17:00', 'week'))).not.toContain('Alaska');
    // the daily line of 8 hours is the overtime table's
    const daily = OVERTIME_STATES.filter(({ daily: hours }) => hours === 8).map(
      ({ name }) => name.en,
    );
    expect(daily).toEqual(['Alaska', 'California', 'Nevada']);
  });

  it('price the shift with the time card at common rates', () => {
    // 7.5 h x $15 = $112.50 a shift, 37.5 h x $15 = $562.50 a week, no overtime
    expect(sectionOf('9:00-17:00', 'pay').table?.rows[1]).toEqual([
      '$15.00',
      '$112.50',
      '$562.50',
      '$0.00',
    ]);
    // 8 to 5 with lunch: 8.5 h a day, 42.5 h: 40 x $15 + 2.5 x $22.50 = $656.25, $56.25 overtime
    expect(sectionOf('8:00-17:00', 'pay').table?.rows[1]).toEqual([
      '$15.00',
      '$127.50',
      '$656.25',
      '$56.25',
    ]);
    expect(sectionOf('8:00-17:00', 'pay').table?.rows[0]?.[0]).toBe('$7.25');
  });

  it('list the state meal periods a shift of its length meets, and when they fall', () => {
    // a 6-hour shift: over 5 (CA, NH, ND, WA) and 6 or more (OR, RI, TN, WV)
    const six = textOf(sectionOf('9:00-15:00', 'breaks'));
    expect(six).toContain('8 states');
    expect(six).not.toContain('Connecticut');
    // an 8-hour shift meets all 15
    const eight = textOf(sectionOf('9:00-17:00', 'breaks'));
    expect(eight).toContain('15 states');
    expect(eight).toContain(
      'Rhode Island, Tennessee and Washington; 20 minutes in Illinois and West Virginia; sufficient unpaid time in Minnesota.',
    );
    // under 8 hours Rhode Island owes 20 minutes
    expect(textOf(sectionOf('9:00-16:00', 'breaks'))).toContain(
      '20 minutes in Rhode Island and West Virginia.',
    );
    expect(sectionOf('9:00-17:00', 'breaks').table?.rows).toEqual([
      ['Connecticut', 'After the first 2 hours and before the last 2', 'Between 11 am and 3 pm'],
      ['Delaware', 'After the first 2 hours and before the last 2', 'Between 11 am and 3 pm'],
      ['Illinois', 'No later than 5 hours after the start', 'By 2 pm'],
      ['Washington', 'Between 2 and 5 hours from the start', 'Between 11 am and 2 pm'],
    ]);
    // 10 pm to 6 am: Washington between 12 am and 3 am
    expect(sectionOf('22:00-6:00', 'breaks').table?.rows.at(-1)).toEqual([
      'Washington',
      'Between 2 and 5 hours from the start',
      'Between 12 am and 3 am',
    ]);
  });

  it('hold each meal threshold to the words of the DOL table', () => {
    for (const period of MEAL_PERIODS) {
      const { hours, kind } = period.threshold;
      const digits = String(hours).replace('.5', '½');
      const word = ({ 5: 'five', 6: 'six', 8: 'eight' } as Record<number, string>)[hours] ?? digits;
      expect(period.standard.replace('7 ½', '7½')).toMatch(new RegExp(`${digits}|${word}`));
      // just under the line it does not apply; at it, only an `atLeast` rule does
      expect(appliesTo(period, hours - 0.5)).toBe(false);
      expect(appliesTo(period, hours)).toBe(kind === 'atLeast');
      expect(appliesTo(period, hours + 0.5)).toBe(true);
    }
    const rhode = MEAL_PERIODS.find(({ state }) => state.en === 'Rhode Island');
    if (rhode === undefined) throw new Error('no Rhode Island');
    expect(mealMinutesOf(rhode, 6)).toBe(20);
    expect(mealMinutesOf(rhode, 8)).toBe(30);
  });
});
