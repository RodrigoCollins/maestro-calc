import { decode, Rational, type Money } from '@maestro-calc/core';
import { shiftDifferential } from '@maestro-calc/pay-core/shift-differential';
import { describe, expect, it } from 'vitest';
import { moneyText } from '../format.ts';
import { SHIFT_PATHS, SHIFT_TEXTS } from '../shift/texts.ts';
import { differentialWeekOf } from './differentials.ts';
import { commonLinksOf, LONG_TAIL_ROUTES, longTailPageOf } from './jobs.ts';
import { DIFFERENTIALS, type Differential } from './routes.ts';

const LANGS = ['en', 'es'] as const;

/** A job by its name: `10%@20` is a 10% differential on $20, `$2@18` is $2 an hour on $18. */
const nameOf = (job: Differential): string =>
  job.source === 'percent'
    ? `${job.differential}%@${job.amount}`
    : `$${job.differential}@${job.amount}`;

const differentialOf = (name: string): Differential => {
  const job = DIFFERENTIALS.find((candidate) => nameOf(candidate) === name);
  if (job === undefined) throw new Error(`no differential job ${name}`);
  return job;
};

/** The calculator's money outputs for the job with `baseHours` at the base rate and `shiftHours`. */
const engine = (
  job: Differential,
  baseHours: number,
  shiftHours: number,
): ((key: string) => string) => {
  const ran = shiftDifferential.run({
    rate: job.amount,
    source: job.source,
    [job.source]: job.differential,
    baseHours: String(baseHours),
    shiftHours: String(shiftHours),
  });
  if (!ran.ok) throw new Error(`${nameOf(job)} must run`);
  const out = new Map<string, Money | Rational>(
    ran.value.outputs.map(({ key, value }) => [key, value]),
  );
  return (key) => {
    const value = out.get(key);
    if (value === undefined || !('currency' in value)) throw new Error(`no money ${key}`);
    return moneyText(value);
  };
};

