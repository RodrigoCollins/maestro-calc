import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { concretePage } from '../calculator/concrete/page.ts';
import { controllerOf } from '../calculator/controller.ts';
import { fromRoot } from '../contract/root.ts';
import { CALCULATOR_PAGES } from '../routing/templates.ts';
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

  // every module the site builds a page for passes the creation checks of the controller (K15,
  // OUTPUT_HINT), the ones the mount runs before the page comes alive
  it.each(Object.entries(PAGES))('builds the controller of %s without an error', (_id, entry) => {
    expect(() => controllerOf(entry.module)).not.toThrow();
  });
});

describe('CalculatorView follows the page id (calculator-web-core › [CWC26], [CWC27])', () => {
  const source = readFileSync(fromRoot('apps/web/src/views/CalculatorView.astro'), 'utf8');
  /** The keys of the `SCRIPTS` table, one row per page id. */
  const scriptIds = (code: string): string[] =>
    Array.from(
      /const SCRIPTS[^=]*=\s*\{([^}]*)\}/s.exec(code)?.[1]?.matchAll(/^\s*([\w-]+):/gm) ?? [],
      ([, id = '']) => id,
    );

  // spec: calculator-web-core › [CWC26] one script row for each calculator page id
  it('has a SCRIPTS row for each calculator page id and no other', () => {
    expect(scriptIds(source)).toEqual([...CALCULATOR_PAGES]);
  });

  it('reads the ids of a table from its keys', () => {
    expect(scriptIds('const SCRIPTS = {\n  a: A,\n  b: B,\n} as const;')).toEqual(['a', 'b']);
  });

  // spec: calculator-web-core › [CWC27] the view is built from the id it is given, never from one calculator
  it('builds its view with pageView and names no calculator outside the script table', () => {
    expect(source).toContain('pageView(id, locale)');
    expect(source).not.toContain('concreteView');
    const outside = source
      .replace(/^import .*$/gm, '')
      .replace(/const SCRIPTS[\s\S]*?\n\}[^\n]*\n/, '');
    expect(outside).not.toMatch(/concrete/i);
  });
});
