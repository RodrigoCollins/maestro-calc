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

  // spec: site-routing-i18n › [SR17] a registry calculator has its page or is pageless, derived from the registry
  it('keeps every registry calculator in exactly one list', () => {
    expect(registry.length).toBeGreaterThan(1);
    for (const id of registry) {
      expect([pageIds.includes(id), PAGELESS.includes(id)].filter(Boolean), id).toHaveLength(1);
    }
    expect([...CALCULATOR_PAGES, ...PAGELESS].toSorted()).toEqual(registry.toSorted());
    expect(CALCULATOR_PAGES.length).toBeGreaterThan(0);
  });

  // spec: site-routing-i18n › [SR17] each failure names the id
  it.each([
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
  it('gives home, each calculator page and each trust page their template', () => {
    const templates = Object.keys(ROUTES).map((id) => [id, templateOf(id)]);
    expect(templates.filter(([, template]) => template === 'calculator')).toEqual(
      CALCULATOR_PAGES.map((id) => [id, 'calculator']),
    );
    expect(templates.find(([id]) => id === 'home')?.[1]).toBe('home');
    expect(templates.filter(([, template]) => template === 'trust')).toHaveLength(
      Object.keys(ROUTES).length - 1 - CALCULATOR_PAGES.length,
    );
  });

  // spec: site-routing-i18n › [SR17] a page id outside the table is named
  it('names a calculator page id that the route table lacks', () => {
    const withoutConcrete = Object.fromEntries(
      Object.entries(ROUTES).filter(([id]) => id !== 'concrete'),
    );
    expect(
      templateProblems(
        withoutConcrete,
        ['concrete'],
        ['rectangle-area', 'gravel', 'mulch', 'topsoil', 'paint', 'drywall', ...PAGELESS],
        registry,
      ),
    ).toEqual(['concrete: page id is not in the route table']);
  });
});
