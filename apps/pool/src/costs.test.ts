import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  ABOVE_GROUND_COST,
  BUILD_COST,
  CONTAINER_COST,
  COST_GUIDES,
  COST_HUB,
  FIBERGLASS_COST,
  HEATER_COST,
  INGROUND_COST,
  interiorArea,
  LINER_COST,
  MAINTENANCE_COST,
  PLUNGE_COST,
  RESURFACING_COST,
  TWELVE_BY_24_COST,
  usd,
} from './costs.ts';
import type { GuideSource } from './guide.ts';
import { routeOf } from './routes.ts';

const pages = readdirSync(fileURLToPath(new URL('pages/', import.meta.url)))
  .filter((name) => name.endsWith('.astro'))
  .map((name) => `/${name.replace(/\.astro$/, '').replace(/^index$/, '')}`);

/** Everything a guide writes: its lead, its tables and its steps. */
const textOf = (guide: (typeof COST_GUIDES)[number]): string =>
  [
    guide.lead,
    ...[guide.table, ...guide.moreTables].flatMap(({ caption, head, rows }) => [
      caption,
      ...head,
      ...rows.flat(),
    ]),
    ...guide.steps.flatMap(({ title, text }) => [title, text]),
  ].join(' ');

const linksOf = (guide: (typeof COST_GUIDES)[number]): string[] =>
  guide.steps.flatMap(({ link }) => (link === undefined ? [] : [link.href]));

describe('the interior area of a pool', () => {
  // hand-checked: floor 32 x 16 = 512, walls 2 x (32 + 16) x (3.5 + 8) / 2 = 552
  it('adds the floor and the four walls at their mean depth', () => {
    expect(interiorArea({ length: 32, width: 16, shallow: 3.5, deep: 8 })).toBe(1064);
    // floor 288, walls 2 x 36 x 4.75 = 342
    expect(interiorArea({ length: 24, width: 12, shallow: 3.5, deep: 6 })).toBe(630);
  });
});

describe('a dollar figure', () => {
  it('is rounded to the dollar and grouped', () => {
    expect(usd(5320)).toBe('$5,320');
    expect(usd(37_440)).toBe('$37,440');
    expect(usd(945.4)).toBe('$945');
  });
});

describe.each(COST_GUIDES.map((guide) => [guide.path, guide] as const))(
  'the cost guide %s',
  (_path, guide) => {
    it('lives at its own page and route, English only, as an article', () => {
      expect(pages).toContain(guide.path);
      const route = routeOf(guide.path);
      expect(route?.kind).toBe('article');
      expect(route?.es).toBeUndefined();
    });

    it('answers the question searched in its h1, and fits a search result', () => {
      expect(guide.h1).toMatch(/^How much does .+ cost(?: to .+)?\?$/);
      expect(guide.title.length).toBeLessThanOrEqual(65);
      expect(guide.title.endsWith('| Pool Figures')).toBe(true);
      expect(guide.description.length).toBeGreaterThanOrEqual(50);
      expect(guide.description.length).toBeLessThanOrEqual(160);
      expect(guide.card.title.length).toBeLessThanOrEqual(30);
      expect(guide.card.summary.length).toBeLessThanOrEqual(90);
    });

    it('opens with a price in its lead, and says the day the prices were read', () => {
      expect(guide.lead).toMatch(/\$\d/);
      expect(['2026-11-09', '2026-11-10']).toContain(guide.checked);
    });

    it('cites every source it names on https, each with its date and the day it was read', () => {
      const cited = new Set([
        ...guide.steps.flatMap(({ sources }) => sources ?? []),
        ...[guide.table, ...guide.moreTables].flatMap(({ sources }) => sources),
      ]);
      expect([...cited].sort()).toEqual(Object.keys(guide.sources).sort());
      for (const { name, url } of Object.values<GuideSource>(guide.sources)) {
        expect(url.startsWith('https://'), name).toBe(true);
        expect(name, name).toMatch(/\d{4}/);
      }
      // a price is read on a day; an official rule is dated by its publication
      const priced = Object.values<GuideSource>(guide.sources).filter(
        ({ name }) => !name.includes('Consumer Product Safety Commission'),
      );
      for (const { name } of priced) expect(name, name).toMatch(/read November (?:9|10), 2026/);
      // a guide checked on a day cites a source read that day
      const day = guide.checked === '2026-11-10' ? 'read November 10, 2026' : 'read November 9';
      expect(priced.some(({ name }) => name.includes(day))).toBe(true);
    });

    it('numbers more than four steps, and links pages that exist', () => {
      expect(guide.steps.length).toBeGreaterThan(4);
      const links = linksOf(guide);
      expect(links.length).toBeGreaterThan(2);
      for (const href of links) expect(pages, href).toContain(href);
    });

    it('links the other cost guides it compares with, the hub included', () => {
      if (guide.path !== COST_HUB.path) expect(linksOf(guide)).toContain(COST_HUB.path);
    });
  },
);

