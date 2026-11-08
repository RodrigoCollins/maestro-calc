import { describe, expect, it } from 'vitest';
import { headTextOf, seoAuditProblems, type SeoAuditRules } from './seo.ts';

const ORIGIN = 'https://x.test';
const head = (title: string, description: string, extra = ''): string =>
  `<html><head><title>${title}</title><meta name="description" content="${description}">${extra}</head></html>`;
const D1 = 'A description that is long enough to be shown whole in a result, one.';
const D2 = 'A description that is long enough to be shown whole in a result, two.';
const NOINDEX = '<meta name="robots" content="noindex">';
const canonical = (path: string): string => `<link rel="canonical" href="${ORIGIN}${path}">`;
const rules = (over: Partial<SeoAuditRules> = {}): SeoAuditRules => ({
  origin: ORIGIN,
  sitemap: ['/a', '/b'],
  robots: `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`,
  indexable: false,
  ...over,
});
const closed = new Map([
  ['/a', head('A | S', D1, NOINDEX)],
  ['/b', head('B | S', D2, NOINDEX)],
  ['/404', head('Not found | S', 'This page does not exist.', NOINDEX)],
]);

describe('headTextOf', () => {
  it('reads the title, description, canonical and robots, decoding entities', () => {
    expect(
      headTextOf(head('A &amp; B', 'x &quot;y&quot;', `${canonical('/a')}${NOINDEX}`)),
    ).toEqual({
      title: 'A & B',
      description: 'x "y"',
      canonical: `${ORIGIN}/a`,
      robots: 'noindex',
    });
    expect(headTextOf('<html></html>')).toEqual({ title: '', description: '' });
  });
});

describe('seoAuditProblems', () => {
  it('accepts a closed site: noindex everywhere, no canonical, the sitemap equal to the pages', () => {
    expect(seoAuditProblems(closed, rules())).toEqual([]);
  });

  it('accepts an open site: each page canonical at its own address, none noindex', () => {
    const open = new Map([
      ['/a', head('A | S', D1, canonical('/a'))],
      ['/b', head('B | S', D2, canonical('/b'))],
      ['/404', head('Not found | S', 'This page does not exist.', NOINDEX)],
    ]);
    expect(seoAuditProblems(open, rules({ indexable: true }))).toEqual([]);
  });

  it('names a page that breaks the closed or the open rule', () => {
    const wrong = new Map([
      ['/a', head('A | S', D1, canonical('/a'))],
      ['/b', head('B | S', D2, NOINDEX)],
    ]);
    expect(seoAuditProblems(wrong, rules())).toEqual([
      '/a: a closed site must say noindex',
      '/a: a closed site has no canonical',
    ]);
    expect(seoAuditProblems(wrong, rules({ indexable: true }))).toEqual([
      '/b: the canonical must be "https://x.test/b", found "none"',
      '/b: an open site must not say noindex',
    ]);
  });

  it('needs titles within 65 characters, descriptions of 50 to 160, each its own', () => {
    const bad = new Map([
      ['/a', head('T'.repeat(66), 'short', NOINDEX)],
      ['/b', head('T'.repeat(66), 'short', NOINDEX)],
    ]);
    const problems = seoAuditProblems(bad, rules());
    expect(problems).toContain('/a: the title has 66 characters, more than 65');
    expect(problems).toContain('/a: the description has 5 characters, outside 50 to 160');
    expect(problems.some((p) => p.startsWith('/b: the title "'))).toBe(true);
    expect(problems).toContain('/b: the description is also the description of /a');
  });

  it('needs the sitemap to list every page but the 404 and nothing else', () => {
    expect(seoAuditProblems(closed, rules({ sitemap: ['/a', '/404', '/c'] }))).toEqual([
      '/b: a page the sitemap does not list',
      '/404: in the sitemap, but the page must not be',
      '/c: in the sitemap, but the build does not hold it',
    ]);
  });

  it('needs robots.txt to let search engines in and name the sitemap', () => {
    expect(seoAuditProblems(closed, rules({ robots: undefined }))).toEqual([
      'robots.txt: not in the build',
    ]);
    expect(seoAuditProblems(closed, rules({ robots: 'User-agent: *\nDisallow: /\n' }))).toEqual([
      'robots.txt: "Disallow: /" keeps search engines out',
      'robots.txt: must name the sitemap https://x.test/sitemap.xml',
    ]);
  });
});
