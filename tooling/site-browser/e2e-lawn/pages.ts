import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Every page of Lawn Figures: the paths of the sitemap of the built `apps/lawn/dist` (the specs
 * serve that same build), so a new route is picked up without an edit here.
 */
export const PAGES: readonly string[] = [
  ...readFileSync(
    resolve(import.meta.dirname, '../../../apps/lawn/dist/sitemap.xml'),
    'utf8',
  ).matchAll(/<loc>([^<]+)<\/loc>/g),
].map(([, loc = '']) => new URL(loc).pathname);

/** The pages that hold a script (one module): the calculators, the frost index and each frost page. */
export const SCRIPTED: readonly string[] = PAGES.filter(
  (path) => path.endsWith('-calculator') || path.startsWith('/frost-dates'),
);

/**
 * Each calculator: the figure its tag shows at the defaults (worked out at build time, so it reads
 * with no script), and one edit worked out by hand with the figure it must show after it. A field
 * is set by name; a select takes its option value.
 */
export const CALCULATORS = [
  {
    path: '/lawn-fertilizer-calculator',
    out: 'pounds',
    // 1 / 0.24 x 5 = 20.83 lb
    initial: '20.8',
    // Purdue's example: 0.75 lb N of 16-8-8 on 8,000 sq ft, 4.6875 x 8 = 37.5 lb, one 50 lb bag
    edits: { area: '8000', nitrogen: '16', phosphate: '8', potash: '8', target: '0.75', bag: '50' },
    edited: '37.5',
    bags: { initial: '2', edited: '1' },
  },
  {
    path: '/grass-seed-calculator',
    out: 'pounds',
    // Kentucky bluegrass, Virginia 2 to 3 lb per 1,000 sq ft, x 5
    initial: '10.0–15.0',
    // tall fescue, Tennessee 5 to 8 lb per 1,000 sq ft, on 1,000 sq ft
    edits: { area: '1000', species: 'tall-fescue', source: 'tennessee' },
    edited: '5.0–8.0',
    bags: { initial: '2–3', edited: '1–2' },
  },
  {
    path: '/sod-calculator',
    out: 'order',
    initial: '1,000',
    // 1,000 x 1.10 = 1,100 sq ft
    edits: { waste: '10' },
    edited: '1,100',
    bags: { initial: '3', edited: '3' },
  },
  {
    path: '/lawn-lime-calculator',
    out: 'pounds',
    // 30 lb per 1,000 sq ft x 5
    initial: '150.0',
    // 30 x 100 / 90 = 33.3 lb per 1,000 sq ft, x 5 = 166.7
    edits: { cce: '90' },
    edited: '166.7',
    bags: { initial: '4', edited: '5' },
  },
] as const;
