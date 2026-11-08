import { decode, Rational } from '@maestro-calc/core';
import { hoursBetween } from '@maestro-calc/pay-core/hours';
import { describe, expect, it } from 'vitest';
import { decimalHoursText, hoursMinutesText } from '../format.ts';
import { HOURS_PATHS } from '../hours/texts.ts';
import { commonLinksOf, LONG_TAIL_ROUTES, longTailPageOf } from './jobs.ts';
import { SHIFTS, type Shift } from './routes.ts';

const LANGS = ['en', 'es'] as const;

/** The common shifts people ask the hours of, as `start-end` on a 24-hour clock. */
// prettier-ignore
const ASKED = ['5:00-13:00', '6:00-14:00', '6:00-14:30', '6:00-15:00', '6:00-16:00', '6:00-18:00', '7:00-15:00', '7:00-16:00', '7:00-17:00', '7:00-19:00', '8:00-15:00', '8:00-16:00', '8:00-16:30', '8:00-17:00', '8:00-18:00', '8:00-20:00', '8:30-16:30', '8:30-17:00', '9:00-15:00', '9:00-16:00', '9:00-17:00', '9:00-18:00', '9:00-21:00', '10:00-16:00', '10:00-18:00', '10:00-19:00', '11:00-19:00', '12:00-20:00', '14:00-22:00', '15:00-23:00', '16:00-0:00', '19:00-7:00', '20:00-8:00', '21:00-9:00', '22:00-6:00', '23:00-7:00'];

const clock = (minutes: number): string =>
  `${String(Math.floor(minutes / 60))}:${String(minutes % 60).padStart(2, '0')}`;
const nameOf = (shift: Shift): string => `${clock(shift.start)}-${clock(shift.end)}`;

const shiftOf = (name: string): Shift => {
  const shift = SHIFTS.find((candidate) => nameOf(candidate) === name);
  if (shift === undefined) throw new Error(`no shift ${name}`);
  return shift;
};

/** The hours calculator's worked hours for the shift less `unpaidBreak` minutes. */
const engineHours = (shift: Shift, unpaidBreak: number): Rational => {
  const ran = hoursBetween.run({
    start: clock(shift.start),
    end: clock(shift.end),
    unpaidBreak: String(unpaidBreak),
  });
  if (!ran.ok) throw new Error(nameOf(shift));
  const hours = ran.value.outputs.find(({ key }) => key === 'hours')?.value;
  if (hours === undefined) throw new Error(`no hours for ${nameOf(shift)}`);
  return hours;
};

const rowOf = (shift: Shift, key: string, lang: 'en' | 'es' = 'en'): string => {
  const row = longTailPageOf(shift, lang).rows.find((candidate) => candidate.key === key);
  if (row === undefined) throw new Error(`no row ${key}`);
  return row.value;
};

const lengthOf = ({ start, end }: Shift): number => (end > start ? end : end + 1440) - start;

