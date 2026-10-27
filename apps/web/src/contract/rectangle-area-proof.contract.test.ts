import { existsSync, readFileSync } from 'node:fs';
import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { enRectangleArea } from '@maestro-calc/i18n/catalogs/en/rectangle-area';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { describe, expect, it } from 'vitest';
import { renderComponent } from '../__testing__/render-component.ts';
import { rectangleAreaPage } from '../calculator/rectangle-area/page.ts';
import { inputId } from '../calculator/ids.ts';
import { textKeysOf } from '../calculator/texts.ts';
import CalculatorBody from '../components/calculator/CalculatorBody.astro';
import type { CalculatorContent } from '../components/calculator/model.ts';
import { pageViewOf } from '../lib/page-view.ts';
import { ROUTES } from '../routing/routes.ts';
import { sitemapXml } from '../seo/sitemap.ts';
import { buildClient } from './__testing__/client-build.ts';
import { entrySourceOf, graphViolations, reaches } from './__testing__/client-graph.ts';
import { expectWithinJsBudget } from './__testing__/js-budget.ts';
import { fromRoot } from './root.ts';

/**
 * The rectangle-area proof: the second calculator is mounted by the generic mount with no slot, and
 * it is not routed. The proof is a test-only entry, its rendered markup and the lookups of the mount
 * (calculator-web-core › [CWC4], [CWC32], [CWC33], [CWC36]).
 */
const PROOF = fromRoot('apps/web/src/contract/__testing__/rectangle-area-entry.ts');
const PROOF_SOURCE = `import '${PROOF}';`;

