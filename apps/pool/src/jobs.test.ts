import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  decode,
  gal,
  isQuantityOf,
  lb,
  liter,
  valueIn,
  type Calculator,
  type InputDescriptor,
  type OutputDescriptor,
} from '@maestro-calc/core';
import { poolAlkalinity } from '@maestro-calc/pool-core/pool-alkalinity';
import { poolCalcium } from '@maestro-calc/pool-core/pool-calcium';
import { poolChlorine } from '@maestro-calc/pool-core/pool-chlorine';
import { poolFillTime } from '@maestro-calc/pool-core/pool-fill-time';
import { poolHeater } from '@maestro-calc/pool-core/pool-heater';
import { poolPh } from '@maestro-calc/pool-core/pool-ph';
import { poolSalt } from '@maestro-calc/pool-core/pool-salt';
import { poolStabilizer } from '@maestro-calc/pool-core/pool-stabilizer';
import { poolVolume } from '@maestro-calc/pool-core/pool-volume';
import { describe, expect, it } from 'vitest';
import {
  ALKALINITY,
  CALCIUM,
  CHLORINE,
  FILL_TIME,
  HEATER,
  PH,
  PUMP,
  SALT,
  STABILIZER,
} from './doses.ts';
import { amountText, outputText, volumeText } from './format.ts';
import { GUIDES, SHOCK_GUIDE } from './guide.ts';
import {
  guideJobLinksOf,
  JOB_PAGES,
  jobLinksOf,
  NEIGHBORS,
  neighborsOf,
  type JobPage,
} from './jobs.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

const pageFiles = readdirSync(fileURLToPath(new URL('pages/', import.meta.url)))
  .filter((name) => name.endsWith('.astro') && !name.startsWith('['))
  .map((name) => `/${name.replace(/\.astro$/, '').replace(/^index$/, '')}`);

