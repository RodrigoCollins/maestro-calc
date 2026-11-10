import { describe, expect, it } from 'vitest';
import { CALENDAR_STATES } from './calendar-paths.ts';
import { DATA_GUIDES, GUIDES, guideAt } from './guide.ts';
import { fertilizerHrefOf } from './feed-rates.ts';
import { STATE_CALENDARS } from './state-calendars.ts';
import { STATE_RATES } from './state-rates.ts';
import { FEED_STATE_GUIDES, SEED_STATE_GUIDES } from './state-guides.ts';
import { ZONE_GUIDES, ZONE_INDEX } from './zone-guides.ts';

const textOf = (path: string): string => {
  const guide = guideAt(path);
  return [
    guide.lead,
    ...guide.sections.flatMap(({ paragraphs, items = [] }) => [...paragraphs, ...items]),
    ...guide.questions.map(({ answer }) => answer),
  ].join(' ');
};

describe('zone pages', () => {
  it('gives one page per half zone, 3a to 10b, under the zone index', () => {
    expect(ZONE_GUIDES.map(({ path }) => path.slice('/planting-zones/'.length))).toEqual(
      [
        '3a',
        '3b',
        '4a',
        '4b',
        '5a',
        '5b',
        '6a',
        '6b',
        '7a',
        '7b',
        '8a',
        '8b',
        '9a',
        '9b',
        '10a',
        '10b',
      ].map((label) => `zone-${label}`),
    );
    for (const guide of ZONE_GUIDES) expect(guide.parent?.path).toBe('/planting-zones');
    expect(GUIDES).toContain(ZONE_INDEX);
  });

  it('answers first in the title and the lead: the temperature and the frost dates', () => {
    const zone = guideAt('/planting-zones/zone-7b');
    expect(zone.title).toBe('Zone 7b Planting Schedule and Frost Dates | Lawn Figures');
    // 548 stations: middle 50% last spring freeze Apr 7, first fall freeze Oct 31 (day 304);
    // 45 days before is Sep 16 (Illinois); four to six weeks is Sep 19 to Oct 3 (UGA)
    expect(zone.lead).toContain('averages 5°F to 10°F');
    expect(zone.lead).toContain('548 NOAA weather stations');
    expect(zone.lead).toContain('last spring freeze is Apr 7');
    expect(zone.lead).toContain('first fall freeze Oct 31');
    expect(zone.lead).toContain('by about Sep 16');
    expect(textOf('/planting-zones/zone-7b')).toContain('Sep 19 to Oct 3 here');
    // tomatoes 1 to 2 weeks after the last frost (UNH): Apr 14 to Apr 21
    expect(zone.lead).toContain('tomatoes from Apr 14 to Apr 21');
  });

  it('leads a warm zone with the warm-season dates', () => {
    // zone 10b: last spring freeze Jan 16, 6 weeks on is Feb 27; first fall freeze Jan 13,
    // two months before is Nov 13
    expect(guideAt('/planting-zones/zone-10b').lead).toContain(
      'feed a warm-season lawn first around Feb 27, plant warm-season plugs by Nov 13',
    );
  });

  it('works every zone out from its own stations: no two zones share a lead', () => {
    expect(new Set(ZONE_GUIDES.map(({ lead }) => lead)).size).toBe(ZONE_GUIDES.length);
  });
});

