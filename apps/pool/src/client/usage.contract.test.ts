import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// analytics-events: every calculator script records its usage (`@maestro-calc/site-kit/track`),
// itself or through the shared runner it calls, so a new calculator cannot ship without it.
const src = resolve(import.meta.dirname, '..');
const read = (path: string): string => readFileSync(resolve(src, path), 'utf8');
const entries = readdirSync(resolve(src, 'islands'))
  .filter((name) => name.endsWith('.astro'))
  .flatMap((name) =>
    Array.from(
      read(`islands/${name}`).matchAll(/<script src="\.\.\/client\/([\w-]+\.ts)"/g),
      ([, script = '']) => script,
    ),
  );
/** The script and the shared runner it calls, as one text. */
const reach = (name: string): string => {
  const text = read(`client/${name}`);
  const runner = /from '\.\/(run-dose)\.ts'/.exec(text)?.[1];
  return runner === undefined ? text : `${text}\n${read(`client/${runner}.ts`)}`;
};

describe('the usage events of the calculator scripts', () => {
  it('finds the calculator scripts of the pages', () => {
    expect(entries.length).toBeGreaterThanOrEqual(10);
  });

  it.each(entries)('%s records calculate', (name) => {
    expect(reach(name)).toMatch(/\bwatchUsage\(/);
  });
});
