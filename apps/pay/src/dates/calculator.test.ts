import { describe, expect, it } from 'vitest';
import { DESCRIPTION, TITLE_MAX } from '../seo/meta.ts';
import { daysBetweenPageOf, DEFAULT_END, DEFAULT_START } from './calculator.ts';
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
});
