import { describe, expect, it } from 'vitest';
import { inboundOf, linkProblems, linksOf } from './links.ts';

const ORIGIN = 'https://cuantolecobro.com';
const page = (...hrefs: string[]): string =>
  `<main>${hrefs.map((href) => `<a href="${href}">x</a>`).join('')}</main><footer></footer>`;

describe('linksOf', () => {
  it('reads internal links as canonical paths, absolute ones on the origin included', () => {
    const links = linksOf(
      page(
        '/a',
        `${ORIGIN}/b?x=1#y`,
        '/c.html',
        'https://other.test/d',
        '#top',
        '//cdn.test/e',
        '/',
      ),
      ORIGIN,
    );
    expect([...links].sort()).toEqual(['/', '/a', '/b', '/c']);
  });
});

describe('inboundOf', () => {
  it('counts the other pages that link each page', () => {
    const site = new Map([
      ['/a', page('/b', '/a')],
      ['/b', page('/a')],
      ['/c', page('/a')],
    ]);
    expect(Object.fromEntries(inboundOf(site, ['/a', '/b', '/c'], ORIGIN))).toEqual({
      '/a': 2,
      '/b': 1,
      '/c': 0,
    });
  });
});

describe('linkProblems', () => {
  it('names a sitemap page the build does not hold, before anything else', () => {
    expect(linkProblems(new Map(), ['/missing'], ORIGIN)).toEqual([
      '/missing: a page the build does not hold',
    ]);
  });
});
