import { readFileSync } from 'node:fs';
import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { enRectangleArea } from '@maestro-calc/i18n/catalogs/en/rectangle-area';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { describe, expect, it } from 'vitest';
import { renderComponent } from '../__testing__/render-component.ts';
import { inputId } from '../calculator/ids.ts';
import { textKeysOf } from '../calculator/texts.ts';
import CalculatorBody from '../components/calculator/CalculatorBody.astro';
import type { CalculatorContent } from '../components/calculator/model.ts';
import { pageViewOf } from '../lib/page-view.ts';
import { buildClient } from './__testing__/client-build.ts';
import { entrySourceOf, graphViolations, reaches } from './__testing__/client-graph.ts';
import { expectWithinJsBudget } from './__testing__/js-budget.ts';
import { slotFreePage } from './__testing__/slot-free-page.ts';
import { fromRoot } from './root.ts';

/**
 * The slot-free proof: a test-only page module (the rectangle-area calculator with no slot) is
 * mounted by the generic mount. The proof is a test-only entry, its rendered markup and the lookups
 * of the mount (calculator-web-core › [CWC4], [CWC33], [CWC36]). No routed page is slot-free, so
 * the no-slot branches of the mount are covered here alone.
 */
const PROOF = fromRoot('apps/web/src/contract/__testing__/slot-free-entry.ts');
const PROOF_SOURCE = `import '${PROOF}';`;

