import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { calculatorAt } from './calculators.ts';
import {
  ARTIFICIAL_COST,
  COST_GUIDES,
  COST_HUB,
  LAWN_SIZES,
  mowingVisitOf,
  MOWING_COST,
  SOD_COST,
  usd,
} from './costs.ts';
import { ALL_GUIDES, GUIDES, guideAt, type Guide } from './guide.ts';
import { routeOf } from './routes.ts';

const pages = readdirSync(fileURLToPath(new URL('pages/', import.meta.url)))
  .filter((name) => name.endsWith('.astro'))
  .map((name) => `/${name.replace(/\.astro$/, '')}`);

/** Every word a cost guide shows: its lead, its sections, its tables and its answers. */
const textOf = (guide: Guide): string =>
  [
    guide.lead,
    ...guide.sections.flatMap(({ paragraphs, items = [], table }) => [
      ...paragraphs,
      ...items,
      ...(table === undefined ? [] : [table.caption, ...table.head, ...table.rows.flat()]),
    ]),
    ...guide.questions.flatMap(({ question, answer }) => [question, answer]),
  ].join(' ');

const hrefsOf = (guide: Guide): string[] =>
  guide.sections.flatMap(({ links = [] }) => links.map(({ href }) => href));

/** The rows of the table of the section `id`. */
const rowsOf = (guide: Guide, id: string): readonly (readonly string[])[] => {
  const table = guide.sections.find((section) => section.id === id)?.table;
  if (table === undefined) throw new Error(`${guide.path} has no table ${id}`);
  return table.rows;
};

describe('the lawn sizes the cost tables run', () => {
  it('are three common areas, then the eighth, quarter, half and whole acre of 43,560 sq ft', () => {
    expect(LAWN_SIZES).toEqual([
      { label: '1,000 sq ft', area: 1000 },
      { label: '2,500 sq ft', area: 2500 },
      { label: '5,000 sq ft', area: 5000 },
      { label: '1/8 acre (5,445 sq ft)', area: 5445 },
      { label: '1/4 acre (10,890 sq ft)', area: 10_890 },
      { label: '1/2 acre (21,780 sq ft)', area: 21_780 },
      { label: '1 acre (43,560 sq ft)', area: 43_560 },
    ]);
  });
});

describe('a dollar figure', () => {
  it('is rounded to the dollar and grouped', () => {
    expect(usd(3267)).toBe('$3,267');
    expect(usd(17_968.5)).toBe('$17,969');
    expect(usd(54.45)).toBe('$54');
  });
});

describe('the price of one mowing by lawn size', () => {
  it('reads the LawnStarter bracket the lawn falls in, a quarter acre still in the first', () => {
    expect(mowingVisitOf(1000)).toEqual([41, 61]);
    expect(mowingVisitOf(10_890)).toEqual([41, 61]);
    expect(mowingVisitOf(10_891)).toEqual([49, 69]);
    expect(mowingVisitOf(21_780)).toEqual([49, 69]);
    expect(mowingVisitOf(21_781)).toEqual([59, 114]);
    expect(mowingVisitOf(43_560)).toEqual([59, 114]);
    expect(() => mowingVisitOf(43_561)).toThrow('no mowing bracket');
  });
});

