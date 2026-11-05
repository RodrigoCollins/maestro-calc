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
const ASKED = ['7:00-15:00', '7:00-16:00', '7:00-19:00', '8:00-16:00', '8:00-16:30', '8:00-17:00', '8:30-17:00', '9:00-17:00', '9:00-18:00', '10:00-18:00', '10:00-19:00', '11:00-19:00', '12:00-20:00', '15:00-23:00', '19:00-7:00', '23:00-7:00'];

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
    expect(page.title).toBe('How many hours is 9 am to 5 pm? 8 hours | Cuenta Horas');
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
    // the Spanish twin
    const nueve = longTailPageOf(nine, 'es');
    expect(nueve.h1).toBe('¿Cuántas horas son de 9 am a 5 pm?');
    expect(nueve.figure).toBe('8 horas');
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
      ['8am-to-4pm', '9am-to-5pm', '10am-to-6pm', '11am-to-7pm', '12pm-to-8pm', '3pm-to-11pm'].map(
        (shift) => `/pay/how-many-hours-is-${shift}`,
      ),
    );
    expect(others('19:00-7:00')).toEqual(
      ['8-30am-to-5pm', '7am-to-4pm', '8am-to-5pm', '9am-to-6pm', '10am-to-7pm', '7am-to-7pm'].map(
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
