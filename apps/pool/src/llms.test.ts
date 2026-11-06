import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CHARTS_INDEX } from './charts.ts';
import { GUIDES } from './guide.ts';
import { HOME_TOOLS } from './home.ts';
import { JOB_PAGES } from './jobs.ts';
import { llmsTxt } from './llms.ts';
import { pagePaths } from './seo/sitemap.ts';
import { SITE } from './site.config.ts';

const pagesDir = new URL('pages/', import.meta.url);
const files = readdirSync(fileURLToPath(pagesDir))
  .filter((name) => name.endsWith('.astro'))
  .map((name) => `./${name}`);
// the sitemap's own list (`pages/sitemap.xml.ts`)
const sitemap = pagePaths(files, { './[job].astro': JOB_PAGES.map(({ path }) => path) });

const text = llmsTxt();
const lines = text.split('\n');
const LINK = /^- \[([^\]]+)\]\((https:\/\/[^)]+)\): (.+)$/;
const links = lines.flatMap((line) => {
  const found = LINK.exec(line);
  return found === null
    ? []
    : [{ name: found[1] ?? '', url: found[2] ?? '', note: found[3] ?? '' }];
});
const pathOf = (url: string): string => new URL(url).pathname;

describe('llms.txt', () => {
  it('is served at /llms.txt, built from the same lists as the sitemap', () => {
    expect(readdirSync(fileURLToPath(pagesDir))).toContain('llms.txt.ts');
    const endpoint = readFileSync(fileURLToPath(new URL('llms.txt.ts', pagesDir)), 'utf8');
    expect(endpoint).toContain('llmsTxt');
  });

  // llmstxt.org: an H1 with the name, a blockquote summary, then H2 sections of link lists
  it('opens with the site name and a one-line summary', () => {
    expect(lines[0]).toBe(`# ${SITE.name}`);
    expect(lines[1]).toBe('');
    expect(lines[2]?.startsWith('> ')).toBe(true);
    expect(text.endsWith('\n')).toBe(true);
  });

  it('lists the calculators, the guides and the pool sizes in sections, the sizes optional', () => {
    const sections = lines.filter((line) => line.startsWith('## '));
    expect(sections).toEqual(['## Calculators', '## Guides and charts', '## About', '## Optional']);
    expect(lines.filter((line) => line.startsWith('# '))).toHaveLength(1);
  });

  it('gives every link a name and a one-line description', () => {
    expect(links.length).toBeGreaterThan(0);
    for (const { name, note } of links) {
      expect(name.length).toBeGreaterThan(0);
      expect(note.length).toBeGreaterThan(10);
      expect(note).not.toContain('\n');
    }
  });

  // every address is a canonical page the sitemap lists, and every sitemap page but the home is listed
  it('links every page of the sitemap, by its canonical address, and nothing else', () => {
    for (const { url } of links) expect(url.startsWith(`${SITE.origin}/`)).toBe(true);
    const paths = links.map(({ url }) => pathOf(url));
    expect(new Set(paths).size).toBe(paths.length);
    expect([...paths].sort()).toEqual(sitemap.filter((path) => path !== '/'));
  });

  it('lists the data index with the guides and charts', () => {
    const section = text.split('## Guides and charts')[1]?.split('\n## ')[0] ?? '';
    expect(section).toContain(
      `- [${CHARTS_INDEX.name}](${SITE.origin}${CHARTS_INDEX.path}): ${CHARTS_INDEX.description}`,
    );
  });

  it('describes each calculator and guide as the home lists it', () => {
    for (const { href, title, summary } of HOME_TOOLS)
      expect(text).toContain(`- [${title} calculator](${SITE.origin}${href}): ${summary}`);
    for (const { path, card } of GUIDES)
      expect(text).toContain(`- [${card.title}](${SITE.origin}${path}): ${card.summary}`);
  });
});

describe('robots.txt', () => {
  const robots = readFileSync(
    fileURLToPath(new URL('../public/robots.txt', import.meta.url)),
    'utf8',
  );

  // AI answer engines read the site as search engines do: no crawler is singled out or kept out
  it('lets every crawler in, the AI answer engines included', () => {
    expect(robots).toMatch(/^User-agent: \*$/m);
    expect(robots).not.toMatch(/^Disallow:\s*\S/m);
    for (const bot of ['GPTBot', 'OAI-SearchBot', 'PerplexityBot', 'ClaudeBot'])
      expect(robots).not.toContain(bot);
  });
});
