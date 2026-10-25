import { describe, expect, it } from 'vitest';
import { graphOf, staticImportsOf } from './graph.ts';

describe('static imports of a built script (site-shell › Client JavaScript only on calculator pages)', () => {
  it.each([
    ['a side-effect import', 'import"./a.js";', ['_astro/a.js']],
    ['a named import', 'import{x}from"./b.js";', ['_astro/b.js']],
    ['a spaced import with single quotes', "import { x } from './c.js';", ['_astro/c.js']],
    ['a re-export', 'export*from"./d.js";export{y}from"./e.js";', ['_astro/d.js', '_astro/e.js']],
    ['a parent path', 'import"../f.js";', ['f.js']],
    ['an absolute path', 'import"/_astro/g.js";', ['_astro/g.js']],
    ['an .mjs file', 'import"./h.mjs";', ['_astro/h.mjs']],
    ['a nested path with dots', 'import"./sub/../sub/i.js";', ['_astro/sub/i.js']],
  ])('reads %s', (_name, text, files) => {
    expect(staticImportsOf('_astro/entry.js', text)).toEqual(files);
  });

  it.each([
    ['a dynamic import', 'const m=()=>import("./lazy.js");'],
    ['a bare package', 'import"lit";import{x}from"react";import"pkg/index.js";'],
    ['a string that is not an import', 'const s="./a.js";'],
    ['a css import', 'import"./a.css";'],
  ])('ignores %s', (_name, text) => {
    expect(staticImportsOf('_astro/entry.js', text)).toEqual([]);
  });
});

describe('the files a script loads (site-quality › [SQ23])', () => {
  const dist = new Map([
    ['_astro/entry.js', 'import"./a.js";import{b}from"./b.js";'],
    ['_astro/a.js', 'import"./c.js";'],
    ['_astro/b.js', 'import"./c.js";'],
    ['_astro/c.js', 'import"./entry.js";export const c=1;'],
    ['_astro/other.js', 'x'],
  ]);

  it('walks the static graph once per file, cycles included, in discovery order', () => {
    expect(graphOf(['_astro/entry.js'], dist)).toEqual([
      '_astro/entry.js',
      '_astro/a.js',
      '_astro/b.js',
      '_astro/c.js',
    ]);
  });

  it('joins several roots without repeating a file', () => {
    expect(graphOf(['_astro/a.js', '_astro/other.js', '_astro/c.js'], dist)).toEqual([
      '_astro/a.js',
      '_astro/other.js',
      '_astro/c.js',
      '_astro/entry.js',
      '_astro/b.js',
    ]);
  });

  it('keeps a file that dist lacks, with nothing behind it', () => {
    expect(graphOf(['_astro/missing.js'], dist)).toEqual(['_astro/missing.js']);
    expect(graphOf([], dist)).toEqual([]);
  });
});
