import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ROUTES } from '../routing/routes.ts';
import { CALCULATOR_PAGES } from '../routing/templates.ts';
import { fromRoot } from './root.ts';

/**
 * The browser suites run over a typed per-calculator record (site-quality › [SQ29], [SQ30]). The
 * browser job has no root install, so the record reaches the workspace only by relative path.
 */
const E2E_DIR = 'tooling/site-browser/e2e';
const read = (file: string): string => readFileSync(fromRoot(E2E_DIR, file), 'utf8');

describe('the typed browser record (site-quality › [SQ29], [SQ30])', () => {
  const table = read('calculator-pages.ts');

  // spec: site-quality › [SQ29] a missing row is a type error
  it('declares E2E as a Record over every calculator page id', () => {
    expect(table).toMatch(
      /export const E2E\b[^=]*=\s*\{[\s\S]*?\}\s*as const satisfies\s*Record<\s*CalculatorPageId,\s*E2eSpec\s*>/,
    );
    expect(table).toMatch(
      /import type \{[^}]*\bCalculatorPageId\b[^}]*\} from '[^']*routing\/templates\.ts'/,
    );
  });

  // spec: site-quality › [SQ30] the browser job has no root install (m-11)
  it('has no runtime import from a workspace package', () => {
    for (const file of ['calculator-pages.ts', 'concrete-pages.ts']) {
      const runtime = read(file)
        .split('\n')
        .filter((line) => /^import\s+(?!type\b)/.test(line));
      expect(
        runtime.filter((line) => line.includes('@maestro-calc/')),
        file,
      ).toEqual([]);
    }
  });

  it('derives the page paths from ROUTES for both locales', () => {
    expect(table).toContain("from '../../../apps/web/src/routing/routes.ts'");
    expect(table).toContain('CALCULATOR_PAGES');
    expect(table).toMatch(/ROUTES\[id\]/);
    expect(CALCULATOR_PAGES.every((id) => id in ROUTES)).toBe(true);
  });
});
