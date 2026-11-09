import { describe, expect, it } from 'vitest';
import {
  AERATION_GUIDE,
  aerationWindowOf,
  PRE_EMERGENT_GUIDE,
  preEmergentOf,
  stateWindowsOf,
} from './aeration-guides.ts';
import { CALENDAR_STATES, feedStatePathOf, seedStatePathOf } from './calendar-paths.ts';
import { calculatorAt } from './calculators.ts';
import { BEST_SEED_GUIDE, GUIDES, guideAt, PLANTING_GUIDE } from './guide.ts';
import { routeOf } from './routes.ts';
import { FEED_STATE_GUIDES, SEED_STATE_GUIDES } from './state-guides.ts';

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

// The middle 50% freeze dates of the NOAA stations of three calendar states, as day numbers of
// the 365-day calendar: Pennsylvania Apr 28 (118) and Oct 19 (292), Texas Mar 14 (73) and Nov 16
// (320), Georgia Mar 21 (80) and Nov 12 (316).
const PENNSYLVANIA = { spring: 118, fall: 292 };
const TEXAS = { spring: 73, fall: 320 };
const GEORGIA = { spring: 80, fall: 316 };

describe('the aeration window worked from the frost dates', () => {
  it('times cool-season aeration before overseeding: seed 45 days before the freeze, a month after the holes', () => {
    // 292 - 45 = 247 (Sep 4); 247 - 30 = 217 (Aug 5)
    expect(aerationWindowOf(['cool'], PENNSYLVANIA)).toEqual({
      cool: { aerateBy: 217, seedBy: 247, freeze: 292 },
    });
  });

  it('starts warm-season aeration about six weeks after the last spring freeze, once the grass grows', () => {
    // 73 + 42 = 115 (Apr 25)
    expect(aerationWindowOf(['warm'], TEXAS)).toEqual({ warm: { from: 115 } });
  });

  it('gives both for a state that grows both', () => {
    // cool: 316 - 45 = 271 (Sep 28), 271 - 30 = 241 (Aug 29); warm: 80 + 42 = 122 (May 2)
    expect(aerationWindowOf(['cool', 'warm'], GEORGIA)).toEqual({
      cool: { aerateBy: 241, seedBy: 271, freeze: 316 },
      warm: { from: 122 },
    });
  });
});

describe('the pre-emergent dates worked from the frost dates', () => {
  it('waits nine weeks from a pre-emergent put down at the middle last spring freeze before seeding', () => {
    // 118 + 63 = 181 (Jun 30); the fall seed date 292 - 45 = 247 (Sep 4)
    expect(preEmergentOf(['cool'], PENNSYLVANIA)).toEqual({
      springFreeze: 118,
      seedAfter: 181,
      fallSeedBy: 247,
    });
  });

  it('has no fall seed date for a warm-season state', () => {
    // 73 + 63 = 136 (May 16)
    expect(preEmergentOf(['warm'], TEXAS)).toEqual({ springFreeze: 73, seedAfter: 136 });
  });

  it('works a row for each of the 20 calendar states from its own stations', () => {
    const rows = stateWindowsOf();
    expect(rows.map(({ state }) => state.code)).toEqual(CALENDAR_STATES.map(({ code }) => code));
    const pennsylvania = rows.find(({ state }) => state.code === 'PA');
    expect(pennsylvania?.aeration).toEqual({ cool: { aerateBy: 217, seedBy: 247, freeze: 292 } });
    expect(pennsylvania?.preEmergent.springFreeze).toBe(118);
    const texas = rows.find(({ state }) => state.code === 'TX');
    expect(texas?.aeration).toEqual({ warm: { from: 115 } });
  });
});

describe('when to aerate your lawn', () => {
  it('is published at its own address and answers first by grass type', () => {
    expect(AERATION_GUIDE.path).toBe('/when-to-aerate-lawn');
    expect(GUIDES).toContain(AERATION_GUIDE);
    expect(AERATION_GUIDE.lead).toMatch(/fall/);
    expect(AERATION_GUIDE.lead).toMatch(/late spring/);
  });

  it('gives the tines, the soil moisture and the core sizes of the source, and the dates by state', () => {
    const text = textOf(AERATION_GUIDE.path);
    expect(text).toContain('2 to 3 inches');
    expect(text).toMatch(/moderately moist/);
    expect(text).toMatch(/about a month/);
    expect(text).toContain('Pennsylvania (cool-season): aerate by about Aug 5 to seed by Sep 4');
    expect(text).toContain('Texas (warm-season): from about Apr 25');
    for (const { name } of CALENDAR_STATES) expect(text, name).toContain(`${name} (`);
  });
});

describe('when to apply pre-emergent', () => {
  it('is published at its own address and answers first with the soil temperature', () => {
    expect(PRE_EMERGENT_GUIDE.path).toBe('/when-to-apply-pre-emergent');
    expect(GUIDES).toContain(PRE_EMERGENT_GUIDE);
    expect(PRE_EMERGENT_GUIDE.lead).toMatch(/53 to 55°F/);
  });

  it('covers the soil temperature, forsythia, the second application, the fall and seeding', () => {
    const text = textOf(PRE_EMERGENT_GUIDE.path);
    expect(text).toMatch(/60°F for 3 to 5 days at 1\/4 inch/);
    expect(text).toMatch(/forsythia/);
    expect(text).toMatch(/6 to 8 weeks later/);
    expect(text).toMatch(/55 to 60°F/);
    expect(text).toMatch(/at least nine weeks/);
    expect(text).toContain('Pennsylvania (cool-season): middle last spring freeze Apr 28');
    for (const { name } of CALENDAR_STATES) expect(text, name).toContain(`${name} (`);
  });
});

describe('the links of the two guides', () => {
  const guides = [AERATION_GUIDE, PRE_EMERGENT_GUIDE];

  it('are linked from the planting guide, the seed hub and every state calendar, and link back', () => {
    for (const guide of guides) {
      expect(hrefsOf(PLANTING_GUIDE.path), guide.path).toContain(guide.path);
      expect(hrefsOf(BEST_SEED_GUIDE.path), guide.path).toContain(guide.path);
      for (const state of [...SEED_STATE_GUIDES, ...FEED_STATE_GUIDES])
        expect(hrefsOf(state.path), `${state.path} -> ${guide.path}`).toContain(guide.path);
      expect(hrefsOf(guide.path)).toContain('/when-to-plant-grass-seed');
      expect(hrefsOf(guide.path)).toContain('/grass-seed-calculator');
    }
    expect(hrefsOf(AERATION_GUIDE.path)).toContain(PRE_EMERGENT_GUIDE.path);
    expect(hrefsOf(PRE_EMERGENT_GUIDE.path)).toContain(AERATION_GUIDE.path);
    expect(calculatorAt('/grass-seed-calculator').guides).toContain(AERATION_GUIDE.id);
  });

  it('link every state calendar', () => {
    for (const { slug } of CALENDAR_STATES) {
      expect(hrefsOf(AERATION_GUIDE.path)).toContain(seedStatePathOf(slug));
      expect(hrefsOf(PRE_EMERGENT_GUIDE.path)).toContain(feedStatePathOf(slug));
    }
  });

  it('link only pages that exist, and date every source with the day it was read', () => {
    for (const guide of guides) {
      for (const href of hrefsOf(guide.path)) expect(routeOf(href), href).toBeDefined();
      for (const { name, url } of Object.values(guide.sources)) {
        expect(name, guide.path).toMatch(/accessed \d{4}-\d{2}-\d{2}/);
        expect(url).toMatch(/^https:\/\//);
      }
    }
  });
});
