import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FROST_PAGES } from './frost.ts';
import { hrefOf, routeOf, ROUTES } from './routes.ts';

const pages = resolve(import.meta.dirname, 'pages');

/** The `.astro` and `.ts` files under `src/pages`, as route-like paths, with `[…]` ones left out. */
const filesIn = (dir: string, prefix = ''): string[] =>
  readdirSync(resolve(pages, dir), { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return filesIn(`${dir}/${entry.name}`, `${prefix}/${entry.name}`);
    return entry.name.includes('[') ? [] : [`${prefix}/${entry.name}`];
  });

describe('routes', () => {
  it('pins the published addresses: they are a public contract', () => {
    expect(ROUTES.slice(0, 27).map(({ path }) => path)).toEqual([
      '/',
      '/lawn-fertilizer-calculator',
      '/grass-seed-calculator',
      '/sod-calculator',
      '/lawn-lime-calculator',
      '/frost-dates',
      '/when-to-fertilize-and-seed-your-lawn',
      '/when-to-plant-grass-seed',
      '/bermuda-grass-seed',
      '/zoysia-grass-seed',
      '/tall-fescue-grass-seed',
      '/perennial-ryegrass-seed',
      '/kentucky-bluegrass-seed',
      '/fescue-grass-seed',
      '/centipede-grass-seed',
      '/buffalo-grass-seed',
      '/st-augustine-grass-seed',
      '/best-grass-seed',
      '/methodology',
      '/about',
      '/editorial-policy',
      '/privacy',
      '/planting-zones',
      '/when-to-sow-grass-seed-uk',
      '/how-long-does-grass-seed-take-to-grow',
      '/when-to-aerate-lawn',
      '/when-to-apply-pre-emergent',
    ]);
  });

  it('has one route per address, every id once', () => {
    expect(new Set(ROUTES.map(({ path }) => path)).size).toBe(ROUTES.length);
    expect(new Set(ROUTES.map(({ id }) => id)).size).toBe(ROUTES.length);
  });

  it('routes the four calculators and every frost page', () => {
    expect(ROUTES.filter(({ kind }) => kind === 'calculator')).toHaveLength(4);
    expect(ROUTES.filter(({ id }) => id.startsWith('frost:'))).toHaveLength(FROST_PAGES.length);
    expect(hrefOf('frost:texas:2')).toBe('/frost-dates/texas/2');
  });

  it('routes a page for each planting zone and a seed and a fertilizer page for each state', () => {
    expect(ROUTES.filter(({ id }) => id.startsWith('zone:'))).toHaveLength(16);
    expect(ROUTES.filter(({ id }) => id.startsWith('seed:'))).toHaveLength(26);
    expect(ROUTES.filter(({ id }) => id.startsWith('feed:'))).toHaveLength(26);
    expect(hrefOf('zone:7b')).toBe('/planting-zones/zone-7b');
    expect(hrefOf('seed:texas')).toBe('/when-to-plant-grass-seed/texas');
    expect(hrefOf('feed:north-carolina')).toBe('/when-to-fertilize-lawn/north-carolina');
  });

  it('has a page file for every fixed route, so a new page file cannot be left out', () => {
    const files = filesIn('.')
      .map((file) => file.replace(/\.(astro|ts)$/, '').replace(/\.(xml|txt)$/, ''))
      .filter((file) => !['/404', '/sitemap', '/llms'].includes(file))
      .map((file) => (file === '/index' ? '/' : file));
    const fixed = ROUTES.filter(({ id }) => !id.includes(':')).map(({ path }) => path);
    // the frost index is `frost-dates/index.astro`, the one fixed route in a folder
    expect([...files].sort()).toEqual(
      [...fixed.map((path) => (path === '/frost-dates' ? '/frost-dates/index' : path))].sort(),
    );
  });

  it('finds a route by address, and the 404 has none', () => {
    expect(routeOf('/sod-calculator')?.id).toBe('sod');
    expect(routeOf('/nope')).toBeUndefined();
    expect(() => hrefOf('nope')).toThrow('no route nope');
  });
});
