import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fromRoot } from './root.ts';

const catalog = readFileSync(fromRoot('packages/core/src/units/catalog.ts'), 'utf8');

const withoutComments = (source: string): string =>
  source.replaceAll(/\/\*[\s\S]*?\*\//g, '').replaceAll(/\/\/.*$/gm, '');

/** A decimal point or an exponent in a numeric literal: how a float sneaks into a factor. */
const FLOAT_LITERAL = /(?<![\w.'])(?:\d+\.\d*|\.\d+|\d+(?:\.\d+)?e[+-]?\d+)(?![\w'])/i;

describe('unit catalog source (units-quantities › Exact unit factors)', () => {
  // spec: units-quantities › Exact unit factors — no float literal anywhere in a factor
  it('has no float literal outside comments', () => {
    expect(FLOAT_LITERAL.test(withoutComments(catalog))).toBe(false);
  });

  it('would notice a float literal (control)', () => {
    for (const code of ['Rational.of(0.3048)', 'const x = 25.4;', 'f(1e3)', 'f(.5)', 'f(2.)']) {
      expect(FLOAT_LITERAL.test(code), code).toBe(true);
    }
    expect(FLOAT_LITERAL.test("Rational.of(5, 127); 'lb/in3'; in3; m2")).toBe(false);
  });

  // design: Performance levers — importing one unit must not drag in the whole catalog
  it('annotates every unit definition as pure so unused units tree-shake', () => {
    const definitions = catalog
      .split('\n')
      .filter((line) => /^export const (?!UNITS\b|findUnit\b)\w+ = /.test(line));
    expect(definitions).toHaveLength(28);
    for (const line of definitions) {
      expect(line, line).toMatch(/^export const \w+ = \/\* @__PURE__ \*\/ \w+\(/);
    }
    // the frozen catalog references every unit, so it must be droppable as well
    expect(catalog).toMatch(/export const UNITS[^=]*=\s*\/\* @__PURE__ \*\/ Object\.freeze/);
  });
});
