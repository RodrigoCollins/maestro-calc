import { decode, Rational, type Money } from '@maestro-calc/core';
import { overtime } from '@maestro-calc/pay-core/overtime';
import { describe, expect, it } from 'vitest';
import { moneyText } from '../format.ts';
import { OVERTIME_PATHS, OVERTIME_TEXTS } from '../overtime/texts.ts';
import { doubleWeekOf } from './doubles.ts';
import { commonLinksOf, LONG_TAIL_ROUTES, longTailPageOf } from './jobs.ts';
import { DOUBLES, type DoubleTime } from './routes.ts';

const LANGS = ['en', 'es'] as const;

const doubleOf = (amount: string): DoubleTime => {
  const job = DOUBLES.find((candidate) => candidate.amount === amount);
  if (job === undefined) throw new Error(`no double-time job of ${amount}`);
  return job;
};

/** The overtime calculator's money outputs for the California week with `hours` double hours. */
const engine = (rate: string, hours: number): ((key: string) => string) => {
  const ran = overtime.run(doubleWeekOf(rate, hours));
  if (!ran.ok) throw new Error(`${rate} with ${String(hours)} h must run`);
  const out = new Map<string, Money | Rational>(
    ran.value.outputs.map(({ key, value }) => [key, value]),
  );
  expect(out.get('doubleHours')).toEqual(Rational.of(hours));
  expect(out.get('regularHours')).toEqual(Rational.of(40));
  expect(out.get('overtimeHours')).toEqual(Rational.of(4));
  return (key) => {
    const value = out.get(key);
    if (value === undefined || !('currency' in value)) throw new Error(`no money ${key}`);
    return moneyText(value);
  };
};

describe('double-time long-tail pages', () => {
  it('cover the common hourly rates, in ascending order', () => {
    expect(DOUBLES.map(({ amount }) => amount)).toEqual(['15', '18', '20', '22', '25', '30']);
  });

  it('write their paths in the style of the other long-tail pages', () => {
    expect(longTailPageOf(doubleOf('20'), 'en').paths).toEqual({
      en: '/pay/double-time-for-20-an-hour',
      es: '/es/pago/tiempo-doble-de-20-la-hora',
    });
    for (const job of DOUBLES) {
      expect(LONG_TAIL_ROUTES.map(({ en }) => en)).toContain(longTailPageOf(job, 'en').paths.en);
    }
  });

  it('take the double-time rate and pay from the overtime calculator, never from the text', () => {
    for (const job of DOUBLES) {
      for (const lang of LANGS) {
        const page = longTailPageOf(job, lang);
        expect(page.figure).toBe(engine(job.amount, 1)('doubleRate'));
        expect(page.rows.map(({ key }) => key)).toEqual(['1', '2', '4', '8']);
        expect(page.rows.map(({ value }) => value)).toEqual(
          [1, 2, 4, 8].map((hours) => engine(job.amount, hours)('doublePay')),
        );
        expect(page.figureLabel).toBe(OVERTIME_TEXTS[lang].doubleRate);
      }
    }
  });

  it('answer the hand-verified cases', () => {
    // 20 x 2 = 40 an hour; 2 x 40 = 80; 40 x 20 + 4 x 30 + 80 = 1,000
    const page = longTailPageOf(doubleOf('20'), 'en');
    expect(page.h1).toBe('What is double time for $20 an hour?');
    expect(page.figure).toBe('$40.00');
    expect(page.title).toBe('What is double time for $20 an hour? $40 | Cuenta Horas');
    expect(page.rows.find(({ key }) => key === '8')?.value).toBe('$320.00');
    expect(page.lead).toBe(
      'Double time for $20 an hour is $40 an hour. In California, hours past 12 in a day pay double: a 14-hour day pays 2 hours of double time, $80, and a week of that day and four 8-hour days comes to $1,000 before taxes.',
    );
    expect(engine('20', 2)('pay')).toBe('$1,000.00');
    // 15 x 2 = 30; 4 x 30 = 120
    const quince = longTailPageOf(doubleOf('15'), 'es');
    expect(quince.h1).toBe('¿Cuánto es tiempo doble de $15 la hora?');
    expect(quince.figure).toBe('$30.00');
    expect(quince.rows.find(({ key }) => key === '4')?.value).toBe('$120.00');
    // 22 x 2 = 44; 40 x 22 + 4 x 33 + 2 x 44 = 880 + 132 + 88 = 1,100
    expect(longTailPageOf(doubleOf('22'), 'es').lead).toBe(
      'Tiempo doble de $22 la hora es $44 la hora. En California, las horas después de 12 en un día se pagan al doble: un día de 14 horas paga 2 horas dobles, $88, y una semana con ese día y cuatro días de 8 horas suma $1,100 antes de impuestos.',
    );
  });

  it('link the overtime calculator, prefilled with the California week at the rate', () => {
    for (const job of DOUBLES) {
      for (const lang of LANGS) {
        const { calculator } = longTailPageOf(job, lang);
        const [path, query = ''] = calculator.href.split('?');
        expect(path).toBe(OVERTIME_PATHS[lang]);
        const { state, issues } = decode(overtime, query);
        expect(issues).toEqual([]);
        const validated = overtime.validate(doubleWeekOf(job.amount, 2));
        if (!validated.ok) throw new Error('the week must validate');
        expect(state).toEqual(validated.value);
        expect(state.rule).toBe('california');
      }
    }
  });

  it('link the nearest other double-time pages', () => {
    const others = longTailPageOf(doubleOf('20'), 'en').others.links.map(({ href }) => href);
    expect(others).toEqual(
      ['15', '18', '22', '25', '30'].map((rate) => `/pay/double-time-for-${rate}-an-hour`),
    );
    for (const job of DOUBLES) {
      for (const lang of LANGS) {
        const page = longTailPageOf(job, lang);
        expect(page.others.links).toHaveLength(DOUBLES.length - 1);
        expect(page.others.links.map(({ href }) => href)).not.toContain(page.paths[lang]);
      }
    }
  });

  it('are all linked from the overtime calculator, and each has its own title', () => {
    for (const lang of LANGS) {
      expect(commonLinksOf('double', lang).links.map(({ href }) => href)).toEqual(
        DOUBLES.map((job) => longTailPageOf(job, lang).paths[lang]),
      );
    }
    const titles = DOUBLES.flatMap((job) => LANGS.map((lang) => longTailPageOf(job, lang).title));
    expect(new Set(titles).size).toBe(titles.length);
  });
});
