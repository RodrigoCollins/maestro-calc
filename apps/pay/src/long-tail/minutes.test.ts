import { decode, Rational } from '@maestro-calc/core';
import { decimalHours } from '@maestro-calc/pay-core/decimal-hours';
import { describe, expect, it } from 'vitest';
import { decimalHoursText } from '../format.ts';
import { DECIMAL_HOURS_PATHS } from '../hours/texts.ts';
import { commonLinksOf, LONG_TAIL_ROUTES, longTailPageOf } from './jobs.ts';
import { MINUTES, type Minutes } from './routes.ts';

const LANGS = ['en', 'es'] as const;

const minutesOf = (count: number): Minutes => {
  const job = MINUTES.find((candidate) => candidate.minutes === count);
  if (job === undefined) throw new Error(`no minutes job of ${String(count)}`);
  return job;
};

/** The converter's decimal hours of `hours` hours and `minutes` minutes. */
const engine = (hours: number, minutes: number): Rational => {
  const ran = decimalHours.run({ hours: String(hours), minutes: String(minutes) });
  if (!ran.ok) throw new Error(`${String(hours)}:${String(minutes)}`);
  const value = ran.value.outputs.find(({ key }) => key === 'decimalHours')?.value;
  if (value === undefined) throw new Error('no decimal hours');
  return value;
};

const rowOf = (count: number, key: string, lang: 'en' | 'es' = 'en'): string => {
  const row = longTailPageOf(minutesOf(count), lang).rows.find((r) => r.key === key);
  if (row === undefined) throw new Error(`no row ${key}`);
  return row.value;
};

describe('minutes long-tail pages', () => {
  it('cover the common minutes people convert, in ascending order', () => {
    expect(MINUTES.map(({ minutes }) => minutes)).toEqual([10, 15, 20, 30, 40, 45, 50]);
  });

  it('write their paths in the style of the other long-tail pages', () => {
    expect(longTailPageOf(minutesOf(15), 'en').paths).toEqual({
      en: '/pay/what-is-15-minutes-in-decimal-hours',
      es: '/es/pago/cuanto-son-15-minutos-en-horas-decimales',
    });
    for (const job of MINUTES) {
      expect(LONG_TAIL_ROUTES.map(({ en }) => en)).toContain(longTailPageOf(job, 'en').paths.en);
    }
  });

  it('take every figure from the converter, never from the text', () => {
    for (const job of MINUTES) {
      for (const lang of LANGS) {
        const page = longTailPageOf(job, lang);
        expect(page.figure).toBe(decimalHoursText(engine(0, job.minutes)));
        expect(page.rows.map(({ key }) => key)).toEqual(['1', '2', '4', '8']);
        expect(page.rows.map(({ value }) => value)).toEqual(
          [1, 2, 4, 8].map((hours) => decimalHoursText(engine(hours, job.minutes))),
        );
      }
    }
  });

  it('answer the hand-verified cases', () => {
    // 15 / 60 = 0.25, exact; 8 h 15 min = 8.25
    const fifteen = longTailPageOf(minutesOf(15), 'en');
    expect(fifteen.h1).toBe('What is 15 minutes in decimal hours?');
    expect(fifteen.figure).toBe('0.25');
    expect(fifteen.title).toBe('What is 15 minutes in decimal hours? 0.25 | Cuenta Horas');
    expect(fifteen.lead).toBe(
      '15 minutes is 0.25 decimal hours: the minutes divided by 60. On a time card, 8 hours 15 minutes is 8.25 hours.',
    );
    expect(rowOf(15, '1')).toBe('1.25');
    expect(fifteen.rows[0]?.label).toBe('1 hour 15 minutes');
    expect(fifteen.rows[3]?.label).toBe('8 hours 15 minutes');
    // 45 / 60 = 0.75
    expect(longTailPageOf(minutesOf(45), 'en').figure).toBe('0.75');
    expect(rowOf(45, '2')).toBe('2.75');
    // 20 / 60 = 0.3333, rounded to 0.33; 8 h 20 min = 8.3333, 8.33
    const twenty = longTailPageOf(minutesOf(20), 'en');
    expect(twenty.figure).toBe('0.33');
    expect(twenty.lead).toBe(
      '20 minutes is 0.33 decimal hours: the minutes divided by 60, rounded to two places. On a time card, 8 hours 20 minutes is 8.33 hours.',
    );
    // 10 / 60 = 0.1667, 0.17; 40 / 60 = 0.6667, 0.67; 50 / 60 = 0.8333, 0.83
    expect(longTailPageOf(minutesOf(10), 'en').figure).toBe('0.17');
    expect(longTailPageOf(minutesOf(40), 'en').figure).toBe('0.67');
    expect(longTailPageOf(minutesOf(50), 'en').figure).toBe('0.83');
    expect(longTailPageOf(minutesOf(30), 'en').figure).toBe('0.50');
    // the Spanish twin
    const quince = longTailPageOf(minutesOf(15), 'es');
    expect(quince.h1).toBe('¿Cuánto son 15 minutos en horas decimales?');
    expect(quince.lead).toBe(
      '15 minutos son 0.25 horas decimales: los minutos divididos por 60. En una tarjeta de horas, 8 horas y 15 minutos son 8.25 horas.',
    );
    expect(quince.rows[0]?.label).toBe('1 hora y 15 minutos');
    expect(longTailPageOf(minutesOf(20), 'es').lead).toContain('redondeados a dos decimales');
  });

  it('link the converter, prefilled with the minutes', () => {
    for (const job of MINUTES) {
      for (const lang of LANGS) {
        const { calculator } = longTailPageOf(job, lang);
        const [path, query = ''] = calculator.href.split('?');
        expect(path).toBe(DECIMAL_HOURS_PATHS[lang]);
        const { state, issues } = decode(decimalHours, query);
        expect(issues).toEqual([]);
        expect(state.hours).toBe(0);
        expect(state.minutes).toBe(job.minutes);
      }
    }
  });

  it('link the six nearest other minutes', () => {
    const others = (count: number): string[] =>
      longTailPageOf(minutesOf(count), 'en').others.links.map(({ href }) => href);
    expect(others(30)).toEqual(
      [10, 15, 20, 40, 45, 50].map((m) => `/pay/what-is-${String(m)}-minutes-in-decimal-hours`),
    );
    for (const job of MINUTES) {
      for (const lang of LANGS) {
        const page = longTailPageOf(job, lang);
        expect(page.others.links).toHaveLength(6);
        expect(page.others.links.map(({ href }) => href)).not.toContain(page.paths[lang]);
      }
    }
  });

  it('are all linked from the converter, and each has its own title', () => {
    for (const lang of LANGS) {
      expect(commonLinksOf('minutes', lang).links.map(({ href }) => href)).toEqual(
        MINUTES.map((job) => longTailPageOf(job, lang).paths[lang]),
      );
    }
    const titles = MINUTES.flatMap((job) => LANGS.map((lang) => longTailPageOf(job, lang).title));
    expect(new Set(titles).size).toBe(titles.length);
  });
});
