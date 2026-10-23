import { globSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrast } from '../contract/contrast.ts';
import { fromRoot } from '../contract/root.ts';

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

describe('Blueprint tokens (site-shell › Design tokens)', () => {
  // spec: site-shell › [SS5]
  it('declares the seven palette values and a light colour scheme on :root', () => {
    const values = Object.values(root).map((value) => value.toUpperCase());
    for (const expected of [INK, LINK, ORANGE, SECONDARY, GROUND, SURFACE, '#1FAF5A']) {
      expect(values, expected).toContain(expected);
    }
    expect(root['color-scheme']).toBe('light');
  });

  // spec: site-shell › [SS6]
  it('has no dark theme in any stylesheet', () => {
    expect(stylesheets).toHaveLength(2);
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
  it.each(['.skip-link', '.wordmark', '.nav-link', '.footer-link', '.lang-switch'])(
    '%s is at least the target size tall and wide',
    (selector) => {
      const rule = baseRules.get(selector);
      expect(rule?.['min-height'], selector).toBe('var(--target-size)');
      expect(rule?.['min-width'], selector).toBe('var(--target-size)');
    },
  );
});
