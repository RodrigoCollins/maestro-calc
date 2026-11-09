import { Rational } from '@maestro-calc/core';
import { SEED_SPECIES } from '@maestro-calc/lawn-core/grass-seed';
import { describe, expect, it } from 'vitest';
import { calculatorAt } from './calculators.ts';
import {
  BEST_SEED_GUIDE,
  citedRateText,
  GRASS_GUIDES,
  GUIDES,
  guideAt,
  lawnPoundsText,
  plugsText,
  seedPoundsText,
  SPECIES_GUIDES,
} from './guide.ts';
import { routeOf } from './routes.ts';
import { viewOf } from './view.ts';

/** Every word a guide shows: its lead, sections, items and answers. */
const textOf = (path: string): string => {
  const guide = guideAt(path);
  return [
    guide.lead,
    ...guide.sections.flatMap(({ paragraphs, items = [] }) => [...paragraphs, ...items]),
    ...guide.questions.flatMap(({ question, answer }) => [question, answer]),
  ].join(' ');
};

const hrefsOf = (path: string): string[] =>
  guideAt(path).sections.flatMap(({ links = [] }) => links.map(({ href }) => href));

describe('figures the grass pages compute', () => {
  it('runs the seed calculator for a lawn: the pounds at each end of the rate', () => {
    // 2 to 3 lb × 5 = 10 to 15 lb; 1.5 to 2 lb × 5 = 7.5 to 10 lb
    expect(seedPoundsText('kentucky-bluegrass', 'virginia-tech', 5000)).toBe('10.0 to 15.0 lb');
    expect(seedPoundsText('kentucky-bluegrass', 'tennessee', 5000)).toBe('7.5 to 10.0 lb');
    // 3 to 5 lb × 5 = 15 to 25 lb
    expect(seedPoundsText('fine-fescue', 'tennessee', 5000)).toBe('15.0 to 25.0 lb');
    expect(viewOf('grass-seed', { area: '5000', species: 'fine-fescue' })?.values['pounds']).toBe(
      '15.0–25.0',
    );
  });

  it('writes a rate a source prints and the pounds it gives a lawn, for grasses the calculator leaves out', () => {
    const centipede = { low: Rational.of(1, 4), high: Rational.of(1, 2) };
    expect(citedRateText(centipede)).toBe('0.25 to 0.5 lb per 1,000 sq ft');
    // 0.25 × 5 = 1.25, 0.5 × 5 = 2.5
    expect(lawnPoundsText(centipede, 5000)).toBe('1.25 to 2.5 lb');
    expect(lawnPoundsText({ low: Rational.of(3), high: Rational.of(5) }, 5000)).toBe('15 to 25 lb');
  });

  it('counts the plugs of a lawn at a spacing in feet', () => {
    // 12-inch centers: one plug per square foot; 2-foot centers: one per 4 sq ft
    expect(plugsText(5000, Rational.of(1))).toBe('5,000 plugs');
    expect(plugsText(5000, Rational.of(2))).toBe('1,250 plugs');
  });
});

describe('Kentucky bluegrass and fescue seed', () => {
  it('are species pages of the calculator data', () => {
    const paths = SPECIES_GUIDES.map(({ path }) => path);
    expect(paths).toContain('/kentucky-bluegrass-seed');
    expect(paths).toContain('/fescue-grass-seed');
    const species = SPECIES_GUIDES.flatMap((guide) => guide.species);
    for (const one of SEED_SPECIES) expect(species).toContain(one);
  });

  it('prints the pounds the calculator gives a 5,000 sq ft lawn', () => {
    expect(textOf('/kentucky-bluegrass-seed')).toContain('10.0 to 15.0 lb');
    expect(textOf('/kentucky-bluegrass-seed')).toContain('7.5 to 10.0 lb');
    expect(textOf('/fescue-grass-seed')).toContain('15.0 to 25.0 lb');
    expect(textOf('/fescue-grass-seed')).toContain('20.0 to 30.0 lb');
  });

  it('tells fine fescue from tall fescue and links the tall fescue page', () => {
    const text = textOf('/fescue-grass-seed');
    for (const name of ['creeping red', 'Chewings', 'hard', 'sheep', 'tall fescue'])
      expect(text).toContain(name);
    expect(text).toMatch(/shade/);
    expect(hrefsOf('/fescue-grass-seed')).toContain('/tall-fescue-grass-seed');
  });

  it('gives the bluegrass mixtures with their own rates', () => {
    expect(textOf('/kentucky-bluegrass-seed')).toMatch(/perennial ryegrass/);
    expect(textOf('/kentucky-bluegrass-seed')).toMatch(/14 to 21 days/);
  });
});

