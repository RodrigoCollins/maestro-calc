import { readFileSync } from 'node:fs';
import { decode } from '@maestro-calc/core';
import { feetInches } from '@maestro-calc/core/calculators/feet-inches';
import { describe, expect, it } from 'vitest';
import { fromRoot } from '../contract/root.ts';
import { JOBS } from '../routing/jobs.ts';
import { LOCALES, pathOf } from '../routing/routes.ts';
import {
  decimalFeetChartBasis,
  decimalFeetChartTable,
  decimalFeetReverse,
  NIST_SP_811,
  REVERSE_INCHES,
} from './decimal-feet-chart.ts';

const { cases } = JOBS['decimal-feet-chart'];

describe('decimal feet to feet and inches chart (growth plan › reference charts)', () => {
  // queries: "decimal to feet and inches calculator" (4.9), "convert 11.65 feet to feet and inches
  // round to the nearest 1 16" (3.0): every hundredth of a foot from 0.10 to 0.99, then common
  // lengths, smallest first, each multiplied by 1 so the calculator writes it in feet and inches
  it('lists every hundredth from 0.10 to 0.99 ft, then the common lengths, smallest first', () => {
    const feet = cases.map((raw) => Number(raw['first']));
    expect(feet.slice(0, 90)).toEqual(Array.from({ length: 90 }, (_, index) => (10 + index) / 100));
    expect(feet).toContain(11.65);
    expect(feet).toEqual(feet.toSorted((a, b) => a - b));
    for (const raw of cases) expect(raw).toMatchObject({ operation: 'multiply', factor: '1' });
  });

  // hand-verified: 0.10 ft = 1.2 in, nearest 1/16 is 1 3/16 (1.1875); 0.25 ft = 3 in; 0.50 ft = 6 in;
  // 0.99 ft = 11.88 in, nearest 1/16 is 11 7/8 (11.875); 11.65 ft = 139.8 in = 11 ft 7.8 in, nearest
  // 1/16 is 7 13/16 (7.8125); 0.0254 m per inch
  it('works every length out with the feet and inches engine', () => {
    const table = decimalFeetChartTable(cases, 'en');
    expect(table.rows).toHaveLength(cases.length);
    const row = (label: string) => table.rows.find((each) => each.label === label)?.cells;
    expect(row('0.10 ft')).toEqual(['1 3/16 in', '1.20']);
    expect(row('0.25 ft')).toEqual(['3 in', '3.00']);
    expect(row('0.50 ft')).toEqual(['6 in', '6.00']);
    expect(row('0.99 ft')).toEqual(['11 7/8 in', '11.88']);
    expect(row('11.65 ft')).toEqual(['11 ft 7 13/16 in', '139.80']);
    expect(table.columns).toHaveLength(3);
    expect(table.answer).toBe('1 3/16 in');
  });

  // the ninety hundredths stay plain text (the HTML budget); each length of a foot or more opens the
  // calculator with it filled in
  it.each(LOCALES)('links each length of a foot or more to the calculator, in %s', (locale) => {
    const table = decimalFeetChartTable(cases, locale);
    table.rows.forEach((row, index) => {
      if (Number(cases[index]?.['first']) < 1) {
        expect(row.href).toBeUndefined();
        return;
      }
      const [path, query = ''] = (row.href ?? '').split('?');
      expect(path).toBe(pathOf('feet-inches', locale));
      const state = feetInches.validate(cases[index] ?? {});
      expect(state.ok && decode(feetInches, query).state).toEqual(state.ok && state.value);
    });
  });

  // hand-verified: 1 in = 1/12 ft = 0.0833 ft, 6 in = 0.5 ft, 11 in = 0.9167 ft
  it.each(LOCALES)('reads inches back to decimal feet, to four places, in %s', (locale) => {
    const reverse = decimalFeetReverse(locale);
    expect(reverse.rows.map(({ label }) => label)).toEqual(
      REVERSE_INCHES.map((inches) => `${String(inches)} in`),
    );
    const feetOf = (label: string) => reverse.rows.find((each) => each.label === label)?.cells[0];
    expect(feetOf('1 in')).toBe('0.0833 ft');
    expect(feetOf('6 in')).toBe('0.5000 ft');
    expect(feetOf('11 in')).toBe('0.9167 ft');
    expect(reverse.columns).toHaveLength(2);
  });

  it.each(LOCALES)(
    'states the exact factors and the rounding the chart rests on, in %s',
    (locale) => {
      const facts = decimalFeetChartBasis(locale);
      expect(facts.map(({ value }) => value)).toEqual(expect.arrayContaining(['12 in', '25.4 mm']));
      expect(facts).toHaveLength(3);
    },
  );

  // the source is the one the feet and inches calculator page lists first (the Spanish entry
  // translates its name)
  it.each(LOCALES)('rests on the source the %s calculator page cites', (locale) => {
    const entry = readFileSync(
      fromRoot(`apps/web/src/content/calculators/${locale}/feet-inches.md`),
      'utf8',
    );
    if (locale === 'en') expect(entry).toContain(`name: ${NIST_SP_811.name}`);
    expect(entry).toContain(`url: ${NIST_SP_811.url}`);
    expect(entry).toContain(`retrieved: ${NIST_SP_811.retrieved}`);
  });
});
