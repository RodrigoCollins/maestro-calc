import { SEED_SOURCES, SEED_SPECIES } from '@maestro-calc/lawn-core/grass-seed';
import { describe, expect, it } from 'vitest';
import { calculatorAt } from './calculators.ts';
import { GUIDES, guideAt, PLANTING_GUIDE, seedRateText, SPECIES_GUIDES } from './guide.ts';
import { routeOf } from './routes.ts';

/** Every word a guide shows: its lead, sections, items and answers. */
const textOf = (path: string): string => {
  const guide = guideAt(path);
  return [
    guide.lead,
    ...guide.sections.flatMap(({ paragraphs, items = [] }) => [...paragraphs, ...items]),
    ...guide.questions.flatMap(({ question, answer }) => [question, answer]),
  ].join(' ');
};

describe('seed rate text', () => {
  it('writes a rate of the calculator data as the page prints it', () => {
    expect(seedRateText('tall-fescue', 'virginia-tech')).toBe('4 to 6 lb per 1,000 sq ft');
    expect(seedRateText('bermudagrass-hulled', 'tennessee')).toBe('0.5 to 1 lb per 1,000 sq ft');
    expect(seedRateText('bermudagrass-hulled', 'virginia-tech')).toBe(
      '1 to 1.5 lb per 1,000 sq ft',
    );
    expect(seedRateText('zoysiagrass', 'tennessee')).toBe('1 to 2 lb per 1,000 sq ft');
  });
});

describe('when to plant grass seed', () => {
  it('is published at its own address and answers first: cool-season late summer, warm-season late spring', () => {
    expect(PLANTING_GUIDE.path).toBe('/when-to-plant-grass-seed');
    expect(GUIDES).toContain(PLANTING_GUIDE);
    expect(PLANTING_GUIDE.lead).toMatch(/late summer/);
    expect(PLANTING_GUIDE.lead).toMatch(/late spring/);
    expect(textOf(PLANTING_GUIDE.path)).toMatch(/soil temperature/i);
  });

  it('links the frost index with its ZIP lookup, state frost pages and the seed calculator', () => {
    const hrefs = PLANTING_GUIDE.sections.flatMap(({ links = [] }) =>
      links.map(({ href }) => href),
    );
    expect(hrefs).toContain('/frost-dates');
    expect(hrefs).toContain('/grass-seed-calculator');
    expect(hrefs.filter((href) => href.startsWith('/frost-dates/')).length).toBeGreaterThanOrEqual(
      3,
    );
  });
});

describe('grass seed by species', () => {
  it('has a page only for species with a seeding rate in the calculator data', () => {
    expect(SPECIES_GUIDES.length).toBeGreaterThanOrEqual(4);
    for (const guide of SPECIES_GUIDES) {
      expect(GUIDES).toContain(guide);
      expect(guide.species.length).toBeGreaterThan(0);
      for (const species of guide.species) expect(SEED_SPECIES).toContain(species);
    }
  });

  it('prints every rate of its species from the data, never a rate of its own', () => {
    for (const guide of SPECIES_GUIDES) {
      const text = textOf(guide.path);
      for (const species of guide.species) {
        const sources = species === 'zoysiagrass' ? (['tennessee'] as const) : SEED_SOURCES;
        for (const source of sources) {
          expect(text, `${guide.path} ${species} ${source}`).toContain(
            seedRateText(species, source),
          );
        }
      }
    }
  });

  it('is linked from the grass seed calculator', () => {
    for (const guide of SPECIES_GUIDES) {
      expect(guide.calculators).toContain('/grass-seed-calculator');
      expect(calculatorAt('/grass-seed-calculator').guides).toContain(guide.id);
    }
  });
});

describe('guide links and sources', () => {
  it('links only pages that exist', () => {
    for (const guide of GUIDES) {
      for (const { links = [] } of guide.sections) {
        for (const { href, label } of links) {
          expect(routeOf(href), `${guide.path} → ${href}`).toBeDefined();
          expect(label.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('dates every source of the seed guides with the day it was read', () => {
    for (const guide of [PLANTING_GUIDE, ...SPECIES_GUIDES]) {
      for (const { name } of Object.values(guide.sources)) {
        expect(name, guide.path).toMatch(/accessed \d{4}-\d{2}-\d{2}/);
      }
    }
  });
});
