import { decode } from '@maestro-calc/core';
import { payConverter } from '@maestro-calc/pay-core/pay-converter';
import { describe, expect, it } from 'vitest';
import { moneyText } from '../format.ts';
import { PATHS } from '../pay-converter/texts.ts';
import { commonLinksOf, JOBS, LONG_TAIL_ROUTES, longTailPageOf } from './jobs.ts';

const LANGS = ['en', 'es'] as const;

const jobOf = (amount: string): (typeof JOBS)[number] => {
  const job = JOBS.find((candidate) => candidate.amount === amount);
  if (job === undefined) throw new Error(`no job of ${amount}`);
  return job;
};

describe('long-tail pages', () => {
  it('take every figure from the pay converter, never from the text', () => {
    for (const job of JOBS) {
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
  });

  it('cover the common hourly rates and salaries people search', () => {
    expect(JOBS.filter(({ per }) => per === 'hour').map(({ amount }) => amount)).toEqual([
      '15',
      '16',
      '17',
      '18',
      '20',
      '22',
      '25',
      '30',
    ]);
    expect(JOBS.filter(({ per }) => per === 'year').map(({ amount }) => amount)).toEqual([
      '40000',
      '45000',
      '50000',
      '60000',
      '70000',
      '80000',
      '100000',
    ]);
  });

  it('link the matching calculator, prefilled through its URL state', () => {
    for (const job of JOBS) {
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
    for (const route of LONG_TAIL_ROUTES) {
      expect(route.kind).toBe('article');
      expect(route.en).toMatch(/^\/pay\/[a-z0-9-]+$/);
      expect(route.es).toMatch(/^\/es\/pago\/[a-z0-9-]+$/);
    }
  });

  it('are linked from the calculator of their kind, in each language', () => {
    for (const lang of LANGS) {
      const linked = (['hour', 'year'] as const).flatMap((per) =>
        commonLinksOf(per, lang).links.map(({ href }) => href),
      );
      expect(linked.sort()).toEqual(LONG_TAIL_ROUTES.map((route) => route[lang]).sort());
    }
  });
});
