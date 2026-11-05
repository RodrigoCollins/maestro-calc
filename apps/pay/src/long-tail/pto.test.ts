import { decode, Rational } from '@maestro-calc/core';
import { ptoAccrual } from '@maestro-calc/pay-core/pto-accrual';
import { describe, expect, it } from 'vitest';
import { decimalHoursText, hoursText, rateText } from '../format.ts';
import { PTO_PATHS, PTO_TEXTS } from '../pto/texts.ts';
import { commonLinksOf, LONG_TAIL_ROUTES, longTailPageOf } from './jobs.ts';
import { PTOS, type Pto } from './routes.ts';

const LANGS = ['en', 'es'] as const;

const ptoOf = (days: number): Pto => {
  const job = PTOS.find((candidate) => candidate.days === days);
  if (job === undefined) throw new Error(`no PTO job of ${String(days)} days`);
  return job;
};

/** The PTO accrual calculator's outputs for `days` at its defaults. */
const engine = (days: number): ((key: string) => Rational) => {
  const ran = ptoAccrual.run({ ptoDays: String(days) });
  if (!ran.ok) throw new Error(String(days));
  return (key) => {
    const value = ran.value.outputs.find((output) => output.key === key)?.value;
    if (value === undefined) throw new Error(`no output ${key}`);
    return value;
  };
};

const rowOf = (days: number, key: string, lang: 'en' | 'es' = 'en'): string => {
  const row = longTailPageOf(ptoOf(days), lang).rows.find((candidate) => candidate.key === key);
  if (row === undefined) throw new Error(`no row ${key}`);
  return row.value;
};

describe('PTO long-tail pages', () => {
  it('cover the common paid days off a year, in ascending order', () => {
    expect(PTOS.map(({ days }) => days)).toEqual([5, 10, 12, 15, 20, 25]);
  });

  it('write their paths in the style of the other long-tail pages', () => {
    expect(longTailPageOf(ptoOf(15), 'en').paths).toEqual({
      en: '/pay/pto-per-paycheck-with-15-days-a-year',
      es: '/es/pago/vacaciones-por-cheque-con-15-dias-al-ano',
    });
    for (const job of PTOS) {
      expect(LONG_TAIL_ROUTES.map(({ en }) => en)).toContain(longTailPageOf(job, 'en').paths.en);
    }
  });

  it('take every figure from the PTO accrual calculator, never from the text', () => {
    for (const job of PTOS) {
      const out = engine(job.days);
      for (const lang of LANGS) {
        const page = longTailPageOf(job, lang);
        expect(page.figure).toContain(decimalHoursText(out('biweekly')));
        expect(page.rows.map(({ key }) => key)).toEqual([
          'weekly',
          'semimonthly',
          'monthly',
          'perHourWorked',
          'hoursPerPtoHour',
          'annualHours',
        ]);
        expect(page.rows.map(({ value }) => value)).toEqual([
          decimalHoursText(out('weekly')),
          decimalHoursText(out('semimonthly')),
          decimalHoursText(out('monthly')),
          rateText(out('perHourWorked')),
          hoursText(out('hoursPerPtoHour')),
          hoursText(out('annualHours')),
        ]);
        expect(page.rows.map(({ label }) => label)).toEqual(
          page.rows.map(({ key }) => PTO_TEXTS[lang].outputs[key as 'weekly']),
        );
      }
    }
  });

  it('answer the hand-verified cases', () => {
    // 10 days x 8 h = 80 h a year; 80 / 26 = 3.0769 h every two weeks; 2,080 / 80 = 26
    const ten = longTailPageOf(ptoOf(10), 'en');
    expect(ten.h1).toBe('How much PTO do I earn per paycheck with 10 days a year?');
    expect(ten.figure).toBe('3.08 hours');
    // too long with the site name for a result to show whole, so the answer keeps the room
    expect(ten.title).toBe('How much PTO do I earn per paycheck with 10 days a year? 3.08 hours');
    expect(ten.lead).toBe(
      'With 10 paid days off a year of 8 hours and a 40-hour week, you earn 3.08 PTO hours every two weeks. That is 80 PTO hours a year over 26 biweekly paychecks, or 1 hour off for every 26 hours you work.',
    );
    expect(rowOf(10, 'weekly')).toBe('1.54');
    expect(rowOf(10, 'monthly')).toBe('6.67');
    expect(rowOf(10, 'perHourWorked')).toBe('0.0385');
    // 15 days = 120 h; 120 / 26 = 4.6154; 120 / 24 = 5; 2,080 / 120 = 17.33
    expect(longTailPageOf(ptoOf(15), 'en').figure).toBe('4.62 hours');
    expect(rowOf(15, 'semimonthly')).toBe('5.00');
    expect(rowOf(15, 'hoursPerPtoHour')).toBe('17.33');
    // 20 days = 160 h; 160 / 26 = 6.1538; 160 / 12 = 13.33; 2,080 / 160 = 13
    expect(longTailPageOf(ptoOf(20), 'en').figure).toBe('6.15 hours');
    expect(rowOf(20, 'monthly')).toBe('13.33');
    expect(rowOf(20, 'hoursPerPtoHour')).toBe('13');
    expect(rowOf(20, 'annualHours')).toBe('160');
    // the Spanish twin
    const diez = longTailPageOf(ptoOf(10), 'es');
    expect(diez.h1).toBe('¿Cuánto PTO gano por cheque con 10 días libres al año?');
    expect(diez.figure).toBe('3.08 horas');
    expect(diez.lead).toBe(
      'Con 10 días libres pagados al año de 8 horas y una semana de 40 horas, ganas 3.08 horas de PTO cada dos semanas. Son 80 horas de PTO al año en 26 cheques, o 1 hora libre por cada 26 horas que trabajas.',
    );
  });

  it('link the PTO accrual calculator, prefilled with the days and its defaults', () => {
    for (const job of PTOS) {
      for (const lang of LANGS) {
        const { calculator } = longTailPageOf(job, lang);
        const [path, query = ''] = calculator.href.split('?');
        expect(path).toBe(PTO_PATHS[lang]);
        const { state, issues } = decode(ptoAccrual, query);
        expect(issues).toEqual([]);
        expect(state.ptoDays.equals(Rational.of(job.days))).toBe(true);
        expect(state.hoursPerDay.equals(Rational.of(8))).toBe(true);
        expect(state.hoursPerWeek.equals(Rational.of(40))).toBe(true);
      }
    }
  });

  it('link the nearest other PTO pages', () => {
    const others = (days: number): string[] =>
      longTailPageOf(ptoOf(days), 'en').others.links.map(({ href }) => href);
    expect(others(15)).toEqual(
      [5, 10, 12, 20, 25].map((days) => `/pay/pto-per-paycheck-with-${String(days)}-days-a-year`),
    );
    for (const job of PTOS) {
      for (const lang of LANGS) {
        const page = longTailPageOf(job, lang);
        expect(page.others.links).toHaveLength(PTOS.length - 1);
        expect(page.others.links.map(({ href }) => href)).not.toContain(page.paths[lang]);
      }
    }
  });

  it('are all linked from the PTO accrual calculator, and each has its own title', () => {
    for (const lang of LANGS) {
      expect(commonLinksOf('pto', lang).links.map(({ href }) => href)).toEqual(
        PTOS.map((job) => longTailPageOf(job, lang).paths[lang]),
      );
    }
    const titles = PTOS.flatMap((job) => LANGS.map((lang) => longTailPageOf(job, lang).title));
    expect(new Set(titles).size).toBe(titles.length);
  });
});
