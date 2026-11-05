import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { figure } from '../__testing__/figure.ts';
import { DOSING_CHART } from '../dosing.ts';
import { GUIDES, guidesOf } from '../guide.ts';
import { JOB_PAGES, volumeJobPathOf } from '../jobs.ts';
import { METHOD_SECTIONS } from '../methodology.ts';
import { VOLUME_CHART } from './chart.ts';
import { VOLUME_TEXTS } from './texts.ts';

const pages = readdirSync(fileURLToPath(new URL('../pages/', import.meta.url)))
  .filter((name) => name.endsWith('.astro'))
  .map((name) => `/${name.replace(/\.astro$/, '').replace(/^index$/, '')}`);

const table = (id: string) => {
  const found = VOLUME_CHART.tables.find((candidate) => candidate.id === id);
  if (found === undefined) throw new Error(`no table ${id}`);
  return found;
};

/** The cell of the table `id` in the row `label`, under the column `index`. */
const cell = (id: string, label: string, index: number): string => {
  const found = table(id).rows.find((row) => row.label === label)?.cells[index];
  if (found === undefined) throw new Error(`no cell ${label} ${String(index)} in ${id}`);
  return found;
};

describe('the pool volume chart', () => {
  it('lives at its own page, with a title and a description a result shows whole', () => {
    expect(pages).toContain(VOLUME_CHART.path);
    expect(VOLUME_CHART.title.endsWith(' | Pool Figures')).toBe(true);
    expect(VOLUME_CHART.title.length).toBeLessThanOrEqual(65);
    expect(VOLUME_CHART.description.length).toBeGreaterThan(50);
    expect(VOLUME_CHART.description.length).toBeLessThanOrEqual(160);
  });

  it('charts round, oval and rectangle pools, in that order', () => {
    expect(VOLUME_CHART.tables.map(({ id }) => id)).toEqual(['round', 'oval', 'rectangle']);
  });

  it('has every common round size from 12 to 33 ft, every 3 ft', () => {
    expect(table('round').rows.map(({ label }) => label)).toEqual([
      '12 ft round',
      '15 ft round',
      '18 ft round',
      '21 ft round',
      '24 ft round',
      '27 ft round',
      '30 ft round',
      '33 ft round',
    ]);
  });

  it('has the common oval and rectangle sizes, 12 x 24 to 20 x 40 ft', () => {
    expect(table('oval').rows.map(({ label }) => label)).toEqual([
      '12 x 18 ft oval',
      '12 x 24 ft oval',
      '15 x 24 ft oval',
      '15 x 30 ft oval',
      '16 x 32 ft oval',
      '18 x 33 ft oval',
      '18 x 40 ft oval',
    ]);
    expect(table('rectangle').rows.map(({ label }) => label)).toEqual([
      '12 x 24 ft',
      '14 x 28 ft',
      '15 x 30 ft',
      '16 x 32 ft',
      '16 x 36 ft',
      '16 x 40 ft',
      '18 x 36 ft',
      '20 x 40 ft',
    ]);
  });

  it('heads each column with its depths and the average the gallons are worked from', () => {
    expect(table('round').columns.map(({ head, average }) => [head, average])).toEqual([
      ['3 ft 6 in deep', '3 ft 6 in'],
      ['4 ft deep', '4 ft'],
      ['4 ft 6 in deep', '4 ft 6 in'],
    ]);
    expect(table('oval').columns).toEqual(table('round').columns);
    expect(table('rectangle').columns.map(({ head, average }) => [head, average])).toEqual([
      ['4 ft deep', '4 ft'],
      ['3 ft to 6 ft', '4 ft 6 in'],
      ['3 ft 6 in to 8 ft', '5 ft 9 in'],
    ]);
  });

  // every cell is the volume calculator's own figure, to the digit: no number is typed by hand
  it.each(VOLUME_CHART.tables.map((t) => [t.id, t] as const))(
    'works out every %s cell as the volume calculator does',
    (_id, { columns, rows }) => {
      for (const { size, cells } of rows) {
        expect(cells).toHaveLength(columns.length);
        columns.forEach(({ shallow, deep }, index) => {
          expect(cells[index], JSON.stringify(size)).toBe(
            figure(VOLUME_TEXTS.path, { ...size, shallow, deep }, 'gallons'),
          );
        });
      }
    },
  );

  // hand-worked in the methodology: 512 ft² × 5.75 ft × 1,728 ÷ 231; π × 24² ÷ 4 × 4 ft × 1,728 ÷ 231;
  // and 800 ft² × 4 ft = 3,200 ft³, × 1,728 ÷ 231 = 23,937.7
  it('gives the sizes worked by hand', () => {
    expect(cell('rectangle', '16 x 32 ft', 2)).toBe('22,023');
    expect(cell('round', '24 ft round', 1)).toBe('13,536');
    expect(cell('rectangle', '20 x 40 ft', 0)).toBe('23,938');
  });

  it('gives the same gallons as the page of each size it has one for', () => {
    for (const { columns, rows } of VOLUME_CHART.tables)
      for (const { size, label, cells } of rows) {
        const job = volumeJobPathOf(size);
        const page = JOB_PAGES.find(({ path }) => path === job);
        if (page === undefined) continue;
        columns.forEach(({ shallow, deep }, index) => {
          const depth = shallow === deep ? shallow : `${shallow} to ${deep}`;
          const row = page.rows.find(({ cells: [at] }) => at === depth);
          if (row !== undefined) expect(cells[index], `${label} ${depth}`).toBe(row.cells[1]);
        });
      }
  });

  it('links every size the site has a page for, and opens the calculator on every row', () => {
    const jobs = VOLUME_CHART.tables.flatMap(({ rows }) =>
      rows.flatMap(({ size }) => volumeJobPathOf(size) ?? []),
    );
    expect(jobs).toHaveLength(20);
    for (const { rows } of VOLUME_CHART.tables)
      for (const { href } of rows) expect(href.startsWith(`${VOLUME_TEXTS.path}?`)).toBe(true);
  });

  it('opens with three sizes, the answer before the tables', () => {
    expect(VOLUME_CHART.lead).toContain(cell('round', '24 ft round', 1));
    expect(VOLUME_CHART.lead).toContain(cell('oval', '15 x 30 ft oval', 1));
    expect(VOLUME_CHART.lead).toContain(cell('rectangle', '16 x 32 ft', 1));
  });

  it('works the shortcut factors out with the calculator: 7.48 gallons a cubic foot', () => {
    expect(VOLUME_CHART.factors.cubicFoot).toBe('7.48');
    expect(VOLUME_CHART.factors.round).toBe('5.9');
    expect(VOLUME_CHART.assumptions.join(' ')).toContain('7.48');
    expect(VOLUME_CHART.assumptions.join(' ')).toContain('average');
  });

  it('cites the gallon as the methodology cites it, and links the method', () => {
    const volume = METHOD_SECTIONS.find(({ id }) => id === 'volume');
    expect(volume?.sources).toContainEqual(VOLUME_CHART.source);
    expect(VOLUME_CHART.method).toBe('/methodology#volume');
  });

  it('asks to be cited by its canonical address', () => {
    expect(VOLUME_CHART.cite.url).toBe(`https://poolfigures.com${VOLUME_CHART.path}`);
    expect(VOLUME_CHART.cite.text).toContain('Pool Figures');
    expect(VOLUME_CHART.cite.text).toContain(VOLUME_CHART.h1);
  });

  it('is a guide the volume calculator links back, next to the dosing chart', () => {
    const paths = GUIDES.map(({ path }) => path);
    expect(paths.indexOf(VOLUME_CHART.path)).toBe(paths.indexOf(DOSING_CHART.path) + 1);
    expect(GUIDES.find(({ path }) => path === VOLUME_CHART.path)?.calculators).toEqual([
      VOLUME_TEXTS.path,
    ]);
    expect(guidesOf(VOLUME_TEXTS.path).map(({ path }) => path)).toContain(VOLUME_CHART.path);
  });

  it('is linked from the dosing chart, next to the calculator', () => {
    expect(DOSING_CHART.chart.href).toBe(VOLUME_CHART.path);
  });
});
