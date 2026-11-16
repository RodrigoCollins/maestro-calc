import { describe, expect, it } from 'vitest';
import { DAYS_BETWEEN_PATH } from '../dates/routes.ts';
import { DESCRIPTION, TITLE_MAX } from '../seo/meta.ts';
import { aguinaldoPageOf, mexicoArticleOf, vacacionesPageOf } from './pages.ts';
import {
  AGUINALDO_PATH,
  ISR_PATH,
  MEXICO_SLUGS,
  mexicoPathOf,
  SUELDO_NETO_PATH,
  VACACIONES_PATH,
} from './routes.ts';
import { isrPageOf, salaryLinks, sueldoNetoPageOf } from './salary-pages.ts';

const textOf = (value: unknown): string => JSON.stringify(value);

// Hand-verified from Anexo 8 RMF 2026, the subsidy decree of DOF 31-12-2025 and the LSS (see
// `packages/pay-core/src/mexico-salary/salary.test.ts` for each sum).
describe('isrPageOf', () => {
  const page = isrPageOf();
  const text = textOf(page);

  it('answers with no script: $946.62 withheld from $12,000 a month', () => {
    expect(page.paths).toEqual({ es: ISR_PATH });
    expect(page.result.figure).toBe('$946.62');
    expect(page.result.rows.map(({ key, value }) => [key, value])).toEqual([
      ['lower', '$7,168.52'],
      ['excess', '$4,831.48'],
      ['rate', '10.88%'],
      ['marginal', '$525.67'],
      ['fixed', '$420.95'],
      ['tariff', '$946.62'],
      ['subsidy', '$0.00'],
    ]);
    expect(page.lead).toContain('$946.62');
  });

  it('publishes the monthly, fortnightly and weekly tariffs of Anexo 8', () => {
    const tables = page.sections.flatMap(({ table }) => (table === undefined ? [] : [table]));
    const monthly = tables.find(({ caption }) => caption.startsWith('Tarifa mensual'));
    expect(monthly?.rows).toHaveLength(11);
    expect(monthly?.rows[0]).toEqual(['$0.01', '$844.59', '$0.00', '1.92%']);
    expect(monthly?.rows[10]).toEqual(['$425,642.00', 'En adelante', '$133,488.54', '35.00%']);
    const fortnight = tables.find(({ caption }) => caption.includes('15 días'));
    expect(fortnight?.rows[2]).toEqual(['$3,537.16', '$6,216.15', '$207.75', '10.88%']);
    const week = tables.find(({ caption }) => caption.includes('7 días'));
    expect(week?.rows[10]).toEqual(['$98,009.67', 'En adelante', '$30,737.49', '35.00%']);
  });

  it('works the examples: minimum wage, the subsidy limit, $12,000, $20,000 and $40,000', () => {
    const examples = page.sections.find(({ id }) => id === 'ejemplos')?.table?.rows;
    expect(examples).toEqual([
      ['Salario mínimo ($315.04 × 30)', '$669.31', '$0.00', '$0.00'],
      ['$11,492.66 (límite del subsidio)', '$891.42', '$535.65', '$355.77'],
      ['$12,000', '$946.62', '$0.00', '$946.62'],
      ['$15,000', '$1,402.82', '$0.00', '$1,402.82'],
      ['$20,000', '$2,383.65', '$0.00', '$2,383.65'],
      ['$40,000', '$6,755.82', '$0.00', '$6,755.82'],
    ]);
  });

  it('explains the subsidy: 15.02% of $3,566.22, $535.65, and its cliff at $11,492.66', () => {
    for (const figure of ['15.02%', '$3,566.22', '$535.65', '$11,492.66', '$11,492.67', '$891.42'])
      expect(text).toContain(figure);
    // a fortnight of $6,000 is over the limit: 475.71; a week of $2,500: 189.36 − 123.34 = 66.02
    for (const figure of ['$475.71', '$123.34', '$66.02']) expect(text).toContain(figure);
  });

  it('answers the questions people search and links the take-home pay and the prestaciones', () => {
    expect(page.sections.flatMap(({ questions }) => questions ?? []).length).toBeGreaterThanOrEqual(
      4,
    );
    const links = page.sections.flatMap(({ links }) => links ?? []).map(({ href }) => href);
    expect(links).toEqual([
      SUELDO_NETO_PATH,
      AGUINALDO_PATH,
      VACACIONES_PATH,
      mexicoPathOf('prima-vacacional'),
      DAYS_BETWEEN_PATH,
    ]);
  });
});

