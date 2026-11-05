import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { figure } from './__testing__/figure.ts';
import { CHEMISTRY_CHART } from './chemistry.ts';
import { DOSING_CHART } from './dosing.ts';
import { ALKALINITY, CALCIUM, CHLORINE, PH, SALT, STABILIZER } from './doses.ts';
import { CALCIUM_GUIDE, GUIDES, guidesOf, PH_GUIDE, SHOCK_GUIDE } from './guide.ts';
import { METHOD_SECTIONS } from './methodology.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

const pages = readdirSync(fileURLToPath(new URL('pages/', import.meta.url)))
  .filter((name) => name.endsWith('.astro'))
  .map((name) => `/${name.replace(/\.astro$/, '').replace(/^index$/, '')}`);

const columns = DOSING_CHART.tables.flatMap(({ columns: of }) => of);

const column = (id: string) => {
  const found = columns.find((candidate) => candidate.id === id);
  if (found === undefined) throw new Error(`no column ${id}`);
  return found;
};

/** The cell of a column in the row of `gallons`, as the page prints it. */
const cell = (id: string, gallons: number): string => {
  const table = DOSING_CHART.tables.find(({ columns: of }) => of.some((c) => c.id === id));
  const index = table?.columns.findIndex((c) => c.id === id) ?? -1;
  const row = table?.rows.find((candidate) => candidate.gallons === gallons);
  const found = row?.cells[index];
  if (found === undefined) throw new Error(`no cell ${id} at ${String(gallons)}`);
  return found;
};