/**
 * The figures of one engine run, as a table row writes them: pounds and bags, fluid ounces and
 * liters of liquid chlorine or muriatic acid, pounds and ounces of baking soda or stabilizer, BTU per hour and
 * BTU of heat, the fill time and its minutes, pounds of calcium chloride and its first addition,
 * or gallons and liters of water.
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
            : path === HEATER.path
              ? poolHeater.run(raw)
              : path === FILL_TIME.path
                ? poolFillTime.run(raw)
                : path === PH.path
                  ? poolPh.run(raw)
                  : path === CALCIUM.path
                    ? poolCalcium.run(raw)
                    : poolVolume.run(raw);
  if (!ran.ok) throw new Error(`${path} did not run`);
  const value = (key: string): unknown => ran.value.outputs.find((out) => out.key === key)?.value;
  if (path === ALKALINITY.path || path === STABILIZER.path)
    return [outputText('pounds', value('pounds')), outputText('ounces', value('ounces'))];
  if (path === CALCIUM.path)
    return [
      outputText('pounds', value('pounds')),
      outputText('firstAddition', value('firstAddition')),
    ];
  if (path === HEATER.path)
    return [outputText('btuPerHour', value('btuPerHour')), outputText('btu', value('btu'))];
  if (path === FILL_TIME.path)
    return [outputText('time', value('time')), outputText('minutes', value('minutes'))];
  if (path === SALT.path)
    return [outputText('pounds', value('pounds')), String(ran.value.shopping[0]?.qty)];
  if (path === CHLORINE.path && raw['product']?.startsWith('liquid') !== true) {
    const dry = value('dry');
    if (!isQuantityOf(dry, 'mass')) throw new Error('dry must be a mass');
    return [outputText('dry', dry), amountText(valueIn(dry, lb), 2)];
  }
  if (path === CHLORINE.path || path === PH.path) {
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

const SHOCK_SIZES = [5000, 10_000, 12_000, 15_000, 18_000, 20_000, 25_000, 30_000, 35_000, 40_000];
const SHOCK_PATHS = SHOCK_SIZES.map(
  (gallons) => `/how-much-shock-for-a-${String(gallons)}-gallon-pool`,
);

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
        HEATER.path,
        FILL_TIME.path,
        PH.path,
        CALCIUM.path,
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
      else if (calculator.path === HEATER.path) expectOpensOn(poolHeater, query, main?.raw ?? {});
      else if (calculator.path === FILL_TIME.path)
        expectOpensOn(poolFillTime, query, main?.raw ?? {});
      else if (calculator.path === PH.path) expectOpensOn(poolPh, query, main?.raw ?? {});
      else if (calculator.path === CALCIUM.path) expectOpensOn(poolCalcium, query, main?.raw ?? {});
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

  // a search result answers the question: the gallons of the large figure, at its depth
  it('gives the answer of a volume page in its description', () => {
    expect(byPath('/16x32-pool-gallons').description).toBe(
      'How many gallons a 16 x 32 pool holds: 22,023 at 3 ft 6 in to 8 ft deep, and the gallons and liters at the other depths it comes in.',
    );
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

  // worked by hand: 30,000 gal × 3.785411784 L = 113,562 L; × 30 mg = 3.407 kg = 7.51 lb of
  // stabilizer, and × 10 ppm × 1.6788 mg = 1.906 kg = 4.20 lb of baking soda
  it('works out stabilizer and baking soda for 30,000 gallons as by hand', () => {
    expect(byPath('/how-much-stabilizer-for-a-30000-gallon-pool').figure.value).toBe('7.5');
    expect(byPath('/how-much-baking-soda-for-a-30000-gallon-pool').figure.value).toBe('4.2');
  });

  // worked by hand: 20,000 gal × 8.34 lb × 10 °F = 1,668,000 BTU, ÷ 24 h = 69,500 BTU an hour
  // (HEATER.method); 15 °F is 2,502,000 BTU, 104,250 an hour; 20 °F 3,336,000, 139,000 an hour
  it('works out the heater for 20,000 gallons, 10, 15 and 20 °F in 24 hours, as by hand', () => {
    const page = byPath('/what-size-pool-heater-for-a-20000-gallon-pool');
    expect(page.figure).toMatchObject({ value: '69,500', unit: 'BTU/H' });
    expect(page.rows.map(({ cells }) => cells)).toEqual([
      ['10 °F in 24 hours', '69,500', '1,668,000'],
      ['15 °F in 24 hours', '104,250', '2,502,000'],
      ['20 °F in 24 hours', '139,000', '3,336,000'],
    ]);
    // 15,000 gal × 8.34 × 10 = 1,251,000 BTU, ÷ 24 = 52,125 an hour
    expect(byPath('/what-size-pool-heater-for-a-15000-gallon-pool').figure.value).toBe('52,125');
    // the water's heat only: the page says a real heater is sized larger
    expect(page.lead).toMatch(/larger/);
  });

  // worked by hand: 15,000 gal ÷ 10 gpm = 1,500 min = 25 h 0 min (FILL_TIME.method); at 5 gpm
  // 3,000 min = 50 h 0 min, at 20 gpm 750 min = 12 h 30 min
  it('works out filling 15,000 gallons at 5, 10 and 20 gallons a minute as by hand', () => {
    const page = byPath('/how-long-to-fill-a-15000-gallon-pool');
    expect(page.figure).toMatchObject({ value: '25 h 0 min' });
    expect(page.rows.map(({ cells }) => cells)).toEqual([
      ['5 gallons a minute', '50 h 0 min', '3,000'],
      ['10 gallons a minute', '25 h 0 min', '1,500'],
      ['20 gallons a minute', '12 h 30 min', '750'],
    ]);
    // 20,000 gal ÷ 10 gpm = 2,000 min = 33 h 20 min, the calculator's own worked example
    expect(byPath('/how-long-to-fill-a-20000-gallon-pool').figure.value).toBe('33 h 20 min');
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

  // worked by hand (Taylor's chart, PH.method): 9.16 fl oz a drop per 10,000 gal, so 20,000 gal is
  // 18.32 fl oz a drop: 18.32, 36.64 and 54.96 fl oz for 1, 2 and 3 drops; × 29.5735 mL = 0.54,
  // 1.08 and 1.63 L
  it('works out muriatic acid for 20,000 gallons, 1 to 3 drops of acid demand, as by hand', () => {
    const page = byPath('/how-much-muriatic-acid-for-a-20000-gallon-pool');
    expect(page.figure).toMatchObject({ value: '36.6', unit: 'FL OZ' });
    expect(page.rows.map(({ cells }) => cells)).toEqual([
      ['1 drop', '18.3', '0.54'],
      ['2 drops', '36.6', '1.08'],
      ['3 drops', '55.0', '1.63'],
    ]);
    // 10,000 gal at 2 drops: 18.32 fl oz; 30,000 gal: 54.96
    expect(byPath('/how-much-muriatic-acid-for-a-10000-gallon-pool').figure.value).toBe('18.3');
    expect(byPath('/how-much-muriatic-acid-for-a-30000-gallon-pool').figure.value).toBe('55.0');
  });

  // Taylor's chart lists 1, 2 and 3 drops: a pH page never doses past it
  it('keeps every pH page within the 3 drops of the chart, for 10,000 to 30,000 gallons', () => {
    const ph = JOB_PAGES.filter(({ calculator }) => calculator.path === PH.path);
    expect(ph.map(({ gallons }) => gallons)).toEqual([10_000, 15_000, 20_000, 25_000, 30_000]);
    for (const { rows } of ph)
      for (const { raw } of rows) {
        expect(raw['product']).toBe('muriatic-31-45');
        expect(Number(raw['drops'])).toBeLessThanOrEqual(3);
        const ran = poolPh.run(raw);
        expect(ran.ok && ran.value.warnings).toEqual([]);
      }
  });

  // worked by hand: 5,000 × 3,200 × 8.34 ÷ 1,000,000 = 133.44 lb, 4 bags; 35,000 gal is 934.08
  // lb, 23.35 bags so 24; and 10.24 fl oz of 12.5% liquid per ppm per 10,000 gal: 5,000 gal from
  // 1 to 3 ppm is 10.24 fl oz, 30,000 gal 61.44
  it('works out salt for 5,000 and 35,000 gallons and chlorine for 5,000 and 30,000 as by hand', () => {
    expect(byPath('/how-much-salt-for-a-5000-gallon-pool').rows[0]?.cells).toEqual([
      '0 ppm',
      '133.4',
      '4',
    ]);
    expect(byPath('/how-much-salt-for-a-35000-gallon-pool').rows[0]?.cells).toEqual([
      '0 ppm',
      '934.1',
      '24',
    ]);
    expect(byPath('/how-much-chlorine-for-a-5000-gallon-pool').figure.value).toBe('10.2');
    expect(byPath('/how-much-chlorine-for-a-30000-gallon-pool').figure.value).toBe('61.4');
  });

  // worked by hand: 200 ft² × 4 ft × 1,728 ÷ 231 = 5,984; 576 ft² × 5.75 ft = 3,312 ft³ = 24,775;
  // 640 ft² × 5.75 ft = 3,680 ft³ = 27,528
  it('works out the 10 x 20, 16 x 36 and 16 x 40 pools as by hand', () => {
    expect(byPath('/10x20-pool-gallons').figure.value).toBe('5,984');
    expect(byPath('/16x36-pool-gallons').figure.value).toBe('24,775');
    expect(byPath('/16x40-pool-gallons').figure.value).toBe('27,528');
  });

  // worked by hand: π × 33² ÷ 4 × 4 ft = 3,421.19 ft³, × 1,728 ÷ 231 = 25,592; the ovals at 4 ft:
  // π × 24 × 12 ÷ 4 = 226.19 ft² → 6,768, π × 32 × 16 ÷ 4 = 402.12 ft² → 12,032,
  // π × 33 × 18 ÷ 4 = 466.53 ft² → 13,959
  it('works out the 33 ft round and the 12 x 24, 16 x 32 and 18 x 33 ovals at 4 ft as by hand', () => {
    expect(byPath('/33-ft-round-pool-gallons').figure.value).toBe('25,592');
    expect(byPath('/12x24-oval-pool-gallons').figure.value).toBe('6,768');
    expect(byPath('/16x32-oval-pool-gallons').figure.value).toBe('12,032');
    expect(byPath('/18x33-oval-pool-gallons').figure.value).toBe('13,959');
  });

  // a search result shows about 65 characters of a title (src/site-check/seo.ts)
  it('titles a calcium page short enough to show whole, with its gallons', () => {
    expect(byPath('/how-much-calcium-chloride-for-a-20000-gallon-pool').title).toBe(
      'How Much Calcium Chloride for 20,000 Gallons? | Pool Figures',
    );
  });

  // worked by hand (CALCIUM.method): gallons × raise ÷ 80,000 lb; 20,000 gal from 150 to 250 ppm
  // is 25 lb, over 3 lb per 10,000 gallons, so 6 lb go in first; from 200, 12.5 lb, 6 first; from
  // 240, 2.5 lb, all at once
  it('works out calcium chloride for 20,000 gallons, 10, 50 and 100 ppm up to 250, as by hand', () => {
    const page = byPath('/how-much-calcium-chloride-for-a-20000-gallon-pool');
    expect(page.figure).toMatchObject({ value: '25.0', unit: 'LB' });
    expect(page.rows.map(({ cells }) => cells)).toEqual([
      ['240 ppm', '2.5', '2.5'],
      ['200 ppm', '12.5', '6.0'],
      ['150 ppm', '25.0', '6.0'],
    ]);
    // 10,000 gal from 150 to 250: 12.5 lb, 3 lb first; 30,000 gal: 37.5 lb, 9 lb first
    expect(byPath('/how-much-calcium-chloride-for-a-10000-gallon-pool').rows[2]?.cells).toEqual([
      '150 ppm',
      '12.5',
      '3.0',
    ]);
    expect(byPath('/how-much-calcium-chloride-for-a-30000-gallon-pool').rows[2]?.cells).toEqual([
      '150 ppm',
      '37.5',
      '9.0',
    ]);
    expect(page.lead).toMatch(/12 hours/);
  });

  // the label: over 3 lb per 10,000 gallons, separate doses at least 12 hours apart
  it('splits every calcium dose over 3 lb per 10,000 gallons, as the label and the calculator do', () => {
    const calcium = JOB_PAGES.filter(({ calculator }) => calculator.path === CALCIUM.path);
    expect(calcium.map(({ gallons }) => gallons)).toEqual([10_000, 15_000, 20_000, 25_000, 30_000]);
    for (const { gallons, rows } of calcium)
      for (const { raw, cells } of rows) {
        const ran = poolCalcium.run(raw);
        if (!ran.ok) throw new Error('a calcium row must run');
        const raise = Number(raw['target']) - Number(raw['current']);
        const split = (gallons * raise) / 80_000 > (gallons * 3) / 10_000;
        expect(ran.value.warnings.map(({ code }) => code)).toEqual(split ? ['splitDose'] : []);
        if (split) expect(cells[2]).toBe(((gallons * 3) / 10_000).toFixed(1));
        else expect(cells[2]).toBe(cells[1]);
      }
  });

  // worked by hand: 3.785411784 L a gallon × 30 mg of CYA = 113.56 g per 1,000 gallons; 5,000 gal is
  // 567.8 g = 1.25 lb, 35,000 gal 3.975 kg = 8.76 lb, 40,000 gal 4.542 kg = 10.01 lb; baking soda
  // at 10 ppm × 1.6788 mg: 5,000 gal 0.70 lb, 35,000 gal 4.90 lb, 40,000 gal 5.61 lb
  it('works out stabilizer and baking soda for 5,000, 35,000 and 40,000 gallons as by hand', () => {
    expect(byPath('/how-much-stabilizer-for-a-5000-gallon-pool').figure.value).toBe('1.3');
    expect(byPath('/how-much-stabilizer-for-a-35000-gallon-pool').figure.value).toBe('8.8');
    expect(byPath('/how-much-stabilizer-for-a-40000-gallon-pool').figure.value).toBe('10.0');
    expect(byPath('/how-much-baking-soda-for-a-5000-gallon-pool').figure.value).toBe('0.7');
    expect(byPath('/how-much-baking-soda-for-a-35000-gallon-pool').figure.value).toBe('4.9');
    expect(byPath('/how-much-baking-soda-for-a-40000-gallon-pool').figure.value).toBe('5.6');
    for (const path of [ALKALINITY.path, STABILIZER.path])
      expect(
        JOB_PAGES.filter(({ calculator }) => calculator.path === path).map(
          ({ gallons }) => gallons,
        ),
      ).toEqual([5000, 10_000, 15_000, 20_000, 25_000, 30_000, 35_000, 40_000]);
  });

  it('links each page to its nearest neighbors of the same calculator, by pool size', () => {
    for (const page of JOB_PAGES) {
      const links = neighborsOf(page);
      const family = JOB_PAGES.filter(
        ({ calculator, guide }) =>
          calculator.path === page.calculator.path && guide?.href === page.guide?.href,
      );
      expect(links.length).toBe(Math.min(NEIGHBORS, family.length - 1));
      for (const { href, label } of links) {
        expect(href).not.toBe(page.path);
        const linked = byPath(href);
        expect(linked.calculator.path).toBe(page.calculator.path);
        expect(linked.guide?.href).toBe(page.guide?.href);
        expect(label).toBe(linked.h1);
      }
    }
    expect(
      neighborsOf(byPath('/how-much-stabilizer-for-a-20000-gallon-pool')).map(({ href }) => href),
    ).toEqual([
      '/how-much-stabilizer-for-a-10000-gallon-pool',
      '/how-much-stabilizer-for-a-15000-gallon-pool',
      '/how-much-stabilizer-for-a-25000-gallon-pool',
      '/how-much-stabilizer-for-a-30000-gallon-pool',
    ]);
    expect(
      neighborsOf(byPath('/how-long-to-fill-a-10000-gallon-pool')).map(({ href }) => href),
    ).toEqual([
      '/how-long-to-fill-a-15000-gallon-pool',
      '/how-long-to-fill-a-20000-gallon-pool',
      '/how-long-to-fill-a-25000-gallon-pool',
      '/how-long-to-fill-a-30000-gallon-pool',
    ]);
    // the 30 ft round (21,151 gal) sits between the 15 x 30 (19,356) and the 16 x 32 (22,023),
    // then the 16 x 36 (24,775)
    expect(neighborsOf(byPath('/30-ft-round-pool-gallons')).map(({ href }) => href)).toEqual([
      '/27-ft-round-pool-gallons',
      '/15x30-pool-gallons',
      '/16x32-pool-gallons',
      '/16x36-pool-gallons',
    ]);
    // 3,384 gal, then the 15 ft round (5,288), the 10 x 20 (5,984), the 12 x 24 oval (6,768) and
    // the 18 ft round (7,614)
    expect(neighborsOf(byPath('/12-ft-round-pool-gallons')).map(({ href }) => href)).toEqual([
      '/15-ft-round-pool-gallons',
      '/10x20-pool-gallons',
      '/12x24-oval-pool-gallons',
      '/18-ft-round-pool-gallons',
    ]);
    expect(
      neighborsOf(byPath('/how-much-muriatic-acid-for-a-20000-gallon-pool')).map(
        ({ href }) => href,
      ),
    ).toEqual([
      '/how-much-muriatic-acid-for-a-10000-gallon-pool',
      '/how-much-muriatic-acid-for-a-15000-gallon-pool',
      '/how-much-muriatic-acid-for-a-25000-gallon-pool',
      '/how-much-muriatic-acid-for-a-30000-gallon-pool',
    ]);
  });

  it('is linked from the calculator it works with, and from no other', () => {
    for (const path of [
      VOLUME_TEXTS.path,
      SALT.path,
      CHLORINE.path,
      ALKALINITY.path,
      STABILIZER.path,
      HEATER.path,
      FILL_TIME.path,
      PH.path,
      CALCIUM.path,
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
      '/how-much-chlorine-for-a-5000-gallon-pool',
      '/how-much-chlorine-for-a-10000-gallon-pool',
      '/how-much-chlorine-for-a-15000-gallon-pool',
      '/how-much-chlorine-for-a-20000-gallon-pool',
      '/how-much-chlorine-for-a-25000-gallon-pool',
      '/how-much-chlorine-for-a-30000-gallon-pool',
      ...SHOCK_PATHS,
    ]);
    expect(jobLinksOf(PH.path).map(({ href }) => href)).toEqual([
      '/how-much-muriatic-acid-for-a-10000-gallon-pool',
      '/how-much-muriatic-acid-for-a-15000-gallon-pool',
      '/how-much-muriatic-acid-for-a-20000-gallon-pool',
      '/how-much-muriatic-acid-for-a-25000-gallon-pool',
      '/how-much-muriatic-acid-for-a-30000-gallon-pool',
    ]);
    expect(jobLinksOf(HEATER.path).map(({ href }) => href)).toEqual([
      '/what-size-pool-heater-for-a-10000-gallon-pool',
      '/what-size-pool-heater-for-a-15000-gallon-pool',
      '/what-size-pool-heater-for-a-20000-gallon-pool',
      '/what-size-pool-heater-for-a-25000-gallon-pool',
      '/what-size-pool-heater-for-a-30000-gallon-pool',
    ]);
    expect(jobLinksOf(FILL_TIME.path)).toContainEqual({
      href: '/how-long-to-fill-a-25000-gallon-pool',
      label: 'How long to fill a 25,000 gallon pool',
    });
    expect(jobLinksOf(CALCIUM.path).map(({ href }) => href)).toEqual([
      '/how-much-calcium-chloride-for-a-10000-gallon-pool',
      '/how-much-calcium-chloride-for-a-15000-gallon-pool',
      '/how-much-calcium-chloride-for-a-20000-gallon-pool',
      '/how-much-calcium-chloride-for-a-25000-gallon-pool',
      '/how-much-calcium-chloride-for-a-30000-gallon-pool',
    ]);
    expect(jobLinksOf(PUMP.path)).toEqual([]);
  });
});

describe('the shock job pages', () => {
  const shock = JOB_PAGES.filter(({ path }) => path.startsWith('/how-much-shock-'));

  it('works out 5,000 to 40,000 gallons, each linked from the shock guide and linking it back', () => {
    expect(shock.map(({ path }) => path)).toEqual(SHOCK_PATHS);
    expect(shock.map(({ gallons }) => gallons)).toEqual(SHOCK_SIZES);
    for (const page of shock) {
      expect(page.calculator.path).toBe(CHLORINE.path);
      expect(page.guide).toEqual({ href: SHOCK_GUIDE.path, label: SHOCK_GUIDE.card.title });
    }
    expect(guideJobLinksOf(SHOCK_GUIDE.path)).toEqual(
      shock.map(({ path, h1 }) => ({ href: path, label: h1 })),
    );
    for (const { path } of GUIDES.filter(({ path }) => path !== SHOCK_GUIDE.path))
      expect(guideJobLinksOf(path)).toEqual([]);
  });

  // the shock guide's levels: 65% cal-hypo to 5 and 10 ppm, 56% dichlor to 8.7 ppm, from 0 ppm
  it('doses the labels the shock guide reads, to the levels they give, from 0 ppm', () => {
    for (const { rows } of shock)
      expect(
        rows.map(({ raw, cells }) => [raw['product'], raw['current'], raw['target'], cells[0]]),
      ).toEqual([
        ['cal-hypo-65', '0', '5', 'Cal-hypo 65%, 0 to 5 ppm'],
        ['cal-hypo-65', '0', '10', 'Cal-hypo 65%, 0 to 10 ppm'],
        ['dichlor-56', '0', '8.7', 'Dichlor 56%, 0 to 8.7 ppm'],
      ]);
  });

  // worked by hand: 20,000 gal × 3.785411784 L × 10 ppm ÷ 1,000 = 757.08 g of chlorine, ÷ 0.65 =
  // 1,164.74 g of cal-hypo, ÷ 28.3495 g = 41.09 oz (2.57 lb); 5 ppm is half, 20.54 oz (1.28 lb);
  // 8.7 ppm of 56% dichlor is 658.66 g ÷ 0.56 = 1,176.18 g = 41.49 oz (2.59 lb)
  it('works out 20,000 gallons as by hand', () => {
    const page = byPath('/how-much-shock-for-a-20000-gallon-pool');
    expect(page.figure).toMatchObject({ value: '41.1', unit: 'OZ BY WEIGHT' });
    expect(page.rows.map(({ cells }) => cells)).toEqual([
      ['Cal-hypo 65%, 0 to 5 ppm', '20.5', '1.28'],
      ['Cal-hypo 65%, 0 to 10 ppm', '41.1', '2.57'],
      ['Dichlor 56%, 0 to 8.7 ppm', '41.5', '2.59'],
    ]);
    // 10,000 gal: the guide's own 10.3 and 20.5 oz of cal-hypo, the label's 10 to 20 oz
    expect(
      byPath('/how-much-shock-for-a-10000-gallon-pool').rows.map(({ cells }) => cells[1]),
    ).toEqual(['10.3', '20.5', '20.7']);
  });

  // a search result answers the question, and names its gallons in title and description
  it('names its gallons in its title and description, and the label levels, never a rule of thumb', () => {
    const page = byPath('/how-much-shock-for-a-15000-gallon-pool');
    expect(page.title).toBe('How Much Shock for a 15,000 Gallon Pool? | Pool Figures');
    expect(page.h1).toBe('How much shock for a 15,000 gallon pool');
    expect(page.description).toContain('15,000 gallon pool');
    for (const { title, description, lead, method, figure } of shock) {
      expect(title.length).toBeLessThanOrEqual(65);
      expect(description.length).toBeLessThanOrEqual(160);
      expect(`${description} ${lead} ${method} ${figure.caption}`).not.toMatch(
        /breakpoint|combined chlorine|10 ?(x|×|times)/i,
      );
      expect(lead).toContain('5 to 10 ppm');
      expect(method).toContain('above 4 ppm');
      expect(method).toContain('above 3 ppm');
    }
  });

  it('links its nearest shock sizes, never the chlorine pages of the same calculator', () => {
    expect(
      neighborsOf(byPath('/how-much-shock-for-a-20000-gallon-pool')).map(({ href }) => href),
    ).toEqual([
      '/how-much-shock-for-a-15000-gallon-pool',
      '/how-much-shock-for-a-18000-gallon-pool',
      '/how-much-shock-for-a-25000-gallon-pool',
      '/how-much-shock-for-a-30000-gallon-pool',
    ]);
    expect(
      neighborsOf(byPath('/how-much-chlorine-for-a-20000-gallon-pool')).map(({ href }) => href),
    ).toEqual([
      '/how-much-chlorine-for-a-10000-gallon-pool',
      '/how-much-chlorine-for-a-15000-gallon-pool',
      '/how-much-chlorine-for-a-25000-gallon-pool',
      '/how-much-chlorine-for-a-30000-gallon-pool',
    ]);
  });
});
