import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CALCULATOR_PAGES } from './pages.ts';

const pages = resolve(import.meta.dirname, '../pages');

describe('CALCULATOR_PAGES', () => {
  it('names the nine calculator pages and the German dog age page as the build files them', () => {
    expect(CALCULATOR_PAGES).toEqual([
      'dog-food-calculator.html',
      'cat-food-calculator.html',
      'puppy-feeding-calculator.html',
      'kitten-feeding-calculator.html',
      'dog-chocolate-toxicity-calculator.html',
      'dog-pregnancy-calculator.html',
      'dog-age-calculator.html',
      'de/hundejahre-rechner.html',
      'cat-age-calculator.html',
      'puppy-weight-calculator.html',
    ]);
  });

  // a calculator page loads its one script through an island; no other page does
  it('is exactly the pages whose source loads an island script', () => {
    const withScript = readdirSync(pages, { recursive: true, encoding: 'utf8' })
      .filter((name) => name.endsWith('.astro'))
      .filter((name) =>
        /Script from '(\.\.\/)+islands\//.test(readFileSync(resolve(pages, name), 'utf8')),
      )
      .map((name) => name.replace(/\.astro$/, '.html'));
    expect([...CALCULATOR_PAGES].sort()).toEqual(withScript.sort());
  });
});
