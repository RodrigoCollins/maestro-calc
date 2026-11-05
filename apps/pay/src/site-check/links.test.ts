import { describe, expect, it } from 'vitest';
import { inboundOf, linkProblems, linksOf, type LinkRules } from './links.ts';

const anchors = (...hrefs: string[]): string =>
  `<html><body>${hrefs.map((href) => `<a class="x" href="${href}">x</a>`).join('')}</body></html>`;

/** A page of the site: every one links the home from its header, as `SiteLayout.astro` does. */
const page = (...hrefs: string[]): string => anchors('/', ...hrefs);

describe('linksOf', () => {
  it('reads the internal paths of the anchors, once each, without query, hash or trailing slash', () => {
    const html = anchors(
      '/pay/a',
      'https://cuentahoras.com/pay/b?x=1#top',
      '/pay/a',
      '/es/',
      '#main',
      'https://example.com/out',
      'https://cuentahoras.com',
    );
    expect(linksOf(html, 'https://cuentahoras.com')).toEqual(['/pay/a', '/pay/b', '/es', '/']);
  });

  it('ignores a link element of the head and an anchor without href', () => {
    const html = '<link rel="canonical" href="/x"><a id="y">y</a><a\nhref="/z">z</a>';
    expect(linksOf(html, 'https://cuentahoras.com')).toEqual(['/z']);
  });
});

describe('inboundOf', () => {
  it('counts the other pages that link each page, a self link left out', () => {
    const pages = new Map([
      ['/', anchors('/a', '/b', '/')],
      ['/a', anchors('/b', '/a')],
      ['/b', anchors()],
    ]);
    expect(inboundOf(pages, 'https://o.test')).toEqual(
      new Map([
        ['/', 0],
        ['/a', 1],
        ['/b', 2],
      ]),
    );
  });
});

const rules = (pages: Record<string, string>, overrides: Partial<LinkRules> = {}): LinkRules => ({
  origin: 'https://o.test',
  pages: new Map(Object.entries(pages)),
  longTail: [{ path: '/pay/a', calculator: '/calc', siblings: ['/pay/b'] }],
  guides: [{ path: '/guide', calculators: ['/calc'] }],
  hubs: ['/'],
  ...overrides,
});

const healthy = {
  '/': page('/calc', '/guide'),
  '/calc': page('/pay/a', '/pay/b', '/guide'),
  '/pay/a': page('/calc', '/pay/b'),
  '/pay/b': page('/calc', '/pay/a'),
  '/guide': page('/calc'),
};

describe('linkProblems', () => {
  it('finds nothing on a site whose pages link as the rules say', () => {
    expect(linkProblems(rules(healthy))).toEqual([]);
  });

  it('names a long-tail page its calculator does not link', () => {
    expect(linkProblems(rules({ ...healthy, '/calc': page('/pay/b', '/guide') }))).toContain(
      '/pay/a: not linked from its calculator /calc',
    );
  });

  it('names a long-tail page that does not link its calculator or a sibling', () => {
    expect(linkProblems(rules({ ...healthy, '/pay/a': page() }))).toEqual([
      '/pay/a: does not link its calculator /calc',
      '/pay/a: does not link its sibling /pay/b',
    ]);
  });

  it('names a guide no hub links and one a calculator it explains does not link', () => {
    expect(
      linkProblems(rules({ ...healthy, '/': page('/calc'), '/calc': page('/pay/a', '/pay/b') })),
    ).toEqual([
      '/guide: not linked from the home or a hub',
      '/guide: not linked from the calculator it explains /calc',
      '/guide: an orphan, no other page links it',
    ]);
  });

  it('names a guide that does not link back to a calculator it explains', () => {
    expect(linkProblems(rules({ ...healthy, '/guide': page() }))).toEqual([
      '/guide: does not link the calculator it explains /calc',
    ]);
  });

  it('names an orphan: a page of the sitemap no other page links', () => {
    expect(linkProblems(rules({ ...healthy, '/lost': page('/calc') }))).toEqual([
      '/lost: an orphan, no other page links it',
    ]);
  });

  it('names a page of the rules the build does not hold', () => {
    const rest = Object.fromEntries(Object.entries(healthy).filter(([path]) => path !== '/pay/b'));
    expect(linkProblems(rules(rest))).toContain('/pay/b: a page the build does not hold');
  });

  it('names a hub the build does not hold', () => {
    expect(linkProblems(rules(healthy, { hubs: ['/', '/es'] }))).toEqual([
      '/es: a page the build does not hold',
    ]);
  });
});
