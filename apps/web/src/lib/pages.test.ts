import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { concretePage } from '../calculator/concrete/page.ts';
import { slotFreePage } from '../contract/__testing__/slot-free-page.ts';
import { controllerOf } from '../calculator/controller.ts';
import { fromRoot } from '../contract/root.ts';
import { CALCULATOR_PAGES } from '../routing/templates.ts';
import { SCRIPTS } from '../views/scripts.ts';
import { PAGES, headStyleOf, pageView, type PageEntry } from './pages.ts';
import { drawingCss, reserveCss } from './reserve.ts';

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
    const { module }: PageEntry = entry;
    expect(() => controllerOf(module)).not.toThrow();
  });
});

/** A row whose module declares no slot, so its head carries only what its reserve adds. */
const PLAIN = { module: slotFreePage, catalogs: PAGES['rectangle-area'].catalogs };

describe('the head style of a page row (calculator-page › [CP65], design K6)', () => {
  // spec: calculator-page › [CP65] a row with a reserve yields the builder output, one without yields nothing
  it('is the reserve builder output for a row that has a reserve and nothing for one that has none', () => {
    const reserve = { answer: [5, [30, 4]], notice: [6] } as const;
    expect(headStyleOf({ ...PLAIN, reserve })).toBe(reserveCss(reserve));
    expect(headStyleOf(PLAIN)).toBeUndefined();
  });

  // an empty reserve writes no CSS, so the head carries no empty `<style></style>`
  it('is nothing for a row whose reserve is empty', () => {
    expect(headStyleOf({ ...PLAIN, reserve: {} })).toBeUndefined();
  });

  it('gives the concrete row no reserve, so its pages carry no extra byte', () => {
    expect('reserve' in PAGES.concrete).toBe(false);
  });
  // spec: blueprint-drawing › [BD22] the box rule is per page: in the head of a page that draws only
  it('adds the drawing box rule after the reserve of a page that draws, and nothing to one that does not', () => {
    const rectangle = PAGES['rectangle-area'];
    expect(drawingCss({ width: 300, height: 200 })).toBe(
      '[data-drawing]{display:block;width:100%;max-width:24rem;aspect-ratio:3/2;margin-bottom:var(--space-3);font:600 17px var(--font-display)}' +
        // from 48rem the panel is two columns: the figures, rows and notes left, the drawing right
        // across more rows than any panel has children, the empty last one taking what it adds
        '@media(min-width:48rem){.calc-result{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);grid-template-rows:repeat(11,auto) 1fr;column-gap:var(--space-4);align-items:start}' +
        // the drawing fills column 2 of every row, so the other children flow into column 1
        '.calc-result>[data-drawing]{grid-column:2;grid-row:1/-1;max-width:none;margin:0}}' +
        // from 64rem the panel sits in the half-width right column, one column again (blueprint-ui slice 5)
        '@media(min-width:64rem){.calc-side>.calc-result{display:block}.calc-side>.calc-result>[data-drawing]{margin:0 0 var(--space-3)}}',
    );
    expect(headStyleOf(rectangle)).toBe(
      `${String(reserveCss(rectangle.reserve))}${drawingCss({ width: 300, height: 200 })}`,
    );
    expect(headStyleOf({ module: rectangle.module, catalogs: rectangle.catalogs })).toBe(
      drawingCss({ width: 300, height: 200 }),
    );
    expect(headStyleOf(PAGES.concrete)).toBe(drawingCss({ width: 300, height: 200 }));
    expect(headStyleOf(PLAIN)).toBeUndefined();
  });

  // spec: blueprint-drawing › [BD22] the shared stylesheet carries no drawing rule
  it('leaves the drawing rule out of the shared calculator stylesheet', () => {
    expect(readFileSync(fromRoot('apps/web/src/styles/calculator.css'), 'utf8')).not.toContain(
      'data-drawing',
    );
  });
});

describe('CalculatorView follows the page id (calculator-web-core › [CWC26], [CWC27])', () => {
  const source = readFileSync(fromRoot('apps/web/src/views/CalculatorView.astro'), 'utf8');

  // spec: calculator-web-core › [CWC26] one script row for each calculator page id, a quoted key included
  it('has a SCRIPTS row for each calculator page id and no other', () => {
    expect(Object.keys(SCRIPTS)).toEqual([...CALCULATOR_PAGES]);
  });

  // spec: calculator-web-core › [CWC27] the view is built from the id it is given, never from one calculator
  it('names no calculator in the view and reads its script from the table', () => {
    expect(source).not.toContain('concreteView');
    expect(source.replace(/^import .*$/gm, '')).not.toMatch(/concrete/i);
    expect(source).toContain("from './scripts.ts'");
  });
});