describe('shift long-tail pages', () => {
  it('cover the common shifts, by length and then by start', () => {
    expect([...SHIFTS.map(nameOf)].sort()).toEqual([...ASKED].sort());
    const order = SHIFTS.map((shift) => [lengthOf(shift), shift.start]);
    const sorted = [...order].sort(([a = 0, b = 0], [c = 0, d = 0]) => a - c || b - d);
    expect(order).toEqual(sorted);
  });

  it('write their paths in the style of the other long-tail pages', () => {
    const nine = shiftOf('9:00-17:00');
    expect(longTailPageOf(nine, 'en').paths).toEqual({
      en: '/pay/how-many-hours-is-9am-to-5pm',
      es: '/es/pago/cuantas-horas-son-de-9-am-a-5-pm',
    });
    expect(longTailPageOf(shiftOf('8:30-17:00'), 'en').paths).toEqual({
      en: '/pay/how-many-hours-is-8-30am-to-5pm',
      es: '/es/pago/cuantas-horas-son-de-8-30-am-a-5-pm',
    });
    expect(longTailPageOf(shiftOf('12:00-20:00'), 'es').paths.en).toBe(
      '/pay/how-many-hours-is-12pm-to-8pm',
    );
    for (const shift of SHIFTS) {
      expect(LONG_TAIL_ROUTES.map(({ en }) => en)).toContain(longTailPageOf(shift, 'en').paths.en);
    }
  });

  it('take every figure from the hours calculator, never from the text', () => {
    for (const shift of SHIFTS) {
      const day = [0, 30, 60].map((unpaidBreak) => engineHours(shift, unpaidBreak));
      const both = (hours: Rational): string =>
        `${hoursMinutesText(hours)} (${decimalHoursText(hours)})`;
      for (const lang of LANGS) {
        const page = longTailPageOf(shift, lang);
        expect(page.rows.map(({ key }) => key)).toEqual([
          'decimal',
          'break30',
          'break60',
          'week',
          'week30',
          'week60',
        ]);
        expect(rowOf(shift, 'decimal', lang)).toBe(decimalHoursText(day[0] ?? Rational.of(0)));
        expect(page.rows.slice(1).map(({ value }) => value)).toEqual([
          both(day[1] ?? Rational.of(0)),
          both(day[2] ?? Rational.of(0)),
          ...day.map((hours) => both(hours.mul(Rational.of(5)))),
        ]);
      }
    }
  });

  it('answer the hand-verified cases', () => {
    // 9:00 to 17:00 is 8 h; less 30 min is 7.5 h; 5 x 8 = 40 h a week
    const nine = shiftOf('9:00-17:00');
    const page = longTailPageOf(nine, 'en');
    expect(page.h1).toBe('How many hours is 9 am to 5 pm?');
    expect(page.figure).toBe('8 hours');
    expect(rowOf(nine, 'decimal')).toBe('8.00');
    expect(rowOf(nine, 'break30')).toBe('7 h 30 min (7.50)');
    expect(rowOf(nine, 'week')).toBe('40 h 0 min (40.00)');
    expect(page.lead).toBe(
      '9 am to 5 pm is 8 hours, or 8.00 decimal hours. With a 30-minute unpaid break you work 7 hours 30 minutes, or 7.50 hours, and five of these shifts come to 37.5 hours a week.',
    );
    expect(page.title).toBe('9 AM to 5 PM is 8 hours | Cuenta Horas');
    // 8:00 to 16:30 is 8 h 30 min = 8.5 h
    expect(longTailPageOf(shiftOf('8:00-16:30'), 'en').figure).toBe('8 hours 30 minutes');
    expect(rowOf(shiftOf('8:00-16:30'), 'decimal')).toBe('8.50');
    // 8:30 to 17:00 is 8 h 30 min = 8.5 h
    expect(rowOf(shiftOf('8:30-17:00'), 'decimal')).toBe('8.50');
    expect(longTailPageOf(shiftOf('8:30-17:00'), 'es').figure).toBe('8 horas y 30 minutos');
    // 19:00 to 7:00 crosses midnight: 5 h to midnight + 7 h = 12 h
    const night = longTailPageOf(shiftOf('19:00-7:00'), 'en');
    expect(night.figure).toBe('12 hours');
    expect(rowOf(shiftOf('19:00-7:00'), 'decimal')).toBe('12.00');
    expect(rowOf(shiftOf('19:00-7:00'), 'week60')).toBe('55 h 0 min (55.00)');
    // 6:00 to 14:00 is 8 h; 6:00 to 18:00 is 12 h, less 60 min is 11 h
    expect(longTailPageOf(shiftOf('6:00-14:00'), 'en').h1).toBe('How many hours is 6 am to 2 pm?');
    expect(longTailPageOf(shiftOf('6:00-14:00'), 'en').figure).toBe('8 hours');
    expect(longTailPageOf(shiftOf('6:00-18:00'), 'es').figure).toBe('12 horas');
    expect(rowOf(shiftOf('6:00-18:00'), 'break60')).toBe('11 h 0 min (11.00)');
    // the Spanish twin
    const nueve = longTailPageOf(nine, 'es');
    expect(nueve.h1).toBe('¿Cuántas horas son de 9 am a 5 pm?');
    expect(nueve.figure).toBe('8 horas');
    expect(nueve.title).toBe('De 9 a 5 son 8 horas | Cuenta Horas');
    // 22:00 to 6:00 crosses midnight: 2 h to midnight + 6 h = 8 h
    const late = longTailPageOf(shiftOf('22:00-6:00'), 'en');
    expect(late.figure).toBe('8 hours');
    expect(late.lead).toContain('crosses midnight');
    expect(late.title).toBe('10 PM to 6 AM is 8 hours | Cuenta Horas');
    expect(longTailPageOf(shiftOf('22:00-6:00'), 'es').title).toBe(
      'De 10 pm a 6 am son 8 horas | Cuenta Horas',
    );
    expect(longTailPageOf(shiftOf('22:00-6:00'), 'es').paths.es).toBe(
      '/es/pago/cuantas-horas-son-de-10-pm-a-6-am',
    );
    // 16:00 to 0:00 ends at midnight: 8 h
    const closing = longTailPageOf(shiftOf('16:00-0:00'), 'en');
    expect(closing.paths.en).toBe('/pay/how-many-hours-is-4pm-to-12am');
    expect(closing.figure).toBe('8 hours');
    expect(closing.title).toBe('4 PM to 12 AM is 8 hours | Cuenta Horas');
    // 8:00 to 18:00 is 10 h; 9:00 to 15:00 is 6 h; 6:00 to 14:30 is 8 h 30 min
    expect(longTailPageOf(shiftOf('8:00-18:00'), 'en').title).toBe(
      '8 AM to 6 PM is 10 hours | Cuenta Horas',
    );
    expect(longTailPageOf(shiftOf('8:00-18:00'), 'es').title).toBe(
      'De 8 a 6 son 10 horas | Cuenta Horas',
    );
    expect(rowOf(shiftOf('9:00-15:00'), 'week')).toBe('30 h 0 min (30.00)');
    expect(rowOf(shiftOf('6:00-14:30'), 'decimal')).toBe('8.50');
    expect(longTailPageOf(shiftOf('6:00-14:30'), 'es').title).toBe(
      'De 6 a 2:30 son 8 horas y 30 minutos | Cuenta Horas',
    );
    // 8:30 to 16:30 is 8 h; 20:00 to 8:00 crosses midnight: 4 h + 8 h = 12 h
    expect(longTailPageOf(shiftOf('8:30-16:30'), 'es').title).toBe(
      'De 8:30 a 4:30 son 8 horas | Cuenta Horas',
    );
    expect(longTailPageOf(shiftOf('20:00-8:00'), 'en').figure).toBe('12 hours');
    expect(longTailPageOf(shiftOf('8:00-20:00'), 'es').title).toBe(
      'De 8 a 8 son 12 horas | Cuenta Horas',
    );
    // an afternoon start keeps its pm, so 7 pm to 7 am is not 7 am to 7 pm
    expect(longTailPageOf(shiftOf('19:00-7:00'), 'es').title).toBe(
      'De 7 pm a 7 am son 12 horas | Cuenta Horas',
    );
    expect(longTailPageOf(shiftOf('7:00-19:00'), 'es').title).toBe(
      'De 7 a 7 son 12 horas | Cuenta Horas',
    );
  });

  it('answer the question first, in the words people search, in the title and the description', () => {
    for (const shift of SHIFTS) {
      for (const lang of LANGS) {
        const page = longTailPageOf(shift, lang);
        const answer = page.title.replace(/ \| Cuenta Horas$/, '');
        expect(answer.endsWith(page.figure)).toBe(true);
        expect(page.description.startsWith(`${answer},`)).toBe(true);
      }
    }
    expect(longTailPageOf(shiftOf('9:00-17:00'), 'es').description).toMatch(
      /^De 9 a 5 son 8 horas, o 8\.00 horas decimales\./,
    );
  });

  it('say that an overnight shift crosses midnight, and only then', () => {
    for (const shift of SHIFTS) {
      const overnight = shift.end < shift.start;
      expect(longTailPageOf(shift, 'en').lead.includes('crosses midnight')).toBe(overnight);
      expect(longTailPageOf(shift, 'es').lead.includes('cruza la medianoche')).toBe(overnight);
    }
    expect(longTailPageOf(shiftOf('23:00-7:00'), 'en').lead).toContain(
      'The shift crosses midnight and ends at 7 am the next day.',
    );
  });

  it('link the hours calculator, prefilled with the shift and no break', () => {
    for (const shift of SHIFTS) {
      for (const lang of LANGS) {
        const { calculator } = longTailPageOf(shift, lang);
        const [path, query = ''] = calculator.href.split('?');
        expect(path).toBe(HOURS_PATHS[lang]);
        const { state, issues } = decode(hoursBetween, query);
        expect(issues).toEqual([]);
        expect(state).toEqual({ start: shift.start, end: shift.end, unpaidBreak: 0 });
      }
    }
  });

  it('link the six nearest shifts by length, then start', () => {
    const others = (name: string): string[] =>
      longTailPageOf(shiftOf(name), 'en').others.links.map(({ href }) => href);
    expect(others('7:00-15:00')).toEqual(
      [
        '9am-to-4pm',
        '5am-to-1pm',
        '6am-to-2pm',
        '8am-to-4pm',
        '8-30am-to-4-30pm',
        '9am-to-5pm',
      ].map((shift) => `/pay/how-many-hours-is-${shift}`),
    );
    expect(others('19:00-7:00')).toEqual(
      ['6am-to-6pm', '7am-to-7pm', '8am-to-8pm', '9am-to-9pm', '8pm-to-8am', '9pm-to-9am'].map(
        (shift) => `/pay/how-many-hours-is-${shift}`,
      ),
    );
    for (const shift of SHIFTS) {
      for (const lang of LANGS) {
        const page = longTailPageOf(shift, lang);
        expect(page.others.links).toHaveLength(6);
        expect(page.others.links.map(({ href }) => href)).not.toContain(page.paths[lang]);
      }
    }
  });

  it('are all linked from the hours calculator, and each has its own title', () => {
    for (const lang of LANGS) {
      expect(commonLinksOf('shift', lang).links.map(({ href }) => href)).toEqual(
        SHIFTS.map((shift) => longTailPageOf(shift, lang).paths[lang]),
      );
    }
    const titles = SHIFTS.flatMap((shift) =>
      LANGS.map((lang) => longTailPageOf(shift, lang).title),
    );
    expect(new Set(titles).size).toBe(titles.length);
  });
});
