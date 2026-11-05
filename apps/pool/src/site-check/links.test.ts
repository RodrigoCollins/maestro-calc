import { describe, expect, it } from 'vitest';
import { inboundOf, linkProblems, linksOf, type LinkRules } from './links.ts';

const ORIGIN = 'https://poolfigures.com';

const page = (body: string, footer = ''): string =>
  `<html><body><header><a href="/">Pool Figures</a></header><main>${body}</main><footer class="pool-footer">${footer}</footer></body></html>`;

const a = (href: string): string => `<a href="${href}">x</a>`;

const FOOTER = a('/guide');

const RULES: LinkRules = {
  origin: ORIGIN,
  sitemap: ['/', '/calc', '/job-1', '/job-2', '/guide'],
  jobs: [
    { path: '/job-1', calculator: '/calc', neighbors: ['/job-2'] },
    { path: '/job-2', calculator: '/calc', neighbors: ['/job-1'] },
  ],
  guides: [{ path: '/guide', calculators: ['/calc'] }],
};

const SITE: ReadonlyMap<string, string> = new Map([
  [
    '/',
    page(`<section aria-labelledby="pool-guides">${a('/guide')}</section>${a('/calc')}`, FOOTER),
  ],
  ['/calc', page(`${a('/job-1')}${a('/job-2')}${a('/guide')}`, FOOTER)],
  ['/job-1', page(`${a('/calc?gallons=1')}${a('/job-2')}`, FOOTER)],
  ['/job-2', page(`${a('/calc#top')}${a('/job-1')}`, FOOTER)],
  ['/guide', page(a('/calc'), FOOTER)],
]);

const without = (path: string, html: string): ReadonlyMap<string, string> =>
  new Map([...SITE, [path, html]]);

describe('linksOf', () => {
  it('reads the internal links of a page as canonical paths, without query or fragment', () => {
    const html = `${a('/calc?gallons=1')}${a('/calc#x')}${a(`${ORIGIN}/guide`)}${a('https://example.com/a')}${a('#local')}${a('mailto:a@b.c')}${a('/about.html')}`;
    expect([...linksOf(html, ORIGIN)].sort()).toEqual(['/about', '/calc', '/guide']);
  });

  it('reads the href of an anchor that carries other attributes first', () => {
    expect([...linksOf('<a class="b" data-x="1" href="/calc">c</a>', ORIGIN)]).toEqual(['/calc']);
  });
});

describe('inboundOf', () => {
  it('counts, for every sitemap page, the other sitemap pages that link it', () => {
    const inbound = inboundOf(SITE, RULES);
    expect(inbound.get('/job-1')).toBe(2);
    expect(inbound.get('/guide')).toBe(4);
    expect(inbound.get('/')).toBe(4);
  });
});

describe('linkProblems', () => {
  it('passes a site whose pages link one another as the rules ask', () => {
    expect(linkProblems(SITE, RULES)).toEqual([]);
  });

  it('names a job page its calculator does not link', () => {
    const site = without('/calc', page(`${a('/job-2')}${a('/guide')}`, FOOTER));
    expect(linkProblems(site, RULES)).toContain('/calc: must link its job page /job-1');
  });

  it('names a job page that does not link back to its calculator', () => {
    const site = without('/job-1', page(a('/job-2'), FOOTER));
    expect(linkProblems(site, RULES)).toContain('/job-1: must link its calculator /calc');
  });

  it('reads a relation in the main content only, not in the header or the footer', () => {
    const html = page(a('/job-2'), `${FOOTER}${a('/calc')}`).replace(
      '<header>',
      `<header>${a('/calc')}`,
    );
    expect(linkProblems(without('/job-1', html), RULES)).toContain(
      '/job-1: must link its calculator /calc',
    );
  });

  it('names a job page that does not link a nearest sibling', () => {
    const site = without('/job-1', page(a('/calc'), FOOTER));
    expect(linkProblems(site, RULES)).toContain('/job-1: must link its sibling /job-2');
  });

  it('names a guide the home Guides list leaves out', () => {
    const site = without(
      '/',
      page(`<section aria-labelledby="pool-guides"></section>${a('/guide')}`, FOOTER),
    );
    expect(linkProblems(site, RULES)).toContain('/: the Guides list must link /guide');
  });

  it('names a page whose footer leaves a guide out', () => {
    const site = without('/job-2', page(`${a('/calc')}${a('/job-1')}${a('/guide')}`));
    expect(linkProblems(site, RULES)).toContain('/job-2: the footer must link the guide /guide');
  });

  it('names a calculator that does not link a guide that explains it', () => {
    const site = without('/calc', page(`${a('/job-1')}${a('/job-2')}`, FOOTER));
    expect(linkProblems(site, RULES)).toContain('/calc: must link its guide /guide');
  });

  it('names a guide that does not link a calculator it explains', () => {
    const site = without('/guide', page('', FOOTER));
    expect(linkProblems(site, RULES)).toContain(
      '/guide: must link the calculator it explains, /calc',
    );
  });

  it('names a sitemap page no other page links', () => {
    const rules = { ...RULES, sitemap: [...RULES.sitemap, '/lost'] };
    const site = new Map([...SITE, ['/lost', page(a('/lost'), FOOTER)]]);
    expect(linkProblems(site, rules)).toEqual(['/lost: no other page in the sitemap links it']);
  });

  it('names a page of the rules the build does not hold', () => {
    const site = new Map([...SITE].filter(([path]) => path !== '/job-2'));
    expect(linkProblems(site, RULES)).toContain('/job-2: a page the build does not hold');
  });
});