describe('the chemical dosing chart', () => {
  it('lives at its own page, with a title and a description a result shows whole', () => {
    expect(pages).toContain(DOSING_CHART.path);
    expect(DOSING_CHART.title.endsWith(' | Pool Figures')).toBe(true);
    expect(DOSING_CHART.title.length).toBeLessThanOrEqual(65);
    expect(DOSING_CHART.description.length).toBeGreaterThan(50);
    expect(DOSING_CHART.description.length).toBeLessThanOrEqual(160);
  });

  it('has a row for every 5,000 gallons from 5,000 to 40,000 in every table', () => {
    const sizes = [5000, 10_000, 15_000, 20_000, 25_000, 30_000, 35_000, 40_000];
    for (const { rows, columns: of } of DOSING_CHART.tables) {
      expect(rows.map(({ gallons }) => gallons)).toEqual(sizes);
      expect(rows.map(({ size }) => size)).toEqual(sizes.map((g) => g.toLocaleString('en-US')));
      for (const { cells } of rows) expect(cells).toHaveLength(of.length);
    }
  });

  it('gives every column a unique id, a head with its unit, an assumption and a source', () => {
    const ids = columns.map(({ id }) => id);
    expect(ids).toEqual([
      'liquid',
      'calHypo',
      'salt',
      'bakingSoda',
      'stabilizer',
      'calcium',
      'acid',
      'acidPerDay',
    ]);
    for (const { head, unit, assumption, sources } of columns) {
      expect(head.length).toBeGreaterThan(0);
      expect(unit.length).toBeGreaterThan(0);
      expect(assumption.length).toBeGreaterThan(40);
      expect(sources.length).toBeGreaterThan(0);
      for (const key of sources) expect(DOSING_CHART.sources, key).toHaveProperty(key);
    }
  });

  // every cell is the calculator's own figure, to the digit: no number is typed by hand
  it.each(columns.map((c) => [c.id, c] as const))(
    'works out every %s cell as its calculator does',
    (id, { calculator, key, raw }) => {
      for (const gallons of DOSING_CHART.tables[0]?.rows.map((row) => row.gallons) ?? [])
        expect(cell(id, gallons), String(gallons)).toBe(figure(calculator, raw(gallons), key));
    },
  );

  // hand-worked: 10.24 fl oz per ppm per 10,000 gal; 0.65 of 378.5 g is 582.4 g, 20.5 oz; 10,000 ×
  // 3,200 × 8.34 ÷ 1,000,000 lb; 1.4 lb, 13.35 oz and 1.25 lb per 10 ppm; Taylor's 9.16 fl oz a drop;
  // HASA's quart (32 fl oz) per 20,000 gallons a day
  it('gives the 10,000 and 20,000 gallon rows as worked by hand', () => {
    expect([10_000, 20_000].map((g) => cell('liquid', g))).toEqual(['10.2', '20.5']);
    expect([10_000, 20_000].map((g) => cell('calHypo', g))).toEqual(['20.5', '41.1']);
    expect([10_000, 20_000].map((g) => cell('salt', g))).toEqual(['266.9', '533.8']);
    expect([10_000, 20_000].map((g) => cell('bakingSoda', g))).toEqual(['1.4', '2.8']);
    expect([10_000, 20_000].map((g) => cell('stabilizer', g))).toEqual(['13.4', '26.7']);
    expect(cell('calcium', 20_000)).toBe('2.5');
    expect([10_000, 20_000].map((g) => cell('acid', g))).toEqual(['9.2', '18.3']);
    expect([10_000, 20_000].map((g) => cell('acidPerDay', g))).toEqual(['16.0', '32.0']);
  });

  it('opens with the 10,000 gallon doses, the answer before the tables', () => {
    for (const id of ['liquid', 'salt', 'bakingSoda', 'acid'])
      expect(DOSING_CHART.lead).toContain(cell(id, 10_000));
    expect(DOSING_CHART.lead).toContain('10,000');
  });

  it('sends each column to the calculator that works it out and to its methodology', () => {
    expect(column('liquid').calculator).toBe(CHLORINE.path);
    expect(column('calHypo').calculator).toBe(CHLORINE.path);
    expect(column('salt').calculator).toBe(SALT.path);
    expect(column('bakingSoda').calculator).toBe(ALKALINITY.path);
    expect(column('stabilizer').calculator).toBe(STABILIZER.path);
    expect(column('calcium').calculator).toBe(CALCIUM.path);
    expect(column('acid').calculator).toBe(PH.path);
    expect(column('acidPerDay').calculator).toBe(PH.path);
    const sections = new Set(METHOD_SECTIONS.map(({ id }) => `/methodology#${id}`));
    for (const { calculator, link, method } of columns) {
      expect(pages).toContain(calculator);
      expect(link.href.startsWith(`${calculator}?`)).toBe(true);
      expect(sections, method).toContain(method);
    }
    expect(DOSING_CHART.gallons.href).toBe(VOLUME_TEXTS.path);
    expect(DOSING_CHART.ranges.href).toBe(CHEMISTRY_CHART.path);
  });

  it('cites every source it names on https, and names every source it cites', () => {
    const cited = new Set(columns.flatMap(({ sources }) => sources));
    expect([...cited].sort()).toEqual(Object.keys(DOSING_CHART.sources).sort());
    for (const { url } of Object.values(DOSING_CHART.sources))
      expect(url.startsWith('https://')).toBe(true);
  });

  it('cites each source as the guides and the chart already cite it', () => {
    const { sources } = DOSING_CHART;
    expect(sources.hayward).toEqual(CHEMISTRY_CHART.sources.hayward);
    expect(sources.cdc).toEqual(CHEMISTRY_CHART.sources.cdc);
    expect(sources.mahc).toEqual(CHEMISTRY_CHART.sources.mahc);
    expect(sources.calHypo).toEqual(SHOCK_GUIDE.sources.calHypo);
    expect(sources.taylor).toEqual(PH_GUIDE.sources.taylor);
    expect(sources.hasa).toEqual(PH_GUIDE.sources.hasa);
    expect(sources.clearView).toEqual(CALCIUM_GUIDE.sources.label);
  });

  it('states the strength each dose assumes', () => {
    expect(column('liquid').assumption).toContain('12.5%');
    expect(column('calHypo').assumption).toContain('65%');
    expect(column('salt').assumption).toContain('99%');
    expect(column('bakingSoda').assumption).toContain('sodium bicarbonate');
    expect(column('stabilizer').assumption).toContain('100% cyanuric acid');
    expect(column('calcium').assumption).toMatch(/calcium chloride flake/i);
    expect(column('acid').assumption).toContain('31.45%');
    expect(column('acidPerDay').assumption).toContain('one quart per 20,000 gallons');
  });

  it('asks to be cited by its canonical address', () => {
    expect(DOSING_CHART.cite.url).toBe(`https://poolfigures.com${DOSING_CHART.path}`);
    expect(DOSING_CHART.cite.text).toContain('Pool Figures');
    expect(DOSING_CHART.cite.text).toContain(DOSING_CHART.h1);
  });

  it('is a guide every calculator it doses links back', () => {
    const guide = GUIDES.find(({ path }) => path === DOSING_CHART.path);
    expect(guide?.calculators).toEqual([
      VOLUME_TEXTS.path,
      CHLORINE.path,
      SALT.path,
      ALKALINITY.path,
      STABILIZER.path,
      CALCIUM.path,
      PH.path,
    ]);
    for (const path of guide?.calculators ?? [])
      expect(guidesOf(path).map((card) => card.path)).toContain(DOSING_CHART.path);
  });
});
