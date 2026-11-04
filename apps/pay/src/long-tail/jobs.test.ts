import { decode, Rational, type Money } from '@maestro-calc/core';
import { payConverter } from '@maestro-calc/pay-core/pay-converter';
import { timeCard } from '@maestro-calc/pay-core/time-card';
import { describe, expect, it } from 'vitest';
import { moneyText } from '../format.ts';
import { PATHS } from '../pay-converter/texts.ts';
import {
  commonLinksOf,
  JOBS,
  LONG_TAIL_ROUTES,
  longTailPageOf,
  overtimeWeekOf,
  TIME_CARD_PATHS,
} from './jobs.ts';

const LANGS = ['en', 'es'] as const;

/** The pay converter jobs; the overtime jobs run through the time card. */
const CONVERTS = JOBS.filter(({ kind }) => kind === 'convert');
const OVERTIMES = JOBS.filter(({ kind }) => kind === 'overtime');

const jobOf = (amount: string, kind: 'convert' | 'overtime' = 'convert'): (typeof JOBS)[number] => {
  const job = JOBS.find((candidate) => candidate.amount === amount && candidate.kind === kind);
  if (job === undefined) throw new Error(`no ${kind} job of ${amount}`);
  return job;
};

/** The time card's overtime pay and week pay for `hours` overtime hours at `rate`. */
const timeCardPay = (rate: string, hours: number): { overtime: string; week: string } => {
  const ran = timeCard.run(overtimeWeekOf(rate, hours));
  if (!ran.ok) throw new Error(`${rate} with ${String(hours)} h must run`);
  const out = new Map<string, Money | Rational>(
    ran.value.outputs.map(({ key, value }) => [key, value]),
  );
  const money = (key: string): string => {
    const value = out.get(key);
    if (value === undefined || !('currency' in value)) throw new Error(`no money ${key}`);
    return moneyText(value);
  };
  expect(out.get('overtimeHours')).toEqual(Rational.of(hours));
  expect(out.get('regularHours')).toEqual(Rational.of(40));
  return { overtime: money('overtimePay'), week: money('pay') };
};

