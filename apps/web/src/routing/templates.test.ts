import { describe, expect, it } from 'vitest';
import { NOT_FOUND_ID, ROUTES } from './routes.ts';
import { CALCULATOR_PAGES, templateOf, templateProblems } from './templates.ts';

describe('page templates (site-routing-i18n › [SR17], [SR18] logic)', () => {
  // spec: site-routing-i18n › [SR18] the template of home, a trust id and the not-found page
  it.each([
    ['home', 'home'],
    ['methodology', 'trust'],
    ['privacy', 'trust'],
    [NOT_FOUND_ID, 'notFound'],
  ] as const)('gives %s the %s template', (id, template) => {
    expect(templateOf(id)).toBe(template);
  });

  // derived: every id of the calculator page list, whatever it holds (the lists against the registry
  // are contract/templates.contract.test.ts)
  it('gives every calculator page the calculator template', () => {
    expect(CALCULATOR_PAGES.length).toBeGreaterThan(0);
    for (const id of CALCULATOR_PAGES) expect(templateOf(id), id).toBe('calculator');
  });

  it('gives an id of the calculator list the calculator template', () => {
    expect(templateOf('about', ['about'])).toBe('calculator');
    expect(templateOf('about', [])).toBe('trust');
    expect(templateOf('home', ['about'])).toBe('home');
  });
});

describe('page lists against the table and the registry (site-routing-i18n › [SR17])', () => {
  const withoutConcrete = Object.fromEntries(
    Object.entries(ROUTES).filter(([id]) => id !== 'concrete'),
  );
  const routes = ROUTES;
  const registry = ['rectangle-area', 'concrete'];

  it('has no problem once concrete is a page and rectangle-area is pageless', () => {
    expect(templateProblems(routes, ['concrete'], ['rectangle-area'], registry)).toEqual([]);
  });

  // spec: site-routing-i18n › [SR17] each failure names the id
  it('names a page id that is not in the route table', () => {
    expect(templateProblems(withoutConcrete, ['concrete'], ['rectangle-area'], registry)).toEqual([
      'concrete: page id is not in the route table',
    ]);
  });

  it('names a registry calculator that is in neither list', () => {
    expect(templateProblems(routes, [], ['rectangle-area'], registry)).toEqual([
      'concrete: registry calculator is in neither the page list nor PAGELESS',
    ]);
  });

  it('names an id that is in both lists', () => {
    expect(
      templateProblems(routes, ['concrete'], ['rectangle-area', 'concrete'], registry),
    ).toEqual(['concrete: id is in both the page list and PAGELESS']);
  });

  it('names a PAGELESS id that is not in the registry', () => {
    expect(templateProblems(routes, [], ['rectangle-area', 'concrete', 'ghost'], registry)).toEqual(
      ['ghost: PAGELESS id is not in the registry'],
    );
  });

  it('names a page id that is not a registry calculator', () => {
    expect(templateProblems(routes, ['about', 'concrete'], ['rectangle-area'], registry)).toEqual([
      'about: page id is not a registry calculator',
    ]);
  });
});
