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
    expect(stylesheets.map((name) => name.split('/').pop())).toEqual([
      'base.css',
      'calculator.css',
      'tokens.css',
    ]);
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
  it('sets the figures in tabular numerals inside cells of a fixed width', () => {
    expect(declared('.calc-figure', 'font-variant-numeric')).toBe('tabular-nums');
    expect(declared('.calc-figure', 'display')).toBe('inline-block');
    expect(declared('.calc-figure', 'min-width')).toMatch(/^\d+ch$/);
  });

  // spec: calculator-page › [CP14], [CP44] and DR-13: every area the script rewrites keeps its size
  it.each(['.calc-answer', '.calc-notice', '.calc-steppers', '.calc-copy'])(
    'reserves a block size for %s',
    (selector) => {
      expect(rem(declared(selector, 'min-height')), selector).toBeGreaterThanOrEqual(44);
    },
  );

  // The shape area is a grid with a gap, so its reserved height is four rows plus three gaps.
  it('reserves the height of the tallest shape, four rows and three gaps, for the shape area', () => {
    const row = declared('.calc-field', 'min-height');
    expect(rem(row)).toBeGreaterThanOrEqual(96);
    expect(declared('.calc-shape-area', 'display')).toBe('grid');
    const gap = rules.get('.calc-shape-area')?.['gap'];
    expect(gap).toBe('var(--space-3)');
    expect(declared('.calc-shape-area', 'min-height')).toBe(
      `calc(4 * ${row} + 3 * ${resolve(gap)})`,
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
