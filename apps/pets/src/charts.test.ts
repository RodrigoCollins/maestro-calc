import { describe, expect, it } from 'vitest';
import { chartOf, CHARTS, CHARTS_GUIDE, CHARTS_INDEX } from './charts.ts';
import { CALL_NOW } from './calc/chocolate.ts';
import { ROUTES } from './routes.ts';

describe('the dog feeding chart', () => {
  const chart = chartOf('/dog-feeding-chart');
  const row = (weight: string) => chart.rows.find(([w]) => w === weight);

  it('lists 5 to 100 lb in steps of 5, four cells each', () => {
    expect(chart.rows).toHaveLength(20);
    expect(chart.rows[0]?.[0]).toBe('5');
    expect(chart.rows.at(-1)?.[0]).toBe('100');
    for (const cells of chart.rows) expect(cells).toHaveLength(chart.columns.length);
  });

  // 40 lb = 18.1437 kg, RER 615.38, x 1.6 = 984.61 kcal, / 360 = 2.735 cups (hand-worked in the methodology)
  it('gives the 40 lb dog 985 kcal and 2 3/4 cups, as the calculator does', () => {
    expect(row('40')).toEqual(['40', '985', '2 ¾', '2.74']);
  });

  // 10 lb = 4.5359 kg, RER 217.57, x 1.6 = 348.11 kcal
  it('gives the 10 lb dog 348 kcal and 1 cup', () => {
    expect(row('10')).toEqual(['10', '348', '1', '0.97']);
  });
});

describe('the puppy feeding chart', () => {
  const chart = chartOf('/puppy-feeding-chart');

  // 10 lb: RER 217.57, x 3 = 652.7 kcal, / 360 = 1.81 cups; x 2 = 435.1 kcal, 1.21 cups
  it('gives a 10 lb puppy 653 kcal under 4 months and 435 from 4 months', () => {
    expect(chart.rows.find(([w]) => w === '10')).toEqual([
      '10',
      '653',
      '1 ¾',
      '1.81',
      '435',
      '1 ¼',
      '1.21',
    ]);
  });

  it('has a cell for every column of every weight', () => {
    expect(chart.rows).toHaveLength(10);
    for (const cells of chart.rows) expect(cells).toHaveLength(chart.columns.length);
  });
});

describe('the chocolate chart', () => {
  const chart = chartOf('/dog-chocolate-toxicity-chart');

  // 20 lb = 9.0718 kg: 20 x 9.0718 = 181.4 mg; / 2.3 = 78.9 g milk; / 5.6 = 32.4 g dark; / 15.5 = 11.7 g baking
  it('gives a 20 lb dog 79 g of milk, 32 g of dark and 12 g of baking chocolate to 20 mg/kg', () => {
    expect(chart.rows.find(([w]) => w === '20')).toEqual(['20', '79', '32', '12']);
  });

  it('tells the reader to call, and lists the calculator', () => {
    expect(chart.callNow).toBe(true);
    expect(CALL_NOW).toContain('(888) 426-4435');
    expect(chart.notes.join(' ')).toContain('call');
    expect(chart.calculators.map(({ href }) => href)).toEqual([
      '/dog-chocolate-toxicity-calculator',
    ]);
  });
});

describe('every chart', () => {
  it('is at the address the routes pin, as an article', () => {
    expect(CHARTS.map(({ path }) => path)).toEqual([
      '/dog-feeding-chart',
      '/puppy-feeding-chart',
      '/dog-chocolate-toxicity-chart',
    ]);
    for (const { path } of CHARTS)
      expect(ROUTES.find((r) => r.path === path)?.kind).toBe('article');
    expect(ROUTES.find((r) => r.path === CHARTS_INDEX.path)?.kind).toBe('article');
  });

  it('keeps titles and descriptions where a result shows them whole', () => {
    for (const chart of [...CHARTS, CHARTS_INDEX]) {
      expect(chart.title.length).toBeLessThanOrEqual(65);
      expect(chart.title.endsWith(' | Bowl Figures')).toBe(true);
      expect(chart.description.length).toBeGreaterThanOrEqual(50);
      expect(chart.description.length).toBeLessThanOrEqual(160);
    }
  });

  it('carries a review day and sources with addresses', () => {
    for (const chart of CHARTS) {
      expect(chart.checked).toBe('2026-11-07');
      expect(chart.sources.length).toBeGreaterThan(0);
      for (const { url } of chart.sources) expect(url).toMatch(/^https:\/\//);
    }
  });

  it('finds a chart by its path, and refuses another', () => {
    expect(chartOf('/puppy-feeding-chart').h1).toContain('Puppy');
    expect(() => chartOf('/nope')).toThrow('no chart /nope');
  });
});

describe('the guide of the charts index', () => {
  const text = CHARTS_GUIDE.paragraphs.join(' ');

  it('reads its figures off the charts: energy follows weight to the 0.75 power', () => {
    // 1,958 / 692 = 2.83
    expect(text).toContain('1,958 calories a day against 692 for a 25 lb dog, 2.8 times');
  });

  it('compares a puppy under 4 months with one from 4 months at the same weight', () => {
    expect(text).toContain('653 calories a day under 4 months and 435 from 4 months');
  });

  it('gives the grams of each chocolate for a 20 lb dog and says to call', () => {
    expect(text).toContain('79 g of milk chocolate, 32 g of dark or 12 g of baking chocolate');
    expect(text).toContain('call');
  });

  it('cites the sources of the charts it reads, once each', () => {
    const urls = CHARTS_GUIDE.sources.map(({ url }) => url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.length).toBeGreaterThanOrEqual(3);
  });
});
