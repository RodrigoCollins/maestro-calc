import { describe, expect, it } from 'vitest';
import { headTextOf, seoAuditProblems, type SeoAuditRules } from './seo.ts';

const ORIGIN = 'https://bowlfigures.com';
const DESCRIPTION = 'A description of a page that is long enough to be shown whole in a result.';

const page = (
  over: { title?: string; description?: string; canonical?: string | null; noindex?: boolean } = {},
): string =>
  [
    '<html><head>',
    over.noindex === true ? '<meta name="robots" content="noindex">' : '',
    over.canonical === null || over.canonical === undefined
      ? ''
      : `<link rel="canonical" href="${over.canonical}">`,
    `<title>${over.title ?? 'A page | Bowl Figures'}</title>`,
    `<meta name="description" content="${over.description ?? DESCRIPTION}">`,
    '</head><body></body></html>',
  ].join('');

const ROBOTS = 'User-agent: *\nAllow: /\n\nSitemap: https://bowlfigures.com/sitemap.xml\n';
const rules = (over: Partial<SeoAuditRules> = {}): SeoAuditRules => ({
  origin: ORIGIN,
  indexable: false,
  sitemap: ['/a', '/b'],
  robots: ROBOTS,
  ...over,
});
const closedSite = (): Map<string, string> =>
  new Map([
    ['/a', page({ title: 'A | Bowl Figures', description: `${DESCRIPTION} A`, noindex: true })],
    ['/b', page({ title: 'B | Bowl Figures', description: `${DESCRIPTION} B`, noindex: true })],
    ['/404', page({ noindex: true })],
  ]);
const openSite = (): Map<string, string> =>
  new Map([
    [
      '/a',
      page({
        title: 'A | Bowl Figures',
        description: `${DESCRIPTION} A`,
        canonical: `${ORIGIN}/a`,
      }),
    ],
    [
      '/b',
      page({
        title: 'B | Bowl Figures',
        description: `${DESCRIPTION} B`,
        canonical: `${ORIGIN}/b`,
      }),
    ],
    ['/404', page({ noindex: true })],
  ]);

describe('headTextOf', () => {
  it('reads the head, decoding entities', () => {
    expect(
      headTextOf(page({ title: 'Cats &amp; dogs', canonical: `${ORIGIN}/a`, noindex: true })),
    ).toEqual({
      title: 'Cats & dogs',
      description: DESCRIPTION,
      canonical: `${ORIGIN}/a`,
      robots: 'noindex',
    });
  });

  it('leaves out what a page does not say', () => {
    expect(headTextOf('<html></html>')).toEqual({ title: '', description: '' });
  });
});

describe('seoAuditProblems', () => {
  it('accepts a closed site whose pages all say noindex, and an open one with its canonicals', () => {
    expect(seoAuditProblems(closedSite(), rules())).toEqual([]);
    expect(seoAuditProblems(openSite(), rules({ indexable: true }))).toEqual([]);
  });

  it('wants noindex and no canonical while the site is closed', () => {
    expect(seoAuditProblems(openSite(), rules())).toEqual([
      '/a: a closed site must say noindex',
      '/a: a closed site must name no canonical',
      '/b: a closed site must say noindex',
      '/b: a closed site must name no canonical',
    ]);
  });

  it('wants each canonical at its own address and no noindex once the site is open', () => {
    expect(seoAuditProblems(closedSite(), rules({ indexable: true }))).toEqual([
      '/a: the canonical must be "https://bowlfigures.com/a", found "none"',
      '/a: an open site must not say noindex',
      '/b: the canonical must be "https://bowlfigures.com/b", found "none"',
      '/b: an open site must not say noindex',
    ]);
  });

  it('measures titles and descriptions, and finds the ones two pages share', () => {
    const site = closedSite();
    site.set('/a', page({ title: 'T'.repeat(66), description: 'short', noindex: true }));
    site.set('/b', page({ title: 'T'.repeat(66), description: 'short', noindex: true }));
    expect(seoAuditProblems(site, rules())).toEqual([
      '/a: the title has 66 characters, more than 65',
      '/a: the description has 5 characters, outside 50 to 160',
      '/b: the title has 66 characters, more than 65',
      '/b: the description has 5 characters, outside 50 to 160',
      `/b: the title "${'T'.repeat(66)}" is also the title of /a`,
      '/b: the description is also the description of /a',
    ]);
  });

  it('wants the sitemap to list exactly the pages, the 404 never', () => {
    expect(seoAuditProblems(closedSite(), rules({ sitemap: ['/a', '/c'] }))).toEqual([
      '/b: a page the sitemap does not list',
      '/c: in the sitemap, but the build does not hold it',
    ]);
  });

  it('holds a closed language of an open site to noindex, no canonical and no sitemap line', () => {
    const site = openSite();
    site.set(
      '/de/c',
      page({ title: 'C | Bowl Figures', description: `${DESCRIPTION} C`, noindex: true }),
    );
    const german = (path: string): boolean => path.startsWith('/de/');
    expect(seoAuditProblems(site, rules({ indexable: true, closed: german }))).toEqual([]);
    site.set(
      '/de/c',
      page({
        title: 'C | Bowl Figures',
        description: `${DESCRIPTION} C`,
        canonical: `${ORIGIN}/de/c`,
      }),
    );
    expect(
      seoAuditProblems(
        site,
        rules({ indexable: true, closed: german, sitemap: ['/a', '/b', '/de/c'] }),
      ),
    ).toEqual([
      '/de/c: a closed language must say noindex',
      '/de/c: a closed language must name no canonical',
      '/de/c: closed to search engines, but in the sitemap',
    ]);
  });

  it('keeps the 404 out of the index', () => {
    const site = closedSite();
    site.set('/404', page({ canonical: `${ORIGIN}/404` }));
    expect(seoAuditProblems(site, rules())).toEqual(['/404: the 404 page must say noindex']);
  });

  it('wants a robots.txt that lets crawlers in and names the sitemap', () => {
    expect(seoAuditProblems(closedSite(), rules({ robots: undefined }))).toEqual([
      'robots.txt: not in the build',
    ]);
    expect(
      seoAuditProblems(closedSite(), rules({ robots: 'User-agent: *\nDisallow: /\n' })),
    ).toEqual([
      'robots.txt: "Disallow: /" keeps search engines out',
      'robots.txt: must name the sitemap https://bowlfigures.com/sitemap.xml',
    ]);
  });
});
