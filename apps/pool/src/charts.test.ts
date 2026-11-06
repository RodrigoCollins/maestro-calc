import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { NAMED_SOURCES } from './about.ts';
import { CHARTS_INDEX, DATA_PAGES, checkedText, ownersOf } from './charts.ts';
import { CHEMISTRY_CHART } from './chemistry.ts';
import { DOSING_CHART } from './dosing.ts';
import { SWIM_GUIDE } from './swim.ts';
import { VOLUME_CHART } from './volume/chart.ts';

const pagesDir = new URL('pages/', import.meta.url);
const files = readdirSync(fileURLToPath(pagesDir)).filter((name) => name.endsWith('.astro'));
const pathOf = (file: string): string => `/${file.replace(/\.astro$/, '')}`;
const listed = DATA_PAGES.map(({ path }) => path);
/** The source of a page, with the component it renders in each language when it is one. */
const sourceOf = (path: string): string => {
  const page = readFileSync(fileURLToPath(new URL(`${path.slice(1)}.astro`, pagesDir)), 'utf8');
  const component = /from '\.\.\/components\/(\w+\.astro)'/.exec(page)?.[1];
  return component === undefined
    ? page
    : `${page}${readFileSync(fileURLToPath(new URL(`../components/${component}`, pagesDir)), 'utf8')}`;
};

describe('the data and charts index', () => {
  it('lives at its own page, with a title and a description search engines can show whole', () => {
    expect(files.map(pathOf)).toContain(CHARTS_INDEX.path);
    expect(CHARTS_INDEX.title.endsWith(' | Pool Figures')).toBe(true);
    expect(CHARTS_INDEX.title.length).toBeLessThanOrEqual(65);
    expect(CHARTS_INDEX.description.length).toBeGreaterThan(50);
    expect(CHARTS_INDEX.description.length).toBeLessThanOrEqual(160);
  });

  // a chart page left out of the index is a citable page a journalist cannot find
  it('lists every chart page of the site, and the swim reference guide', () => {
    const charts = files.filter((name) => name.endsWith('-chart.astro')).map(pathOf);
    expect(charts.length).toBeGreaterThan(0);
    for (const chart of charts) expect(listed).toContain(chart);
    expect(listed).toContain(SWIM_GUIDE.path);
    expect(new Set(listed).size).toBe(listed.length);
  });

  it('lists only pages the site builds', () => {
    for (const path of listed) expect(files.map(pathOf)).toContain(path);
  });

  it('describes each page with the summary and the check date of its own module', () => {
    const modules = [CHEMISTRY_CHART, DOSING_CHART, VOLUME_CHART, SWIM_GUIDE];
    expect(DATA_PAGES).toHaveLength(modules.length);
    for (const module of modules) {
      const entry = DATA_PAGES.find(({ path }) => path === module.path);
      expect(entry?.name).toBe(module.card.title);
      expect(entry?.summary).toBe(module.card.summary);
      expect(entry?.checked).toBe(module.checked);
    }
  });

  it('dates every check as a real day, no later than the last one', () => {
    for (const { checked } of DATA_PAGES) {
      expect(checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(`${checked}T00:00:00Z`).toISOString().slice(0, 10)).toBe(checked);
      expect(checked <= '2026-11-05').toBe(true);
    }
    expect(checkedText('2026-11-05')).toBe('November 5, 2026');
  });

  it('names the owners of the sources each page cites, from the sources themselves', () => {
    expect(DATA_PAGES.find(({ path }) => path === CHEMISTRY_CHART.path)?.owners).toEqual([
      'Hayward',
      'CDC MAHC',
      'CDC',
    ]);
    expect(DATA_PAGES.find(({ path }) => path === DOSING_CHART.path)?.owners).toEqual(
      expect.arrayContaining(['Taylor Technologies', 'HASA', 'CDC MAHC']),
    );
    expect(DATA_PAGES.find(({ path }) => path === VOLUME_CHART.path)?.owners).toEqual(['NIST']);
    for (const { owners } of DATA_PAGES) {
      expect(owners.length).toBeGreaterThan(0);
      expect(new Set(owners).size).toBe(owners.length);
    }
  });

  it('refuses a source whose owner it cannot name', () => {
    expect(() => ownersOf([{ name: 'Some forum post', url: 'https://example.com' }])).toThrow(
      'Some forum post',
    );
    // each owner is one the about page names, or the code and the labels it names them by
    for (const { owners } of DATA_PAGES)
      for (const owner of owners)
        expect([...NAMED_SOURCES, 'CDC MAHC', 'EPA-registered labels']).toContain(owner);
  });

  it('tells journalists the figures are free to cite with a link, and where to write', () => {
    expect(CHARTS_INDEX.press.email).toBe('press@maestrocalc.com');
    expect(CHARTS_INDEX.press.text).toMatch(/free to cite/);
    expect(CHARTS_INDEX.press.text).toMatch(/link/);
  });

  // check:site holds the built links too (`site-check/links.ts`)
  it('is linked from every page it lists', () => {
    for (const path of listed) expect(sourceOf(path)).toContain('<DataLink');
  });
});
