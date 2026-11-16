import { describe, expect, it } from 'vitest';
import { DESCRIPTION, TITLE_MAX } from '../seo/meta.ts';
import { ptuPageOf } from './ptu-page.ts';
import { AGUINALDO_PATH, FINIQUITO_PATH, ISR_PATH, PTU_PATH, SDI_PATH } from './routes.ts';

const textOf = (value: unknown): string => JSON.stringify(value);

// Hand-verified with exact fractions (see `packages/pay-core/src/mexico/ptu.test.ts`): $12,000 a
// month (400.00 a day) all 365 days of the year, in a company with a renta gravable of $2,000,000
// whose workers worked 7,300 days and earned $3,650,000.
describe('ptuPageOf', () => {
  const page = ptuPageOf();
  const text = textOf(page);

  it('answers with no script: $9,000.00, every line with its figure', () => {
    expect(page.paths).toEqual({ es: PTU_PATH });
    expect(page.result.figure).toBe('$9,000.00');
    expect(page.result.rows.map(({ key, value }) => [key, value])).toEqual([
      ['salary', '$146,000.00'],
      ['pool', '$200,000.00'],
      ['half', '$100,000.00'],
      ['daysShare', '$5,000.00'],
      ['salaryShare', '$4,000.00'],
      ['beforeCap', '$9,000.00'],
      ['capMonths', '$36,000.00 (90 días)'],
      ['capAverage', '$0.00'],
      ['cap', '$36,000.00'],
      ['exempt', '$1,759.65'],
      ['taxable', '$7,240.35'],
    ]);
  });

  it('names the article of every line', () => {
    const labels = textOf(page.result.rows.map(({ label }) => label));
    for (const article of ['art. 124', 'art. 120', 'art. 123', 'fr. VIII', 'art. 93']) {
      expect(labels).toContain(article);
    }
  });

  it('keeps a short title and description and answers first', () => {
    expect(page.title.length).toBeLessThanOrEqual(TITLE_MAX);
    expect(page.description.length).toBeGreaterThanOrEqual(DESCRIPTION.min);
    expect(page.description.length).toBeLessThanOrEqual(DESCRIPTION.max);
    expect(page.lead).toContain('$9,000.00');
    expect(page.sections[0]?.id).toBe('como-se-reparte');
  });

  it('offers the estimate with the cap alone and says the exact figure needs the company', () => {
    expect(page.modes.map(([key]) => key)).toEqual(['exact', 'cap']);
    expect(textOf(page.modes)).toContain('Estima con el tope');
    expect(page.estimate).toContain('art. 121');
    const section = textOf(page.sections.find(({ id }) => id === 'sin-cifras'));
    for (const words of ['art. 121', 'art. 125', 'diez días', '$36,000.00']) {
      expect(section).toContain(words);
    }
  });

  it('works the cap of art. 127 fr. VIII both ways', () => {
    const section = textOf(page.sections.find(({ id }) => id === 'tope'));
    // 315.04 a day: 50,000.00 + 28,747.40 = 78,747.40, capped at 90 × 315.04 = 28,353.60; with
    // an average of 32,000.00 the cap is the average
    for (const figure of ['$78,747.40', '$28,353.60', '$25,000.00', '$32,000.00']) {
      expect(section).toContain(figure);
    }
    expect(section).toContain('más favorable');
  });

  it('works a partial year and the amount the company announces', () => {
    const steps = textOf(page.sections.find(({ id }) => id === 'ejemplos'));
    // $123,456.78 among 4,321 days and $2,345,678.90: 2,857.13 + 1,732.73 = 4,589.86
    for (const figure of ['$2,857.13', '$1,732.73', '$4,589.86']) expect(steps).toContain(figure);
  });

  it('gives the dates, who is left out and the part free of ISR', () => {
    expect(text).toContain('30 de mayo');
    expect(text).toContain('29 de junio');
    const left = textOf(page.sections.find(({ id }) => id === 'quien-no'));
    for (const words of ['directores', 'trabajadores del hogar', 'sesenta días', 'art. 126']) {
      expect(left).toContain(words);
    }
    const isr = textOf(page.sections.find(({ id }) => id === 'isr'));
    expect(isr).toContain('15 UMA');
    expect(isr).toContain('$1,759.65');
  });

  it('says it is an estimate and sends a real case to PROFEDET, free', () => {
    expect(text).toContain('PROFEDET');
    expect(text).toContain('gratuitos');
    expect(page.note).toContain('estimación');
  });

  it('cites the law, the resolution of the 10% and the 2026 figures, dated', () => {
    const labels = page.sources.map(({ label }) => label);
    expect(labels.some((label) => label.startsWith('Ley Federal del Trabajo'))).toBe(true);
    expect(labels.some((label) => label.startsWith('Ley del Impuesto sobre la Renta'))).toBe(true);
    for (const words of ['DOF 03-02-2009', 'diez por ciento', '$117.31', '$315.04']) {
      expect(textOf(labels)).toContain(words);
    }
    for (const label of labels) expect(label).toMatch(/leído el 16 de noviembre de 2026/);
  });

  it('links the aguinaldo, SDI, finiquito and ISR calculators', () => {
    const hrefs = page.sections.flatMap(({ links }) => links ?? []).map(({ href }) => href);
    for (const href of [AGUINALDO_PATH, SDI_PATH, FINIQUITO_PATH, ISR_PATH]) {
      expect(hrefs).toContain(href);
    }
  });
});
