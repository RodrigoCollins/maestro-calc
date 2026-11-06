import { describe, expect, it } from 'vitest';
import { siteText } from '../lib/site-text.ts';
import { GET } from '../pages/llms.txt.ts';
import { GUIDE_IDS } from '../routing/guides.ts';
import { HUB_IDS } from '../routing/hubs.ts';
import { isChartJob, JOB_IDS } from '../routing/jobs.ts';
import { pathOf, ROUTES, urlOf, type PageId } from '../routing/routes.ts';
import { CALCULATOR_PAGES } from '../routing/templates.ts';
import { llmsTxt } from './llms.ts';
import { sitemapXml } from './sitemap.ts';

/*
 * `/llms.txt` (llmstxt.org): the site name, a one-line summary, then sections of links with a line
 * each, all derived from the route table and the site catalogs, so a new page can never be missing.
 */

const text = llmsTxt();
const lines = text.split('\n');

/** The lines of section `heading`, up to the next one. */
const sectionOf = (heading: string): string[] => {
  const start = lines.indexOf(`## ${heading}`);
  if (start === -1) return [];
  const end = lines.findIndex((line, index) => index > start && line.startsWith('## '));
  return lines.slice(start + 1, end === -1 ? undefined : end).filter((line) => line !== '');
};

/** The list item of a page: its title without the site suffix, its URL and its description. */
const itemOf = (id: PageId, locale: 'en' | 'es'): string => {
  const site = siteText(locale);
  const title = site(`page.${id}.title`).replace(/ \| Maestro Calc$/, '');
  return `- [${title}](${urlOf(pathOf(id, locale))}): ${site(`page.${id}.description`)}`;
};

describe('llms.txt (llmstxt.org, derived from the route table)', () => {
  it('opens with the site name and the summary of the home', () => {
    expect(lines[0]).toBe('# Maestro Calc');
    expect(lines[1]).toBe('');
    expect(lines[2]).toBe(`> ${siteText('en')('page.home.description')}`);
    expect(text.endsWith('\n')).toBe(true);
  });

  it('lists every calculator, chart, guide and hub in English, each once, in table order', () => {
    expect(sectionOf('Calculators')).toEqual(CALCULATOR_PAGES.map((id) => itemOf(id, 'en')));
    // the data and charts index first, then each chart
    expect(sectionOf('Reference charts')).toEqual(
      (['charts', ...JOB_IDS.filter(isChartJob)] as const).map((id) => itemOf(id, 'en')),
    );
    expect(sectionOf('Guides')).toEqual(GUIDE_IDS.map((id) => itemOf(id, 'en')));
    expect(sectionOf('Trades')).toEqual(HUB_IDS.map((id) => itemOf(id, 'en')));
    expect(sectionOf('About')).toEqual(
      (['methodology', 'about', 'glossary', 'guides', 'embed-calculators'] as const).map((id) =>
        itemOf(id, 'en'),
      ),
    );
  });

  it('lists the Spanish calculators, charts and guides, and every other job as optional', () => {
    expect(sectionOf('Español')).toEqual(
      [...CALCULATOR_PAGES, 'charts' as const, ...JOB_IDS.filter(isChartJob), ...GUIDE_IDS].map(
        (id) => itemOf(id, 'es'),
      ),
    );
    expect(sectionOf('Optional')).toEqual(
      JOB_IDS.filter((id) => !isChartJob(id)).map((id) => itemOf(id, 'en')),
    );
  });

  it('links only canonical URLs of the sitemap, each a list item with a description', () => {
    const sitemap = sitemapXml();
    const items = lines.filter((line) => line.startsWith('- '));
    expect(items.length).toBeGreaterThan(Object.keys(ROUTES).length);
    for (const item of items) {
      const match = /^- \[[^\]\n]+\]\((https:\/\/maestrocalc\.com[^)\s]*)\): \S.*$/.exec(item);
      expect(match, item).not.toBeNull();
      expect(sitemap, item).toContain(`<loc>${match?.[1] ?? ''}</loc>`);
    }
    expect(new Set(items).size).toBe(items.length);
  });

  it('is served as UTF-8 plain text', async () => {
    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    expect(await response.text()).toBe(text);
  });
});
