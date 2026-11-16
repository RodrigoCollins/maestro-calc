import { describe, expect, it } from 'vitest';
import { DESCRIPTION, TITLE_MAX } from '../seo/meta.ts';
import { finiquitoPageOf } from './finiquito-page.ts';
import {
  AGUINALDO_PATH,
  ANTIGUEDAD_PATH,
  FINIQUITO_PATH,
  ISR_PATH,
  SDI_PATH,
  VACACIONES_PATH,
} from './routes.ts';

const textOf = (value: unknown): string => JSON.stringify(value);

// Hand-verified with exact fractions (see `packages/pay-core/src/mexico/finiquito.test.ts`):
// $15,000 a month (500.00 a day) from 1 March 2019 to 15 November 2026, dismissed with no cause,
// 4 vacation days taken and 15 days unpaid.
describe('finiquitoPageOf', () => {
  const page = finiquitoPageOf();
  const text = textOf(page);

  it('answers with no script: $128,900.48 in all, every line with its figure', () => {
    expect(page.paths).toEqual({ es: FINIQUITO_PATH });
    expect(page.result.figure).toBe('$128,900.48');
    expect(page.result.rows.map(({ key, value }) => [key, value])).toEqual([
      ['service', '7 años y 260 días'],
      ['sdi', '$528.08'],
      ['unpaid', '$7,500.00'],
      ['aguinaldo', '$6,554.79 (13.11 días)'],
      ['vacaciones', '$16,835.62 (33.67 días)'],
      ['prima', '$4,208.90'],
      ['antiguedad', '$46,273.97'],
      ['finiquito', '$81,373.28'],
      ['indemnizacion', '$47,527.20'],
      ['veinte', '$0.00'],
      ['liquidacion', '$47,527.20'],
      ['exempt', '$89,742.15'],
      ['taxable', '$39,158.33'],
    ]);
  });

  it('names the article of every line', () => {
    const labels = textOf(page.result.rows.map(({ label }) => label));
    for (const article of [
      'art. 87',
      'arts. 76 y 79',
      'art. 80',
      'art. 162',
      'art. 89',
      'art. 50',
      'art. 93',
    ])
      expect(labels).toContain(article);
  });

  it('keeps a short title and description and answers first', () => {
    expect(page.title.length).toBeLessThanOrEqual(TITLE_MAX);
    expect(page.description.length).toBeGreaterThanOrEqual(DESCRIPTION.min);
    expect(page.description.length).toBeLessThanOrEqual(DESCRIPTION.max);
    expect(page.lead).toContain('$128,900.48');
    expect(page.sections[0]?.id).toBe('finiquito-o-liquidacion');
  });

  it('lets the visitor choose the 20 days a year and says when they apply', () => {
    expect(page.defaults.refused).toBe(false);
    expect(page.labels.refused).toContain('20 días');
    const section = page.sections.find(({ id }) => id === 'veinte-dias');
    expect(textOf(section)).toContain('art. 49');
    expect(textOf(section)).toContain('reinstal');
    // 528.08 × 20 × 2,815 / 365 = 81,454.53; 47,527.20 + 81,454.53 = 128,981.73
    for (const figure of ['$81,454.53', '$128,981.73', '$210,355.01'])
      expect(text).toContain(figure);
  });

  it('shows the part free of ISR and says the ISR itself is not worked out', () => {
    const section = textOf(page.sections.find(({ id }) => id === 'isr'));
    // 90 × 117.31 = 10,557.90 a year; 8 years: 84,463.20
    for (const figure of ['$10,557.90', '$84,463.20', '$3,519.30', '$1,759.65'])
      expect(section).toContain(figure);
    expect(section).toContain('último sueldo mensual ordinario');
    expect(page.note).toContain('no calcula el ISR');
  });

  it('works the other cases: a first-year resignation and a resignation at 15 years', () => {
    const steps = textOf(page.sections.find(({ id }) => id === 'ejemplos'));
    // 315.04 a day, 1 February to 31 August 2026: 2,744.73 + 2,195.79 + 548.95 = 5,489.47
    for (const figure of ['$2,744.73', '$2,195.79', '$548.95', '$5,489.47'])
      expect(steps).toContain(figure);
    // $12,000 a month, 1 July 2011 to 30 June 2026: 400 × 12 × 15 = 72,000.00; in all 88,975.34
    for (const figure of ['$72,000.00', '$88,975.34']) expect(steps).toContain(figure);
  });

  it('says it is an estimate and sends a real case to PROFEDET, free', () => {
    expect(text).toContain('PROFEDET');
    expect(text).toContain('gratuitos');
    expect(text).toContain('estimación');
    expect(text).toContain('dos meses');
  });

  it('cites the laws and the 2026 figures, dated', () => {
    const labels = page.sources.map(({ label }) => label);
    expect(labels.some((label) => label.startsWith('Ley Federal del Trabajo'))).toBe(true);
    expect(labels.some((label) => label.startsWith('Ley del Impuesto sobre la Renta'))).toBe(true);
    expect(textOf(labels)).toContain('$117.31');
    expect(textOf(labels)).toContain('$315.04');
    for (const label of labels) expect(label).toMatch(/leído el 16 de noviembre de 2026/);
  });

  it('links the aguinaldo, vacation, prima de antigüedad, SDI and ISR calculators', () => {
    const hrefs = page.sections.flatMap(({ links }) => links ?? []).map(({ href }) => href);
    for (const href of [AGUINALDO_PATH, VACACIONES_PATH, ANTIGUEDAD_PATH, SDI_PATH, ISR_PATH])
      expect(hrefs).toContain(href);
  });
});
