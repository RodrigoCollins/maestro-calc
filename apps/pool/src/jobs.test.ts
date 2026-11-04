import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  decode,
  gal,
  isQuantityOf,
  liter,
  type Calculator,
  type InputDescriptor,
  type OutputDescriptor,
} from '@maestro-calc/core';
import { poolSalt } from '@maestro-calc/pool-core/pool-salt';
import { poolVolume } from '@maestro-calc/pool-core/pool-volume';
import { describe, expect, it } from 'vitest';
import { CHLORINE, PUMP, SALT } from './doses.ts';
import { outputText, volumeText } from './format.ts';
import { JOB_PAGES, jobLinksOf, type JobPage } from './jobs.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

const pageFiles = readdirSync(fileURLToPath(new URL('pages/', import.meta.url)))
  .filter((name) => name.endsWith('.astro') && !name.startsWith('['))
  .map((name) => `/${name.replace(/\.astro$/, '').replace(/^index$/, '')}`);

/** The figures of one engine run, as a table row writes them: pounds and bags, or gallons and liters. */
const engineCells = (path: string, raw: Readonly<Record<string, string>>): string[] => {
  const ran = path === SALT.path ? poolSalt.run(raw) : poolVolume.run(raw);
  if (!ran.ok) throw new Error(`${path} did not run`);
  const value = (key: string): unknown => ran.value.outputs.find((out) => out.key === key)?.value;
  if (path === SALT.path)
    return [outputText('pounds', value('pounds')), String(ran.value.shopping[0]?.qty)];
  const volume = value('gallons');
  if (!isQuantityOf(volume, 'volume')) throw new Error('gallons must be a volume');
  return [volumeText(volume, gal), volumeText(volume, liter)];
};

/** The calculator decodes the link's query into the very inputs of `raw`, with no issue. */
const expectOpensOn = <const I extends readonly InputDescriptor[]>(
  engine: Calculator<string, I, readonly OutputDescriptor[], readonly string[]>,
  query: string,
  raw: Readonly<Record<string, string>>,
): void => {
  const validated = engine.validate(raw);
  if (!validated.ok) throw new Error('the main row must validate');
  const decoded = decode(engine, query);
  expect(decoded.issues).toEqual([]);
  expect(decoded.state).toEqual(validated.value);
};

const byPath = (path: string): JobPage => {
  const page = JOB_PAGES.find((job) => job.path === path);
  if (page === undefined) throw new Error(`no job page ${path}`);
  return page;
};

describe('the long-tail job pages', () => {
  it('gives each job its own path, clear of every page file', () => {
    const paths = JOB_PAGES.map(({ path }) => path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const path of paths) {
      expect(path).toMatch(/^\/[a-z0-9-]+$/);
      expect(pageFiles).not.toContain(path);
    }
  });

  // the plan's guard: a figure the engine computes, never a typed one
  it('fills every row of every table from its own engine run', () => {
    for (const { calculator, figure, rows } of JOB_PAGES) {
      expect(rows.length).toBeGreaterThan(1);
      for (const { raw, cells } of rows)
        expect(cells.slice(1)).toEqual(engineCells(calculator.path, raw));
      expect(rows.some(({ cells }) => cells.includes(figure.value))).toBe(true);
    }
  });

  it('links each page to its calculator, opened on the pool of the large figure', () => {
    for (const { calculator, rows, figure } of JOB_PAGES) {
      expect([SALT.path, VOLUME_TEXTS.path]).toContain(calculator.path);
      expect(pageFiles).toContain(calculator.path);
      const [path, query = ''] = calculator.href.split('?');
      expect(path).toBe(calculator.path);
      const main = rows.find(({ cells }) => cells.includes(figure.value));
      if (calculator.path === SALT.path) expectOpensOn(poolSalt, query, main?.raw ?? {});
      else expectOpensOn(poolVolume, query, main?.raw ?? {});
    }
  });

  // worked by hand: 15,000 × 3,200 × 8.34 ÷ 1,000,000 = 400.32 lb, 400.32 ÷ 40 = 10.008, so 11 bags
  it('works out 15,000 gallons from fresh water to 3,200 ppm as by hand', () => {
    const page = byPath('/how-much-salt-for-a-15000-gallon-pool');
    expect(page.figure).toMatchObject({ value: '400.3', unit: 'LB' });
    expect(page.rows[0]?.cells).toEqual(['0 ppm', '400.3', '11']);
    // 15,000 × 800 × 8.34 ÷ 1,000,000 = 100.08 lb, 3 bags
    expect(page.rows.find(({ cells }) => cells[0] === '2,400 ppm')?.cells).toEqual([
      '2,400 ppm',
      '100.1',
      '3',
    ]);
  });

  // worked by hand: 512 ft² × 5.75 ft × 1,728 ÷ 231 = 22,023; π × 24² ÷ 4 × 4 ft × 1,728 ÷ 231 = 13,536
  it('works out the 16 x 32 and the 24 ft round pools as by hand', () => {
    expect(byPath('/16x32-pool-gallons').figure.value).toBe('22,023');
    expect(byPath('/24-ft-round-pool-gallons').figure.value).toBe('13,536');
    // π × 30 × 15 ÷ 4 = 353.43 ft², × 4 ft × 1,728 ÷ 231 = 10,575
    expect(byPath('/15x30-oval-pool-gallons').figure.value).toBe('10,575');
  });

  // worked by hand: 800 ft² × (3.5 + 8) ÷ 2 ft = 4,600 ft³, × 1,728 ÷ 231 = 34,410
  it('works out the 20 x 40 and the 18 ft and 21 ft round pools as by hand', () => {
    expect(byPath('/20x40-pool-gallons').figure.value).toBe('34,410');
    // π × 18² ÷ 4 × 4 ft = 1,017.88 ft³, × 1,728 ÷ 231 = 7,614
    expect(byPath('/18-ft-round-pool-gallons').figure.value).toBe('7,614');
    // π × 21² ÷ 4 × 4 ft = 1,385.44 ft³, × 1,728 ÷ 231 = 10,364
    expect(byPath('/21-ft-round-pool-gallons').figure.value).toBe('10,364');
  });

  it('is linked from the calculator it works with, and from no other', () => {
    for (const path of [VOLUME_TEXTS.path, SALT.path]) {
      const linked = jobLinksOf(path).map(({ href }) => href);
      const own = JOB_PAGES.filter(({ calculator }) => calculator.path === path);
      expect(linked).toEqual(own.map((page) => page.path));
      expect(jobLinksOf(path).map(({ label }) => label)).toEqual(own.map(({ h1 }) => h1));
    }
    expect(jobLinksOf(VOLUME_TEXTS.path)).toContainEqual({
      href: '/12x24-pool-gallons',
      label: 'How many gallons in a 12 x 24 pool',
    });
    expect(jobLinksOf(SALT.path)).toContainEqual({
      href: '/how-much-salt-for-a-20000-gallon-pool',
      label: 'How much salt for a 20,000 gallon pool',
    });
    expect(jobLinksOf(CHLORINE.path)).toEqual([]);
    expect(jobLinksOf(PUMP.path)).toEqual([]);
  });
});