describe('sueldoNetoPageOf', () => {
  const page = sueldoNetoPageOf();
  const text = textOf(page);

  it('answers with no script: $17,076.22 net from $20,000 a month', () => {
    expect(page.paths).toEqual({ es: SUELDO_NETO_PATH });
    expect(page.result.figure).toBe('$17,076.22');
    expect(page.result.rows.map(({ key, value }) => [key, value])).toEqual([
      ['gross', '$20,000.00'],
      ['isr', '$2,383.65'],
      ['sbc', '$699.54'],
      ['excedente', '$41.71'],
      ['dinero', '$52.47'],
      ['pensionados', '$78.70'],
      ['invalidez', '$131.16'],
      ['cesantia', '$236.09'],
      ['imss', '$540.13'],
    ]);
  });

  it('works the examples: minimum wage, $12,000, $20,000 and $40,000', () => {
    const examples = page.sections.find(({ id }) => id === 'ejemplos')?.table?.rows;
    expect(examples).toEqual([
      ['Salario mínimo ($9,451.20)', '$0.00', '$0.00', '$9,451.20'],
      ['$12,000', '$946.62', '$307.20', '$10,746.18'],
      ['$20,000', '$2,383.65', '$540.13', '$17,076.22'],
      ['$40,000', '$6,755.82', '$1,122.51', '$32,121.67'],
    ]);
  });

  it('says what it leaves out: INFONAVIT, the state payroll tax and voluntary deductions', () => {
    for (const word of ['INFONAVIT', 'nóminas', 'voluntarios', 'pensión alimenticia'])
      expect(text).toContain(word);
    // 11 years: 24 days of vacation, SBC 705.02; the cap of 25 UMA, 2,932.75
    for (const figure of ['$705.02', '$544.69', '$2,932.75']) expect(text).toContain(figure);
  });

  it('cites the LSS, the ISR tariff and the subsidy decree', () => {
    const hrefs = page.sources.map(({ href }) => href);
    expect(hrefs).toContain('https://www.imss.gob.mx/sites/all/statics/pdf/leyes/LSS.pdf');
    expect(hrefs).toContain('https://dof.gob.mx/nota_detalle.php?codigo=5777649&fecha=31/12/2025');
    expect(hrefs.some((href) => href.includes('Anexo-8-RMF-2026'))).toBe(true);
  });

  it('links the ISR calculator, the aguinaldo, the vacations and the dates calculator', () => {
    const links = page.sections.flatMap(({ links }) => links ?? []).map(({ href }) => href);
    expect(links).toEqual([
      ISR_PATH,
      AGUINALDO_PATH,
      VACACIONES_PATH,
      mexicoPathOf('prima-vacacional'),
      DAYS_BETWEEN_PATH,
    ]);
  });
});

describe('the two salary pages', () => {
  it('have heads that fit and differ from every other Mexico page', () => {
    const pages = [
      isrPageOf(),
      sueldoNetoPageOf(),
      aguinaldoPageOf(),
      vacacionesPageOf(),
      ...MEXICO_SLUGS.map(mexicoArticleOf),
    ];
    expect(new Set(pages.map(({ title }) => title)).size).toBe(pages.length);
    expect(new Set(pages.map(({ description }) => description)).size).toBe(pages.length);
    for (const { title, description } of pages.slice(0, 2)) {
      expect(title.length).toBeLessThanOrEqual(TITLE_MAX);
      expect(description.length).toBeGreaterThanOrEqual(DESCRIPTION.min);
      expect(description.length).toBeLessThanOrEqual(DESCRIPTION.max);
    }
  });

  it('are linked from the Spanish home', () => {
    expect(salaryLinks().map(({ href }) => href)).toEqual([ISR_PATH, SUELDO_NETO_PATH]);
  });
});

describe('the salary pages state they are an estimate', () => {
  it.each([
    ['isr', isrPageOf()],
    ['sueldo neto', sueldoNetoPageOf()],
  ] as const)('the %s note opens with it', (_, page) => {
    expect(page.note).toMatch(/^Es una estimación\b/);
  });
});