describe('the cost guides', () => {
  it('are the hub, then the eleven priced questions', () => {
    expect(COST_GUIDES.map(({ path }) => path)).toEqual([
      '/how-much-does-a-pool-cost',
      '/inground-pool-cost',
      '/plunge-pool-cost',
      '/fiberglass-pool-cost',
      '/pool-resurfacing-cost',
      '/pool-liner-replacement-cost',
      '/cost-to-build-a-pool',
      '/12x24-pool-cost',
      '/above-ground-pool-cost',
      '/shipping-container-pool-cost',
      '/pool-heater-cost',
      '/pool-maintenance-cost',
    ]);
  });

  it('send the hub to each of the eleven', () => {
    const links = linksOf(COST_HUB);
    for (const { path } of COST_GUIDES.slice(1)) expect(links, path).toContain(path);
  });

  it('give each its own title, description and lead', () => {
    for (const key of ['title', 'description', 'lead', 'h1'] as const)
      expect(new Set(COST_GUIDES.map((guide) => guide[key])).size).toBe(COST_GUIDES.length);
  });
});

// Every price is the source's own, as read on 2026-11-09: a changed one must be checked again.
describe('the published prices', () => {
  it('gives the inground prices of This Old House by size and material', () => {
    const text = textOf(INGROUND_COST);
    expect(text).toContain('$38,000 to $100,000');
    expect(text).toContain('$38,000 to $70,000');
    expect(text).toContain('$50,000 to $95,000');
    expect(text).toContain('$58,000 to $100,000');
    expect(text).toContain('$67,000 to $123,000');
    expect(text).toContain('$102,000 to $180,000');
    expect(text).toContain('$130 to $240');
    expect(text).toContain('15 to 25%');
    expect(text).toContain('$90 to $270 per month');
    expect(text).toContain('48 inches');
  });

  it('works the price per square foot out on two sizes', () => {
    const text = textOf(INGROUND_COST);
    // 288 sq ft x $130 and x $240; 512 sq ft x $200 and x $350
    expect(text).toContain('$37,440 to $69,120');
    expect(text).toContain('$102,400 to $179,200');
  });

  it('gives the plunge pool prices of This Old House, Latham and Bob Vila', () => {
    const text = textOf(PLUNGE_COST);
    expect(text).toContain('$10,000 to $35,000 or more');
    expect(text).toContain('about $20,000');
    expect(text).toContain('$28,500');
    expect(text).toContain('$53,200 to $59,200');
    expect(text).toContain('$12,999');
    expect(text).toContain('around $35,000');
    expect(text).toContain('$10,000 to $22,000');
  });

  it('compares the gallons of a plunge pool with a backyard pool, from the volume calculator', () => {
    const text = textOf(PLUNGE_COST);
    expect(text).toContain('5,266 gallons');
    expect(text).toContain('22,023 gallons');
  });

  it('gives the fiberglass prices of River Pools, Latham and This Old House', () => {
    const text = textOf(FIBERGLASS_COST);
    expect(text).toContain('$60,000 to $100,000');
    expect(text).toContain('$85,000 to $135,000');
    expect(text).toContain('$85,000 to $200,000');
    expect(text).toContain('$50,000 to $150,000');
    expect(text).toContain('$175 to $330');
    // 12 x 24: $50,000 - $38,000 and $95,000 - $70,000 above vinyl
    expect(text).toContain('$12,000 to $25,000 more');
  });

  it('gives the resurfacing prices and works them out on the surface of two pools', () => {
    const text = textOf(RESURFACING_COST);
    expect(text).toContain('about $5 per square foot');
    expect(text).toContain('$5 to $7 per square foot');
    expect(text).toContain('$1,000 to $30,000');
    expect(text).toContain('1,064 square feet');
    // 1,064 x $5; 630 x $5.50; 1,064 x $6.50
    expect(text).toContain('$5,320');
    expect(text).toContain('$3,465');
    expect(text).toContain('$6,916');
  });

  it('gives the liner prices and works them out on the surface of two pools', () => {
    const text = textOf(LINER_COST);
    expect(text).toContain('$4,500 or more');
    expect(text).toContain('$1,125 to $3,688');
    expect(text).toContain('$2,393');
    expect(text).toContain('$700 to $1,500');
    expect(text).toContain('$1,000 to $2,500');
    expect(text).toContain('5 to 9 years');
    // 630 and 1,064 sq ft at $1 to $5; $700 + $1,000 and $1,500 + $2,500
    expect(text).toContain('$630 to $3,150');
    expect(text).toContain('$1,064 to $5,320');
    expect(text).toContain('$1,700 to $4,000');
  });

  it('gives the hub the range from an above-ground kit to a turn-key concrete pool', () => {
    const text = textOf(COST_HUB);
    expect(text).toContain('$1,500 to $7,500');
    expect(text).toContain('$95,000 to $225,000');
    expect(text).toContain('$36,730');
  });

  it('gives the build prices of Bob Vila line by line, and This Old House and River Pools', () => {
    const text = textOf(BUILD_COST);
    expect(text).toContain('$36,730');
    expect(text).toContain('$1,800 to $58,540');
    expect(text).toContain('$3,400');
    expect(text).toContain('$5,000 to $30,000');
    expect(text).toContain('$200 to $2,000');
    expect(text).toContain('$125 to $250');
    expect(text).toContain('$1,500 to $10,000');
    expect(text).toContain('$450 to $1,800');
    expect(text).toContain('$95,000 to $225,000');
  });

  it('works a 12 x 24 ft pool out: its price, its gallons, its surface and its running costs', () => {
    const text = textOf(TWELVE_BY_24_COST);
    expect(text).toContain('$38,000 to $100,000');
    expect(text).toContain('$26,000 to $37,500');
    expect(text).toContain('$2,000 to $5,000');
    // 12 x 24 x (3.5 + 6) / 2 = 1,368 cu ft x 7.4805 = 10,233 gallons, from the volume calculator
    expect(text).toContain('10,233 gallons');
    expect(text).toContain('630 square feet');
    // 630 x $5 of plaster; 288 sq ft x $130 and x $240
    expect(text).toContain('$3,150');
    expect(text).toContain('$37,440 to $69,120');
    // 10,233 x 8.34 x 10 Btu: COP 5.7 heat pump $7.97, natural gas $26.53
    expect(text).toContain('853,432 Btu');
    expect(text).toContain('$7.97');
    expect(text).toContain('$26.53');
    // 1 ppm of 12.5% liquid chlorine: 0.0819 gal, $0.74; salt 273 lb, 7 bags, $76.93
    expect(text).toContain('$0.74');
    expect(text).toContain('7 bags');
    expect(text).toContain('$76.93');
  });

  it('gives the above-ground prices of River Pools, Fixr and This Old House, with the gallons', () => {
    const text = textOf(ABOVE_GROUND_COST);
    expect(text).toContain('$1,500 to $7,500');
    expect(text).toContain('$1,000 to $3,000');
    expect(text).toContain('$3,000 to $7,500');
    expect(text).toContain('$800 to $1,500');
    expect(text).toContain('$1,049.99');
    expect(text).toContain('$15 to $35');
    // the volume calculator's round pools at 4 ft of water
    expect(text).toContain('5,288 gallons');
    expect(text).toContain('13,536 gallons');
  });

  it('gives the shipping container pool prices of This Old House and two makers', () => {
    const text = textOf(CONTAINER_COST);
    expect(text).toContain('$42,000');
    expect(text).toContain('$56,000');
    expect(text).toContain('$44,900');
    expect(text).toContain('$45,000');
    expect(text).toContain('3,800 gallons');
    expect(text).toContain('37,000 lb');
    expect(text).toContain('$35,000 to $65,000');
    expect(text).toContain('$28,000 to $50,000');
    // 3,800 x 8.34 x 10 = 316,920 Btu; 92.9 kWh on an 11 kW heater, 8.4 hours, $16.87
    expect(text).toContain('316,920 Btu');
    expect(text).toContain('8.4 hours');
    expect(text).toContain('$16.87');
  });

  it('prices the heaters and works one warm-up out in each energy, at EIA prices', () => {
    const text = textOf(HEATER_COST);
    expect(text).toContain('$2,500 to $5,000');
    expect(text).toContain('$3,000 to $7,000');
    expect(text).toContain('$120 to $200');
    expect(text).toContain('18.16 cents');
    expect(text).toContain('$27.05');
    expect(text).toContain('$2.82');
    // 22,023 x 8.34 x 10 = 1,836,718 Btu
    expect(text).toContain('1,836,718 Btu');
    expect(text).toContain('94.4 kWh');
    expect(text).toContain('$17.15');
    expect(text).toContain('$24.44');
    expect(text).toContain('$97.76');
    expect(text).toContain('$57.09');
    expect(text).toContain('$67.42');
    // 1,836,718 / 110,000 Btu per hour
    expect(text).toContain('16.7 hours');
  });

  it('prices the upkeep and works the chemicals out for a 22,023 gallon pool', () => {
    const text = textOf(MAINTENANCE_COST);
    expect(text).toContain('$90 to $270 per month');
    expect(text).toContain('$30 to $260');
    expect(text).toContain('$375 to $500');
    expect(text).toContain('$350 to $650');
    expect(text).toContain('$310');
    expect(text).toContain('75%');
    // 1 ppm of 12.5% liquid: 0.176 gal at $35.99 / 4 = $1.59; 30 days at 1 ppm a day $47.56
    expect(text).toContain('$1.59');
    expect(text).toContain('$47.56');
    // a 1 lb bag of shock per 10,000 gallons a week: 2.2 lb, $9.18 a week, $39.76 a month
    expect(text).toContain('$9.18');
    expect(text).toContain('$39.76');
    // 587.7 lb of salt, 15 bags at $10.99
    expect(text).toContain('15 bags');
    expect(text).toContain('$164.85');
  });
});
