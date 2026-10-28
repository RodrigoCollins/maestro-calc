import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { lengthsOf, mediaBlocksOf } from '../../__testing__/css-media.ts';
import { fromRoot } from '../../contract/root.ts';
import { reserveCss } from '../../lib/reserve.ts';
import { rectangleAreaReserve } from './reserve.ts';

const source = readFileSync(fromRoot('apps/web/src/calculator/rectangle-area/reserve.ts'), 'utf8');

/** The e2e widths: the numbers of `const WIDTHS = [...]` in `layout.spec.ts`. */
const widths = (
  /const WIDTHS = \[([^\]]+)\]/.exec(
    readFileSync(fromRoot('tooling/site-browser/e2e/layout.spec.ts'), 'utf8'),
  )?.[1] ?? ''
)
  .split(',')
  .map((width) => Number(width.trim()))
  .filter((width) => width > 0);

/** Every breakpoint of the reserve's CSS as `[number, unit]`. */
const breakpoints = (): [number, string][] =>
  mediaBlocksOf(reserveCss(rectangleAreaReserve) ?? '').flatMap(([condition]) =>
    lengthsOf(condition),
  );

describe('the square footage reserve (calculator-page › [CP64], [CP73], design K6, K11)', () => {
  // the values reach no client bundle: the module holds data and type-only imports
  it('has type-only imports, so the page module and the client entry gain nothing from it', () => {
    const imports = source.split('\n').filter((line) => line.startsWith('import '));
    expect(imports.length).toBeGreaterThan(0);
    for (const line of imports) expect(line).toMatch(/^import type /);
  });

  // spec: calculator-page › [CP64] the builder accepts it: positive counts, increasing rem breakpoints
  it('builds into CSS that sets both counts on the calculator', () => {
    const css = reserveCss(rectangleAreaReserve);
    expect(css).toMatch(/^\.calculator\{--answer-lines:\d+;--notice-lines:\d+\}/);
    expect(breakpoints().length).toBeGreaterThan(0);
  });

  // spec: calculator-page › [CP64] every breakpoint is rem, and both its pixel edges are e2e widths
  it('steps at rem breakpoints whose two pixel edges are among the e2e widths', () => {
    for (const [value, unit] of breakpoints()) {
      expect(unit, String(value)).toBe('rem');
      const first = Math.ceil(value * 16);
      expect(widths, `${String(value)}rem`).toContain(first - 1);
      expect(widths, `${String(value)}rem`).toContain(first);
    }
  });
});
