import { describe, expect, it } from 'vitest';
import { GUIDES, guideOf, guidesOf } from './guides.ts';
import { ROUTES } from './routes.ts';
import { CALCULATOR_PAGES } from './templates.ts';

describe('guides (guides › Guide pages)', () => {
  it('ties each guide to a routed calculator page or to none, and each guide is a route under /guides', () => {
    expect(Object.keys(GUIDES).length).toBeGreaterThan(0);
    for (const [id, { calculator }] of Object.entries(GUIDES)) {
      if (calculator !== null) expect(CALCULATOR_PAGES, id).toContain(calculator);
      const route = ROUTES[id as keyof typeof ROUTES];
      expect(route.en, id).toMatch(/^\/guides\/[a-z0-9-]+$/);
      expect(route.es, id).toMatch(/^\/es\/guias\/[a-z0-9-]+$/);
    }
  });

  it('finds the guide of a page id, and nothing for any other id', () => {
    expect(guideOf('guide-concrete-bags-or-truck')).toEqual({ calculator: 'concrete' });
    expect(guideOf('guide-tape-measure-fractions')).toEqual({ calculator: 'feet-inches' });
    expect(guideOf('guide-square-footage')).toEqual({ calculator: 'rectangle-area' });
    expect(guideOf('guide-drywall-estimate')).toEqual({ calculator: 'drywall' });
    expect(guideOf('guide-roof-pitch')).toEqual({ calculator: 'roof-pitch' });
    expect(guideOf('guide-concrete-quote')).toEqual({ calculator: 'concrete' });
    // spec: guides › [GU10] a guide with no calculator of its own
    expect(guideOf('guide-contractor-license')).toEqual({ calculator: null });
    expect(guideOf('guide-paint-quote')).toEqual({ calculator: 'paint' });
    // spec: guides › [GU12] the landscaping hub gets its first guide
    expect(guideOf('guide-gravel-driveway')).toEqual({ calculator: 'gravel' });
    expect(guideOf('about')).toBeUndefined();
    expect(guideOf('concrete')).toBeUndefined();
  });

  // spec: guides › [GU6] a calculator page lists the guides that end in it
  it('lists the guides of a calculator page in table order, and none for a calculator without one', () => {
    expect(guidesOf('concrete')).toEqual(['guide-concrete-bags-or-truck', 'guide-concrete-quote']);
    expect(guidesOf('roof-pitch')).toEqual(['guide-roof-pitch']);
    expect(guidesOf('paint')).toEqual(['guide-paint-quote']);
    expect(guidesOf('gravel')).toEqual(['guide-gravel-driveway']);
    expect(guidesOf('mulch')).toEqual([]);
    for (const calculator of CALCULATOR_PAGES) {
      for (const id of guidesOf(calculator)) expect(GUIDES[id].calculator).toBe(calculator);
    }
  });
});
