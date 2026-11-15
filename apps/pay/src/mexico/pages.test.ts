import { describe, expect, it } from 'vitest';
import { DESCRIPTION, TITLE_MAX } from '../seo/meta.ts';
import { aguinaldoPageOf, mexicoArticleOf, vacacionesPageOf } from './pages.ts';
import { AGUINALDO_PATH, MEXICO_SLUGS, mexicoPathOf, VACACIONES_PATH } from './routes.ts';

const textOf = (value: unknown): string => JSON.stringify(value);

describe('aguinaldoPageOf', () => {
  const page = aguinaldoPageOf();

  it('answers with no script: 15 days of $315.04 for 2026, $4,725.60', () => {
    expect(page.result.figure).toBe('$4,725.60');
    expect(page.result.rows.map(({ key, value }) => [key, value])).toEqual([
      ['daily', '$315.04'],
      ['worked', '365 días'],
      ['earned', '15 días'],
      ['exempt', '$3,519.30'],
      ['taxable', '$1,206.30'],
    ]);
    expect(page.paths).toEqual({ es: AGUINALDO_PATH });
  });

  it('works the partial year, the monthly salary and the exempt part out by the engine', () => {
    const text = textOf(page.sections);
    // 1 July to 31 December: 184 days; 4,725.60 × 184 / 365 = 2,382.22
    expect(text).toContain('184 días');
    expect(text).toContain('$2,382.22');
    // 12,000 / 30 = 400.00 a day; × 15 = 6,000.00; taxable 2,480.70
    expect(text).toContain('$6,000.00');
    expect(text).toContain('$2,480.70');
  });
});

describe('vacacionesPageOf', () => {
  const page = vacacionesPageOf();

  it('answers with no script: five years of service, 20 days, prima $1,575.20', () => {
    expect(page.result.figure).toBe('20 días');
    expect(page.result.rows.map(({ key, value }) => [key, value])).toEqual([
      ['years', '5 años'],
      ['pay', '$6,300.80'],
      ['prima', '$1,575.20'],
      ['exempt', '$1,575.20'],
      ['taxable', '$0.00'],
      ['next', '22 días desde el viernes 15 de enero de 2027'],
    ]);
    expect(page.paths).toEqual({ es: VACACIONES_PATH });
  });

  it('works 11 years on $15,000 a month out by the engine', () => {
    const text = textOf(page.sections);
    // 500 a day × 24 = 12,000.00; prima 3,000.00; exempt 1,759.65; taxable 1,240.35
    for (const figure of ['$12,000.00', '$3,000.00', '$1,759.65', '$1,240.35'])
      expect(text).toContain(figure);
  });
});

describe('mexicoArticleOf', () => {
  it('answers the days of aguinaldo by law: 15 days, before 20 December', () => {
    const page = mexicoArticleOf('cuantos-dias-de-aguinaldo-son-por-ley');
    expect(page.answer.figure).toBe('15 días');
    expect(page.lead).toContain('20 de diciembre');
    const text = textOf(page.sections);
    // 315.04 × 30 = 9,451.20; hired 1 October: 92 days, 4,725.60 × 92 / 365 = 1,191.11
    expect(text).toContain('$9,451.20');
    expect(text).toContain('92 días');
    expect(text).toContain('$1,191.11');
  });

  it('dates the aguinaldo of 2026: 20 December is a Sunday, so Saturday 19 at the latest', () => {
    const page = mexicoArticleOf('aguinaldo-2026');
    expect(page.lead).toContain('sábado 19 de diciembre de 2026');
    const text = textOf(page.sections);
    // 440.87 × 15 = 6,613.05, taxable 3,093.75; 1,000 × 15 = 15,000.00, taxable 11,480.70
    for (const figure of ['$117.31', '$3,519.30', '$6,613.05', '$3,093.75', '$11,480.70'])
      expect(text).toContain(figure);
  });

  it('tabulates the vacation days of art. 76 with their pay at the minimum wage', () => {
    const page = mexicoArticleOf('cuantos-dias-de-vacaciones-son-por-ano');
    expect(page.answer.figure).toBe('12 días');
    const table = page.sections.find(({ table }) => table !== undefined)?.table;
    // 315.04 × 22 = 6,930.88, prima 25% = 1,732.72
    expect(table?.rows[5]).toEqual(['6 a 10 años', '22 días', '$6,930.88', '$1,732.72']);
    expect(table?.rows).toHaveLength(11);
  });

  it.each(MEXICO_SLUGS)('%s has its path, a head that fits, sources and a calculator', (slug) => {
    const page = mexicoArticleOf(slug);
    expect(page.paths).toEqual({ es: mexicoPathOf(slug) });
    expect(page.title.length).toBeLessThanOrEqual(TITLE_MAX);
    expect(page.description.length).toBeGreaterThanOrEqual(DESCRIPTION.min);
    expect(page.description.length).toBeLessThanOrEqual(DESCRIPTION.max);
    expect(page.sources.length).toBeGreaterThanOrEqual(3);
    expect([AGUINALDO_PATH, VACACIONES_PATH]).toContain(page.calculator.href);
  });

  it('gives each page its own title and description', () => {
    const pages = [aguinaldoPageOf(), vacacionesPageOf(), ...MEXICO_SLUGS.map(mexicoArticleOf)];
    expect(new Set(pages.map(({ title }) => title)).size).toBe(pages.length);
    expect(new Set(pages.map(({ description }) => description)).size).toBe(pages.length);
    for (const { description } of pages) {
      expect(description.length).toBeGreaterThanOrEqual(DESCRIPTION.min);
      expect(description.length).toBeLessThanOrEqual(DESCRIPTION.max);
    }
  });
});