describe('rectangle-area proof entry: source graph and size (calculator-web-core › [CWC4], [CWC36])', () => {
  // spec: calculator-web-core › [CWC4] no slot file and no concrete file is reached
  it('mounts the page module and reaches no slot file and no concrete file', async () => {
    const { modules } = await buildClient(PROOF_SOURCE);
    expect(reaches(modules, '/apps/web/src/contract/__testing__/rectangle-area-entry.ts')).toBe(
      true,
    );
    expect(reaches(modules, '/apps/web/src/client/mount.ts')).toBe(true);
    expect(reaches(modules, '/apps/web/src/calculator/controller.ts')).toBe(true);
    expect(reaches(modules, '/apps/web/src/calculator/rectangle-area/page.ts')).toBe(true);
    expect(
      modules.filter((id) => /\/apps\/web\/src\/calculator\/(slots|concrete)\//.test(id)),
    ).toEqual([]);
    expect(graphViolations(modules, 'rectangle-area')).toEqual([]);
  });

  it('is found when the entry imports a slot', async () => {
    const { modules } = await buildClient(
      `${PROOF_SOURCE}\nexport { answerSlot } from '${fromRoot('apps/web/src/calculator/slots/answer.ts')}';`,
    );
    expect(modules.some((id) => id.includes('/apps/web/src/calculator/slots/'))).toBe(true);
  });

  // spec: calculator-web-core › [CWC36] smaller than the concrete entry, within the budget; the size is printed
  it('weighs less than the concrete entry and at most the calculator JavaScript budget, and prints the size', async () => {
    const proof = await buildClient(PROOF_SOURCE);
    const concrete = await buildClient(entrySourceOf('concrete'));
    expectWithinJsBudget(
      'rectangle-area proof entry',
      proof.size,
      ` (concrete entry ${concrete.size.toLocaleString('en-US')} B)`,
    );
    expect(proof.size).toBeLessThan(concrete.size);
  });
});

const CONTENT: CalculatorContent = {
  updatedLabel: 'Last updated',
  updated: '2026-10-25',
  updatedText: 'October 25, 2026',
  sources: [{ name: 'Source', url: 'https://example.com/', retrieved: 'October 25, 2026' }],
};

const render = async () =>
  renderComponent(CalculatorBody, {
    view: pageViewOf(rectangleAreaPage, 'en', { ...enCommon, ...enRectangleArea, ...enSite }),
    content: CONTENT,
  });

type Root = Awaited<ReturnType<typeof render>>;

/** The selectors of the shared layout, which the generic mount also looks up with a failing lookup. */
const LAYOUT_SELECTORS = ['header a[hreflang]'];

/**
 * The string selector of every throwing lookup (`find(` and `findAs(`) of a source, with the per-key
 * lookups through `ids.ts` filled in for each text key. A selector that is not a plain string is
 * reported as such.
 */
const throwingSelectors = (source: string, keys: readonly string[]): string[] =>
  Array.from(
    source.matchAll(/\b(?:find|findAs)\(\s*[\w.]+,\s*(?:'([^']*)'|"([^"]*)"|`([^`]*)`)/g),
    (found) => found[1] ?? found[2] ?? found[3] ?? '',
  ).flatMap((selector) => {
    if (!selector.includes('${')) return [selector];
    if (selector === '#${inputId(key)}') return keys.map((key) => `#${inputId(key)}`);
    return [`unresolved:${selector}`];
  });

/** The throwing selectors of a source that match nothing in the markup (the layout ones excepted). */
const lookupProblems = (source: string, root: Root, keys: readonly string[]): string[] =>
  throwingSelectors(source, keys).filter(
    (selector) => !LAYOUT_SELECTORS.includes(selector) && root.querySelector(selector) === null,
  );

describe('rectangle-area markup (calculator-web-core › [CWC33])', () => {
  // spec: calculator-web-core › [CWC33] no slot element, and the elements every page has
  it('has no slot element and the elements of a page with two fields and three outputs', async () => {
    const root = await render();
    expect(
      root.querySelectorAll(
        '[data-choice], [data-step], [data-shopping], [data-line], [data-fill], [data-line-note], [data-cost-row], [data-hint-row], [data-price-hint]',
      ),
    ).toHaveLength(0);
    expect(root.querySelector('#calc-length')).not.toBeNull();
    expect(root.querySelector('#calc-width')).not.toBeNull();
    expect(root.querySelectorAll('[data-unit]')).toHaveLength(2);
    expect(root.querySelectorAll('[data-copy]')).toHaveLength(1);
    expect(root.querySelectorAll('[data-copy-status]')).toHaveLength(1);
    expect(root.querySelectorAll('[data-primary]')).toHaveLength(1);
    expect(
      root.querySelectorAll('[data-output]').map((el) => [el.getAttribute('data-output'), el.text]),
    ).toEqual([
      ['areaFt2', '100.00'],
      ['areaYd2', '11.11'],
      ['areaM2', '9.29'],
    ]);
  });
});

describe('the lookups of the generic mount (calculator-web-core › [CWC33])', () => {
  const mount = readFileSync(fromRoot('apps/web/src/client/mount.ts'), 'utf8');
  const keys = textKeysOf(rectangleAreaPage.calculator);

  // spec: calculator-web-core › [CWC33] every failing lookup matches the rectangle-area markup
  it('finds, in the rectangle-area markup, every element a failing lookup of the mount needs', async () => {
    const selectors = throwingSelectors(mount, keys);
    expect(selectors).toEqual(
      expect.arrayContaining(['[data-primary]', '[data-copy]', '#calc-length', '#calc-width']),
    );
    expect(lookupProblems(mount, await render(), keys)).toEqual([]);
  });

  it('resolves the id of every text input of the module', async () => {
    const root = await render();
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) expect(root.querySelector(`#${inputId(key)}`), key).not.toBeNull();
  });

  // seeded: a slot selector inside a failing lookup is found
  it.each([
    ['a choice group', "find(root, '[data-choice]');", '[data-choice]'],
    ['a stepper', "findAs(root, '[data-step]', HTMLElement);", '[data-step]'],
    ['a cost row', 'find(document, "[data-cost-row]");', '[data-cost-row]'],
    ['a key that is not a text input', 'find(root, `#calc-ghost`);', '#calc-ghost'],
  ])('names %s in a failing lookup', async (_what, code, selector) => {
    expect(lookupProblems(`${mount}\n${code}`, await render(), keys)).toEqual([selector]);
  });

  it('does not flag a list lookup of a slot element', async () => {
    expect(
      lookupProblems(`${mount}\nfindAll(root, '[data-choice]');`, await render(), keys),
    ).toEqual([]);
  });
});

describe('rectangle-area stays unrouted (calculator-web-core › [CWC32])', () => {
  // spec: calculator-web-core › [CWC32] not in the route table, the sitemap, the catalogs or the entries
  it('is in no route, no sitemap row, no site catalog key and has no entry or island', () => {
    expect(Object.keys(ROUTES)).not.toContain('rectangle-area');
    expect(JSON.stringify(ROUTES)).not.toContain('rectangle-area');
    expect(sitemapXml()).not.toContain('rectangle-area');
    for (const catalog of [enSite, esSite]) {
      expect(Object.keys(catalog).filter((key) => key.includes('rectangle-area'))).toEqual([]);
    }
    expect(existsSync(fromRoot('apps/web/src/client/entries/rectangle-area.ts'))).toBe(false);
    expect(existsSync(fromRoot('apps/web/src/islands/RectangleAreaScript.astro'))).toBe(false);
  });

  it('keeps the proof entry among the test files', () => {
    expect(existsSync(PROOF)).toBe(true);
  });
});
