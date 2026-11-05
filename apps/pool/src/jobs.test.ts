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
import { poolAlkalinity } from '@maestro-calc/pool-core/pool-alkalinity';
import { poolChlorine } from '@maestro-calc/pool-core/pool-chlorine';
import { poolSalt } from '@maestro-calc/pool-core/pool-salt';
import { poolStabilizer } from '@maestro-calc/pool-core/pool-stabilizer';
import { poolVolume } from '@maestro-calc/pool-core/pool-volume';
import { describe, expect, it } from 'vitest';
import { ALKALINITY, CHLORINE, PUMP, SALT, STABILIZER } from './doses.ts';
import { outputText, volumeText } from './format.ts';
import { JOB_PAGES, jobLinksOf, NEIGHBORS, neighborsOf, type JobPage } from './jobs.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

const pageFiles = readdirSync(fileURLToPath(new URL('pages/', import.meta.url)))
  .filter((name) => name.endsWith('.astro') && !name.startsWith('['))
  .map((name) => `/${name.replace(/\.astro$/, '').replace(/^index$/, '')}`);

/**
 * The figures of one engine run, as a table row writes them: pounds and bags, fluid ounces and
 * liters of liquid chlorine, pounds and ounces of baking soda or stabilizer, or gallons and liters
 * of water.
 */
