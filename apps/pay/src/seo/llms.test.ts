import { existsSync, readFileSync } from 'node:fs';
import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { describe, expect, it } from 'vitest';
import { LONG_TAIL_ROUTES } from '../long-tail/routes.ts';
import { ROUTES } from '../routes.ts';
import { SITE } from '../site.config.ts';
import { LLMS_PAGES, llmsTxt } from './llms.ts';

const text = llmsTxt(ROUTES, SITE.origin);
const lines = text.split('\n');
const LINK = /^- \[([^\]]+)\]\((https:\/\/[^)]+)\): (.+)$/;
const links = lines.flatMap((line) => {
  const found = LINK.exec(line);
  if (found === null) return [];
  const [, title = '', url = '', description = ''] = found;
  return [{ title, url, description }];
});
const longTail = new Set(LONG_TAIL_ROUTES.map(({ id }) => id));
// every page but the home, the long-tail pages and the privacy notice is worth an answer engine
const LISTED = ROUTES.filter(({ id }) => id !== 'home' && id !== 'privacy' && !longTail.has(id));
const urlsOf = (lang: 'en' | 'es'): string[] =>
  LISTED.map((route) => canonicalUrl(route[lang], SITE.origin));

describe('llms.txt', () => {
  it('opens with the site name as its one H1 and a one-line summary (llmstxt.org)', () => {
    expect(lines[0]).toBe('# Cuenta Horas');
    expect(lines.filter((line) => line.startsWith('# '))).toHaveLength(1);
    expect(lines[1]).toBe('');
    expect(lines[2]).toMatch(/^> \S.{20,200}$/);
  });

  it('lists the calculators, the guides and the Spanish pages under H2 sections', () => {
    const headings = lines.filter((line) => line.startsWith('## '));
    expect(headings).toEqual([
      '## Calculators',
      '## Guides',
      '## En español: calculadoras',
      '## En español: guías',
      '## Optional',
    ]);
  });

  it('links every calculator and article of the route table, in both languages, once', () => {
    const urls = links.map(({ url }) => url);
    expect([...urls].sort()).toEqual([...urlsOf('en'), ...urlsOf('es')].sort());
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('links only canonical URLs of real routes', () => {
    const routed = new Set(
      ROUTES.flatMap(({ en, es }) => [en, es]).map((path) => canonicalUrl(path, SITE.origin)),
    );
    for (const { url } of links) expect(routed.has(url), url).toBe(true);
  });

  it('gives each link the page title, without the site suffix, and a one-line description', () => {
    for (const { title, description } of links) {
      expect(title).not.toMatch(/\| Cuenta Horas$/);
      expect(description).not.toMatch(/\n/);
      expect(description.length).toBeGreaterThan(20);
    }
    expect(links).toContainEqual(
      expect.objectContaining({
        title: 'Tipped Minimum Wage by State, 2026',
        url: `${SITE.origin}/guides/tipped-minimum-wage-by-state`,
      }),
    );
  });

  it('has the texts of every listed page', () => {
    expect(Object.keys(LLMS_PAGES).sort()).toEqual(LISTED.map(({ id }) => id).sort());
  });

  it('is served at /llms.txt by an endpoint, never a static copy that could drift', () => {
    expect(existsSync(new URL('../pages/llms.txt.ts', import.meta.url))).toBe(true);
    expect(existsSync(new URL('../../public/llms.txt', import.meta.url))).toBe(false);
  });
});

describe('robots.txt', () => {
  it('blocks no answer engine crawler', () => {
    const robots = readFileSync(new URL('../../public/robots.txt', import.meta.url), 'utf8');
    expect(robots).toMatch(/^User-agent: \*\nAllow: \/$/m);
    expect(robots).not.toMatch(/Disallow/);
    for (const bot of ['GPTBot', 'OAI-SearchBot', 'PerplexityBot', 'ClaudeBot']) {
      expect(robots).not.toContain(bot);
    }
  });
});
