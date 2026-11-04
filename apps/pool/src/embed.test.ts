import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CHLORINE, PUMP, SALT } from './doses.ts';
import { EMBED_PAGE, EMBEDS, snippets } from './embed.ts';
import { HOME_TOOLS } from './home.ts';
import { pagePaths } from './seo/sitemap.ts';
import { CALCULATOR_PAGES, EMBED_PAGES } from './site-check/pages.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

const pagesDir = resolve(import.meta.dirname, 'pages');
const layout = readFileSync(resolve(import.meta.dirname, 'components/Layout.astro'), 'utf8');

describe('EMBEDS', () => {
  it('embeds every calculator of the home at /embed + its path', () => {
    expect(EMBEDS.map(({ page }) => page)).toEqual(HOME_TOOLS.map(({ href }) => href));
    for (const { path, page } of EMBEDS) expect(path).toBe(`/embed${page}`);
  });

  it('has one source page per embed under src/pages/embed, and no other', () => {
    const files = readdirSync(resolve(pagesDir, 'embed'));
    expect(files.sort()).toEqual(EMBEDS.map(({ page }) => `${page.slice(1)}.astro`).sort());
    for (const file of files) {
      expect(readFileSync(resolve(pagesDir, 'embed', file), 'utf8'), file).toMatch(/\bembed\b/);
    }
  });

  it('lets each built embed load its one calculator script (the budgets of site-check)', () => {
    expect([...EMBED_PAGES].sort()).toEqual(
      EMBEDS.map(({ path }) => `${path.slice(1)}.html`).sort(),
    );
    for (const page of EMBED_PAGES) expect(CALCULATOR_PAGES).toContain(page);
  });

  it('names each calculator by the heading of its page', () => {
    expect(EMBEDS.map(({ name }) => name)).toEqual([
      VOLUME_TEXTS.h1,
      SALT.h1,
      CHLORINE.h1,
      PUMP.h1,
    ]);
  });
});

describe('snippets', () => {
  it('frames each calculator, then credits Pool Figures outside the frame', () => {
    expect(snippets).toHaveLength(EMBEDS.length);
    expect(snippets[1]?.code).toBe(
      [
        '<iframe src="https://poolfigures.com/embed/pool-salt-calculator" title="Pool salt calculator" width="100%" height="1100" style="border:0" loading="lazy"></iframe>',
        '<p><a href="https://poolfigures.com/pool-salt-calculator">Pool salt calculator by Pool Figures</a></p>',
      ].join('\n'),
    );
  });
});

describe('the embed page', () => {
  it('is a page of the sitemap at /embed-calculators, and the embeds are not', () => {
    const files = readdirSync(pagesDir).map((name) => `./${name}`);
    const paths = pagePaths(files.filter((name) => name.endsWith('.astro') && !name.includes('[')));
    expect(EMBED_PAGE.path).toBe('/embed-calculators');
    expect(paths).toContain(EMBED_PAGE.path);
    expect(paths.some((path) => path.startsWith('/embed/'))).toBe(false);
  });

  it('is linked from the footer of every page', () => {
    const footer = /<footer[\s\S]*<\/footer>/.exec(layout)?.[0] ?? '';
    expect(footer).toContain(`href="${EMBED_PAGE.path}"`);
  });

  it('keeps its title under 70 characters and a description search engines show whole', () => {
    expect(EMBED_PAGE.title).toContain('Pool Figures');
    expect(EMBED_PAGE.title.length).toBeLessThanOrEqual(70);
    expect(EMBED_PAGE.description.length).toBeGreaterThan(50);
    expect(EMBED_PAGE.description.length).toBeLessThanOrEqual(160);
  });

  it('asks to keep the link under the frame', () => {
    expect(EMBED_PAGE.steps.join(' ')).toContain('Keep the link');
  });
});