describe('shift differential long-tail pages', () => {
  it('cover a 10% differential and a few dollars an hour at common rates, in order', () => {
    expect(DIFFERENTIALS.map(nameOf)).toEqual([
      '10%@15',
      '10%@18',
      '10%@20',
      '15%@20',
      '10%@22',
      '10%@25',
      '10%@30',
      '$2@15',
      '$2@18',
      '$1@20',
      '$2@20',
      '$3@20',
      '$2@25',
    ]);
  });

  it('write their paths in the style of the other long-tail pages', () => {
    expect(longTailPageOf(differentialOf('10%@20'), 'en').paths).toEqual({
      en: '/pay/10-percent-shift-differential-on-20-an-hour',
      es: '/es/pago/diferencial-de-turno-del-10-por-ciento-sobre-20-la-hora',
    });
    expect(longTailPageOf(differentialOf('$2@18'), 'es').paths).toEqual({
      en: '/pay/18-an-hour-with-a-2-dollar-shift-differential',
      es: '/es/pago/18-la-hora-con-diferencial-de-turno-de-2-dolares',
    });
    for (const job of DIFFERENTIALS) {
      expect(LONG_TAIL_ROUTES.map(({ en }) => en)).toContain(longTailPageOf(job, 'en').paths.en);
    }
  });

  it('take the shift rate and the 48-hour week from the calculator, never from the text', () => {
    for (const job of DIFFERENTIALS) {
      const week = engine(job, 24, 24);
      for (const lang of LANGS) {
        const page = longTailPageOf(job, lang);
        expect(page.figure).toBe(engine(job, 0, 1)('shiftRate'));
        expect(page.figureLabel).toBe(SHIFT_TEXTS[lang].outputs.shiftRate);
        expect(page.rows.map(({ key }) => key)).toEqual([
          'differentialPay',
          'straightPay',
          'regularRate',
          'overtimePremium',
          'pay',
        ]);
        expect(page.rows.map(({ value }) => value)).toEqual(
          ['differentialPay', 'straightPay', 'regularRate', 'overtimePremium', 'pay'].map(week),
        );
        expect(page.note).toBe(SHIFT_TEXTS[lang].notes[2]);
      }
    }
  });

  it('answer the hand-verified cases', () => {
    // 20 x 1.10 = 22; 24 x 20 + 24 x 22 = 1,008; 1,008 / 48 = 21; 8 x 10.50 = 84; 1,092
    const page = longTailPageOf(differentialOf('10%@20'), 'en');
    expect(page.h1).toBe('What is a 10% shift differential on $20 an hour?');
    expect(page.figure).toBe('$22.00');
    expect(page.title).toBe('What is a 10% shift differential on $20 an hour? $22 | Cuenta Horas');
    expect(page.lead).toBe(
      'A 10% shift differential on $20 an hour adds $2 an hour, so the shift pays $22 an hour. In a 48-hour week, 24 hours at $20 and 24 on the shift, the differential counts in the regular rate for overtime: $21 an hour, so the 8 hours over 40 add $84 and the week pays $1,092 before taxes.',
    );
    expect(page.rows.find(({ key }) => key === 'differentialPay')?.value).toBe('$48.00');
    // 18 + 2 = 20; 24 x 18 + 24 x 20 = 912; 912 / 48 = 19; 8 x 9.50 = 76; 988
    const dos = longTailPageOf(differentialOf('$2@18'), 'es');
    expect(dos.h1).toBe('¿Cuánto es $18 la hora con un diferencial de turno de $2?');
    expect(dos.lead).toBe(
      '$18 la hora con un diferencial de turno de $2 paga $20 la hora en el turno. En una semana de 48 horas, 24 a $18 y 24 en el turno, el diferencial cuenta en la tarifa regular para horas extra: $19 la hora, así que las 8 horas después de 40 suman $76 y la semana paga $988 antes de impuestos.',
    );
    // 15 x 1.10 = 16.50; 360 + 396 = 756; 756 / 48 = 15.75; 8 x 7.875 = 63; 819
    const quince = longTailPageOf(differentialOf('10%@15'), 'en');
    expect(quince.figure).toBe('$16.50');
    expect(quince.rows.find(({ key }) => key === 'regularRate')?.value).toBe('$15.75');
    expect(quince.rows.find(({ key }) => key === 'overtimePremium')?.value).toBe('$63.00');
    expect(quince.rows.find(({ key }) => key === 'pay')?.value).toBe('$819.00');
    // 20 x 1.15 = 23; 480 + 552 = 1,032; 1,032 / 48 = 21.50; 8 x 10.75 = 86; 1,118
    expect(longTailPageOf(differentialOf('15%@20'), 'es').lead).toBe(
      'Un diferencial de turno del 15% sobre $20 la hora suma $3 la hora, así que el turno paga $23 la hora. En una semana de 48 horas, 24 a $20 y 24 en el turno, el diferencial cuenta en la tarifa regular para horas extra: $21.50 la hora, así que las 8 horas después de 40 suman $86 y la semana paga $1,118 antes de impuestos.',
    );
  });

  it('link the shift differential calculator, prefilled with the 48-hour week', () => {
    for (const job of DIFFERENTIALS) {
      for (const lang of LANGS) {
        const { calculator } = longTailPageOf(job, lang);
        const [path, query = ''] = calculator.href.split('?');
        expect(path).toBe(SHIFT_PATHS[lang]);
        const { state, issues } = decode(shiftDifferential, query);
        expect(issues).toEqual([]);
        const validated = shiftDifferential.validate(differentialWeekOf(job));
        if (!validated.ok) throw new Error('the week must validate');
        expect(state).toEqual(validated.value);
        expect(state.source).toBe(job.source);
        expect(state.baseHours).toEqual(Rational.of(24));
        expect(state.shiftHours).toEqual(Rational.of(24));
      }
    }
  });

  it('link the nearest other shift differential pages', () => {
    const others = longTailPageOf(differentialOf('10%@20'), 'en').others.links.map(
      ({ href }) => href,
    );
    expect(others).toEqual([
      '/pay/10-percent-shift-differential-on-15-an-hour',
      '/pay/10-percent-shift-differential-on-18-an-hour',
      '/pay/15-percent-shift-differential-on-20-an-hour',
      '/pay/10-percent-shift-differential-on-22-an-hour',
      '/pay/10-percent-shift-differential-on-25-an-hour',
      '/pay/10-percent-shift-differential-on-30-an-hour',
    ]);
    for (const job of DIFFERENTIALS) {
      for (const lang of LANGS) {
        const page = longTailPageOf(job, lang);
        expect(page.others.links).toHaveLength(6);
        expect(page.others.links.map(({ href }) => href)).not.toContain(page.paths[lang]);
      }
    }
  });

  it('are all linked from the shift differential calculator, and each has its own title', () => {
    for (const lang of LANGS) {
      expect(commonLinksOf('differential', lang).links.map(({ href }) => href)).toEqual(
        DIFFERENTIALS.map((job) => longTailPageOf(job, lang).paths[lang]),
      );
    }
    const titles = DIFFERENTIALS.flatMap((job) =>
      LANGS.map((lang) => longTailPageOf(job, lang).title),
    );
    expect(new Set(titles).size).toBe(titles.length);
  });
});
