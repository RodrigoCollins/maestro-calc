import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fromRoot } from './root.ts';

const read = (path: string): string => readFileSync(fromRoot(path), 'utf8');

const manifest = JSON.parse(read('packages/data/package.json')) as {
  dependencies: Record<string, string>;
  exports: Record<string, string>;
};

describe('the yields-only subpath of @maestro-calc/data (material-data-contract)', () => {
  // spec: material-data-contract › [MDC5] Yields-only module (source text). This is a web contract
  // because the lint boundary forbids Node builtins inside `packages/data`, tests included.
  it('holds no URL, no message key and no source name, and imports only core', () => {
    const source = read('packages/data/src/yields/concrete-mix.ts');
    expect(source).not.toContain('http');
    expect(source).not.toContain('material.');
    expect(source).not.toContain('QUIKRETE');
    const specifiers = [...source.matchAll(/from '([^']+)'/g)].map((match) => match[1]);
    expect(specifiers).toEqual(['@maestro-calc/core']);
  });

  // spec: material-data-contract › Dependency direction
  it('depends on core only and exports the entry point and the yields subpath', () => {
    expect(Object.keys(manifest.dependencies)).toEqual(['@maestro-calc/core']);
    expect(manifest.exports).toEqual({
      '.': './src/index.ts',
      './yields/*': './src/yields/*.ts',
    });
  });
});
