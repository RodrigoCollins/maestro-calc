import { describe, expect, it } from 'vitest';
import { DESCRIPTION, TITLE_MAX } from '../seo/meta.ts';
import { daysBetweenPageOf, DEFAULT_END, DEFAULT_SHIFT, DEFAULT_START } from './calculator.ts';
import { HOURS_PATHS } from '../hours/texts.ts';
import { AGUINALDO_PATH, VACACIONES_PATH } from '../mexico/routes.ts';
import { COUNTDOWNS, countdownPathOf, DAYS_BETWEEN_PATH } from './routes.ts';

const page = daysBetweenPageOf();
const section = (id: string) => {
  const found = page.sections.find((each) => each.id === id);
  if (found === undefined) throw new Error(`no section ${id}`);
  return found;
};

describe('the days-between calculator page', () => {
  it('fits a search result', () => {
    expect(page.title.length).toBeLessThanOrEqual(TITLE_MAX);
    expect(page.description.length).toBeGreaterThanOrEqual(DESCRIPTION.min);
    expect(page.description.length).toBeLessThanOrEqual(DESCRIPTION.max);
    expect(page.paths).toEqual({ es: DAYS_BETWEEN_PATH });
  });

  it('targets «calculadora de fechas» and «contador de días», for the days between two dates', () => {
    expect(page.h1).toBe('Calculadora de fechas: contador de días entre dos fechas');
    expect(page.title.startsWith(page.h1)).toBe(true);
    expect(page.lead).toContain('cuántos días han pasado desde una fecha');
  });

  it('links the aguinaldo and vacation calculators, which count days and years worked', () => {
    const hrefs = section('mexico').links?.map(({ href }) => href);
    expect(hrefs).toEqual([AGUINALDO_PATH, VACACIONES_PATH]);
  });

  it('works out 2026 with no script: 364 days, 52 weeks, 260 weekdays', () => {
    expect([DEFAULT_START, DEFAULT_END]).toEqual(['2026-01-01', '2026-12-31']);
    expect(page.result.figure).toBe('364 días');
    expect(page.result.rows.map(({ key, value }) => [key, value])).toEqual([
      ['weeks', '52 semanas'],
      ['business', '260 días'],
    ]);
  });

  it('counts by hand from 15 March to 10 June 2026: 16 + 30 + 31 + 10 = 87', () => {
    const steps = section('how-to-count').steps?.join(' ') ?? '';
    expect(steps).toContain('16');
    expect(steps).toContain('16 + 30 + 31 + 10 = 87');
  });

  it('tells counting with and without the first day apart: 30 or 31 days in January', () => {
    const text = section('inclusive').paragraphs.join(' ');
    expect(text).toContain('30 días');
    expect(text).toContain('31 días');
  });

  it('tabulates common spans from the engine', () => {
    const rows = section('spans').table?.rows ?? [];
    // the whole of 2028, a leap year, counting both ends: 366 days
    expect(rows.find((row) => row[0]?.includes('2028'))?.[2]).toBe('366');
    expect(rows[0]).toEqual([
      'Del 1 de enero al 31 de diciembre de 2026',
      '364',
      '365',
      '52 semanas',
      '260',
    ]);
  });

  it('links every countdown page', () => {
    const hrefs = section('countdowns').links?.map(({ href }) => href);
    expect(hrefs).toEqual(COUNTDOWNS.map(countdownPathOf));
  });

  it('links the hours calculator and the hub of every calculator', () => {
    const hrefs = section('related').links?.map(({ href }) => href);
    expect(hrefs).toEqual([HOURS_PATHS.es, '/es']);
  });
});

describe('the «Hoy» buttons', () => {
  it('answer «cuántos días han pasado» and «cuántos días faltan» in one step', () => {
    expect(page.today.label).toBe('Hoy');
    expect(page.today.start.startsWith(page.today.label)).toBe(true);
    expect(page.today.end.startsWith(page.today.label)).toBe(true);
    expect(page.lead).toContain('«Hoy»');
    const text = section('today').paragraphs.join(' ');
    expect(text).toContain('cuántos días han pasado');
    expect(text).toContain('cuántos días faltan');
  });

  it('say the build writes no date of today: the device gives it', () => {
    expect(section('today').paragraphs.join(' ')).toContain('tu dispositivo');
  });

  it('work an example of fixed dates: 1 January to 15 November 2026 is 318 days', () => {
    expect(section('today').paragraphs.join(' ')).toContain('318 días');
  });
});

describe('the add-or-subtract tool', () => {
  it('opens on 90 calendar days after 1 January 2026, worked out with no script', () => {
    expect(DEFAULT_SHIFT).toEqual({ from: '2026-01-01', amount: '90' });
    expect(page.shift.result.figure).toBe('miércoles 1 de abril de 2026');
    expect(page.shift.result.rows.map(({ key, value }) => [key, value])).toEqual([
      ['calendar', '90 días'],
      ['weeks', '12 semanas y 6 días'],
      ['business', '64 días'],
    ]);
  });

  it('is in the description, the lead and the heading of its form', () => {
    expect(page.description).toContain('suma o resta días');
    expect(page.lead).toContain('suma o resta días');
    expect(page.shift.heading).toBe('Sumar o restar días a una fecha');
  });

  it('says the start day is not counted', () => {
    expect(page.shift.note).toContain('no se cuenta');
  });

  it('tabulates the dates after 1 January 2026, in calendar days and in weekdays', () => {
    const rows = section('add-subtract').table?.rows ?? [];
    expect(rows.find((row) => row[0] === '90 días')?.slice(1)).toEqual([
      'miércoles 1 de abril de 2026',
      'jueves 7 de mayo de 2026',
    ]);
    // 2026 is not a leap year: 365 days after 1 January 2026 is 1 January 2027
    expect(rows.find((row) => row[0] === '365 días')?.[1]).toBe('viernes 1 de enero de 2027');
  });

  it('works the business days by hand: 10 after Friday 13 November 2026 is Friday 27', () => {
    expect(section('add-subtract').steps?.join(' ')).toContain('viernes 27 de noviembre de 2026');
  });
});

describe('the questions', () => {
  const faq = section('faq').questions ?? [];
  const answerOf = (part: string) => faq.find(({ question }) => question.includes(part))?.answer;

  it('answer «qué fecha será dentro de 90 días» and «qué fecha fue hace 30 días»', () => {
    expect(answerOf('dentro de 90 días')).toContain('miércoles 1 de abril de 2026');
    expect(answerOf('hace 30 días')).toContain('viernes 16 de octubre de 2026');
  });

  it('answer how many days a year has, leap or not', () => {
    expect(answerOf('año')).toContain('366');
  });

  it('are at least five, each answered in a sentence or more', () => {
    expect(faq.length).toBeGreaterThanOrEqual(5);
    for (const { answer } of faq) expect(answer.length).toBeGreaterThan(80);
  });
});