describe.each(COST_GUIDES.map((guide) => [guide.path, guide] as const))(
  'the cost guide %s',
  (_path, guide) => {
    it('lives at its own page and route, as an article, and is no footer guide', () => {
      expect(pages).toContain(guide.path);
      expect(routeOf(guide.path)?.kind).toBe('article');
      expect(routeOf(guide.path)?.id).toBe(guide.id);
      expect(ALL_GUIDES).toContain(guide);
      expect(GUIDES).not.toContain(guide);
      expect(guideAt(guide.path)).toBe(guide);
    });

    it('asks the question searched in its h1 and answers it with a price in the lead', () => {
      expect(guide.h1).toMatch(/^How much does .+ cost\?$/);
      expect(guide.lead.split('. ')[0]).toMatch(/\$\d/);
      expect(guide.checked).toBe('2026-11-10');
      expect(guide.card.title.length).toBeLessThanOrEqual(40);
      expect(guide.card.summary.length).toBeLessThanOrEqual(100);
    });

    it('works its prices out on a table, in five sections or more, with questions', () => {
      expect(guide.sections.length).toBeGreaterThanOrEqual(5);
      expect(guide.sections.some(({ table }) => table !== undefined)).toBe(true);
      expect(guide.questions.length).toBeGreaterThanOrEqual(3);
      for (const { table } of guide.sections) {
        if (table === undefined) continue;
        for (const row of table.rows) expect(row, table.caption).toHaveLength(table.head.length);
      }
    });

    it('dates every source and the day it was read', () => {
      for (const { name, url } of Object.values(guide.sources)) {
        expect(name, name).toMatch(/\d{4}/);
        expect(name, name).toContain('accessed 2026-11-10');
        expect(url).toMatch(/^https:\/\//);
      }
    });

    it('links pages that exist: the hub, a calculator and the frost dates or a zone', () => {
      const hrefs = hrefsOf(guide);
      for (const href of hrefs) expect(routeOf(href), href).toBeDefined();
      if (guide !== COST_HUB) expect(hrefs).toContain(COST_HUB.path);
      expect(hrefs.some((href) => href.endsWith('-calculator'))).toBe(true);
      expect(
        hrefs.some((href) => href.startsWith('/frost-dates') || href.startsWith('/planting-zones')),
      ).toBe(true);
    });

    it('is linked back from every calculator it names', () => {
      for (const path of guide.calculators) expect(calculatorAt(path).guides).toContain(guide.id);
    });
  },
);

describe('the cost guides', () => {
  it('are the hub, then mowing, sod and artificial grass', () => {
    expect(COST_GUIDES.map(({ path }) => path)).toEqual([
      '/how-much-does-lawn-care-cost',
      '/lawn-mowing-cost',
      '/sod-cost',
      '/artificial-grass-cost',
    ]);
  });

  it('send the hub to each of the others', () => {
    for (const { path } of COST_GUIDES.slice(1)) expect(hrefsOf(COST_HUB), path).toContain(path);
  });

  it('give each its own lead and questions', () => {
    expect(new Set(COST_GUIDES.map(({ lead }) => lead)).size).toBe(COST_GUIDES.length);
    const questions = COST_GUIDES.flatMap(({ questions }) => questions.map((q) => q.question));
    expect(new Set(questions).size).toBe(questions.length);
  });
});

// Every price is the source's own, as read on 2026-11-10: a changed one must be checked again.
describe('the published prices', () => {
  it('gives the hub the service prices of LawnStarter and This Old House', () => {
    const text = textOf(COST_HUB);
    for (const price of [
      '$42–$68 per visit',
      '$100 to $410 per month',
      '$67–$405',
      '$107–$202',
      '$65–$165',
      '$107–$435',
      '$427–$1,514',
      '$2,028–$3,394',
      '$300',
      '$100 to $500',
      '$395',
      '$175',
      '$558 to $890',
      '$200 to $250',
      '8,712 square feet',
    ])
      expect(text, price).toContain(price);
  });

  it('gives the mowing prices of LawnStarter and Bob Vila', () => {
    const text = textOf(MOWING_COST);
    for (const price of [
      '$44 to $71 per visit',
      '$57',
      '$32 to $68 per hour',
      '$0.01 to $0.06 per square foot',
      '$41–$61',
      '$49–$69',
      '$59–$114',
      '$1,152–$1,800',
      '$1,980–$3,060',
      '$1,222–$1,742',
      '$1,886–$2,852',
      '$1,462–$2,346',
      '6 to 12 inches',
      '$325',
      '$48 to $206',
      '$150 to $200',
      '$25 to $60 per hour',
      '$1,500 to $5,000',
    ])
      expect(text, price).toContain(price);
  });

  it('gives the sod prices of LawnStarter, Bob Vila and The Grass Outlet', () => {
    const text = textOf(SOD_COST);
    for (const price of [
      '$0.60 per square foot',
      '$1.65 per square foot',
      '$150 to $450',
      '$4 to $7.50',
      '$0.55 to $1 per square foot',
      '$65 to $230',
      '15% to 20%',
      '$732 to $1,354',
      '$1,000 and $2,200',
      '$0.41–$0.86',
      '$0.98–$1.79',
      '$0.29–$0.43',
      '$205',
      '$315',
      '$0.15 to $0.60 per square foot',
      '$90 and $350',
    ])
      expect(text, price).toContain(price);
  });

  it('gives the artificial grass prices of LawnStarter, This Old House and Bob Vila', () => {
    const text = textOf(ARTIFICIAL_COST);
    for (const price of [
      '$15 to $19 per square foot',
      '$7,400 to $9,350',
      '$3.45 to $12 per square foot',
      '$2–$8 per square foot',
      '$4–$12 per square foot',
      '$250 to $350',
      '50% to 60%',
      '15% to 20%',
      '$0.88 to $1.84 per square foot',
      '$7.65',
      '$6.63',
      '$9.18',
      '15 to 20 years',
      '$2,961 to $7,792',
    ])
      expect(text, price).toContain(price);
  });
});

// Hand-worked from the published rates and the engines of the calculators.
describe('the figures worked out by lawn size', () => {
  it('prices a weekly mowing season of 24 and 46 weeks from the bracket of each size', () => {
    expect(rowsOf(MOWING_COST, 'sizes')).toEqual([
      // $41 x 24 = $984, $61 x 24 = $1,464; $41 x 46 = $1,886, $61 x 46 = $2,806
      ['1,000 sq ft', '$41 to $61', '$984 to $1,464', '$1,886 to $2,806'],
      ['2,500 sq ft', '$41 to $61', '$984 to $1,464', '$1,886 to $2,806'],
      ['5,000 sq ft', '$41 to $61', '$984 to $1,464', '$1,886 to $2,806'],
      ['1/8 acre (5,445 sq ft)', '$41 to $61', '$984 to $1,464', '$1,886 to $2,806'],
      ['1/4 acre (10,890 sq ft)', '$41 to $61', '$984 to $1,464', '$1,886 to $2,806'],
      // $49 x 24 = $1,176, $69 x 24 = $1,656; $49 x 46 = $2,254, $69 x 46 = $3,174
      ['1/2 acre (21,780 sq ft)', '$49 to $69', '$1,176 to $1,656', '$2,254 to $3,174'],
      // $59 x 24 = $1,416, $114 x 24 = $2,736; $59 x 46 = $2,714, $114 x 46 = $5,244
      ['1 acre (43,560 sq ft)', '$59 to $114', '$1,416 to $2,736', '$2,714 to $5,244'],
    ]);
  });

  it('counts the mowings a $325 mower pays for at the $57 average', () => {
    // 325 / 57 = 5.7, so the sixth mowing
    expect(textOf(MOWING_COST)).toContain('about 6 mowings');
  });

  it('counts the mowings of an acre a $1,500 rider pays for', () => {
    // 1,500 / 114 = 13.2 and 1,500 / 59 = 25.4, so the 14th and the 26th
    expect(textOf(MOWING_COST)).toContain('about 14 to 26 mowings');
  });

  it('counts the pallets of the sod calculator and prices the sod alone and installed', () => {
    expect(rowsOf(SOD_COST, 'sizes')).toEqual([
      // 1,000 / 450 = 2.2 -> 3; 1,000 x $0.60 = $600; 1,000 x $1.65 = $1,650
      ['1,000 sq ft', '3', '375', '$600', '$1,650'],
      // 2,500 / 450 = 5.6 -> 6; 2,500 / 2.67 = 937.5 -> 938
      ['2,500 sq ft', '6', '938', '$1,500', '$4,125'],
      ['5,000 sq ft', '12', '1,875', '$3,000', '$8,250'],
      // 5,445 / 450 = 12.1 -> 13; 5,445 x 3 / 8 = 2,041.9 -> 2,042; x $1.65 = $8,984.25
      ['1/8 acre (5,445 sq ft)', '13', '2,042', '$3,267', '$8,984'],
      // 10,890 / 450 = 24.2 -> 25; x 3 / 8 = 4,083.75 -> 4,084; x $1.65 = $17,968.50
      ['1/4 acre (10,890 sq ft)', '25', '4,084', '$6,534', '$17,969'],
      // 21,780 / 450 = 48.4 -> 49; x 3 / 8 = 8,167.5 -> 8,168
      ['1/2 acre (21,780 sq ft)', '49', '8,168', '$13,068', '$35,937'],
      // 43,560 / 450 = 96.8 -> 97; x 3 / 8 = 16,335
      ['1 acre (43,560 sq ft)', '97', '16,335', '$26,136', '$71,874'],
    ]);
  });

  it('prices each pallet of The Grass Outlet per square foot of its 450', () => {
    expect(rowsOf(SOD_COST, 'pallets')).toEqual([
      // 205 / 450 = 0.456; 320 / 450 = 0.711
      ['Raleigh St. Augustine', '$205', '$320', '$0.46'],
      ['Texas Native St. Augustine', '$230', 'Pre-order only', '$0.51'],
      ['Palmetto St. Augustine', '$240', 'Pre-order only', '$0.53'],
      ['419 Tifway Bermuda', '$220', '$270', '$0.49'],
      ['Celebration Bermuda', '$225', 'Pre-order only', '$0.50'],
      ['Palisades Zoysia', '$315', '$390', '$0.70'],
      ['Zeon Zoysia', '$325', 'Pre-order only', '$0.72'],
      ['Density Buffalo', '$315', 'Pre-order only', '$0.70'],
    ]);
  });

  it('prices artificial grass installed and its material alone by area', () => {
    expect(rowsOf(ARTIFICIAL_COST, 'sizes')).toEqual([
      // 250 x $15 = $3,750, x $19 = $4,750; 250 x $2 = $500, x $8 = $2,000
      ['250 sq ft', '$3,750 to $4,750', '$500 to $2,000'],
      ['500 sq ft', '$7,500 to $9,500', '$1,000 to $4,000'],
      ['1,000 sq ft', '$15,000 to $19,000', '$2,000 to $8,000'],
      ['2,500 sq ft', '$37,500 to $47,500', '$5,000 to $20,000'],
      ['5,000 sq ft', '$75,000 to $95,000', '$10,000 to $40,000'],
      // 5,445 x $15 = $81,675, x $19 = $103,455; x $2 = $10,890, x $8 = $43,560
      ['1/8 acre (5,445 sq ft)', '$81,675 to $103,455', '$10,890 to $43,560'],
      // 10,890 x $15 = $163,350, x $19 = $206,910; x $2 = $21,780, x $8 = $87,120
      ['1/4 acre (10,890 sq ft)', '$163,350 to $206,910', '$21,780 to $87,120'],
    ]);
  });

  it('sets 1,000 sq ft of turf beside 1,000 sq ft of sod', () => {
    expect(textOf(ARTIFICIAL_COST)).toContain('$15,000 to $19,000');
    expect(textOf(ARTIFICIAL_COST)).toContain('$1,650');
  });

  it('gives the hub mowing, fertilizer and seed by size, from the calculators', () => {
    expect(rowsOf(COST_HUB, 'sizes')).toEqual([
      // fertilizer: area / 1,000 x 1 lb N / 0.24 (24-0-0 at 1 lb N); DIY feed at $10 per 1,000 sq ft
      // seed: Kentucky bluegrass at Virginia's 2 to 3 lb per 1,000 sq ft
      ['1,000 sq ft', '$41 to $61', '4.2 lb', '$10', '2.0–3.0 lb'],
      ['2,500 sq ft', '$41 to $61', '10.4 lb', '$25', '5.0–7.5 lb'],
      ['5,000 sq ft', '$41 to $61', '20.8 lb', '$50', '10.0–15.0 lb'],
      // 5.445 / 0.24 = 22.69; 5.445 x 2 = 10.89, x 3 = 16.335
      ['1/8 acre (5,445 sq ft)', '$41 to $61', '22.7 lb', '$54', '10.9–16.3 lb'],
      // 10.89 / 0.24 = 45.375; x 2 = 21.78, x 3 = 32.67
      ['1/4 acre (10,890 sq ft)', '$41 to $61', '45.4 lb', '$109', '21.8–32.7 lb'],
      // 21.78 / 0.24 = 90.75; x 2 = 43.56, x 3 = 65.34
      ['1/2 acre (21,780 sq ft)', '$49 to $69', '90.8 lb', '$218', '43.6–65.3 lb'],
      // 43.56 / 0.24 = 181.5; x 2 = 87.12, x 3 = 130.68
      ['1 acre (43,560 sq ft)', '$59 to $114', '181.5 lb', '$436', '87.1–130.7 lb'],
    ]);
  });

  it('works a year of care for a Midwest quarter acre out on the hub', () => {
    // $1,222 + $395 + $175 = $1,792; $1,742 + $395 + $175 = $2,312
    expect(textOf(COST_HUB)).toContain('$1,792 to $2,312');
  });
});
