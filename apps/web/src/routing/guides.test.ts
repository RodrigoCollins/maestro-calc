import { describe, expect, it } from 'vitest';
import { GUIDES, guideOf } from './guides.ts';
import { ROUTES } from './routes.ts';
import { CALCULATOR_PAGES } from './templates.ts';

describe('guides (guides › Guide pages)', () => {
  it('ties each guide to a routed calculator page, and each guide is a route under /guides', () => {
    expect(Object.keys(GUIDES).length).toBeGreaterThan(0);
    for (const [id, { calculator }] of Object.entries(GUIDES)) {
      expect(CALCULATOR_PAGES, id).toContain(calculator);
      const route = ROUTES[id as keyof typeof ROUTES];
      expect(route.en, id).toMatch(/^\/guides\/[a-z0-9-]+$/);
      expect(route.es, id).toMatch(/^\/es\/guias\/[a-z0-9-]+$/);
    }
  });

  it('finds the guide of a page id, and nothing for any other id', () => {
    expect(guideOf('guide-concrete-bags-or-truck')).toEqual({ calculator: 'concrete' });
    expect(guideOf('about')).toBeUndefined();
    expect(guideOf('concrete')).toBeUndefined();
  });
});
