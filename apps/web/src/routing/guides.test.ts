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
    // spec: guides › [GU13] the raised bed guide ends in the topsoil calculator
    expect(guideOf('guide-raised-bed-soil')).toEqual({ calculator: 'topsoil' });
    // spec: guides › [GU14] the roofing quote guide ends in the roofing calculator
    expect(guideOf('guide-roofing-quote')).toEqual({ calculator: 'roofing' });
    // spec: guides › [GU15] the fence post guide ends in the concrete calculator
    expect(guideOf('guide-fence-post-concrete')).toEqual({ calculator: 'concrete' });
    // spec: guides › [GU16] the mulch guide ends in the mulch calculator
    expect(guideOf('guide-mulch')).toEqual({ calculator: 'mulch' });
    // spec: guides › [GU17] the cubic yards guide ends in the gravel calculator
    expect(guideOf('guide-cubic-yards')).toEqual({ calculator: 'gravel' });
    // spec: guides › [GU18] the concrete bag coverage guide ends in the concrete calculator
    expect(guideOf('guide-concrete-bag-coverage')).toEqual({ calculator: 'concrete' });
    // spec: guides › [GU19] the paint coverage guide ends in the paint calculator
    expect(guideOf('guide-paint-coverage')).toEqual({ calculator: 'paint' });
    // spec: guides › [GU20] the gravel coverage guide ends in the gravel calculator
    expect(guideOf('guide-gravel-coverage')).toEqual({ calculator: 'gravel' });
    // the board feet guide ("how to calculate board feet") ends in the board feet calculator
    expect(guideOf('guide-board-feet')).toEqual({ calculator: 'board-feet' });
    expect(guideOf('about')).toBeUndefined();
    expect(guideOf('concrete')).toBeUndefined();
  });

  // spec: guides › [GU6] a calculator page lists the guides that end in it
  it('lists the guides of a calculator page in table order, and none for a calculator without one', () => {
    expect(guidesOf('concrete')).toEqual([
      'guide-concrete-bags-or-truck',
      'guide-concrete-quote',
      'guide-fence-post-concrete',
      'guide-concrete-bag-coverage',
    ]);
    expect(guidesOf('roof-pitch')).toEqual(['guide-roof-pitch']);
    expect(guidesOf('roofing')).toEqual(['guide-roofing-quote']);
    expect(guidesOf('paint')).toEqual(['guide-paint-quote', 'guide-paint-coverage']);
    expect(guidesOf('gravel')).toEqual([
      'guide-gravel-driveway',
      'guide-cubic-yards',
      'guide-gravel-coverage',
    ]);
    expect(guidesOf('topsoil')).toEqual(['guide-raised-bed-soil']);
    expect(guidesOf('mulch')).toEqual(['guide-mulch']);
    expect(guidesOf('board-feet')).toEqual(['guide-board-feet']);
    for (const calculator of CALCULATOR_PAGES) {
      for (const id of guidesOf(calculator)) expect(GUIDES[id].calculator).toBe(calculator);
    }
  });
});
