import { posix } from 'node:path';
import { parse } from 'node-html-parser';

/**
 * Byte budgets of Cuenta Horas, uncompressed bytes on disk, the same ceilings as Maestro Calc
 * (`apps/web/src/site-check/budgets.ts`): a page without a calculator loads no JavaScript, and a
 * calculator page loads one module whose static import graph is at most `js`.
 */
export const LIMITS = {
  html: 49_152,
  css: 20_480,
  font: 30_720,
  fonts: 92_160,
  js: 49_152,
  weight: 172_032,
  calculatorWeight: 204_800,
} as const;

/** The built `dist`: the text of every text file, the size of every file, and the calculator pages. */
export interface Build {
  readonly texts: ReadonlyMap<string, string>;
  readonly sizes: ReadonlyMap<string, number>;
  readonly calculators: ReadonlySet<string>;
}

/** `import"./a.js"`, `import{x}from"./a.js"`, `export*from"./a.js"`: a static specifier ending in .js, .mjs or .cjs. */
const STATIC_IMPORT = /(?:\bimport|\bfrom)\s*["']([^"']+\.[cm]?js)["']/g;

/** The files a script imports statically; a dynamic `import()` and a bare package name are not followed. */
export const staticImportsOf = (file: string, text: string): string[] =>
  Array.from(text.matchAll(STATIC_IMPORT), ([, specifier = '']) => specifier).flatMap(
    (specifier) => {
      if (specifier.startsWith('/')) return [specifier.slice(1)];
      return specifier.startsWith('.') ? [posix.join(posix.dirname(file), specifier)] : [];
    },
  );

const graphOf = (roots: readonly string[], texts: Build['texts']): string[] => {
  const seen = new Set<string>();
  const queue = [...roots];
  for (const file of queue) {
    if (seen.has(file)) continue;
    seen.add(file);
    queue.push(...staticImportsOf(file, texts.get(file) ?? ''));
  }
  return [...seen];
};

const fmt = (bytes: number): string => bytes.toLocaleString('en-US');
const sum = (values: readonly number[]): number =>
  values.reduce((total, value) => total + value, 0);
const bytesOf = (text: string): number => new TextEncoder().encode(text).length;
const over = (file: string, what: string, bytes: number, limit: number): string =>
  `${file}: ${what} ${fmt(bytes)} B, over the limit of ${fmt(limit)} B`;

/** The `dist` file of a same-origin absolute reference (`/a/b.css` is `a/b.css`). */
const local = (refs: readonly string[]): string[] =>
  refs.flatMap((ref) => (ref.startsWith('/') && !ref.startsWith('//') ? [ref.slice(1)] : []));

/** The analytics loader every page carries (`public/analytics.js`); it is outside the zero-JS rule. */
export const ANALYTICS_LOADER = 'analytics.js';

const URL_IN_CSS = /url\(\s*["']?([^"')]+)["']?\s*\)/g;

const pageProblems = (file: string, text: string, build: Build): string[] => {
  const size = (name: string): number => build.sizes.get(name) ?? 0;
  const root = parse(text);
  const attrs = (selector: string, name: string): string[] =>
    root.querySelectorAll(selector).flatMap((element) => element.getAttribute(name) ?? []);
  const css = root
    .querySelectorAll('style')
    .map((style) => style.text)
    .join('\n');
  const fonts = new Set(
    local([
      ...Array.from(css.matchAll(URL_IN_CSS), ([, url = '']) => url),
      ...attrs('link[rel~=preload][as=font]', 'href'),
    ]).filter((name) => name.endsWith('.woff2')),
  );
  const scripts = local(attrs('script[src]', 'src')).filter((src) => src !== ANALYTICS_LOADER);
  const calculator = build.calculators.has(file);
  const modules = local(attrs('script[type=module][src]', 'src'));
  const js = sum(graphOf(modules, build.texts).map(size));
  const html = size(file);
  const weight = html + sum([...fonts].map(size)) + js;
  const weightLimit = calculator ? LIMITS.calculatorWeight : LIMITS.weight;
  const cssBytes = bytesOf(css);
  return [
    ...(html > LIMITS.html ? [over(file, 'HTML weighs', html, LIMITS.html)] : []),
    ...(cssBytes > LIMITS.css ? [over(file, 'CSS weighs', cssBytes, LIMITS.css)] : []),
    ...(calculator
      ? [
          ...(modules.length === 1 && scripts.length === 1
            ? []
            : [
                `${file}: has ${String(scripts.length)} module scripts, and a calculator page has exactly one`,
              ]),
          ...(js > LIMITS.js ? [over(file, 'JavaScript weighs', js, LIMITS.js)] : []),
        ]
      : scripts.map(
          (src) => `${file}: loads /${src}, and a page without a calculator loads no JavaScript`,
        )),
    ...(weight > weightLimit ? [over(file, 'the page weighs', weight, weightLimit)] : []),
  ];
};

/** Every page, font and script of the build over its budget, each named with its limit. */
export const budgetProblems = (build: Build): string[] => {
  const fonts = [...build.sizes.keys()].filter((file) => file.endsWith('.woff2'));
  const fontTotal = sum(fonts.map((file) => build.sizes.get(file) ?? 0));
  const pages = [...build.texts].filter(([file]) => file.endsWith('.html'));
  return [
    ...fonts.flatMap((file) => {
      const bytes = build.sizes.get(file) ?? 0;
      return bytes > LIMITS.font ? [over(file, 'weighs', bytes, LIMITS.font)] : [];
    }),
    ...(fontTotal > LIMITS.fonts ? [over('dist', 'the fonts weigh', fontTotal, LIMITS.fonts)] : []),
    ...pages.flatMap(([file, text]) => pageProblems(file, text, build)),
  ];
};
