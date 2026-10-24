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
  it('keeps the WhatsApp label legible: near-black text on the WhatsApp green', () => {
    expect(contrast(ON_WHATSAPP, WHATSAPP)).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#FFFFFF', WHATSAPP)).toBeLessThan(4.5);
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
