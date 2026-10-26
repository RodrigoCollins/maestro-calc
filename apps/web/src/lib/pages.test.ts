import { describe, expect, it } from 'vitest';
import { concretePage } from '../calculator/concrete/page.ts';
import { CALCULATOR_PAGES } from '../routing/templates.ts';
import { concreteView } from './page-view.ts';
import { PAGES, pageView } from './pages.ts';

describe('the per-id page table (calculator-web-core › [CWC23], [CWC26], [CWC27])', () => {
  // spec: calculator-web-core › [CWC27] the view follows the id
  it('holds the module of each calculator page id, and a catalog for each locale', () => {
    expect(Object.keys(PAGES)).toEqual([...CALCULATOR_PAGES]);
    expect(PAGES.concrete.module).toBe(concretePage);
    expect(Object.keys(PAGES.concrete.catalogs)).toEqual(['en', 'es']);
    expect(PAGES.concrete.catalogs.en['calc.concrete.title']).toBe('Concrete Calculator');
    expect(PAGES.concrete.catalogs.es['calc.concrete.title']).toBe('Calculadora de Concreto');
  });

  // spec: calculator-web-core › [CWC27] the page id picks the module
  it.each(['en', 'es'] as const)('builds the %s view of the module the id names', (locale) => {
    const view = pageView('concrete', locale);
    expect(view.id).toBe('concrete');
    expect(view.title).toBe(locale === 'en' ? 'Concrete Calculator' : 'Calculadora de Concreto');
  });

  // spec: calculator-web-core › [CWC23] the table builds the view the concrete builder built
  it.each(['en', 'es'] as const)('builds the same %s view as the concrete builder', (locale) => {
    expect(pageView('concrete', locale)).toEqual(concreteView(locale));
  });
});
