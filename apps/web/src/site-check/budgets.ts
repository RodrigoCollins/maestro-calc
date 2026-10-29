import { ANALYTICS_SRC, scriptRootsOf } from './assets.ts';
import { attrsOf, urlsIn } from './dom.ts';
import { graphOf } from './graph.ts';
import { isCalculatorPage, problem } from './types.ts';
import type { BuildBytes, CheckContext, Dist, Page, Problem } from './types.ts';

/** The byte size of every file under `dist`, by posix path (text and binary alike). */
export type Sizes = BuildBytes['sizes'];

/**
 * Design budgets (site-quality): bytes on disk, uncompressed. A static page has no JavaScript of its
 * own (`js: 0`); the analytics loader every page carries has a budget of its own (analytics-gtm),
 * and its bytes count toward the page weight. Tag Manager itself comes from Google after the load.
 */
export const LIMITS = {
  html: 49_152,
  css: 20_480,
  font: 30_720,
  fonts: 92_160,
  js: 0,
  analytics: 3_072,
  weight: 172_032,
} as const;

/**
 * The calculator template's own ceilings (site-quality › Byte budgets): the JavaScript of a page is
 * its entry, its module preloads and their static imports, and it counts toward the page weight.
 */
export const CALCULATOR_LIMITS = { js: 49_152, weight: 204_800 } as const;

const DIST = '(dist)';
const JS_FILE = /\.[cm]?js$/;

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
  /** The script files a static page references (the budget is zero). */
  readonly scripts: readonly string[];
  /** The bytes of the analytics loader, when the page carries its tag. */
  readonly analytics: number;
  /** The entry file of a calculator page, if any, and the bytes of its whole JavaScript graph. */
  readonly entry: string | undefined;
  readonly js: number;
  /** The HTML plus the linked CSS, fonts (referenced by CSS or preloaded), favicon and JavaScript a visitor downloads. */
  readonly weight: number;
}

const measure = (page: Page, sizes: Sizes, dist: Dist, calculator: boolean): Measure => {
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
  const loader = ANALYTICS_SRC.slice(1);
  const scripts = localFiles([
    ...attrsOf(page.root, 'script[src]', 'src'),
    ...attrsOf(page.root, 'link[href]', 'href'),
  ]).filter((file) => JS_FILE.test(file) && file !== loader);
  const analytics = attrsOf(page.root, 'script[src]', 'src').includes(ANALYTICS_SRC)
    ? size(loader)
    : 0;
  const linkedBytes = sum(linked.map(size));
  const roots = calculator ? scriptRootsOf(page) : [];
  const js = sum(graphOf(roots, dist).map(size));
  return {
    html,
    css: sum(inline.map((text) => new TextEncoder().encode(text).length)) + linkedBytes,
    scripts: calculator ? [] : scripts,
    analytics,
    entry: roots[0],
    js,
    weight: html + linkedBytes + sum([...fonts].map(size)) + sum(icons.map(size)) + js + analytics,
  };
};

const fontFiles = (sizes: Sizes): string[] =>
  [...sizes.keys()].filter((file) => file.endsWith('.woff2'));

/** `over` for a file or page whose size needs no qualifier after the byte count. */
const PLAIN = '';

const over = (what: string, bytes: number, limit: number): string =>
  `${fmt(bytes)} B${what} exceeds the limit of ${fmt(limit)} B`;

/** Pages, fonts and scripts over their byte budget, each named with its limit. */
export const budgetProblems = ({ pages, sizes, dist, site }: CheckContext): Problem[] => {
  const fonts = fontFiles(sizes);
  const fontTotal = sum(fonts.map((file) => sizeOf(sizes, file)));
  return [
    ...pages.flatMap((page) => {
      const calculator = isCalculatorPage(page, site);
      const { html, css, scripts, analytics, entry, js, weight } = measure(
        page,
        sizes,
        dist,
        calculator,
      );
      const weightLimit = calculator ? CALCULATOR_LIMITS.weight : LIMITS.weight;
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
        ...(analytics > LIMITS.analytics
          ? [
              problem(
                page.file,
                'js-budget',
                `${ANALYTICS_SRC} weighs ${fmt(analytics)} B, and its budget is ${fmt(LIMITS.analytics)} B`,
              ),
            ]
          : []),
        ...(js > CALCULATOR_LIMITS.js
          ? [
              problem(
                page.file,
                'js-budget',
                `/${String(entry)} and its imports weigh ${fmt(js)} B, and the budget is ${fmt(CALCULATOR_LIMITS.js)} B`,
              ),
            ]
          : []),
        ...(weight > weightLimit
          ? [problem(page.file, 'weight-budget', over(PLAIN, weight, weightLimit))]
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
export const budgetSummary = ({ pages, sizes, dist, site }: CheckContext): string[] => {
  const measures = pages.map(
    (page) => [page, measure(page, sizes, dist, isCalculatorPage(page, site))] as const,
  );
  const statics = measures.filter(([page]) => !isCalculatorPage(page, site));
  const calculators = measures.filter(([page]) => isCalculatorPage(page, site));
  const fonts = fontFiles(sizes);
  return [
    largest(
      'html',
      measures.map(([page, m]) => [page.file, m.html]),
      LIMITS.html,
    ),
    largest(
      'css',
      measures.map(([page, m]) => [page.file, m.css]),
      LIMITS.css,
    ),
    largest(
      'font',
      fonts.map((file) => [file, sizeOf(sizes, file)]),
      LIMITS.font,
    ),
    `budget fonts: total ${fmt(sum(fonts.map((file) => sizeOf(sizes, file))))} B in ${String(fonts.length)} files (limit ${fmt(LIMITS.fonts)})`,
    `budget js: ${fmt(sum(statics.flatMap(([, m]) => m.scripts.map((file) => sizeOf(sizes, file)))))} B referenced (limit ${fmt(LIMITS.js)})`,
    largest(
      'weight',
      statics.map(([page, m]) => [page.file, m.weight]),
      LIMITS.weight,
    ),
    ...(calculators.length === 0
      ? []
      : [
          largest(
            'js (calculator)',
            calculators.map(([page, m]) => [page.file, m.js]),
            CALCULATOR_LIMITS.js,
          ),
          largest(
            'weight (calculator)',
            calculators.map(([page, m]) => [page.file, m.weight]),
            CALCULATOR_LIMITS.weight,
          ),
        ]),
  ];
};
