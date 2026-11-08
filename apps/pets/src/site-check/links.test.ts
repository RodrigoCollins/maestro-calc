import { describe, expect, it } from 'vitest';
import { linkProblems, linksOf, type LinkRules } from './links.ts';

const ORIGIN = 'https://bowlfigures.com';
const html = (main: string, footer = ''): string =>
  `<body><main>${main}</main><footer>${footer}</footer></body>`;

describe('linksOf', () => {
  it('reads internal links as canonical paths, dropping queries, fragments and other sites', () => {
    const text =
      '<a href="/a?x=1&amp;y=2">a</a><a href="/b#top">b</a><a href="https://bowlfigures.com/c">c</a>' +
      '<a href="https://other.test/d">d</a><a href="#here">e</a><a href="tel:+1">f</a><a href="//cdn.test/x">g</a>' +
      '<a href="/index.html">h</a><a href="/m.html">i</a><a class="x" href="/">j</a>';
    expect([...linksOf(text, ORIGIN)].sort()).toEqual(['/', '/a', '/b', '/c', '/m']);
  });
});

describe('linkProblems', () => {
  const site = new Map([
    ['/', html('<a href="/a">a</a>', '<a href="/b">b</a>')],
    ['/a', html('<a href="/b">b</a> <a href="/og.png">preview</a>', '<a href="/">home</a>')],
    ['/b', html('<a href="/a">a</a>', '<a href="/">home</a>')],
  ]);
  const rules: LinkRules = {
    origin: ORIGIN,
    sitemap: ['/', '/a', '/b'],
    must: [{ path: '/b', targets: ['/a'] }],
  };
  const files = new Set(['/og.png']);

  it('accepts a site whose pages all link one another as asked', () => {
    expect(linkProblems(site, rules, files)).toEqual([]);
  });

  it('names a page of the rules the build does not hold', () => {
    expect(linkProblems(new Map(), rules)).toEqual([
      '/: a page the build does not hold',
      '/a: a page the build does not hold',
      '/b: a page the build does not hold',
    ]);
  });

  it('names a link to a page that is not there, and a file only when it is not public', () => {
    expect(linkProblems(site, rules)).toEqual(['/a: links /og.png, which the build does not hold']);
  });

  it('names a link a page must carry in its main, not just anywhere', () => {
    const only = { ...rules, must: [{ path: '/', targets: ['/b'] }] };
    expect(linkProblems(site, only, files)).toEqual(['/: must link /b in its main']);
  });

  it('names an orphan: a sitemap page no other page links', () => {
    const orphaned = new Map(site);
    orphaned.set('/', html('<a href="/b">b</a>'));
    orphaned.set('/b', html('<a href="/a">a</a>'));
    orphaned.set('/a', html('<a href="/b">b</a>'));
    expect(linkProblems(orphaned, rules, files)).toEqual(['/: no other page in the sitemap links it']);
  });

  it('does not count a page linking itself', () => {
    const selfish = new Map(site);
    selfish.set('/a', html('<a href="/a">me</a>'));
    selfish.set('/', html('<a href="/b">b</a>'));
    selfish.set('/b', html('<a href="/">home</a>'));
    expect(linkProblems(selfish, rules, files)).toEqual([
      '/b: must link /a in its main',
      '/a: no other page in the sitemap links it',
    ]);
  });
});
