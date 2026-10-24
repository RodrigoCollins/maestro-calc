import { attrsOf, urlsIn } from './dom.ts';
import { problem } from './types.ts';
import type { BuildBytes, Dist, Page, Problem } from './types.ts';

/** The byte size of every file under `dist`, by posix path (text and binary alike). */
export type Sizes = BuildBytes['sizes'];

/** Design budgets (site-quality): bytes on disk, uncompressed. JavaScript has none (`js: 0`). */
export const LIMITS = {
  html: 40_960,
  css: 20_480,
  font: 30_720,
  fonts: 92_160,
  js: 0,
  weight: 163_840,
} as const;

const DIST = '(dist)';
const JS_FILE = /\.m?js$/;

/** The size of `file`, or 0 for a file the build does not hold (another rule names it). */
const sizeOf = (sizes: Sizes, file: string): number => sizes.get(file) ?? 0;

const fmt = (bytes: number): string => bytes.toLocaleString('en-US');
const sum = (values: readonly number[]): number =>
  values.reduce((total, value) => total + value, 0);

/** The `dist` file a same-origin absolute reference points at (`/a/b.css` is `a/b.css`). */
const fileOfRef = (ref: string): string | undefined =>
  ref.startsWith('/') && !ref.startsWith('//') ? ref.slice(1) : undefined;

const localFiles = (refs: readonly string[]): string[] =>
  refs.flatMap((ref) => fileOfRef(ref) ?? []);

interface Measure {
  readonly html: number;
  /** Inline `<style>` text plus every linked stylesheet. */
  readonly css: number;
  readonly scripts: readonly string[];
  /** The HTML plus the linked CSS, fonts (referenced by CSS or preloaded) and favicon a visitor downloads. */
  readonly weight: number;
}

const measure = (page: Page, sizes: Sizes, dist: Dist): Measure => {
  const size = (file: string): number => sizeOf(sizes, file);
  const html = size(page.file);
  const inline = page.root.querySelectorAll('style').map((style) => style.text);
  const linked = localFiles(attrsOf(page.root, 'link[rel~=stylesheet]', 'href'));
  const css = [...inline, ...linked.map((file) => dist.get(file) ?? '')].join('\n');
  const fonts = new Set(
    localFiles([
      ...urlsIn(css),
      ...attrsOf(page.root, 'link[rel~=preload][as=font]', 'href'),
    ]).filter((file) => file.endsWith('.woff2')),
  );
  const icons = localFiles(attrsOf(page.root, 'link[rel~=icon]', 'href'));
  const scripts = localFiles([
    ...attrsOf(page.root, 'script[src]', 'src'),
    ...attrsOf(page.root, 'link[href]', 'href'),
  ]).filter((file) => JS_FILE.test(file));
  const linkedBytes = sum(linked.map(size));
  return {
    html,
    css: sum(inline.map((text) => new TextEncoder().encode(text).length)) + linkedBytes,
    scripts,
    weight: html + linkedBytes + sum([...fonts].map(size)) + sum(icons.map(size)),
  };
};

const fontFiles = (sizes: Sizes): string[] =>
  [...sizes.keys()].filter((file) => file.endsWith('.woff2'));

/** `over` for a file or page whose size needs no qualifier after the byte count. */
const PLAIN = '';

const over = (what: string, bytes: number, limit: number): string =>
  `${fmt(bytes)} B${what} exceeds the limit of ${fmt(limit)} B`;

/** Pages, fonts and scripts over their byte budget, each named with its limit. */
export const budgetProblems = (pages: readonly Page[], sizes: Sizes, dist: Dist): Problem[] => {
  const fonts = fontFiles(sizes);
  const fontTotal = sum(fonts.map((file) => sizeOf(sizes, file)));
  return [
    ...pages.flatMap((page) => {
      const { html, css, scripts, weight } = measure(page, sizes, dist);
      return [
        ...(html > LIMITS.html
          ? [problem(page.file, 'html-budget', over(PLAIN, html, LIMITS.html))]
          : []),
        ...(css > LIMITS.css
          ? [problem(page.file, 'css-budget', over(' of CSS', css, LIMITS.css))]
          : []),
        ...scripts.map((file) =>
          problem(
            page.file,
            'js-budget',
            `/${file} (${fmt(sizeOf(sizes, file))} B) is JavaScript, and the budget is ${fmt(LIMITS.js)} B`,
          ),
        ),
        ...(weight > LIMITS.weight
          ? [problem(page.file, 'weight-budget', over(PLAIN, weight, LIMITS.weight))]
          : []),
      ];
    }),
    ...fonts
      .filter((file) => sizeOf(sizes, file) > LIMITS.font)
      .map((file) => problem(file, 'font-budget', over(PLAIN, sizeOf(sizes, file), LIMITS.font))),
    ...(fontTotal > LIMITS.fonts
      ? [problem(DIST, 'fonts-budget', over(' of fonts', fontTotal, LIMITS.fonts))]
      : []),
  ];
};

/** `<label>: largest <path> <size> B (limit <n>)` for the entry with the highest value. */
const largest = (
  label: string,
  entries: readonly (readonly [string, number])[],
  limit: number,
): string => {
  const [path, bytes] = entries.reduce(
    (best, entry) => (entry[1] > best[1] ? entry : best),
    ['', 0],
  );
  return `budget ${label}: largest /${path} ${fmt(bytes)} B (limit ${fmt(limit)})`;
};

/** One line per category with the largest page or file and its size (site-quality › [SQ6]). */
export const budgetSummary = (pages: readonly Page[], sizes: Sizes, dist: Dist): string[] => {
  const measures = pages.map((page) => [page.file, measure(page, sizes, dist)] as const);
  const fonts = fontFiles(sizes);
  return [
    largest(
      'html',
      measures.map(([file, m]) => [file, m.html]),
      LIMITS.html,
    ),
    largest(
      'css',
      measures.map(([file, m]) => [file, m.css]),
      LIMITS.css,
    ),
    largest(
      'font',
      fonts.map((file) => [file, sizeOf(sizes, file)]),
      LIMITS.font,
    ),
    `budget fonts: total ${fmt(sum(fonts.map((file) => sizeOf(sizes, file))))} B in ${String(fonts.length)} files (limit ${fmt(LIMITS.fonts)})`,
    `budget js: ${fmt(sum(measures.flatMap(([, m]) => m.scripts.map((file) => sizeOf(sizes, file)))))} B referenced (limit ${fmt(LIMITS.js)})`,
    largest(
      'weight',
      measures.map(([file, m]) => [file, m.weight]),
      LIMITS.weight,
    ),
  ];
};
