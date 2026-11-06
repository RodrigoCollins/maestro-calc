import { decode } from '@maestro-calc/core';
import { BULK_WEIGHTS, type BulkWeightId } from '@maestro-calc/data';
import { describe, expect, it } from 'vitest';
import { JOBS } from '../routing/jobs.ts';
import { LOCALES, pathOf } from '../routing/routes.ts';
import {
  cubicYardWeightBasis,
  cubicYardWeightSources,
  cubicYardWeightTable,
} from './cubic-yard-weight-chart.ts';
import { gravel } from './gravel.ts';
import { siteText } from './site-text.ts';

const { cases } = JOBS['cubic-yard-weight-chart'];

describe('cubic yard weight chart (growth plan › reference charts)', () => {
  // hand-verified: a pound per cubic yard is 0.45359237 kg ÷ 0.764554857984 m³ = 0.5932764 kg/m³,
  // and 1/27 lb/ft³. 3,600 lb = 1.80 t, 133.33 lb/ft³, 2,135.8 kg/m³; 3,720 lb = 1.86 t, 137.78,
  // 2,207.0; 145 × 27 = 3,915 lb = 1.9575 t, 2,322.7 kg/m³; 150 × 27 = 4,050 lb = 2.025 t, 2,402.8;
  // 1.45 t = 2,900 lb, 107.41 lb/ft³, 1,720.5016 kg/m³; 0.8 t = 1,600 lb, 59.26, 949.2;
  // 1,330 kg/m³ = 2,241.79 lb, 1.1209 t, 83.03 lb/ft³; 473 lb = 0.2365 t, 17.52, 280.6;
  // 243 lb = 0.1215 t, 9.00, 144.2
  it('works every material out from its density: lb and tons per yd³, lb per ft³, kg per m³', () => {
    const table = cubicYardWeightTable(cases, 'en');
    expect(table.rows).toHaveLength(BULK_WEIGHTS.length);
    expect(table.columns).toHaveLength(5);
    const cells = table.rows.map(({ cells: each }) => each);
    expect(cells).toEqual([
      ['3,600–3,720', '1.80–1.86', '133.3–137.8', '2,136–2,207'],
      ['2,580', '1.29', '95.6', '1,531'],
      ['2,840', '1.42', '105.2', '1,685'],
      ['3,240', '1.62', '120.0', '1,922'],
      ['3,915–4,050', '1.96–2.03', '145.0–150.0', '2,323–2,403'],
      ['2,900', '1.45', '107.4', '1,721'],
      ['1,600', '0.80', '59.3', '949'],
      ['1,600', '0.80', '59.3', '949'],
      ['2,242', '1.12', '83.0', '1,330'],
      ['473', '0.24', '17.5', '281'],
      ['243', '0.12', '9.0', '144'],
    ]);
  });

  it('names each material in both languages, and links the calculator that sizes it', () => {
    for (const locale of LOCALES) {
      const text = siteText(locale);
      const table = cubicYardWeightTable(cases, locale);
      expect(table.rows.map(({ label }) => label)).toEqual(
        BULK_WEIGHTS.map(({ id }) => text(`page.cubic-yard-weight-chart.materials.${id}`)),
      );
      const hrefs = table.rows.map(({ href }) => href?.split('?')[0]);
      expect(hrefs).toEqual([
        pathOf('gravel', locale),
        pathOf('gravel', locale),
        undefined,
        undefined,
        pathOf('concrete', locale),
        undefined,
        pathOf('topsoil', locale),
        undefined,
        undefined,
        pathOf('mulch', locale),
        pathOf('mulch', locale),
      ]);
    }
  });

  // the gravel rows open the gravel calculator on one cubic yard (9 ft × 9 ft × 4 in, no extra),
  // whose engine gives the same tons: 1.83 compacted, the midpoint of the range, and 1.29 loose
  it('opens the gravel calculator on one cubic yard, where the engine weighs it the same', () => {
    const table = cubicYardWeightTable(cases, 'en');
    for (const [index, raw] of cases.entries()) {
      const query = table.rows[index]?.href?.split('?')[1] ?? '';
      const state = gravel.validate(raw);
      expect(state.ok && decode(gravel, query).state).toEqual(state.ok && state.value);
    }
    expect(cases.map((raw) => raw['placement'])).toEqual(['compacted', 'loose']);
    expect(table.answer).toBe(table.rows[0].cells[1]);
  });

  it('lists each source once, labelled by the materials it gives, in the order of the chart', () => {
    const sources = cubicYardWeightSources('en');
    const urls = BULK_WEIGHTS.flatMap(({ sources: each }) => each.map(({ url }) => url));
    expect(sources.map(({ source }) => source.url)).toEqual([...new Set(urls)]);
    const text = siteText('en');
    const name = (id: BulkWeightId) => text(`page.cubic-yard-weight-chart.materials.${id}`);
    expect(sources[0].label).toBe(`${name('gravel-compacted')}; ${name('gravel-loose')}`);
    expect(sources.find(({ source }) => source.url.includes('fhwa'))?.label).toBe(name('concrete'));
  });

  it('states the condition of every figure, as its source gives it', () => {
    for (const locale of LOCALES) {
      const text = siteText(locale);
      expect(cubicYardWeightBasis(locale)).toEqual(
        BULK_WEIGHTS.map(({ id }) => ({
          label: text(`page.cubic-yard-weight-chart.materials.${id}`),
          value: text(`page.cubic-yard-weight-chart.conditions.${id}`),
        })),
      );
    }
  });

  it('opens with the weights of the chart, as the chart works them out', () => {
    for (const locale of LOCALES) {
      const intro = siteText(locale)('page.cubic-yard-weight-chart.intro');
      const rows = cubicYardWeightTable(cases, locale).rows;
      // gravel loose and compacted (the calculator's 1.83 midpoint), concrete, sand, topsoil, mulch
      expect(intro).toContain(rows[1]?.cells[1]);
      expect(intro).toContain('1.83');
      expect(intro).toContain(rows[4]?.cells[0]?.replace('–', locale === 'en' ? ' to ' : ' a '));
      expect(intro).toContain(rows[5]?.cells[1]);
      expect(intro).toContain(rows[6]?.cells[1]);
      expect(intro).toContain(rows[9]?.cells[0]);
      expect(intro).toContain(rows[10]?.cells[0]);
    }
  });
});
