import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  COST_GUIDES,
  COST_HUB,
  FIBERGLASS_COST,
  INGROUND_COST,
  interiorArea,
  LINER_COST,
  PLUNGE_COST,
  RESURFACING_COST,
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
      expect(guide.checked).toBe('2026-11-09');
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
      for (const { name } of priced) expect(name, name).toContain('read November 9, 2026');
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
  it('are the hub, then the five priced questions', () => {
    expect(COST_GUIDES.map(({ path }) => path)).toEqual([
      '/how-much-does-a-pool-cost',
      '/inground-pool-cost',
      '/plunge-pool-cost',
      '/fiberglass-pool-cost',
      '/pool-resurfacing-cost',
      '/pool-liner-replacement-cost',
    ]);
  });

  it('send the hub to each of the five', () => {
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
});
