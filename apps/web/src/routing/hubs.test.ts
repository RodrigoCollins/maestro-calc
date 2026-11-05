import { describe, expect, it } from 'vitest';
import { GUIDES } from './guides.ts';
import { HUBS, hubOf, hubOfCalculator } from './hubs.ts';
import { ROUTES } from './routes.ts';
import { CALCULATOR_PAGES } from './templates.ts';

// spec: hubs › [HB1] each trade hub lists routed calculators and published guides
describe('trade hubs (hubs › Hub pages)', () => {
  it('lists routed calculators and published guides, each hub a route of its own', () => {
    expect(Object.keys(HUBS).length).toBeGreaterThan(0);
    for (const [id, { calculators, guides }] of Object.entries(HUBS)) {
      expect(calculators.length, id).toBeGreaterThan(0);
      for (const calculator of calculators) expect(CALCULATOR_PAGES, id).toContain(calculator);
      for (const guide of guides) expect(Object.keys(GUIDES), id).toContain(guide);
      const route = ROUTES[id as keyof typeof ROUTES];
      expect(route.en, id).toMatch(/^\/[a-z-]+$/);
      expect(route.es, id).toMatch(/^\/es\/[a-z-]+$/);
    }
  });

  it('puts a calculator in one hub at most, and every guide in the hub of its calculator', () => {
    const owners = Object.entries(HUBS).flatMap(([id, { calculators }]) =>
      calculators.map((calculator) => [calculator, id] as const),
    );
    expect(new Set(owners.map(([calculator]) => calculator)).size).toBe(owners.length);
    const hubOfCalculator = new Map(owners);
    for (const [id, { guides }] of Object.entries(HUBS)) {
      for (const guide of guides) {
        expect(hubOfCalculator.get(GUIDES[guide].calculator), guide).toBe(id);
      }
    }
  });

  it('finds the hub of a page id, and nothing for any other id', () => {
    expect(hubOf('hub-concrete')).toEqual({
      calculators: ['concrete'],
      guides: [
        'guide-concrete-bags-or-truck',
        'guide-concrete-quote',
        'guide-fence-post-concrete',
        'guide-concrete-bag-coverage',
      ],
    });
    // spec: hubs › [HB4] the paint hub lists its calculator and its guide
    expect(hubOf('hub-paint')).toEqual({ calculators: ['paint'], guides: ['guide-paint-quote'] });
    expect(hubOf('hub-landscaping')?.guides).toEqual([
      'guide-gravel-driveway',
      'guide-raised-bed-soil',
      'guide-mulch',
      'guide-cubic-yards',
    ]);
    expect(hubOf('hub-roofing')?.guides).toEqual(['guide-roof-pitch', 'guide-roofing-quote']);
    expect(hubOf('concrete')).toBeUndefined();
    expect(hubOf('about')).toBeUndefined();
  });

  // spec: hubs › [HB3] a calculator page links the hub of its trade
  it('finds the hub of a calculator page', () => {
    expect(hubOfCalculator('gravel')).toBe('hub-landscaping');
    expect(hubOfCalculator('roofing')).toBe('hub-roofing');
    expect(hubOfCalculator('paint')).toBe('hub-paint');
  });
});
