import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { fromRoot } from './root.ts';

const manifest = (path: string): { version: string; devDependencies?: Record<string, string> } =>
  JSON.parse(readFileSync(path, 'utf8')) as {
    version: string;
    devDependencies?: Record<string, string>;
  };

/** The version of `vite` that Astro itself resolves: the one beside it in the install tree. */
const astroVite = (): string => {
  const fromAstro = createRequire(createRequire(import.meta.url).resolve('astro/package.json'));
  return manifest(fromAstro.resolve('vite/package.json')).version;
};

describe('vite pin of the web workspace (site-quality › [SQ27], design C17)', () => {
  // The size probe builds with Vite directly; it must be the Vite that builds the site, so the
  // devDependency is exact and equal to the version Astro resolves (no caret, no tilde).
  it('declares vite as an exact devDependency equal to the version Astro resolves', () => {
    const declared = manifest(fromRoot('apps/web/package.json')).devDependencies?.['vite'];
    expect(declared).toMatch(/^\d+\.\d+\.\d+$/);
    expect(declared).toBe(astroVite());
  });
});
