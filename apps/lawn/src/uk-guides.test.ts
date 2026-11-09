import { describe, expect, it } from 'vitest';
import { calculatorAt } from './calculators.ts';
import { BEST_SEED_GUIDE, GUIDES, guideAt, PLANTING_GUIDE } from './guide.ts';
import { routeOf } from './routes.ts';
import { fahrenheitText, GROWING_GUIDE, kilogramsText, ouncesText, UK_GUIDE } from './uk-guides.ts';

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

describe('the metric figures of the UK pages', () => {
  it('writes a Celsius figure in Fahrenheit, to the degree', () => {
    // 8 x 9/5 + 32 = 46.4; 10 -> 50; 25 -> 77; 12 -> 53.6
    expect(fahrenheitText(8)).toBe('46°F');
    expect(fahrenheitText(10)).toBe('50°F');
    expect(fahrenheitText(25)).toBe('77°F');
    expect(fahrenheitText(12)).toBe('54°F');
  });

  it('writes a rate in g/m² in ounces per square yard, to one decimal', () => {
    // 35 g x 0.83612736 m² per sq yd / 28.349523125 g per oz = 1.03 oz
    expect(ouncesText(35)).toBe('1.0 oz');
    expect(ouncesText(50)).toBe('1.5 oz');
    expect(ouncesText(25)).toBe('0.7 oz');
  });

  it('works the kilograms of seed for a lawn, with the pounds', () => {
    // 35 to 50 g/m² x 50 m² = 1,750 to 2,500 g = 3.9 to 5.5 lb
    expect(kilogramsText(35, 50, 50)).toBe('1.75 to 2.5 kg (3.9 to 5.5 lb)');
    // 25 g/m² x 50 m² = 1.25 kg = 2.8 lb
    expect(kilogramsText(25, 25, 50)).toBe('1.25 kg (2.8 lb)');
  });
});

describe('when to sow grass seed in the UK', () => {
  it('is published at its own address and answers first: autumn or spring, with the soil temperature', () => {
    expect(UK_GUIDE.path).toBe('/when-to-sow-grass-seed-uk');
    expect(GUIDES).toContain(UK_GUIDE);
    expect(UK_GUIDE.lead).toMatch(/September/);
    expect(UK_GUIDE.lead).toMatch(/March/);
    expect(UK_GUIDE.lead).toMatch(/8–10°C \(46–50°F\)/);
  });

  it('gives the sowing rates in g/m², imperial in parentheses, for a new lawn, overseeding and repairs', () => {
    const text = textOf(UK_GUIDE.path);
    expect(text).toContain('35–50 g/m²');
    expect(text).toContain('25 g/m²');
    expect(text).toContain('15–25 g/m²');
    expect(text).toMatch(/g\/m² \([\d.]+ (to [\d.]+ )?oz per sq yd\)/);
  });

  it('gives the germination days of the grasses of UK mixes and the Met Office months', () => {
    const text = textOf(UK_GUIDE.path);
    for (const grass of ['perennial ryegrass', 'fescue', 'bent', 'smooth-stalked meadow-grass'])
      expect(text.toLowerCase(), grass).toContain(grass);
    expect(text).toMatch(/Met Office/);
    expect(UK_GUIDE.sources['metOffice']?.url).toMatch(/^https:\/\/www\.metoffice\.gov\.uk\//);
    expect(UK_GUIDE.sources['rhs']?.url).toMatch(/^https:\/\/www\.rhs\.org\.uk\//);
  });

  it('prints the rate the calculator gives in metric, from its data', () => {
    expect(textOf(UK_GUIDE.path)).toContain('14.6–24.4 g/m²');
  });
});

describe('how long grass seed takes to grow', () => {
  it('is published at its own address and answers first in days and weeks', () => {
    expect(GROWING_GUIDE.path).toBe('/how-long-does-grass-seed-take-to-grow');
    expect(GUIDES).toContain(GROWING_GUIDE);
    expect(GROWING_GUIDE.lead).toMatch(/3 to 7 days/);
    expect(GROWING_GUIDE.lead).toMatch(/weeks/);
  });

  it('covers germination by species and soil temperature, and the first mow, in the US and the UK', () => {
    const text = textOf(GROWING_GUIDE.path);
    for (const grass of ['Kentucky bluegrass', 'tall fescue', 'perennial ryegrass', 'bermudagrass'])
      expect(text, grass).toContain(grass);
    expect(text).toMatch(/soil/);
    expect(text).toMatch(/50 to 70°F/);
    expect(text).toMatch(/5–7.5 cm \(2–3 in\)/);
    expect(Object.keys(GROWING_GUIDE.sources)).toEqual(
      expect.arrayContaining(['tennessee', 'maryland', 'rhs', 'johnsons']),
    );
  });
});

describe('the links of the two guides', () => {
  it('are linked from the planting guide, the seed hub and the grass seed calculator, and link back', () => {
    for (const guide of [UK_GUIDE, GROWING_GUIDE]) {
      expect(hrefsOf(PLANTING_GUIDE.path), guide.path).toContain(guide.path);
      expect(hrefsOf(BEST_SEED_GUIDE.path), guide.path).toContain(guide.path);
      expect(calculatorAt('/grass-seed-calculator').guides).toContain(guide.id);
      expect(hrefsOf(guide.path)).toContain('/grass-seed-calculator');
      expect(hrefsOf(guide.path)).toContain('/when-to-plant-grass-seed');
    }
    expect(hrefsOf(UK_GUIDE.path)).toContain(GROWING_GUIDE.path);
    expect(hrefsOf(GROWING_GUIDE.path)).toContain(UK_GUIDE.path);
  });

  it('link only pages that exist, and date every source with the day it was read', () => {
    for (const guide of [UK_GUIDE, GROWING_GUIDE]) {
      for (const href of hrefsOf(guide.path)) expect(routeOf(href), href).toBeDefined();
      for (const { name, url } of Object.values(guide.sources)) {
        expect(name, guide.path).toMatch(/accessed \d{4}-\d{2}-\d{2}/);
        expect(url).toMatch(/^https:\/\//);
      }
    }
  });
});
