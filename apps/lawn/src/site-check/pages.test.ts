import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ROUTES } from '../routes.ts';
import { CALCULATOR_PAGES } from './pages.ts';

describe('CALCULATOR_PAGES', () => {
  it('holds the four calculators, the frost index and every frost page, as built files', () => {
    expect(CALCULATOR_PAGES).toHaveLength(
      4 + 1 + ROUTES.filter(({ id }) => id.startsWith('frost:')).length,
    );
    expect(CALCULATOR_PAGES).toContain('sod-calculator.html');
    expect(CALCULATOR_PAGES).toContain('frost-dates.html');
    expect(CALCULATOR_PAGES).toContain('frost-dates/texas/2.html');
  });

  // a page with a script is a tool page: a test holds the list equal to the pages that load one
  it('is held equal to the *-calculator page files', () => {
    const files = readdirSync(resolve(import.meta.dirname, '../pages'))
      .filter((file) => file.endsWith('-calculator.astro'))
      .map((file) => `${file.replace('.astro', '')}.html`);
    expect(
      CALCULATOR_PAGES.filter((page) => !page.includes('/') && page !== 'frost-dates.html'),
    ).toEqual(
      files.sort(
        (a, b) =>
          ROUTES.findIndex((r) => `${r.path.slice(1)}.html` === a) -
          ROUTES.findIndex((r) => `${r.path.slice(1)}.html` === b),
      ),
    );
  });
});
