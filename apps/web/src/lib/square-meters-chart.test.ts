import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fromRoot } from '../contract/root.ts';
import { JOBS } from '../routing/jobs.ts';
import { LOCALES } from '../routing/routes.ts';
import {
  NIST_SP_811_AREA,
  REVERSE_SQUARE_METERS,
  squareMetersChartBasis,
  squareMetersChartTable,
  squareMetersReverse,
} from './square-meters-chart.ts';

const { cases } = JOBS['square-feet-to-square-meters-chart'];

describe('square feet to square meters chart (growth plan › reference charts)', () => {
  // query: "the area of a large rug is 188 ft2. what is this area in units of m2?" (11.0): common
  // areas from 10 to 2,000 ft², smallest first, each typed as a strip that long and 1 ft wide, so
  // the square footage engine works the square meters out
  it('lists the common areas from 10 to 2,000 ft², smallest first, each as a 1 ft wide strip', () => {
    const feet = cases.map((raw) => Number((raw['length'] ?? '').replace('ft', '')));
    expect(feet[0]).toBe(10);
    expect(feet.at(-1)).toBe(2000);
    expect(feet).toEqual(expect.arrayContaining([25, 100, 188, 1000]));
    expect(feet).toEqual(feet.toSorted((a, b) => a - b));
    expect(new Set(feet).size).toBe(feet.length);
    for (const raw of cases) expect(raw['width']).toBe('1ft');
  });

  // hand-verified with the exact 0.09290304 m² per ft²: 10 → 0.9290304 (0.93), 25 → 2.322576
  // (2.32), 100 → 9.290304 (9.29), 188 → 17.46577152 (17.47), 1,000 → 92.90304 (92.90), 2,000 →
  // 185.80608 (185.81)
  it.each(LOCALES)('works every area out with the square footage engine, in %s', (locale) => {
    const table = squareMetersChartTable(cases, locale);
    expect(table.rows).toHaveLength(cases.length);
    const row = (label: string) => table.rows.find((each) => each.label === label)?.cells;
    expect(row('10 ft²')).toEqual(['0.93']);
    expect(row('25 ft²')).toEqual(['2.32']);
    expect(row('100 ft²')).toEqual(['9.29']);
    expect(row('188 ft²')).toEqual(['17.47']);
    expect(row('1,000 ft²')).toEqual(['92.90']);
    expect(row('2,000 ft²')).toEqual(['185.81']);
    expect(table.columns).toHaveLength(2);
    expect(table.answer).toContain('0.93');
    // a strip 1 ft wide is no room to open the calculator on: the rows stay plain text
    for (const each of table.rows) expect(each.href).toBeUndefined();
  });

  // hand-verified: 1 m² = 1 ÷ 0.09290304 = 10.7639104 ft² (10.76), 10 m² = 107.64, 25 m² = 269.10,
  // 100 m² = 1,076.39, 200 m² = 2,152.78
  it.each(LOCALES)('reads square meters back to square feet, in %s', (locale) => {
    const reverse = squareMetersReverse(locale);
    expect(reverse.rows.map(({ label }) => label)).toEqual(
      REVERSE_SQUARE_METERS.map((meters) => `${String(meters)} m²`),
    );
    const feetOf = (label: string) => reverse.rows.find((each) => each.label === label)?.cells[0];
    expect(feetOf('1 m²')).toBe('10.76');
    expect(feetOf('10 m²')).toBe('107.64');
    expect(feetOf('25 m²')).toBe('269.10');
    expect(feetOf('100 m²')).toBe('1,076.39');
    expect(feetOf('200 m²')).toBe('2,152.78');
    expect(reverse.columns).toHaveLength(2);
  });

  it.each(LOCALES)(
    'states the exact factors and the rounding the chart rests on, in %s',
    (locale) => {
      const facts = squareMetersChartBasis(locale);
      expect(facts.map(({ value }) => value)).toEqual([
        '0.3048 m',
        '0.09290304 m²',
        '10.7639 ft²',
        expect.any(String),
      ]);
    },
  );

  // the source is the one the square footage calculator page cites (the Spanish entry translates
  // its name)
  it.each(LOCALES)('rests on the source the %s calculator page cites', (locale) => {
    const entry = readFileSync(
      fromRoot(`apps/web/src/content/calculators/${locale}/rectangle-area.md`),
      'utf8',
    );
    if (locale === 'en') expect(entry).toContain(`name: ${NIST_SP_811_AREA.name}`);
    expect(entry).toContain(`url: ${NIST_SP_811_AREA.url}`);
    expect(entry).toContain(`retrieved: ${NIST_SP_811_AREA.retrieved}`);
  });
});
