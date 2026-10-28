import { globSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrast } from '../contract/contrast.ts';
import SiteFooter from '../components/SiteFooter.astro';
import SiteHeader from '../components/SiteHeader.astro';
import LanguageSwitch from '../components/LanguageSwitch.astro';
import SkipLink from '../components/SkipLink.astro';
import Wordmark from '../components/Wordmark.astro';
import { fromRoot } from '../contract/root.ts';
import { renderComponent } from '../__testing__/render-component.ts';
import { lengthsOf, mediaBlocksOf, mediaCountOf } from '../__testing__/css-media.ts';
import { headStyleOf, PAGES, type PageEntry } from '../lib/pages.ts';
import { CALCULATOR_PAGES } from '../routing/templates.ts';
import { reserveCss } from '../lib/reserve.ts';

const stylesheets = globSync('apps/web/src/styles/*.css', { cwd: fromRoot() }).sort();
const read = (name: string): string => readFileSync(fromRoot('apps/web/src/styles', name), 'utf8');
const tokens = read('tokens.css');
const base = read('base.css');

type Declarations = Record<string, string>;

/** Flat rules of a stylesheet (no nesting): each selector of a list to its merged declarations. */
const rulesOf = (css: string): Map<string, Declarations> => {
  const rules = new Map<string, Declarations>();
  for (const [, selectors = '', body = ''] of css
    .replaceAll(/\/\*[\s\S]*?\*\//g, '')
    .replaceAll(/@media[^{]+\{(?:[^{}]*\{[^{}]*\})*\s*\}/g, '')
    .matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const declarations = Object.fromEntries(
      body
        .split(';')
        .map((declaration) => declaration.split(/:(.*)/s).map((part) => part.trim()))
        .filter(([property]) => property !== undefined && property !== '')
        .map(([property = '', value = '']) => [property, value]),
    );
    for (const selector of selectors
      .split(',')
      .map((part) => part.trim().replaceAll(/\s+/g, ' '))) {
      rules.set(selector, { ...rules.get(selector), ...declarations });
    }
  }
  return rules;
};

/** Each `@media` block as `[condition, its flat rules]`; `rulesOf` skips them. */
const mediaRulesOf = (css: string): [string, Map<string, Declarations>][] =>
  mediaBlocksOf(css.replaceAll(/\/\*[\s\S]*?\*\//g, '')).map(([query, inner]) => [
    query,
    rulesOf(inner),
  ]);

/** The e2e widths: the numbers of `const WIDTHS = [...]` in `layout.spec.ts`. */
const widths = (
  /const WIDTHS = \[([^\]]+)\]/.exec(
    readFileSync(fromRoot('tooling/site-browser/e2e/layout.spec.ts'), 'utf8'),
  )?.[1] ?? ''
)
  .split(',')
  .map((width) => Number(width.trim()))
  .filter((width) => width > 0);

/**
 * What is wrong with the breakpoints of a stylesheet: a length that is not `rem`, and a rem
 * breakpoint whose edges (the first pixel width where it applies and the one before) are not among
 * `widths`. Each problem names the media condition. Nothing for no CSS (an empty reserve).
 */
const breakpointProblems = (css: string | undefined, edges: readonly number[]): string[] =>
  mediaBlocksOf(css ?? '').flatMap(([query]) => {
    const lengths = lengthsOf(query);
    if (lengths.length === 0) return [`${query}: no length`];
    return lengths.flatMap(([value, unit]) => {
      if (unit !== 'rem') return [`${query}: ${unit}`];
      const first = Math.ceil(value * 16);
      return [first - 1, first]
        .filter((width) => !edges.includes(width))
        .map((width) => `${query}: no width ${String(width)}`);
    });
  });

const tokenRules = rulesOf(tokens);
const baseRules = rulesOf(base);
const root = tokenRules.get(':root') ?? {};

/** A declared value with `var(--x)` replaced by the token it names. */
const resolve = (value: string | undefined): string =>
  (value ?? '').replaceAll(/var\((--[\w-]+)\)/g, (_, name: string) => root[name] ?? `<${name}>`);

const colour = (name: string): string => resolve(`var(${name})`).toUpperCase();
const rem = (value: string): number => Number.parseFloat(value) * 16;

const INK = '#0E2240';
const LINK = '#1D4ED8';
const ORANGE = '#F06A1D';
const SECONDARY = '#56616B';
const GROUND = '#EEF1EF';
const SURFACE = '#FFFFFF';
const WHATSAPP = '#1FAF5A';
const ON_WHATSAPP = '#06210F';
const ERROR = '#B42318';

describe('Blueprint tokens (site-shell › Design tokens)', () => {
  // spec: site-shell › [SS5]
  it('declares the seven palette values, the WhatsApp text colour and a light colour scheme on :root', () => {
    const values = Object.values(root).map((value) => value.toUpperCase());
    for (const expected of [INK, LINK, ORANGE, SECONDARY, GROUND, SURFACE, WHATSAPP, ON_WHATSAPP]) {
      expect(values, expected).toContain(expected);
    }
    expect(root['color-scheme']).toBe('light');
  });

  // review RD-8: tokens are named by role, and each names its docs/design/direction.md swatch
  it.each([
    ['--color-text', INK, 'Blueprint ink'],
    ['--color-link', LINK, 'Chalk line'],
    ['--color-accent', ORANGE, 'Safety orange'],
    ['--color-text-secondary', SECONDARY, 'Form gray'],
    ['--color-ground', GROUND, 'Plan paper'],
    ['--color-surface', SURFACE, 'Sheet white'],
    ['--color-whatsapp', WHATSAPP, 'WhatsApp'],
    ['--color-on-whatsapp', ON_WHATSAPP, 'WhatsApp'],
    ['--color-error', ERROR, 'Error red'],
  ])('names %s by role with the %s swatch comment', (name, hex, swatch) => {
    expect(colour(name)).toBe(hex);
    const line = tokens.split('\n').find((text) => text.includes(`${name}:`));
    expect(line, name).toMatch(new RegExp(String.raw`/\*.*${swatch}.*\*/`));
  });

  it('has no colour token named after its hue or after the old swatch names', () => {
    expect(
      Object.keys(root).filter((name) => /^--color-(ink|orange|secondary)$/.test(name)),
    ).toEqual([]);
  });

  // spec: site-shell › [SS6]
  it('has no dark theme in any stylesheet', () => {
    for (const name of stylesheets) {
      expect(readFileSync(fromRoot(name), 'utf8'), name).not.toContain('prefers-color-scheme');
    }
  });

  it('sets the page ground and the ink text colour on the body', () => {
    const body = baseRules.get('body');
    expect(colour('--color-ground')).toBe(GROUND);
    expect(resolve(body?.['background']).toUpperCase()).toBe(GROUND);
    expect(resolve(body?.['color']).toUpperCase()).toBe(INK);
    expect(body?.['font-family']).toBe('var(--font-body)');
    expect(baseRules.get('h1')?.['font-family']).toBe('var(--font-display)');
  });

  // spec: site-shell › [SS11] source side
  it('sets a body size of at least 17 px', () => {
    expect(rem(resolve(baseRules.get('body')?.['font-size']))).toBeGreaterThanOrEqual(17);
    expect(rem(resolve(baseRules.get('body')?.['font-size']))).toBe(17);
  });

  it('sets the touch target token to 2.75rem (44 px)', () => {
    expect(root['--target-size']).toBe('2.75rem');
    expect(rem('2.75rem')).toBe(44);
  });
});

describe('Blueprint primitives (site-shell › [SS24], [SS25], [SS26])', () => {
  // spec: site-shell › [SS24] the display size is a fluid clamp above the H1 size
  it('declares --text-display as a clamp with rem bounds, its minimum above --text-h1', () => {
    const display = root['--text-display'] ?? '';
    const bounds = /^clamp\(\s*([\d.]+)rem\s*,[^,]+,\s*([\d.]+)rem\s*\)$/.exec(display);
    expect(display, '--text-display').toMatch(/^clamp\(/);
    expect(bounds, '--text-display bounds are rem').not.toBeNull();
    expect(Number(bounds?.[1])).toBeGreaterThan(Number.parseFloat(root['--text-h1'] ?? '0'));
    expect(Number(bounds?.[2])).toBeGreaterThan(Number(bounds?.[1]));
  });

  // spec: site-shell › [SS24] only the home hero reads the display size
  it('reads --text-display in HomeView.astro and nowhere else', () => {
    const readers = globSync('apps/web/src/**/*.{astro,css,ts}', { cwd: fromRoot() }).filter(
      (name) =>
        !/\.test(-d)?\.ts$/.test(name) &&
        readFileSync(fromRoot(name), 'utf8').includes('var(--text-display)'),
    );
    expect(readers).toEqual(['apps/web/src/views/HomeView.astro']);
  });

  // spec: site-shell › [SS31] hero text over the ink and over the lightest grid line
  it('keeps the hero text at 4.5:1 over the ink ground and over the lightest grid line', () => {
    const hero = readFileSync(fromRoot('apps/web/src/views/HomeView.astro'), 'utf8');
    const mixed = /color-mix\(in srgb, var\(--color-surface\) (\d+)%, transparent\)/.exec(hero);
    expect(mixed, 'the grid line is a surface mix over transparent').not.toBeNull();
    const share = Number(mixed?.[1]) / 100;
    // Sheet white at that share over the ink, per channel
    const line = `#${[1, 3, 5]
      .map((at) => Number.parseInt(INK.slice(at, at + 2), 16) * (1 - share) + 255 * share)
      .map((value) => Math.round(value).toString(16).padStart(2, '0'))
      .join('')}`;
    expect(line).not.toBe(INK.toLowerCase());
    expect(contrast(SURFACE, INK)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(SURFACE, line)).toBeGreaterThanOrEqual(4.5);
  });

  // spec: site-shell › [SS25] one grid cell, one tick weight, no tick length, no radius token
  it('pins --grid-size to 1rem and --tick-weight to a positive length', () => {
    expect(root['--grid-size']).toBe('1rem');
    expect(root['--tick-weight']).toMatch(/^\d*\.?\d+(px|rem)$/);
    expect(Number.parseFloat(root['--tick-weight'] ?? '0')).toBeGreaterThan(0);
  });

  // spec: site-shell › [SS25] the tick length is the grid cell, so no second token carries it
  it('declares no tick-length token and no custom property named after a radius', () => {
    expect(Object.keys(root).filter((name) => /tick-length|^--tick(?!-weight)/.test(name))).toEqual(
      [],
    );
    const everywhere = stylesheets.flatMap((name) =>
      [...readFileSync(fromRoot(name), 'utf8').matchAll(/(--[\w-]*radius[\w-]*)\s*:/g)].map(
        (match) => match[1],
      ),
    );
    expect(everywhere).toEqual([]);
  });

  // spec: site-shell › [SS26] square corners in the three global sheets, long-hands included
  it('uses no non-zero radius in the global sheets', () => {
    for (const name of stylesheets) {
      const css = readFileSync(fromRoot(name), 'utf8');
      const radii = [...css.matchAll(/[\w-]*radius\s*:\s*([^;}]+)/g)].map((match) => match[1]);
      expect(
        radii.filter((value) => !/^0(px|rem)?(\s+0(px|rem)?)*$/.test(value?.trim() ?? '')),
        name,
      ).toEqual([]);
    }
  });

  // spec: site-shell › [SS30] the global sheets stay tokens, base and calculator
  it('keeps exactly the three global sheets', () => {
    expect(stylesheets.map((name) => name.split('/').pop())).toEqual([
      'base.css',
      'calculator.css',
      'tokens.css',
    ]);
  });
});

describe('contrast (site-shell › [SS7, SS14, SS16])', () => {
  it('keeps the WhatsApp label legible: near-black text on the WhatsApp green', () => {
    expect(contrast(ON_WHATSAPP, WHATSAPP)).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#FFFFFF', WHATSAPP)).toBeLessThan(4.5);
  });

  it('keeps the error red legible on the ground and on the white tool surface', () => {
    expect(contrast(ERROR, GROUND)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(ERROR, SURFACE)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps text at 4.5:1 or more on the page ground', () => {
    expect(contrast(INK, GROUND)).toBeGreaterThan(13);
    expect(contrast(LINK, GROUND)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(SECONDARY, GROUND)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(LINK, SURFACE)).toBeGreaterThanOrEqual(4.5);
  });

  // design W6: orange alone fails WCAG 1.4.11 on the ground, so the ink ring carries the 3:1
  it('shows why the focus ring needs the ink ring: orange alone is below 3:1 on the ground', () => {
    expect(contrast(ORANGE, GROUND)).toBeLessThan(3);
    expect(contrast(INK, GROUND)).toBeGreaterThanOrEqual(3);
    expect(contrast(INK, SURFACE)).toBeGreaterThanOrEqual(3);
  });

  it('draws the focus indicator as a 3 px orange outline with a 2 px ink ring, never none', () => {
    const focus = baseRules.get(':focus-visible');
    expect(resolve(focus?.['outline']).toUpperCase()).toBe(`3PX SOLID ${ORANGE}`);
    expect(resolve(focus?.['box-shadow']).toUpperCase()).toBe(`0 0 0 2PX ${INK}`);
    expect(base).not.toMatch(/outline:\s*(none|0)\b/);
  });
});

describe('skip link styles (site-shell › Skip link)', () => {
  it('is off-screen until it has focus, then visible', () => {
    expect(baseRules.get('.skip-link')?.['transform']).toBe('translateY(-150%)');
    expect(baseRules.get('.skip-link:focus')?.['transform']).toBe('none');
  });
});

// spec: site-shell › [SS15] source side
describe('touch targets (site-shell › Focus visibility and touch targets)', () => {
  it('defines one .tap-target utility at the target size in both directions', () => {
    const rule = baseRules.get('.tap-target');
    expect(rule?.['min-height']).toBe('var(--target-size)');
    expect(rule?.['min-width']).toBe('var(--target-size)');
  });

  // review RD-9: components opt in; base.css holds no selector keyed to a component class
  it.each(['.skip-link', '.wordmark', '.nav-link', '.footer-link', '.lang-switch'])(
    'keeps %s out of the global stylesheet size rules',
    (selector) => {
      expect(baseRules.get(selector)?.['min-height'], selector).toBeUndefined();
      expect(baseRules.get(selector)?.['min-width'], selector).toBeUndefined();
    },
  );

  const link = { href: '/x', label: 'X' };
  it.each([
    ['SkipLink', SkipLink, { label: 'Skip' }],
    ['Wordmark', Wordmark, { href: '/' }],
    [
      'LanguageSwitch',
      LanguageSwitch,
      { href: '/es', lang: 'es', hreflang: 'es-US', label: 'Español' },
    ],
    ['SiteFooter', SiteFooter, { contactLabel: 'Contact', email: 'a@b.c', links: [link] }],
    [
      'SiteHeader',
      SiteHeader,
      {
        homeHref: '/',
        navLabel: 'Main',
        links: [link],
        language: { href: '/es', lang: 'es', hreflang: 'es-US', label: 'Español' },
      },
    ],
  ])('%s marks every link as a tap target', async (_name, component, props) => {
    const document = await renderComponent(component, props);
    const anchors = document.querySelectorAll('a');
    expect(anchors.length).toBeGreaterThan(0);
    for (const anchor of anchors) expect(anchor.classList.contains('tap-target')).toBe(true);
  });
});

describe('Page gutter (G1 review carry-over)', () => {
  const main = baseRules.get('main');

  it('keeps main content off the screen edge with a 16 px gutter on phones', () => {
    expect(rem(resolve(main?.['padding']))).toBe(16);
  });

  it('centres main content in the page width, the same column as the header and footer', () => {
    expect(resolve(main?.['max-width'])).toBe('64rem');
    expect(main?.['margin']).toBe('0 auto');
  });
});

describe('calculator styles (calculator-page › Form controls, Layout stability; site-shell › Design tokens)', () => {
  const calculator = read('calculator.css');
  const rules = rulesOf(calculator);
  const declared = (selector: string, property: string): string =>
    resolve(rules.get(selector)?.[property]);

  // spec: calculator-page › Form controls: inputs at least 56 px, every other control the target size
  it('makes the text inputs 56 px tall and the buttons the 44 px target in both directions', () => {
    expect(rem(declared('.calc-field input', 'min-height'))).toBe(56);
    expect(declared('.calc-choice', 'min-height')).toBe('2.75rem');
    expect(declared('.calc-choice', 'min-width')).toBe('2.75rem');
  });

  // spec: calculator-page › Layout stability: figures in fixed-width cells with tabular digits
  // A flex item is blockified, so the row, cost and shopping figures keep the fixed cell; the
  // large figure stays inline, where `min-width` does not apply, so its digits start flush (mockup)
  it('sets the figures in tabular numerals, the row figures inside cells of a fixed width', () => {
    expect(declared('.calc-figure', 'font-variant-numeric')).toBe('tabular-nums');
    expect(declared('.calc-figure', 'min-width')).toMatch(/^\d+ch$/);
    expect(declared('.calc-figure', 'text-align')).toBe('right');
    expect(rules.get('.calc-figure')?.['display']).toBeUndefined();
    expect(rules.get('.calc-primary .calc-figure')?.['display']).toBeUndefined();
    expect(rules.get('.calc-primary')?.['display']).toBeUndefined();
    for (const row of ['.calc-row', '.calc-shopping', '.calc-cost']) {
      expect(declared(row, 'display'), row).toBe('flex');
    }
  });

  // spec: calculator-page › [CP14], [CP44]: the stepper and copy areas keep a fixed reserve
  it.each(['.calc-steppers'])('reserves a block size for %s', (selector) => {
    expect(rem(declared(selector, 'min-height')), selector).toBeGreaterThanOrEqual(44);
  });

  // spec: calculator-page › [CP64], design K13: the line counts the sweep measured, per range
  const STEPS = {
    '--answer-lines': {
      fallback: 5,
      steps: [
        [24.125, 4],
        [30.0625, 3],
        [45.625, 2],
      ],
    },
    '--notice-lines': {
      fallback: 6,
      steps: [
        [22.25, 5],
        [29, 4],
        [41.6875, 3],
      ],
    },
  } as const;
  const stepsOf = (css: string, property: string): [number, number][] =>
    mediaRulesOf(css).flatMap(([query, blockRules]) => {
      const count = blockRules.get(':root')?.[property];
      const width = lengthsOf(query)[0]?.[0] ?? NaN;
      return count === undefined ? [] : [[width, Number(count)]];
    });

  // spec: calculator-page › [CP59]-[CP61] the answer and the notice reserve a line count in their own unit
  it.each([
    ['.calc-answer', '--answer-lines', '--text-h3'],
    ['.calc-notice', '--notice-lines', '--text-base'],
  ] as const)('sizes %s as a line count times its own line unit', (selector, property, size) => {
    expect(rules.get(selector)?.['min-height']).toBe(
      `calc(var(${property}, ${String(STEPS[property].fallback)}) * var(${size}) * var(--leading-body))`,
    );
  });

  it.each(Object.keys(STEPS) as (keyof typeof STEPS)[])(
    'steps %s down at the measured rem widths',
    (property) => {
      const { fallback, steps } = STEPS[property];
      expect(stepsOf(calculator, property)).toEqual(steps);
      const found = stepsOf(calculator, property);
      expect(found.map(([width]) => width)).toEqual(
        found.map(([width]) => width).toSorted((a, b) => a - b),
      );
      for (const [at, [, count = 0]] of found.entries()) {
        expect(count).toBeLessThan(at === 0 ? fallback : (found[at - 1]?.[1] ?? 0));
      }
    },
  );

  // spec: calculator-page › [CP64] breakpoints are rem, whatever the syntax of the condition
  it.each([
    ['min-width', '(min-width: 30rem)', [[30, 'rem']]],
    ['range syntax', '(width>=30rem)', [[30, 'rem']]],
    ['px', '(min-width: 480px)', [[480, 'px']]],
  ])('reads the lengths of a %s condition', (_name, query, expected) => {
    expect(lengthsOf(query)).toEqual(expected);
  });

  // seeded: the parser reads every block it can and throws on one it cannot, never drops it
  it.each([
    ['two flat blocks', '@media (width>=1rem){a{b:c}}@media (width>=2rem){d{e:f}}', 2],
    ['a commented-out block', '/* @media (width>=1rem){a{b:c}} */@media (width>=2rem){d{e:f}}', 1],
  ])('parses %s', (_name, css, count) => {
    expect(mediaCountOf(css)).toBe(count);
    expect(mediaBlocksOf(css)).toHaveLength(count);
  });

  it.each([
    ['a nested @supports', '@media (width>=1rem){@supports (display:grid){a{b:c}}}'],
    [
      'a nested @supports after a flat rule',
      '@media (width>=1rem){a{b:c} @supports (display:grid){d{e:f}}}@media (width>=2rem){g{h:i}}',
    ],
  ])('throws on a block with %s inside @media', (_name, css) => {
    expect(() => mediaBlocksOf(css)).toThrow(/@media blocks/);
  });

  it('uses rem and never px in any media condition', () => {
    expect(mediaBlocksOf(calculator).length).toBe(mediaCountOf(calculator));
    const queries = mediaBlocksOf(calculator).map(([query]) => query);
    expect(queries.length).toBeGreaterThan(0);
    for (const query of queries) {
      expect(
        lengthsOf(query).filter(([, unit]) => unit !== 'rem'),
        query,
      ).toEqual([]);
    }
  });

  // spec: calculator-page › [CP64], design K13: every breakpoint has both its edges among the e2e widths
  it('puts both edges of every breakpoint in the WIDTHS of layout.spec.ts', () => {
    expect(widths.length, 'WIDTHS of layout.spec.ts').toBeGreaterThan(0);
    expect(mediaBlocksOf(calculator).length).toBeGreaterThan(0);
    expect(breakpointProblems(calculator, widths)).toEqual([]);
  });

  // The rows of the page table that declare a reserve (calculator-page › [CP73]); a page without one
  // keeps the shared counts of `calculator.css`.
  const reserved = Object.entries(PAGES).flatMap(([id, entry]) => {
    const { reserve } = entry as PageEntry;
    return reserve === undefined ? [] : [[id, reserve] as const];
  });

  it('has at least one reserve, each on the row of a routed calculator page, so the check below runs', () => {
    expect(reserved.length).toBeGreaterThan(0);
    for (const [id] of reserved) expect(CALCULATOR_PAGES, id).toContain(id);
  });

  // spec: calculator-page › [CP64] the CSS of every reserve of the page table passes the same checks
  it('keeps the reserve of every row that declares one in rem with both edges in WIDTHS', () => {
    for (const [id, reserve] of reserved) {
      expect(breakpointProblems(reserveCss(reserve), widths), id).toEqual([]);
    }
  });

  // spec: blueprint-drawing › [BD20], [BD22] the head style of a page (reserve and drawing box)
  // passes the same checks, so the two-column panel from 48rem has both its edges in WIDTHS
  it('keeps the whole head style of every row in rem with both edges in WIDTHS', () => {
    const styled = Object.entries(PAGES).flatMap(([id, entry]) => {
      const css = headStyleOf(entry);
      return css === undefined ? [] : [[id, css] as const];
    });
    expect(styled.length).toBeGreaterThan(0);
    for (const [id, css] of styled) expect(breakpointProblems(css, widths), id).toEqual([]);
  });

  // seeded: a px breakpoint and an edge missing from WIDTHS are each flagged, a clean reserve is not
  it.each([
    [
      'a px breakpoint',
      '@media(min-width:480px){.calculator{--answer-lines:2}}',
      ['(min-width:480px): px'],
    ],
    [
      'an edge missing from WIDTHS',
      reserveCss({ answer: [5, [31, 4]] }),
      ['(min-width:31rem): no width 495', '(min-width:31rem): no width 496'],
    ],
    // spec: calculator-page › [CP64] a condition with no length is no breakpoint the e2e widths can hold
    [
      'a condition with no length',
      '@media(prefers-reduced-motion:reduce){.calculator{--answer-lines:2}}',
      ['(prefers-reduced-motion:reduce): no length'],
    ],
    ['a clean breakpoint', reserveCss({ answer: [5, [30.0625, 4]] }), []],
  ])('flags %s', (_name, css, expected) => {
    expect(breakpointProblems(css, widths)).toEqual(expected);
  });

  // spec: calculator-page › [CP61] the copy reserve holds the mounted content, under one body line more
  it('reserves for the copy block its mounted content and less than one body line more', () => {
    const content = 4.6;
    const line = Number.parseFloat(resolve(`var(--text-base)`)) * Number(root['--leading-body']);
    const reserved = Number.parseFloat(declared('.calc-copy', 'min-height'));
    expect(reserved).toBeGreaterThanOrEqual(content);
    expect(reserved).toBeLessThan(content + line);
  });

  // The choice area is a grid with a gap; its reserved height is the row count of the page
  // (`style="--calc-rows:N"`, one row without it) times a row, plus one gap fewer than the rows (m-6).
  it('reserves the height of the tallest option, `--calc-rows` rows and the gaps between them, for the choice area', () => {
    const row = declared('.calc-field', 'min-height');
    expect(rem(row)).toBeGreaterThanOrEqual(96);
    expect(declared('.calc-choice-area', 'display')).toBe('grid');
    const gap = rules.get('.calc-choice-area')?.['gap'];
    expect(gap).toBe('var(--space-3)');
    expect(declared('.calc-choice-area', 'min-height')).toBe(
      `calc(var(--calc-rows, 1) * ${row} + (var(--calc-rows, 1) - 1) * ${resolve(gap)})`,
    );
  });

  it('has no rule for a class that no part renders', () => {
    expect([...rules.keys()]).not.toContain('.calc-fields');
  });

  // spec: calculator-page › Form controls: an invalid input says so in the error colour
  it('draws an invalid input in the error colour token, not the link colour', () => {
    expect(rules.get(".calc-field input[aria-invalid='true']")?.['border-color']).toBe(
      'var(--color-error)',
    );
  });

  // spec: calculator-page › Errors without a button: the message is in the error colour and the size of a hint
  it('draws the error message the script adds in the error colour token', () => {
    expect(declared('.calc-error', 'color')).toBe(
      declared(".calc-field input[aria-invalid='true']", 'border-color'),
    );
    expect(rules.get('.calc-error')?.['color']).toBe('var(--color-error)');
    expect(rules.get('.calc-error')?.['grid-column']).toBe('1 / -1');
  });

  // spec: calculator-page › Copy link: the read-only fallback field is a full-size input
  it('makes the copy fallback field as tall as the other inputs', () => {
    expect(rem(declared('.calc-fallback', 'min-height'))).toBe(56);
  });

  // spec: calculator-page › Accessibility of the interactive page: no animation, ring untouched
  it('animates nothing and leaves the focus ring to the base stylesheet', () => {
    expect(calculator).not.toMatch(/animation|transition|@keyframes/);
    expect(calculator).not.toMatch(/outline|:focus|box-shadow/);
  });

  // spec: calculator-page › Result panel: safety orange on the ink ground keeps the text contrast
  it('puts orange and white on the ink ground of the result panel at 4.5:1 or more', () => {
    expect(declared('.calc-result', 'background').toUpperCase()).toBe(INK);
    expect(declared('.calc-qty', 'color').toUpperCase()).toBe(ORANGE);
    expect(declared('.calc-result', 'color').toUpperCase()).toBe(SURFACE);
    expect(contrast(ORANGE, INK)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(SURFACE, INK)).toBeGreaterThanOrEqual(4.5);
  });

  // The stylesheet reaches a page through the one component that uses its classes.
  it('is imported by the CalculatorBody container', () => {
    const body = readFileSync(
      fromRoot('apps/web/src/components/calculator/CalculatorBody.astro'),
      'utf8',
    );
    expect(body).toContain("import '../../styles/calculator.css';");
  });

  // spec: site-quality › CSS budget: the sources of all stylesheets stay well inside 20,480 B
  it('keeps the sources of the three stylesheets inside the CSS budget', () => {
    const bytes = [tokens, base, calculator].reduce((sum, css) => sum + Buffer.byteLength(css), 0);
    expect(bytes).toBeLessThanOrEqual(20480);
  });
});
