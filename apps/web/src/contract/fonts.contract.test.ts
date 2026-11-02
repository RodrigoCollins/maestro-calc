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

  it('swaps, uses the latin subset and falls back to its own metric-adjusted family', () => {
    expect(fonts).toHaveLength(2);
    for (const entry of fonts) {
      expect(entry.display, entry.name).toBe('swap');
      expect(entry.subsets, entry.name).toEqual(['latin']);
      expect(entry.fallbacks, entry.name).toEqual([`${entry.name} Fallback`, 'sans-serif']);
      expect(entry.optimizedFallbacks, entry.name).toBe(false);
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

/** Capsize's metrics of the local fonts the fallback faces stand on (Arial, and Arial Bold at 700). */
const ARIAL = { unitsPerEm: 2048, xWidthAvg: 913 };
const ARIAL_BOLD = { unitsPerEm: 2048, xWidthAvg: 983 };

const percent = (value: number): string =>
  `${String(Number.parseFloat((value * 100).toFixed(4)))}%`;

/** The `@font-face` blocks of `css` whose family is `family`, by weight. */
const facesOf = (css: string, family: string): Map<number, string> =>
  new Map(
    Array.from(css.matchAll(/@font-face\s*\{([^}]*)\}/g), ([, body = '']) => body)
      .filter((body) => body.includes(`font-family: '${family}'`))
      .map((body) => [
        Number(/font-weight:\s*(\d+)/.exec(body)?.[1]),
        body.replaceAll(/\s+/g, ' '),
      ]),
  );

// spec: site-shell › [SS33] the fallback faces stand on Arial, Liberation Sans, Arimo or Roboto,
// so a system without Arial (Linux, Android) still gets the adjusted metrics and the swap moves nothing
describe('metric-adjusted fallback faces (site-shell › Self-hosted fonts)', () => {
  const css = readFileSync(fromRoot('apps/web/src/styles/base.css'), 'utf8');

  it('declares one fallback face per web-font variant, each on the Arial-metric local fonts and Roboto', async () => {
    const { fromBuffer } = await import('@capsizecss/unpack');
    for (const entry of fonts) {
      const faces = facesOf(css, `${entry.name} Fallback`);
      const variants = entry.options?.variants ?? [];
      expect([...faces.keys()].sort(), entry.name).toEqual(weightsOf(entry));
      for (const variant of variants) {
        const weight = Number(variant.weight);
        const face = faces.get(weight) ?? '';
        const bold = weight >= 700;
        const sources = bold
          ? [
              'Arial Bold',
              'Arial-BoldMT',
              'Liberation Sans Bold',
              'LiberationSans-Bold',
              'Arimo Bold',
              'Arimo-Bold',
              'Roboto Bold',
              'Roboto-Bold',
            ]
          : [
              'Arial',
              'ArialMT',
              'Liberation Sans',
              'LiberationSans',
              'Arimo',
              'Arimo-Regular',
              'Roboto',
              'Roboto-Regular',
            ];
        expect(face, `${entry.name} ${String(weight)}`).toContain(
          `src: ${sources.map((name) => `local('${name}')`).join(', ')};`,
        );
        const metrics = await fromBuffer(
          readFileSync(fromRoot('node_modules', String(variant.src[0]))),
        );
        const local = bold ? ARIAL_BOLD : ARIAL;
        const size = metrics.xWidthAvg / metrics.unitsPerEm / (local.xWidthAvg / local.unitsPerEm);
        const em = metrics.unitsPerEm * size;
        for (const [property, value] of [
          ['size-adjust', size],
          ['ascent-override', metrics.ascent / em],
          ['descent-override', Math.abs(metrics.descent) / em],
          ['line-gap-override', metrics.lineGap / em],
        ] as const) {
          expect(face, `${entry.name} ${String(weight)} ${property}`).toContain(
            `${property}: ${percent(value)};`,
          );
        }
        expect(face).toContain('font-display: swap;');
      }
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