describe('state pages', () => {
  it('gives each calendar state a seed page and a fertilizer page', () => {
    expect(SEED_STATE_GUIDES).toHaveLength(26);
    expect(FEED_STATE_GUIDES).toHaveLength(26);
    expect(guideAt('/when-to-plant-grass-seed/texas').title).toBe(
      'When to Plant Grass Seed in Texas | Lawn Figures',
    );
    expect(guideAt('/when-to-fertilize-lawn/ohio').title).toBe(
      'When to Fertilize Your Lawn in Ohio | Lawn Figures',
    );
  });

  it('cites an extension source of the state itself for its grasses, seeding and feeding', () => {
    for (const state of CALENDAR_STATES) {
      const calendar = STATE_CALENDARS[state.code as keyof typeof STATE_CALENDARS];
      expect(calendar.seed.length, state.code).toBeGreaterThan(0);
      expect(calendar.feed.length, state.code).toBeGreaterThan(0);
      expect(calendar.kinds.length, state.code).toBeGreaterThan(0);
      const seed = guideAt(`/when-to-plant-grass-seed/${state.slug}`);
      for (const { source } of [calendar.grasses, ...calendar.seed]) {
        expect(Object.values(seed.sources)).toContainEqual(source);
      }
    }
  });

  it('works the seed dates out zone by zone from the state’s stations', () => {
    // Wisconsin: zones 4a to 6a; its 5a stations have their middle first fall freeze on Oct 7,
    // and 45 days before is Aug 23
    const text = textOf('/when-to-plant-grass-seed/wisconsin');
    expect(text).toContain('USDA zones 4a to 6a');
    expect(text).toContain(
      'Zone 5a (59 stations): last spring freeze May 4, first fall freeze Oct 7; cool-season seed by Aug 23.',
    );
  });

  it('times warm-season feeding from the frost for a warm-season state', () => {
    // Texas zone 8a: last spring freeze Mar 29 (day 88) and 6 weeks on is May 10;
    // first fall freeze Nov 7 (day 311): 6 weeks before is Sep 26, four weeks Oct 10
    expect(textOf('/when-to-fertilize-lawn/texas')).toContain(
      'Zone 8a (111 stations): first warm-season feeding May 10, last Sep 26 to Oct 10.',
    );
  });

  it('gives every fertilizer page the nitrogen rates of its own extension service', () => {
    for (const state of CALENDAR_STATES) {
      const rates = STATE_RATES[state.code as keyof typeof STATE_RATES];
      expect(rates.items.length, state.code).toBeGreaterThan(0);
      expect(rates.feeding, state.code).toBeGreaterThan(0);
      expect(rates.feeding, state.code).toBeLessThanOrEqual(1);
      const page = guideAt(`/when-to-fertilize-lawn/${state.slug}`);
      for (const source of rates.sources)
        expect(Object.values(page.sources)).toContainEqual(source);
      const section = page.sections.find(({ id }) => id === 'rates');
      expect(section?.items, state.code).toEqual(rates.items);
    }
    // Ohio State HYG-4031, Table 3; Virginia 430-011, Table 2 and its seasonal totals
    expect(textOf('/when-to-fertilize-lawn/ohio')).toContain(
      'Kentucky bluegrass and perennial ryegrass: 2 to 3 lb of N per 1,000 sq ft a year at low maintenance, 3.5 to 5 lb at high.',
    );
    expect(textOf('/when-to-fertilize-lawn/virginia')).toContain(
      'Bermudagrass and St. Augustinegrass: 0.5 lb in April, 0.7 lb a month from May through July and 0.5 lb in August; 2 to 4 lb a year.',
    );
  });

  it('adds the states whose extension service publishes rates by grass: SC, AL, KY, AR, MS, KS', () => {
    expect(CALENDAR_STATES.slice(20).map(({ code }) => code)).toEqual([
      'SC',
      'AL',
      'KY',
      'AR',
      'MS',
      'KS',
    ]);
    // UK AGR-212, Table 4
    expect(textOf('/when-to-fertilize-lawn/kentucky')).toContain(
      'Kentucky bluegrass, perennial ryegrass and tall fescue: 2 to 4 lb of N per 1,000 sq ft a year, fed in autumn; fine fescues 1 to 2 lb.',
    );
    // Mississippi Publication 1322, Table 9: hybrid bermudagrass by zone
    expect(textOf('/when-to-fertilize-lawn/mississippi')).toContain(
      'Hybrid bermudagrass: 3 lb of N per 1,000 sq ft a season in zone 7a (May 15, June 15, August 15), 6 lb in zone 8b (the first of each month, April through September).',
    );
    expect(guideAt('/when-to-fertilize-lawn/kansas').title).toBe(
      'When to Fertilize Your Lawn in Kansas | Lawn Figures',
    );
  });

  it('works one feeding out at the state’s own rate, with the calculator filled in', () => {
    // Arizona: ½ lb of N a month on bermudagrass. On the calculator defaults (5,000 sq ft,
    // 24-0-6, 15 lb bags): 0.5 / 0.24 = 2.08 lb per 1,000 sq ft, 10.42 lb in all, one bag
    const arizona = guideAt('/when-to-fertilize-lawn/arizona');
    const worked = arizona.sections.find(({ id }) => id === 'worked');
    expect(worked?.heading).toBe('Worked example: one feeding in Arizona');
    expect(worked?.paragraphs.join(' ')).toContain(
      '2.1 lb of product per 1,000 sq ft (0.5 ÷ 0.24), 10.4 lb for the lawn: 1 bag of 15 lb.',
    );
    expect(worked?.links?.[0]?.href).toBe(fertilizerHrefOf(0.5));
    // Ohio: 1 lb, the calculator's own default: 4.2 lb per 1,000 sq ft, 20.8 lb, 2 bags
    const ohio = guideAt('/when-to-fertilize-lawn/ohio');
    expect(ohio.sections.find(({ id }) => id === 'worked')?.paragraphs.join(' ')).toContain(
      '4.2 lb of product per 1,000 sq ft (1 ÷ 0.24), 20.8 lb for the lawn: 2 bags of 15 lb.',
    );
    for (const guide of FEED_STATE_GUIDES) {
      expect(guide.questions.map(({ question }) => question)).toContain(
        `How much nitrogen does a lawn need in ${guide.h1.slice('When to fertilize your lawn in '.length)}?`,
      );
    }
  });

  it('keeps every page its own: no two leads alike, every source on https', () => {
    expect(new Set(DATA_GUIDES.map(({ lead }) => lead)).size).toBe(DATA_GUIDES.length);
    for (const guide of DATA_GUIDES) {
      for (const { url } of Object.values(guide.sources))
        expect(url, guide.path).toMatch(/^https:\/\//);
      const urls = Object.values(guide.sources).map(({ url }) => url);
      expect(new Set(urls).size, guide.path).toBe(urls.length);
    }
  });
});