const engineCells = (path: string, raw: Readonly<Record<string, string>>): string[] => {
  const ran =
    path === SALT.path
      ? poolSalt.run(raw)
      : path === CHLORINE.path
        ? poolChlorine.run(raw)
        : path === ALKALINITY.path
          ? poolAlkalinity.run(raw)
          : path === STABILIZER.path
            ? poolStabilizer.run(raw)
            : poolVolume.run(raw);
  if (!ran.ok) throw new Error(`${path} did not run`);
  const value = (key: string): unknown => ran.value.outputs.find((out) => out.key === key)?.value;
  if (path === ALKALINITY.path || path === STABILIZER.path)
    return [outputText('pounds', value('pounds')), outputText('ounces', value('ounces'))];
  if (path === SALT.path)
    return [outputText('pounds', value('pounds')), String(ran.value.shopping[0]?.qty)];
  if (path === CHLORINE.path) {
    const liquid = value('liquid');
    if (!isQuantityOf(liquid, 'volume')) throw new Error('liquid must be a volume');
    return [outputText('liquid', liquid), volumeText(liquid, liter, 2)];
  }
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
      expect([
        SALT.path,
        CHLORINE.path,
        ALKALINITY.path,
        STABILIZER.path,
        VOLUME_TEXTS.path,
      ]).toContain(calculator.path);
      expect(pageFiles).toContain(calculator.path);
      const [path, query = ''] = calculator.href.split('?');
      expect(path).toBe(calculator.path);
      const main = rows.find(({ cells }) => cells.includes(figure.value));
      if (calculator.path === SALT.path) expectOpensOn(poolSalt, query, main?.raw ?? {});
      else if (calculator.path === CHLORINE.path)
        expectOpensOn(poolChlorine, query, main?.raw ?? {});
      else if (calculator.path === ALKALINITY.path)
        expectOpensOn(poolAlkalinity, query, main?.raw ?? {});
      else if (calculator.path === STABILIZER.path)
        expectOpensOn(poolStabilizer, query, main?.raw ?? {});
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

  // worked by hand: 20,000 gal × 3.785411784 L × 2 ppm ÷ 1,000 = 151.42 g of chlorine, ÷ 0.125 =
  // 1,211.3 mL of 12.5% liquid, ÷ 29.5735 mL = 40.96 fl oz (CHLORINE.method: 10.24 per ppm per 10,000)
  it('works out 20,000 gallons from 1 to 3 ppm with 12.5% liquid as by hand', () => {
    const page = byPath('/how-much-chlorine-for-a-20000-gallon-pool');
    expect(page.figure).toMatchObject({ value: '41.0', unit: 'FL OZ' });
    expect(page.rows.map(({ cells }) => cells)).toEqual([
      ['1 to 2 ppm', '20.5', '0.61'],
      ['1 to 3 ppm', '41.0', '1.21'],
      ['1 to 4 ppm', '61.4', '1.82'],
    ]);
    // 10,000 gal: 10.24 fl oz for each ppm, so 20.48 for 2 ppm
    expect(byPath('/how-much-chlorine-for-a-10000-gallon-pool').figure.value).toBe('20.5');
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

  // worked by hand: 20,000 gal × 3.785411784 L × 10 ppm × 84.007 ÷ 50.04 mg = 1.271 kg = 2.80 lb
  // (44.83 oz); 20 ppm is 5.60 lb and 30 ppm 8.41 lb
  it('works out baking soda for 20,000 gallons, 10, 20 and 30 ppm up to 100, as by hand', () => {
    const page = byPath('/how-much-baking-soda-for-a-20000-gallon-pool');
    expect(page.figure).toMatchObject({ value: '2.8', unit: 'LB' });
    expect(page.rows.map(({ cells }) => cells)).toEqual([
      ['90 ppm', '2.8', '44.8'],
      ['80 ppm', '5.6', '89.7'],
      ['70 ppm', '8.4', '134.5'],
    ]);
    // 10,000 gal: 1.40 lb for 10 ppm (ALKALINITY.method: 1.4 lb per 10 ppm per 10,000 gallons)
    expect(byPath('/how-much-baking-soda-for-a-10000-gallon-pool').figure.value).toBe('1.4');
    expect(page.lead).not.toMatch(/ideal/i);
  });

  // worked by hand: 20,000 gal × 3.785411784 L × 30 mg = 2.271 kg = 5.01 lb (80.12 oz); from 20
  // ppm, 10 ppm is 1.67 lb (26.71 oz)
  it('works out stabilizer for 20,000 gallons, from fresh water to 30 ppm, as by hand', () => {
    const page = byPath('/how-much-stabilizer-for-a-20000-gallon-pool');
    expect(page.figure).toMatchObject({ value: '5.0', unit: 'LB' });
    expect(page.rows.map(({ cells }) => cells)).toEqual([
      ['0 ppm', '5.0', '80.1'],
      ['10 ppm', '3.3', '53.4'],
      ['20 ppm', '1.7', '26.7'],
    ]);
    // 25,000 gal: 2.839 kg = 6.26 lb from 0 to 30 ppm
    expect(byPath('/how-much-stabilizer-for-a-25000-gallon-pool').figure.value).toBe('6.3');
    expect(page.lead).not.toMatch(/ideal/i);
  });

  // worked by hand: π × 15² × 4 ft = 2,827.43 ft³, × 1,728 ÷ 231 = 21,151; π × 6² × 4 = 3,384
  it('works out the 12, 15, 27 and 30 ft round pools at 4 ft as by hand', () => {
    expect(byPath('/30-ft-round-pool-gallons').figure.value).toBe('21,151');
    expect(byPath('/12-ft-round-pool-gallons').figure.value).toBe('3,384');
    // π × 7.5² × 4 = 706.86 ft³ = 5,288; π × 13.5² × 4 = 2,290.22 ft³ = 17,132
    expect(byPath('/15-ft-round-pool-gallons').figure.value).toBe('5,288');
    expect(byPath('/27-ft-round-pool-gallons').figure.value).toBe('17,132');
  });

  // worked by hand: 392 ft² × 5.75 ft = 2,254 ft³, × 1,728 ÷ 231 = 16,861; 450 ft² × 5.75 = 19,356
  it('works out the 14 x 28 and the 15 x 30 pools, 3 ft 6 in to 8 ft, as by hand', () => {
    expect(byPath('/14x28-pool-gallons').figure.value).toBe('16,861');
    expect(byPath('/15x30-pool-gallons').figure.value).toBe('19,356');
    expect(byPath('/15x30-pool-gallons').rows.map(({ cells }) => cells[1])).toEqual([
      '13,465',
      '15,148',
      '19,356',
    ]);
  });

  it('links each page to its nearest neighbors of the same calculator, by pool size', () => {
    for (const page of JOB_PAGES) {
      const links = neighborsOf(page);
      const family = JOB_PAGES.filter(({ calculator }) => calculator.path === page.calculator.path);
      expect(links.length).toBe(Math.min(NEIGHBORS, family.length - 1));
      for (const { href, label } of links) {
        expect(href).not.toBe(page.path);
        const linked = byPath(href);
        expect(linked.calculator.path).toBe(page.calculator.path);
        expect(label).toBe(linked.h1);
      }
    }
    expect(
      neighborsOf(byPath('/how-much-stabilizer-for-a-20000-gallon-pool')).map(({ href }) => href),
    ).toEqual([
      '/how-much-stabilizer-for-a-10000-gallon-pool',
      '/how-much-stabilizer-for-a-15000-gallon-pool',
      '/how-much-stabilizer-for-a-25000-gallon-pool',
    ]);
    // the 30 ft round (21,151 gal) sits between the 15 x 30 (19,356) and the 16 x 32 (22,023)
    expect(neighborsOf(byPath('/30-ft-round-pool-gallons')).map(({ href }) => href)).toEqual([
      '/27-ft-round-pool-gallons',
      '/15x30-pool-gallons',
      '/16x32-pool-gallons',
      '/18x36-pool-gallons',
    ]);
    expect(neighborsOf(byPath('/12-ft-round-pool-gallons')).map(({ href }) => href)).toEqual([
      '/15-ft-round-pool-gallons',
      '/18-ft-round-pool-gallons',
      '/12x24-pool-gallons',
      '/21-ft-round-pool-gallons',
    ]);
  });

  it('is linked from the calculator it works with, and from no other', () => {
    for (const path of [
      VOLUME_TEXTS.path,
      SALT.path,
      CHLORINE.path,
      ALKALINITY.path,
      STABILIZER.path,
    ]) {
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
    expect(jobLinksOf(CHLORINE.path).map(({ href }) => href)).toEqual([
      '/how-much-chlorine-for-a-10000-gallon-pool',
      '/how-much-chlorine-for-a-15000-gallon-pool',
      '/how-much-chlorine-for-a-20000-gallon-pool',
      '/how-much-chlorine-for-a-25000-gallon-pool',
    ]);
    expect(jobLinksOf(PUMP.path)).toEqual([]);
  });
});
