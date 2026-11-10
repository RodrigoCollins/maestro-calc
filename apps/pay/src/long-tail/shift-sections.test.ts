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
    ...(section.after ?? []),
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
          'rounding',
          'by-hour',
          'week',
          'time-card',
          'breaks',
          'teens',
        ]);
        expect(page.sections?.[0]?.heading).toMatch(
          lang === 'en' ? /^How the figures are worked out$/ : /^Cómo se calcula$/,
        );
        for (const section of page.sections ?? []) {
          expect(textOf(section)).not.toMatch(/undefined|NaN|\$-/);
        }
        const hrefs = page.sources?.map(({ href }) => href) ?? [];
        for (const source of [
          SOURCES.factSheet23,
          SOURCES.ecfr19,
          SOURCES.mealTable,
          SOURCES.factSheet43,
        ]) {
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

  it('show how a quarter-hour time clock records the punches of the shift', () => {
    // a quarter-hour clock records a punch up to 7 minutes off as the time itself, 8 or more as
    // the next quarter: 8:52 is 8 minutes from 9 and 7 from 8:45, so it records 8:45
    const nine = sectionOf('9:00-17:00', 'rounding');
    expect(nine.heading).toBe('How a quarter-hour time clock records 9 am to 5 pm');
    expect(textOf(nine)).toContain(
      'a punch-in from 8:53 am to 9:07 am and a punch-out from 4:53 pm to 5:07 pm still record 9 am to 5 pm',
    );
    expect(nine.table?.rows).toEqual([
      ['In', '8:52 am', '8:45 am', '+15 min'],
      ['In', '8:53 am', '9 am', '0 min'],
      ['In', '9:07 am', '9 am', '0 min'],
      ['In', '9:08 am', '9:15 am', '−15 min'],
      ['Out', '4:52 pm', '4:45 pm', '−15 min'],
      ['Out', '4:53 pm', '5 pm', '0 min'],
      ['Out', '5:07 pm', '5 pm', '0 min'],
      ['Out', '5:08 pm', '5:15 pm', '+15 min'],
    ]);
    // across midnight: 10 pm to 6 am, a punch-in at 10:08 pm records 10:15 pm
    expect(sectionOf('22:00-6:00', 'rounding').table?.rows[3]).toEqual([
      'In',
      '10:08 pm',
      '10:15 pm',
      '−15 min',
    ]);
    expect(sectionOf('9:00-17:00', 'rounding', 'es').table?.rows[0]).toEqual([
      'Entrada',
      '8:52 am',
      '8:45 am',
      '+15 min',
    ]);
  });

  it('give the week, the pay period and the month, and the federal overtime of the week', () => {
    // 5 x 8 = 40 h, 5 x 7.5 = 37.5 h; 80 and 75 every two weeks; 40 x 52 / 12 = 173.33
    const nine = textOf(sectionOf('9:00-17:00', 'week'));
    // the week itself is the answer's rows, so the section starts at the pay period
    expect(nine).not.toContain('40 hours a week with no unpaid break');
    expect(nine).not.toContain('Fair Labor Standards Act');
    expect(nine).toContain('80 hours a pay period with no unpaid break or 75');
    expect(nine).toContain('173.33 or 162.5 hours a month');
    // the overtime of the week is the time card's, so the week section does not restate it
    expect(nine).not.toContain('overtime;');
    const eight = textOf(sectionOf('8:00-17:00', 'week'));
    // four 10-hour days with lunch: 4 x 9.5 = 38 h, inside 40
    expect(textOf(sectionOf('8:00-18:00', 'week'))).toContain(
      'Four of these shifts a week, with a 30-minute lunch each, come to 38 hours, inside the 40-hour line.',
    );
    // full time with lunch: 30 / 7.5 = 4 shifts, 35 / 7.5 = 4.67 so 5; 30 / 8.5 = 3.53 so 4
    expect(nine).toContain('4 a week reach the 30 hours the IRS counts');
    expect(nine).toContain('and 5 reach the 35 hours');
    expect(eight).toContain('4 a week reach the 30 hours');
    expect(textOf(sectionOf('9:00-17:00', 'week', 'es'))).toContain(
      '4 turnos de 9 am a 5 pm llegan a las 30 horas semanales del IRS',
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

  it('fill a five-day time card with the shift, day by day, from the time card calculator', () => {
    // 9 to 5 less 30 min is 7.5 h a day at $20: 7.5 h and $150 on Monday, 37.5 h and $750 by Friday
    const nine = sectionOf('9:00-17:00', 'time-card');
    expect(nine.heading).toBe('A week of 9 am to 5 pm on a time card');
    // lunch at the middle of the shift, as the split step has it: 9 to 1 is 4 h, 1:30 to 5 is 3.5 h
    expect(nine.table?.rows[0]).toEqual([
      'Monday',
      '9 am',
      '1 pm',
      '1:30 pm',
      '5 pm',
      '7.5',
      '7.5',
      '$150.00',
    ]);
    expect(nine.table?.rows[4]?.slice(5)).toEqual(['7.5', '37.5', '$750.00']);
    expect(nine.table?.caption).toBe(
      'Time card: 9 am to 5 pm with lunch from 1 pm to 1:30 pm, Monday to Friday, at $20.00 an hour',
    );
    expect(textOf(nine)).toContain(
      'clock in at 9 am, out for lunch at 1 pm, back in at 1:30 pm and out at 5 pm: 4 + 3.5 = 7.5 paid hours',
    );
    expect(nine.table?.rows).toHaveLength(5);
    expect(textOf(nine)).toContain('37.5 × $20.00 = $750.00');
    expect(textOf(nine)).toContain('2.5 hours short of the 40');
    // 2 x 37.5 = 75 h and 2 x $750 = $1,500; 52 x 37.5 = 1,950 h and 52 x $750 = $39,000
    expect(textOf(nine)).toContain(
      'Two weeks of 9 am to 5 pm cards pay $1,500.00 a biweekly pay period; 52 weeks of 9 am to 5 pm cards, 1,950 hours and $39,000.00 a year',
    );
    // 37.5 x $7.25 = $271.875, shown $271.88; a biweekly check of 75 x $7.25 = $543.75
    expect(textOf(nine)).toContain(
      'At the federal minimum wage of $7.25, the same 9 am to 5 pm card pays $271.88 a week and $543.75 every two weeks.',
    );
    // 8 to 4:30 less 30 min is 8 h: exactly 40 by Friday
    expect(textOf(sectionOf('8:00-16:30', 'time-card'))).toContain('exactly the 40-hour line');
    // 8 to 6 less 30 min is 9.5 h: 38 h and $760 by Thursday, then 47.5 h, 7.5 of them overtime:
    // 40 x $20 = $800 and 7.5 x $30 = $225, $1,025 in all
    const ten = sectionOf('8:00-18:00', 'time-card');
    expect(ten.table?.rows[3]?.slice(6)).toEqual(['38', '$760.00']);
    expect(ten.table?.rows[4]?.slice(6)).toEqual(['47.5', '$1,025.00']);
    expect(textOf(ten)).toContain(
      'the first 40 are regular time, $800.00, and the 7.5 hours past 40 are overtime at $30.00 an hour, $225.00, for $1,025.00 before taxes',
    );
    // 38 h by Thursday, 2 more on Friday: 8 am + 2 h = 10 am, before the lunch at 1 pm
    expect(textOf(ten)).toContain('crosses the 40-hour line on Friday at 10 am');
    // 7 to 4: 34 h by Thursday, 6 more: 4.5 to the lunch at 11:30 am, 1.5 after 12 pm = 1:30 pm
    expect(textOf(sectionOf('7:00-16:00', 'time-card'))).toContain(
      'crosses the 40-hour line on Friday at 1:30 pm',
    );
    // 7 to 7 less 30 min is 11.5 h: 46 h by Thursday, 6 of them overtime: $800 + $180 = $980
    const twelve = sectionOf('7:00-19:00', 'time-card');
    expect(twelve.table?.rows[3]?.slice(6)).toEqual(['46', '$980.00']);
    // 34.5 h by Wednesday, 5.5 more: 7 am + 5.5 h = 12:30 pm, before the lunch at 1 pm
    expect(textOf(twelve)).toContain('crosses the 40-hour line on Thursday at 12:30 pm');
    // 9 to 5 stops at 37.5: a Saturday from 9 am reaches 40 at 9 am + 2.5 h = 11:30 am
    expect(textOf(nine)).toContain(
      'A sixth shift on Saturday from 9 am would reach 40 hours at 11:30 am; every minute after that is overtime.',
    );
    expect(textOf(sectionOf('9:00-17:00', 'time-card', 'es'))).toContain(
      'Un sexto turno el sábado desde las 9 am llegaría a las 40 horas a las 11:30 am',
    );
    expect(textOf(sectionOf('8:00-16:30', 'time-card'))).not.toContain('sixth shift');
    // an overnight shift clocks in one evening and out the next morning
    // 10 pm to 2 am, then 2:30 am to 6 am
    expect(sectionOf('22:00-6:00', 'time-card').table?.rows[0]).toEqual([
      'Monday',
      '10 pm',
      '2 am',
      '2:30 am',
      '6 am',
      '7.5',
      '7.5',
      '$150.00',
    ]);
    const es = sectionOf('9:00-17:00', 'time-card', 'es');
    expect(es.heading).toBe('Una semana de 9 am a 5 pm en la tarjeta de horas');
    expect(es.table?.rows[0]?.[0]).toBe('Lunes');
    expect(es.table?.head).toHaveLength(8);
    expect(textOf(es)).toContain(
      'marcas la entrada a las 9 am, sales a comer a la 1 pm, regresas a la 1:30 pm y marcas la salida a las 5 pm',
    );
    expect(textOf(es)).toContain('Al viernes la tarjeta de 9 am a 5 pm suma 37.5 horas');
    expect(textOf(nine)).toContain('By Friday the 9 am to 5 pm card shows 37.5 hours');
  });

  it('price the minimum-wage week of a shift with overtime from the time card', () => {
    // 8 to 5 with lunch: 42.5 h: 40 x $7.25 = $290 + 2.5 x $10.875 = $27.1875, $317.19 a week
    expect(textOf(sectionOf('8:00-17:00', 'time-card'))).toContain(
      'the same 8 am to 5 pm card pays $317.19 a week',
    );
    for (const shift of SHIFTS) {
      const page = longTailPageOf(shift, 'en');
      expect(page.sections?.some(({ id }) => id === 'pay')).toBe(false);
    }
  });

  it('count the hours on the clock and the paid hours at each hour of the shift', () => {
    // 9 to 5 with lunch from 1 to 1:30: 4 paid hours at 1 pm, then 4.5 at 2 pm and 7.5 at 5 pm
    const nine = sectionOf('9:00-17:00', 'by-hour');
    expect(nine.heading).toBe('Hour by hour from 9 am to 5 pm');
    expect(nine.table?.rows).toEqual([
      ['10 am', '1.00', '1.00', '$20.00'],
      ['11 am', '2.00', '2.00', '$40.00'],
      ['12 pm', '3.00', '3.00', '$60.00'],
      ['1 pm', '4.00', '4.00', '$80.00'],
      ['2 pm', '5.00', '4.50', '$90.00'],
      ['3 pm', '6.00', '5.50', '$110.00'],
      ['4 pm', '7.00', '6.50', '$130.00'],
      ['5 pm', '8.00', '7.50', '$150.00'],
    ]);
    expect(nine.paragraphs[0]).toBe(
      'Halfway through 9 am to 5 pm is 1 pm, 4 hours on the clock. With a 30-minute unpaid lunch from 1 pm to 1:30 pm, the paid hours stop at 4 during the lunch and reach 7.5 at 5 pm.',
    );
    // 8:30 to 5: 8.5 h, halfway at 12:45 pm; lunch from 12:45 to 1:15 (4:15 in), and the last
    // row is the end, half an hour after 4:30 pm: 8.5 on the clock, 8 paid
    const half = sectionOf('8:30-17:00', 'by-hour');
    expect(half.table?.rows[3]).toEqual(['12:30 pm', '4.00', '4.00', '$80.00']);
    expect(half.table?.rows[4]).toEqual(['1:30 pm', '5.00', '4.50', '$90.00']);
    expect(half.table?.rows.at(-1)).toEqual(['5 pm', '8.50', '8.00', '$160.00']);
    expect(half.paragraphs[0]).toContain('Halfway through 8:30 am to 5 pm is 12:45 pm');
    // overnight: 10 pm to 6 am crosses midnight at the second row
    const night = sectionOf('22:00-6:00', 'by-hour');
    expect(night.table?.rows[1]).toEqual(['12 am', '2.00', '2.00', '$40.00']);
    expect(night.table?.rows.at(-1)).toEqual(['6 am', '8.00', '7.50', '$150.00']);
    const es = sectionOf('9:00-17:00', 'by-hour', 'es');
    expect(es.heading).toBe('Hora por hora de 9 am a 5 pm');
    expect(es.paragraphs[0]).toContain('La mitad de un turno de 9 am a 5 pm es la 1 pm');
  });

  it('say whether federal child labor rules let a 14- or 15-year-old work the shift', () => {
    // 9 to 5 with lunch is 7.5 paid hours: inside 7 am to 7 pm and the 8-hour non-school day
    const nine = sectionOf('9:00-17:00', 'teens');
    expect(nine.heading).toBe('Can a 14- or 15-year-old work 9 am to 5 pm?');
    expect(textOf(nine)).toContain(
      '9 am to 5 pm falls inside the 7 am to 7 pm that federal law allows a 14- or 15-year-old all year.',
    );
    expect(textOf(nine)).toContain(
      'Its 7.5 paid hours with a 30-minute lunch fit a day without school, up to 8, but never a school day, up to 3',
    );
    // 12 to 8 ends after 7 pm, but by 9 pm: only from June 1 through Labor Day
    expect(textOf(sectionOf('12:00-20:00', 'teens'))).toContain(
      '12 pm to 8 pm ends after 7 pm, so a 14- or 15-year-old may work it only from June 1 through Labor Day, when the evening limit is 9 pm.',
    );
    // 6 to 2 starts before 7 am; 3 to 11 ends after 9 pm; 10 to 6 crosses midnight
    expect(textOf(sectionOf('6:00-14:00', 'teens'))).toContain(
      '6 am to 2 pm starts before 7 am, the earliest a 14- or 15-year-old may start, so federal law does not allow it',
    );
    expect(textOf(sectionOf('15:00-23:00', 'teens'))).toContain(
      '3 pm to 11 pm ends after 9 pm, later than a 14- or 15-year-old may work even from June 1 through Labor Day, so federal law does not allow it',
    );
    expect(textOf(sectionOf('22:00-6:00', 'teens'))).toContain(
      '10 pm to 6 am runs through the night',
    );
    // 8 to 5 less 30 min is 8.5 h, over 8; less 60 min it is 8, at the limit
    expect(textOf(sectionOf('8:00-17:00', 'teens'))).toContain(
      'Its 8.5 paid hours with a 30-minute lunch pass the 8 allowed on a day without school; only a 60-minute lunch, at 8, keeps it within the limit',
    );
    // 8 to 6 less 60 min is 9 h: over 8 either way
    expect(textOf(sectionOf('8:00-18:00', 'teens'))).toContain(
      'Its 9.5 paid hours with a 30-minute lunch, and 9 even with a 60-minute one, pass the 8 allowed on a day without school, so it is not allowed on any day',
    );
    // a window it cannot work says nothing about the length
    expect(textOf(sectionOf('6:00-14:00', 'teens'))).not.toContain('paid hours');
    expect(textOf(sectionOf('9:00-17:00', 'teens'))).not.toContain('16-');
    expect(textOf(sectionOf('9:00-17:00', 'teens', 'es'))).toContain(
      'De 9 am a 5 pm cae dentro del horario de 7 am a 7 pm',
    );
    for (const shift of SHIFTS) {
      expect(textOf(sectionOf(`${clock(shift.start)}-${clock(shift.end)}`, 'teens'))).toContain(
        '(DOL Fact Sheet #43)',
      );
      expect(
        sectionOf(`${clock(shift.start)}-${clock(shift.end)}`, 'teens').paragraphs,
      ).toHaveLength(1);
    }
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

  it("give New York's own meal periods, which turn on the time of day", () => {
    // 9 to 5 is over 6 hours and covers 11 am to 2 pm: 30 minutes inside that window
    expect(textOf(sectionOf('9:00-17:00', 'breaks'))).toContain(
      'In New York, 9 am to 5 pm runs more than 6 hours across the noonday period of 11 am to 2 pm, so it owes at least 30 minutes off between 11 am and 2 pm (60 minutes in a factory).',
    );
    // 8 to 8 starts before 11 am and goes past 7 pm: also 20 more minutes between 5 and 7 pm
    expect(textOf(sectionOf('8:00-20:00', 'breaks'))).toContain(
      'Because 8 am to 8 pm starts before 11 am and goes past 7 pm, New York adds at least 20 minutes between 5 pm and 7 pm.',
    );
    // 7 to 7 ends at 7 pm, not later: no extra period
    expect(textOf(sectionOf('7:00-19:00', 'breaks'))).not.toContain('New York adds');
    // 10 pm to 6 am starts between 1 pm and 6 am: 45 minutes midway, at 2 am
    expect(textOf(sectionOf('22:00-6:00', 'breaks'))).toContain(
      'In New York, 10 pm to 6 am runs more than 6 hours from a start between 1 pm and 6 am, so it owes at least 45 minutes (60 in a factory) midway through the shift, around 2 am.',
    );
    // 5 am to 1 pm starts before 6 am: midway is 9 am
    expect(textOf(sectionOf('5:00-13:00', 'breaks'))).toContain('around 9 am');
    // 9 to 3 is exactly 6 hours, not more: New York owes nothing by these rules
    expect(textOf(sectionOf('9:00-15:00', 'breaks'))).not.toContain('In New York');
    expect(textOf(sectionOf('22:00-6:00', 'breaks', 'es'))).toContain(
      'En Nueva York, de 10 pm a 6 am dura más de 6 horas y empieza entre la 1 pm y las 6 am, así que da derecho a 45 minutos como mínimo (60 en una fábrica) a la mitad del turno, hacia las 2 am.',
    );
    // rounding and clocking out in Spanish: the rule in a clause, the shift's own times kept
    const rounding = textOf(sectionOf('7:00-17:00', 'rounding', 'es'));
    expect(rounding).toContain('Es legal si con el tiempo te pagan todo (29 CFR 785.48).');
    const out = textOf(sectionOf('7:00-17:00', 'clock-out', 'es'));
    expect(out).toContain('Si sales a las 5 pm, el descanso sin pago te deja con menos de 10 horas');
    // the Spanish says the federal rule and the state count in few words, shared by every page
    const es = textOf(sectionOf('7:00-17:00', 'breaks', 'es'));
    expect(es).toContain(
      'La ley federal no exige una pausa para comer: las pausas de 5 a 20 minutos se pagan (29 CFR 785.18) y solo una comida libre de 30 minutos o más se resta de las 10 horas de 7 am a 5 pm (29 CFR 785.19).',
    );
    expect(es).toContain('la tabla del Departamento de Trabajo (1 de enero de 2023) la pide en 15 estados');
    const hrefs = longTailPageOf(shiftOf('9:00-17:00'), 'en').sources?.map(({ href }) => href);
    expect(hrefs).toContain(SOURCES.nyMeal.href);
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
