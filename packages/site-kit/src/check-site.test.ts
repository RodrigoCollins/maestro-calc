import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { LIMITS } from './budgets.ts';
import { checkSite } from './check-site.ts';

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** A built `dist` in a temporary directory, from file name to content. */
const dist = (files: Record<string, string>): string => {
  const root = mkdtempSync(join(tmpdir(), 'site-kit-'));
  dirs.push(root);
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(join(root, file, '..'), { recursive: true });
    writeFileSync(join(root, file), content);
  }
  return root;
};

const page = (body = '', head = ''): string =>
  `<!doctype html><html><head>${head}</head><body>${body}</body></html>`;
const calculator = page('', '<script type="module" src="/_astro/a.js"></script>');

describe('checkSite', () => {
  it('lists every page with its size, nested pages included, and finds no problem in a lean build', () => {
    const { pages, problems } = checkSite(
      dist({
        'index.html': page(),
        'es/a.html': calculator,
        '_astro/a.js': 'export{}',
        '_astro/fonts/a.woff2': 'binary',
      }),
      ['es/a.html'],
    );
    expect(pages.map(({ file }) => file)).toEqual(['es/a.html', 'index.html']);
    expect(pages.every(({ bytes }) => bytes > 0)).toBe(true);
    expect(problems).toEqual([]);
  });

  it('names a calculator page the build does not hold', () => {
    const { problems } = checkSite(dist({ 'index.html': page() }), ['gone.html']);
    expect(problems).toEqual(['gone.html: a calculator page the build does not hold']);
  });

  it('reports a page over its budget', () => {
    const { problems } = checkSite(dist({ 'big.html': page('x'.repeat(LIMITS.html)) }), []);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/^big\.html: HTML weighs .* over the limit of 49,152 B$/);
  });

  it('reports script on a page that is not a calculator', () => {
    const { problems } = checkSite(dist({ 'index.html': calculator, '_astro/a.js': '' }), []);
    expect(problems).toEqual([
      'index.html: loads /_astro/a.js, and a page without a calculator loads no JavaScript',
    ]);
  });
});
