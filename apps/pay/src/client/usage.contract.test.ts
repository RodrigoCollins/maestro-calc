import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// analytics-events: every calculator script records its usage (`@maestro-calc/site-kit/track`),
// itself or through the shared runner it calls, so a new calculator cannot ship without it.
const src = resolve(import.meta.dirname, '..');
const read = (path: string): string => readFileSync(resolve(src, path), 'utf8');
const astro = (dir: string): string[] =>
  readdirSync(resolve(src, dir))
    .filter((name) => name.endsWith('.astro'))
    .map((name) => read(`${dir}/${name}`));
// `time-now.ts` is no calculator: it fills the live time of a page from the clock, with no form to
// calculate and no share link, so it records no usage.
const entries = [...astro('components'), ...astro('islands')]
  .flatMap((text) =>
    Array.from(text.matchAll(/<script src="\.\.\/client\/([\w-]+\.ts)"/g), ([, name = '']) => name),
  )
  .filter((name) => name !== 'time-now.ts');
/** The script and the shared runner it calls, as one text. */
const reach = (name: string): string => {
  const text = read(`client/${name}`);
  const runner = /from '\.\/(run-form)\.ts'/.exec(text)?.[1];
  return runner === undefined ? text : `${text}\n${read(`client/${runner}.ts`)}`;
};

describe('the usage events of the calculator scripts', () => {
  it('finds the calculator scripts of the pages', () => {
    expect(entries.length).toBeGreaterThanOrEqual(10);
  });

  it.each(entries)('%s records calculate and its WhatsApp link', (name) => {
    const text = reach(name);
    expect(text).toMatch(/\bwatchUsage\(/);
    expect(text).toMatch(/\bshare: 'a\[data-(share|whatsapp)\]'/);
  });

  it('records the print button of the time card', () => {
    expect(read('client/time-card.ts')).toMatch(/\bprint: '\[data-print\]'/);
  });
});