// prettier-ignore
const HOURLY = ['15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '28', '30', '35', '40', '45', '50'];
// prettier-ignore
const SALARIES = ['30000', '35000', '40000', '45000', '50000', '55000', '60000', '65000', '70000', '75000', '80000', '90000', '100000', '120000', '150000'];
const OVERTIME_RATES = ['15', '16', '17', '18', '19', '20', '22', '25', '30'];

describe('long-tail pages', () => {
  it('take every figure from the pay converter, never from the text', () => {
    for (const job of CONVERTS) {
      const ran = payConverter.run({ amount: job.amount, per: job.per });
      if (!ran.ok) throw new Error(job.amount);
      const engine = Object.fromEntries(
        ran.value.outputs.map(({ key, value }) => [key, moneyText(value)]),
      );
      for (const lang of LANGS) {
        const page = longTailPageOf(job, lang);
        for (const { key, value } of page.rows) expect(value).toBe(engine[key]);
        expect(page.figure).toBe(engine[job.per === 'hour' ? 'annual' : 'hourly']);
      }
    }
  });

  it('answer the hand-verified cases', () => {
    // 20 x 40 x 52 = 41,600; 41,600 / 12 = 3,466.67; 20 x 40 = 800
    const twenty = longTailPageOf(jobOf('20'), 'en');
    expect(twenty.figure).toBe('$41,600.00');
    expect(twenty.rows.find(({ key }) => key === 'monthly')?.value).toBe('$3,466.67');
    expect(twenty.rows.find(({ key }) => key === 'weekly')?.value).toBe('$800.00');
    // 50,000 / (40 x 52) = 24.038...
    const fifty = longTailPageOf(jobOf('50000'), 'es');
    expect(fifty.figure).toBe('$24.04');
    expect(fifty.h1).toBe('¿$50,000 al año cuánto es por hora?');
    // 22 x 40 x 52 = 45,760; 45,760 / 12 = 3,813.33; 22 x 40 = 880
    const twentyTwo = longTailPageOf(jobOf('22'), 'en');
    expect(twentyTwo.figure).toBe('$45,760.00');
    expect(twentyTwo.rows.find(({ key }) => key === 'monthly')?.value).toBe('$3,813.33');
    expect(twentyTwo.rows.find(({ key }) => key === 'weekly')?.value).toBe('$880.00');
    // 45,000 / (40 x 52) = 45,000 / 2,080 = 21.634...
    expect(longTailPageOf(jobOf('45000'), 'en').figure).toBe('$21.63');
    // 19 x 40 x 52 = 39,520; 35 x 2,080 = 72,800
    expect(longTailPageOf(jobOf('19'), 'en').figure).toBe('$39,520.00');
    expect(longTailPageOf(jobOf('35'), 'es').figure).toBe('$72,800.00');
    // 55,000 / 2,080 = 26.442...; 150,000 / 2,080 = 72.115...
    expect(longTailPageOf(jobOf('55000'), 'en').figure).toBe('$26.44');
    expect(longTailPageOf(jobOf('150000'), 'en').figure).toBe('$72.12');
    expect(longTailPageOf(jobOf('150000'), 'en').h1).toBe('$150,000 a year is how much an hour?');
  });

  it('link the nearest amounts of their family, never every page of it', () => {
    const others = (amount: string, kind: 'convert' | 'overtime' = 'convert'): string[] =>
      longTailPageOf(jobOf(amount, kind), 'en').others.links.map(({ href }) => href);
    expect(others('15')).toEqual(
      ['16', '17', '18', '19', '20', '21'].map((a) => `/pay/${a}-an-hour-is-how-much-a-year`),
    );
    expect(others('30')).toEqual(
      ['25', '26', '28', '35', '40', '45'].map((a) => `/pay/${a}-an-hour-is-how-much-a-year`),
    );
    expect(others('50000')).toEqual(
      ['35000', '40000', '45000', '55000', '60000', '65000'].map(
        (a) => `/pay/${a}-a-year-is-how-much-an-hour`,
      ),
    );
    expect(others('30', 'overtime')).toEqual(
      ['17', '18', '19', '20', '22', '25'].map((a) => `/pay/time-and-a-half-for-${a}-an-hour`),
    );
    for (const job of JOBS) {
      for (const lang of LANGS) {
        const { links } = longTailPageOf(job, lang).others;
        expect(links).toHaveLength(6);
        expect(links.map(({ href }) => href)).not.toContain(longTailPageOf(job, lang).paths[lang]);
      }
    }
  });

  it('cover the common hourly rates and salaries people search', () => {
    expect(CONVERTS.filter(({ per }) => per === 'hour').map(({ amount }) => amount)).toEqual(
      HOURLY,
    );
    expect(CONVERTS.filter(({ per }) => per === 'year').map(({ amount }) => amount)).toEqual(
      SALARIES,
    );
    expect(OVERTIMES.map(({ amount }) => amount)).toEqual(OVERTIME_RATES);
  });

  it('link the matching calculator, prefilled through its URL state', () => {
    for (const job of CONVERTS) {
      for (const lang of LANGS) {
        const { calculator } = longTailPageOf(job, lang);
        const [path, query = ''] = calculator.href.split('?');
        expect(path).toBe(PATHS[job.per === 'hour' ? 'hourly' : 'salary'][lang]);
        const { state, issues } = decode(payConverter, query);
        expect(issues).toEqual([]);
        expect(moneyText(state.amount).replace(/[$,]/g, '')).toBe(Number(job.amount).toFixed(2));
        expect(state.per).toBe(job.per);
      }
    }
  });

  it('route one English and Spanish pair per job, each with its own title', () => {
    expect(LONG_TAIL_ROUTES).toHaveLength(JOBS.length);
    const titles = JOBS.flatMap((job) => LANGS.map((lang) => longTailPageOf(job, lang).title));
    expect(new Set(titles).size).toBe(titles.length);
    expect(LONG_TAIL_ROUTES.map(({ en }) => en)).toContain('/pay/time-and-a-half-for-20-an-hour');
    expect(LONG_TAIL_ROUTES.map(({ es }) => es)).toContain('/es/pago/tiempo-y-medio-de-20-la-hora');
    for (const route of LONG_TAIL_ROUTES) {
      expect(route.kind).toBe('article');
      expect(route.en).toMatch(/^\/pay\/[a-z0-9-]+$/);
      expect(route.es).toMatch(/^\/es\/pago\/[a-z0-9-]+$/);
    }
  });

  it('are linked from the calculator of their kind, in each language', () => {
    for (const lang of LANGS) {
      const linked = (['hour', 'year', 'overtime'] as const).flatMap((per) =>
        commonLinksOf(per, lang).links.map(({ href }) => href),
      );
      expect(linked.sort()).toEqual(LONG_TAIL_ROUTES.map((route) => route[lang]).sort());
    }
  });
});

describe('overtime long-tail pages', () => {
  it('take the overtime rate and pay from the time card, never from the text', () => {
    for (const job of OVERTIMES) {
      for (const lang of LANGS) {
        const page = longTailPageOf(job, lang);
        // the rate is the time card's pay for one overtime hour
        expect(page.figure).toBe(timeCardPay(job.amount, 1).overtime);
        expect(page.rows.map(({ value }) => value)).toEqual(
          [5, 10, 15, 20].map((hours) => timeCardPay(job.amount, hours).overtime),
        );
      }
    }
  });

  it('answer the hand-verified case', () => {
    // 20 x 1.5 = 30 an hour; 10 x 30 = 300; 40 x 20 + 300 = 1,100
    const page = longTailPageOf(jobOf('20', 'overtime'), 'en');
    expect(page.h1).toBe('What is time and a half for $20 an hour?');
    expect(page.figure).toBe('$30.00');
    expect(page.rows.find(({ key }) => key === '10')?.value).toBe('$300.00');
    expect(page.lead).toBe(
      'Time and a half for $20 an hour is $30 an hour. Under the federal rule, 10 overtime hours past 40 in a week pay $300, and the 50-hour week comes to $1,100 before taxes.',
    );
    expect(timeCardPay('20', 10)).toEqual({ overtime: '$300.00', week: '$1,100.00' });
    // 15 x 1.5 = 22.50; 10 x 22.50 = 225
    const fifteen = longTailPageOf(jobOf('15', 'overtime'), 'es');
    expect(fifteen.h1).toBe('¿Cuánto es tiempo y medio de $15 la hora?');
    expect(fifteen.figure).toBe('$22.50');
    expect(fifteen.rows.find(({ key }) => key === '10')?.value).toBe('$225.00');
    // 17 x 1.5 = 25.50
    expect(longTailPageOf(jobOf('17', 'overtime'), 'en').figure).toBe('$25.50');
  });

  it('link the time card, prefilled with the 50-hour week at the rate', () => {
    for (const job of OVERTIMES) {
      for (const lang of LANGS) {
        const { calculator } = longTailPageOf(job, lang);
        const [path, query = ''] = calculator.href.split('?');
        expect(path).toBe(TIME_CARD_PATHS[lang]);
        const { state, issues } = decode(timeCard, query);
        expect(issues).toEqual([]);
        const validated = timeCard.validate(overtimeWeekOf(job.amount, 10));
        if (!validated.ok) throw new Error('the week must validate');
        expect(state).toEqual(validated.value);
      }
    }
  });
});