describe('slot-free proof entry: source graph and size (calculator-web-core › [CWC4], [CWC36])', () => {
  // spec: calculator-web-core › [CWC4] no slot file and no concrete file is reached
  it('mounts the page module and reaches no slot file and no concrete file', async () => {
    const { modules } = await buildClient(PROOF_SOURCE);
    expect(reaches(modules, '/apps/web/src/contract/__testing__/slot-free-entry.ts')).toBe(true);
    expect(reaches(modules, '/apps/web/src/client/mount.ts')).toBe(true);
    expect(reaches(modules, '/apps/web/src/calculator/controller.ts')).toBe(true);
    expect(reaches(modules, '/apps/web/src/contract/__testing__/slot-free-page.ts')).toBe(true);
    expect(
      modules.filter((id) => /\/apps\/web\/src\/calculator\/(slots|concrete)\//.test(id)),
    ).toEqual([]);
    // spec: calculator-web-core › [CWC43] the proof entry reaches no drawing writer either
    expect(reaches(modules, '/apps/web/src/client/draw.ts')).toBe(false);
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
      'slot-free proof entry',
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
    view: pageViewOf(slotFreePage, 'en', { ...enCommon, ...enRectangleArea, ...enSite }),
    content: CONTENT,
  });

type Root = Awaited<ReturnType<typeof render>>;

/** The selectors of the shared layout, which the generic mount also looks up with a failing lookup. */
const LAYOUT_SELECTORS = ['header a[hreflang]'];

/**
 * The source without the definition of `findAs`, whose body forwards its `selector` to `find`: the
 * one lookup whose selector is not written at the call.
 */
const withoutFindAs = (source: string): string =>
  source.replace(/^const findAs = [\s\S]*?^};$/m, '');

/** A throwing lookup: its receiver, then a string selector (groups 1 to 3) or anything else (4). */
const LOOKUP = /\b(?:find|findAs)\(\s*[\w.]+,\s*(?:'([^']*)'|"([^"]*)"|`([^`]*)`|([^,)]+))/g;

/**
 * The string selector of every throwing lookup (`find(` and `findAs(`) of a source, with the per-key
 * lookups through `ids.ts` filled in for each text key. A selector that is not a plain string
 * (`non-literal lookup: <argument>`) or a template that is not the per-key one (`unresolved:`) is a
 * problem by itself, so no lookup is skipped.
 */
const throwingSelectors = (source: string, keys: readonly string[]): string[] =>
  Array.from(withoutFindAs(source).matchAll(LOOKUP), (found) =>
    found[4] === undefined
      ? (found[1] ?? found[2] ?? found[3] ?? '')
      : `non-literal lookup: ${found[4].trim()}`,
  ).flatMap((selector) => {
    if (!selector.includes('${')) return [selector];
    if (selector === '#${inputId(key)}') return keys.map((key) => `#${inputId(key)}`);
    return [`unresolved:${selector}`];
  });

/** Whether an entry of `throwingSelectors` is a problem by itself rather than a selector to try. */
const isUncheckable = (selector: string): boolean =>
  selector.startsWith('non-literal lookup: ') || selector.startsWith('unresolved:');

/**
 * The throwing lookups of a source that cannot be checked or match nothing in the markup (the
 * layout ones excepted).
 */
const lookupProblems = (source: string, root: Root, keys: readonly string[]): string[] =>
  throwingSelectors(source, keys).filter(
    (selector) =>
      isUncheckable(selector) ||
      (!LAYOUT_SELECTORS.includes(selector) && root.querySelector(selector) === null),
  );

describe('slot-free markup (calculator-web-core › [CWC33], [CWC45])', () => {
  // spec: calculator-web-core › [CWC33] no slot element, and the elements every page has
  it('has no slot element and the elements of a page with two fields and three outputs', async () => {
    const root = await render();
    expect(
      root.querySelectorAll(
        '[data-choice], [data-step], [data-shopping], [data-line], [data-fill], [data-line-note], [data-cost], [data-hint-row], [data-price-hint], [data-drawing]',
      ),
    ).toHaveLength(0);
    expect(root.querySelector('#calc-length')).not.toBeNull();
    expect(root.querySelector('#calc-width')).not.toBeNull();
    expect(root.querySelectorAll('[data-unit]')).toHaveLength(2);
    expect(root.querySelectorAll('[data-copy]')).toHaveLength(1);
    expect(root.querySelectorAll('[data-copy-status]')).toHaveLength(1);
    // spec: calculator-web-core › [CWC47] the share anchor is generic: every page has it
    expect(root.querySelectorAll('a[data-share][hidden]:not([href])')).toHaveLength(1);
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
  const keys = textKeysOf(slotFreePage.calculator);

  // spec: calculator-web-core › [CWC33] every failing lookup matches the slot-free markup
  it('finds, in the slot-free markup, every element a failing lookup of the mount needs', async () => {
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
    ['a cost row', 'find(document, "[data-cost]");', '[data-cost]'],
    ['a key that is not a text input', 'find(root, `#calc-ghost`);', '#calc-ghost'],
    // spec: calculator-web-core › [CWC44] a throwing lookup of the drawing box is found
    ['the drawing box', "find(root, '[data-drawing]');", '[data-drawing]'],
  ])('names %s in a failing lookup', async (_what, code, selector) => {
    expect(lookupProblems(`${mount}\n${code}`, await render(), keys)).toEqual([selector]);
  });

  // judgment G3: a lookup whose selector is not written at the call is reported, never skipped
  it.each([
    ['a variable', 'find(root, SELECTOR);', 'non-literal lookup: SELECTOR'],
    [
      'a forwarded parameter outside findAs',
      'findAs(root, selector, HTMLElement);',
      'non-literal lookup: selector',
    ],
    ['a template that is not the per-key one', 'find(root, `#${other}`);', 'unresolved:#${other}'],
  ])('reports %s in a failing lookup', async (_what, code, problem) => {
    expect(lookupProblems(`${mount}\n${code}`, await render(), keys)).toEqual([problem]);
  });

  it('skips the one forwarding call, the `find` inside `findAs`, and no other', () => {
    expect(mount).toContain('const found = find(root, selector);');
    expect(throwingSelectors(mount, keys).filter((s) => s.startsWith('non-literal'))).toEqual([]);
    expect(
      throwingSelectors(
        'const findAs = (root, selector) => {\n  return find(root, selector);\n};\nfind(root, other);',
        keys,
      ),
    ).toEqual(['non-literal lookup: other']);
  });

  // spec: calculator-web-core › [CWC44], [CWC47] the box and the share link are looked up as lists
  it('looks up neither the drawing box nor the share link with a throwing lookup', () => {
    expect(
      throwingSelectors(mount, keys).filter((selector) =>
        ['[data-drawing]', '[data-share]'].includes(selector),
      ),
    ).toEqual([]);
  });

  // spec: calculator-web-core › [CWC47], calculator-page › [CP81] the share anchor is a list, revealed
  // with the copy button; the mount writes its href and nothing else, and listens on the form only
  it('reveals the share anchor with the copy button and writes only its href', () => {
    expect(mount).toContain("shares: findAll(root, '[data-share]')");
    expect(mount).toContain("'[data-copy][hidden], [data-share][hidden], [data-step] [hidden]'");
    expect(Array.from(mount.matchAll(/\bshare\.(\w+)\(/g), ([, member]) => member)).toEqual([
      'setAttribute',
      'getAttribute',
    ]);
    expect(mount).toMatch(/share\.setAttribute\('href', shareHref\(/);
    expect(
      Array.from(mount.matchAll(/([\w.]+)\.addEventListener\(/g), ([, target]) => target),
    ).toEqual(['ui.form', 'ui.form', 'ui.form', 'ui.form']);
  });

  // trim C of blueprint-panel: the cost row holds its hint, so the hint-row hook is gone
  it('looks up no hint row: the cost figure and its hint are spans of one row', () => {
    expect(mount).not.toContain('data-hint-row');
    expect(mount).toContain("'[data-cost], [data-price-hint]'");
  });

  it('does not flag a list lookup of a slot element', async () => {
    expect(
      lookupProblems(`${mount}\nfindAll(root, '[data-choice]');`, await render(), keys),
    ).toEqual([]);
  });
});
