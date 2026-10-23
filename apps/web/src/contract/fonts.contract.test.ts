import { globSync, readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fromRoot, importFromRoot } from './root.ts';

interface Variant {
  weight?: string | number;
  style?: string;
  src: unknown[];
}
interface FontFamily {
  name: string;
  cssVariable: string;
  display?: string;
  subsets?: string[];
  fallbacks?: string[];
  optimizedFallbacks?: boolean;
  options?: { variants: Variant[] };
}

const { default: config } = await importFromRoot<{ default: { fonts?: FontFamily[] } }>(
  'apps/web/astro.config.mjs',
);
const fonts = config.fonts ?? [];
const family = (name: string): FontFamily | undefined => fonts.find((entry) => entry.name === name);
const weightsOf = (entry: FontFamily | undefined): number[] =>
  (entry?.options?.variants ?? []).map((variant) => Number(variant.weight)).sort();

describe('fonts config (site-shell › Self-hosted fonts)', () => {
  // spec: site-shell › [SS8] config side
  it('declares Barlow for body text and Barlow Condensed for display', () => {
    expect(fonts.map(({ name }) => name)).toEqual(['Barlow', 'Barlow Condensed']);
    expect(family('Barlow')?.cssVariable).toBe('--font-body');
    expect(weightsOf(family('Barlow'))).toEqual([400, 600]);
    expect(family('Barlow Condensed')?.cssVariable).toBe('--font-display');
    expect(weightsOf(family('Barlow Condensed'))).toEqual([600, 700]);
  });

  it('swaps, uses the latin subset and keeps the generated fallback metrics', () => {
    expect(fonts).toHaveLength(2);
    for (const entry of fonts) {
      expect(entry.display, entry.name).toBe('swap');
      expect(entry.subsets, entry.name).toEqual(['latin']);
      expect(entry.fallbacks, entry.name).toContain('Arial');
      expect(entry.optimizedFallbacks, entry.name).not.toBe(false);
    }
  });

  it('reads the latin woff2 files of the pinned fontsource packages', () => {
    expect(fonts).toHaveLength(2);
    for (const entry of fonts) {
      const sources = (entry.options?.variants ?? []).flatMap((variant) => variant.src);
      expect(sources.length, entry.name).toBe(2);
      for (const source of sources) {
        expect(String(source), entry.name).toMatch(
          /^@fontsource\/barlow(-condensed)?\/files\/.+-latin-\d+-normal\.woff2$/,
        );
      }
    }
  });

  // review RES-3: the four files stay inside the font budget (SS8 and the performance spec)
  it('keeps each woff2 at 30 KiB or less and the four together at 90 KiB or less', () => {
    const sizes = fonts
      .flatMap((entry) => entry.options?.variants ?? [])
      .flatMap((variant) => variant.src)
      .map((source) => statSync(fromRoot('node_modules', String(source))).size);
    expect(sizes).toHaveLength(4);
    for (const size of sizes) {
      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThanOrEqual(30_720);
    }
    expect(sizes.reduce((total, size) => total + size, 0)).toBeLessThanOrEqual(92_160);
  });

  it('pins both fontsource packages to an exact version', () => {
    const { dependencies } = JSON.parse(
      readFileSync(fromRoot('apps/web/package.json'), 'utf8'),
    ) as { dependencies: Record<string, string> };
    for (const name of ['@fontsource/barlow', '@fontsource/barlow-condensed']) {
      expect(dependencies[name], name).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });
});

describe('no third-party font host (site-shell › [SS9])', () => {
  const HOSTS = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'use.typekit.net',
    'cdn.jsdelivr.net',
    'unpkg.com',
  ];

  it('mentions none in the Astro config or the stylesheets', () => {
    const files = [
      fromRoot('apps/web/astro.config.mjs'),
      ...globSync('apps/web/src/styles/**/*.css', { cwd: fromRoot() }).map((path) =>
        fromRoot(path),
      ),
    ];
    expect(files.length).toBeGreaterThanOrEqual(1);
    for (const file of files) {
      for (const host of HOSTS)
        expect(readFileSync(file, 'utf8'), `${file} ${host}`).not.toContain(host);
    }
  });
});
