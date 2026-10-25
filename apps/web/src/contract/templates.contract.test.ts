import { describe, expect, it } from 'vitest';
import { calculators } from '../lib/calculators.ts';
import { ROUTES } from '../routing/routes.ts';
import { CALCULATOR_PAGES, PAGELESS, templateOf, templateProblems } from '../routing/templates.ts';

const registry: string[] = calculators.map(({ id }) => id);
const pageIds: readonly string[] = CALCULATOR_PAGES;

describe('calculator pages in the route table (site-routing-i18n › [SR17])', () => {
  // spec: site-routing-i18n › [SR17] the lists agree with the table and the registry
  it('has no problem for the real lists, the table and the registry', () => {
    expect(templateProblems(ROUTES, CALCULATOR_PAGES, PAGELESS, registry)).toEqual([]);
  });

  // spec: site-routing-i18n › [SR17] until go-live concrete is a registry calculator without a page
  it('keeps every registry calculator in exactly one list', () => {
    expect(registry.length).toBeGreaterThan(1);
    for (const id of registry) {
      expect([pageIds.includes(id), PAGELESS.includes(id)].filter(Boolean), id).toHaveLength(1);
    }
    expect(PAGELESS).toContain('concrete');
  });

  // spec: site-routing-i18n › [SR17] each failure names the id
  it.each([
    [
      'a page id missing from the table',
      ['concrete'],
      ['rectangle-area'],
      'concrete: page id is not in the route table',
    ],
    [
      'a registry calculator in neither list',
      [],
      ['rectangle-area'],
      'concrete: registry calculator is in neither the page list nor PAGELESS',
    ],
    [
      'an id in both lists',
      ['rectangle-area'],
      ['rectangle-area', 'concrete'],
      'rectangle-area: id is in both the page list and PAGELESS',
    ],
    [
      'a PAGELESS id outside the registry',
      [],
      [...PAGELESS, 'ghost'],
      'ghost: PAGELESS id is not in the registry',
    ],
  ])('names the id for %s', (_name, pages, pageless, message) => {
    expect(templateProblems(ROUTES, pages, pageless, registry)).toContain(message);
  });

  // spec: site-routing-i18n › [SR18] the template of every routable id, from the table
  it('gives every id of the table the home or the trust template while no page is routed', () => {
    const templates = Object.keys(ROUTES).map((id) => [id, templateOf(id as keyof typeof ROUTES)]);
    expect(templates.filter(([, template]) => template === 'calculator')).toEqual([]);
    expect(templates.find(([id]) => id === 'home')?.[1]).toBe('home');
  });
});
