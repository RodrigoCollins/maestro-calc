import { describe, expect, it } from 'vitest';
import { CALENDAR_STATES } from './calendar-paths.ts';
import { DATA_GUIDES, GUIDES, guideAt } from './guide.ts';
import { STATE_CALENDARS } from './state-calendars.ts';
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
    expect(SEED_STATE_GUIDES).toHaveLength(20);
    expect(FEED_STATE_GUIDES).toHaveLength(20);
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
