import { describe, expect, it } from 'vitest';
import { budgetProblems, LIMITS, staticImportsOf, type Build } from './budgets.ts';

const page = (body: string, head = ''): string =>
  `<!doctype html><html><head>${head}</head><body>${body}</body></html>`;

const build = (files: Record<string, string | number>, calculators: string[] = []): Build => {
  const texts = new Map<string, string>();
  const sizes = new Map<string, number>();
  for (const [file, content] of Object.entries(files)) {
    if (typeof content === 'number') sizes.set(file, content);
    else {
      texts.set(file, content);
      sizes.set(file, new TextEncoder().encode(content).length);
    }
  }
  return { texts, sizes, calculators: new Set(calculators) };
};

const script = (src: string): string => `<script type="module" src="${src}"></script>`;

describe('staticImportsOf', () => {
  it('follows relative and absolute static imports, not dynamic ones or packages', () => {
    const text =
      'import"./a.js";import{x}from"../b.mjs";export*from"/_astro/c.js";import("./lazy.js");import"pkg"';
    expect(staticImportsOf('_astro/x/entry.js', text)).toEqual([
      '_astro/x/a.js',
      '_astro/b.mjs',
      '_astro/c.js',
    ]);
  });
});

describe('budgetProblems', () => {
  it('passes a small static page and a calculator page with one script', () => {
    const files = {
      'index.html': page('<h1>Home</h1>', '<style>h1{color:red}</style>'),
      'calc.html': page(script('/_astro/calc.js')),
      '_astro/calc.js': 'import"./shared.js";',
      '_astro/shared.js': 'export const a=1;',
    };
    expect(budgetProblems(build(files, ['calc.html']))).toEqual([]);
  });

  it('names a static page that loads JavaScript', () => {
    const files = { 'index.html': page(script('/_astro/x.js')), '_astro/x.js': 'x' };
    expect(budgetProblems(build(files))).toEqual([
      'index.html: loads /_astro/x.js, and a page without a calculator loads no JavaScript',
    ]);
  });

  // The analytics loader every page carries is not the zero-JS budget of a static page; any other
  // classic script still is.
  it('lets every page carry the analytics loader, and only that one script', () => {
    const loader =
      '<script src="/analytics.js" data-ga="G-ABC123" data-host="cuentahoras.com" defer></script>';
    const files = {
      'index.html': page('<h1>Home</h1>', loader),
      'calc.html': page(script('/_astro/calc.js'), loader),
      '_astro/calc.js': 'export const a=1;',
      'analytics.js': '(function(){})();',
      'other.html': page('', '<script src="/other.js" defer></script>'),
      'other.js': '',
    };
    expect(budgetProblems(build(files, ['calc.html']))).toEqual([
      'other.html: loads /other.js, and a page without a calculator loads no JavaScript',
    ]);
  });

  it('wants exactly one module script on a calculator page', () => {
    expect(budgetProblems(build({ 'calc.html': page('') }, ['calc.html']))).toEqual([
      'calc.html: has 0 module scripts, and a calculator page has exactly one',
    ]);
  });

  it('counts the whole static import graph of a calculator against the JS budget', () => {
    const files = {
      'calc.html': page(script('/_astro/calc.js')),
      '_astro/calc.js': 'import"./big.js";',
      '_astro/big.js': LIMITS.js,
    };
    const [problem] = budgetProblems(build(files, ['calc.html']));
    expect(problem).toMatch(
      /^calc\.html: JavaScript weighs 49,1\d\d B, over the limit of 49,152 B$/,
    );
  });

  it('names HTML and inline CSS over their limits', () => {
    const css = `<style>${'a'.repeat(LIMITS.css + 1)}</style>`;
    const html = page('x'.repeat(LIMITS.html), css);
    const problems = budgetProblems(build({ 'index.html': html }));
    expect(problems).toHaveLength(2);
    expect(problems[0]).toMatch(/^index\.html: HTML weighs [\d,]+ B, over the limit of 49,152 B$/);
    expect(problems[1]).toBe('index.html: CSS weighs 20,481 B, over the limit of 20,480 B');
  });

  it('adds the preloaded and referenced fonts to the page weight', () => {
    const head = `<link rel="preload" as="font" href="/_astro/fonts/a.woff2"><style>@font-face{src:url(/_astro/fonts/b.woff2)}</style>`;
    const files = {
      'index.html': page('', head),
      '_astro/fonts/a.woff2': 90_000,
      '_astro/fonts/b.woff2': 90_000,
    };
    expect(budgetProblems(build(files))).toEqual([
      '_astro/fonts/a.woff2: weighs 90,000 B, over the limit of 30,720 B',
      '_astro/fonts/b.woff2: weighs 90,000 B, over the limit of 30,720 B',
      'dist: the fonts weigh 180,000 B, over the limit of 92,160 B',
      expect.stringMatching(
        /^index\.html: the page weighs 180,\d{3} B, over the limit of 172,032 B$/,
      ),
    ]);
  });
});