describe('centipede, buffalo and St. Augustine', () => {
  it('are published at their own addresses, outside the calculator species', () => {
    expect(GRASS_GUIDES.map(({ path }) => path)).toEqual([
      '/centipede-grass-seed',
      '/buffalo-grass-seed',
      '/st-augustine-grass-seed',
    ]);
    for (const guide of GRASS_GUIDES) expect(GUIDES).toContain(guide);
  });

  it('prints the cited centipede rate and what it gives a 5,000 sq ft lawn', () => {
    const text = textOf('/centipede-grass-seed');
    expect(text).toContain('0.25 to 0.5 lb per 1,000 sq ft');
    expect(text).toContain('1.25 to 2.5 lb');
    expect(text).toMatch(/28 days/);
    expect(text).toMatch(/not in the grass seed calculator/);
  });

  it('prints both buffalograss rates, burs and seed, and what each gives a 5,000 sq ft lawn', () => {
    const text = textOf('/buffalo-grass-seed');
    expect(text).toContain('1 to 2 lb per 1,000 sq ft');
    expect(text).toContain('5 to 10 lb');
    expect(text).toContain('3 to 5 lb per 1,000 sq ft');
    expect(text).toContain('15 to 25 lb');
    expect(text).toMatch(/60°F/);
  });

  it('says plainly that St. Augustine seed is not available, and counts sod and plugs instead', () => {
    const guide = guideAt('/st-augustine-grass-seed');
    expect(guide.lead).toMatch(/not available/);
    const text = textOf(guide.path);
    expect(text).toContain('5,000 plugs');
    expect(text).toContain('1,250 plugs');
    expect(text).toContain('150 sq ft of sod');
    // 5,000 sq ft in pallets of 450 sq ft: 11.1, rounded up to 12 (the sod calculator)
    expect(text).toContain('12 pallets');
    expect(guide.calculators).toEqual(['/sod-calculator']);
    expect(calculatorAt('/sod-calculator').guides).toContain(guide.id);
    expect(hrefsOf(guide.path)).toContain('/sod-calculator');
  });
});

describe('best grass seed', () => {
  it('is published at its own address and answers by region first', () => {
    expect(BEST_SEED_GUIDE.path).toBe('/best-grass-seed');
    expect(GUIDES).toContain(BEST_SEED_GUIDE);
    for (const region of [/North/, /transition zone/, /South/, /Great Plains/])
      expect(BEST_SEED_GUIDE.lead).toMatch(region);
  });

  it('links every grass page, the planting guide and the seed calculator', () => {
    const hrefs = hrefsOf(BEST_SEED_GUIDE.path);
    for (const guide of [...SPECIES_GUIDES, ...GRASS_GUIDES]) expect(hrefs).toContain(guide.path);
    expect(hrefs).toContain('/when-to-plant-grass-seed');
    expect(hrefs).toContain('/grass-seed-calculator');
    expect(calculatorAt('/grass-seed-calculator').guides).toContain(BEST_SEED_GUIDE.id);
  });

  it('compares every calculator grass by the pounds the calculator gives a 5,000 sq ft lawn', () => {
    const text = textOf(BEST_SEED_GUIDE.path);
    for (const species of SEED_SPECIES)
      expect(text, species).toContain(seedPoundsText(species, 'virginia-tech', 5000));
    expect(text).toContain('1.25 to 2.5 lb');
  });

  it('works the pure live seed of a label: 85% germination × 98% purity', () => {
    expect(textOf(BEST_SEED_GUIDE.path)).toMatch(/83%/);
  });
});

describe('the new grass pages', () => {
  const paths = [
    '/kentucky-bluegrass-seed',
    '/fescue-grass-seed',
    ...GRASS_GUIDES.map(({ path }) => path),
    BEST_SEED_GUIDE.path,
  ];

  it('are routed and link the best grass seed page or every grass page', () => {
    for (const path of paths) {
      expect(routeOf(path), path).toBeDefined();
      if (path !== BEST_SEED_GUIDE.path) expect(hrefsOf(path), path).toContain('/best-grass-seed');
    }
  });

  it('each say something the others do not: a lead and an h1 of their own', () => {
    const guides = paths.map(guideAt);
    expect(new Set(guides.map(({ lead }) => lead)).size).toBe(guides.length);
    expect(new Set(guides.map(({ h1 }) => h1)).size).toBe(guides.length);
    for (const guide of guides) expect(guide.sections.length, guide.path).toBeGreaterThanOrEqual(4);
  });

  it('date every source with the day it was read', () => {
    for (const path of paths) {
      for (const { name, url } of Object.values(guideAt(path).sources)) {
        expect(name, path).toMatch(/accessed \d{4}-\d{2}-\d{2}/);
        expect(url, path).toMatch(/^https:\/\//);
      }
    }
  });
});
