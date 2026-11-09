import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// analytics-events: every calculator script records its usage (`@maestro-calc/site-kit/track`)
// through the shared runner it calls, so a new calculator cannot ship without it.
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

describe('the usage events of the calculator scripts', () => {
  it('finds the five calculator scripts of the pages', () => {
    expect(entries.sort()).toEqual([
      'cat.ts',
      'chocolate.ts',
      'dog-age.ts',
      'dog.ts',
      'due-date.ts',
    ]);
  });

  it.each(entries)('%s runs the shared runner', (name) => {
    expect(read(`client/${name}`)).toMatch(/\brunForm\(/);
  });

  it('records calculate and the WhatsApp share in the shared runner', () => {
    const runner = read('client/run-form.ts');
    expect(runner).toMatch(/\bwatchUsage\(/);
    expect(runner).toContain("share: 'a[data-share]'");
  });
});
