import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CALCULATOR_PAGES } from './pages.ts';

describe('CALCULATOR_PAGES', () => {
  it('names a built page of a source page in src/pages', () => {
    for (const page of CALCULATOR_PAGES) {
      const source = resolve(import.meta.dirname, '../pages', page.replace(/\.html$/, '.astro'));
      expect(existsSync(source), source).toBe(true);
    }
  });
});
