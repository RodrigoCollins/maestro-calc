import { posix } from 'node:path';
import type { Dist } from './types.ts';

/** `import"./a.js"`, `import{x}from"./a.js"`, `export*from"./a.js"`: a static specifier ending in .js, .mjs or .cjs. */
const STATIC_IMPORT = /(?:\bimport|\bfrom)\s*["']([^"']+\.[cm]?js)["']/g;

/**
 * The `dist` files a script imports statically, in source order. A dynamic `import()` is not
 * followed (a lazy chunk would dodge the byte budget), and a bare package name is no file.
 */
export const staticImportsOf = (file: string, text: string): string[] =>
  Array.from(text.matchAll(STATIC_IMPORT), ([, specifier = '']) => specifier).flatMap(
    (specifier) => {
      if (specifier.startsWith('/')) return [specifier.slice(1)];
      return specifier.startsWith('.') ? [posix.join(posix.dirname(file), specifier)] : [];
    },
  );

/** `roots` and everything they import statically, each file once, in discovery order. */
export const graphOf = (roots: readonly string[], dist: Dist): string[] => {
  const seen = new Set<string>();
  const queue = [...roots];
  for (const file of queue) {
    if (seen.has(file)) continue;
    seen.add(file);
    queue.push(...staticImportsOf(file, dist.get(file) ?? ''));
  }
  return [...seen];
};
