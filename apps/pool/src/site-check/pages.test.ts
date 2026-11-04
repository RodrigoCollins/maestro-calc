import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CALCULATOR_PAGES } from './pages.ts';

describe('CALCULATOR_PAGES', () => {
  // a calculator page left out would fail the zero-JavaScript rule, so the list is the directory
  it('names the built page of every calculator source page, and no other', () => {
    const sources = readdirSync(resolve(import.meta.dirname, '../pages'))
      .filter((name) => name.endsWith('-calculator.astro'))
      .map((name) => name.replace(/\.astro$/, '.html'));
    expect([...CALCULATOR_PAGES].sort()).toEqual(sources.sort());
  });
});
