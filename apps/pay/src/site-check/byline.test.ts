import { describe, expect, it } from 'vitest';
import { bylineProblems } from './byline.ts';

const page = {
  path: '/guides/x',
  checked: '2026-11-05',
  sources: ['https://www.dol.gov/a?b=1&c=2', 'https://www.irs.gov/b'],
};
const BYLINE =
  '<p class="byline">By the <a href="/editorial-policy">Cuenta Horas editorial team</a> · Reviewed <time datetime="2026-11-05">November 5, 2026</time> · <a href="#sources">Sources</a></p>';
const SOURCES =
  '<section aria-labelledby="sources"><h2 id="sources">Sources</h2><ul><li><a href="https://www.dol.gov/a?b=1&amp;c=2">A</a></li><li><a href="https://www.irs.gov/b">B</a></li></ul></section>';
const html = (byline: string, sources = SOURCES): string =>
  `<main><div><p class="kicker">Guide</p><h1>X</h1>${byline}</div><p>Text</p>${sources}</main>`;
const problemsOf = (built: string | undefined, at = page) =>
  bylineProblems((path) => (path === at.path ? built : undefined), [at]);

describe('bylineProblems', () => {
  it('accepts the byline right under the h1 and a sources section that links every source', () => {
    expect(problemsOf(html(BYLINE))).toEqual([]);
  });

  it('accepts the sources on an element with the id, such as the line under a table', () => {
    const line =
      '<p class="sources" id="sources">Sources: <a href="https://www.dol.gov/a?b=1&amp;c=2">A</a>; <a href="https://www.irs.gov/b">B</a></p>';
    expect(problemsOf(html(BYLINE, line))).toEqual([]);
  });

  it('names a page the build does not hold', () => {
    expect(problemsOf(undefined)).toEqual(['/guides/x: a byline page the build does not hold']);
  });

  it('wants the byline right under the h1', () => {
    expect(problemsOf(html(`<p>Lead</p>${BYLINE}`))).toEqual([
      '/guides/x: no byline right under the h1',
    ]);
  });

  it('wants the team linked to the editorial policy of the page language', () => {
    const es = { ...page, path: '/es/guias/x' };
    expect(problemsOf(html(BYLINE), es)).toEqual([
      '/es/guias/x: the byline must credit the editorial team at /es/politica-editorial',
    ]);
  });

  it('wants the review day the page data carries', () => {
    expect(problemsOf(html(BYLINE.replace('2026-11-05', '2026-11-04')))).toEqual([
      '/guides/x: the byline must give the review day 2026-11-05',
    ]);
  });

  it('wants the byline to link the sources, and the section to link each source', () => {
    expect(problemsOf(html(BYLINE.replace('#sources', '#elsewhere')))).toEqual([
      '/guides/x: the byline must link the #sources section',
    ]);
    expect(problemsOf(html(BYLINE, SOURCES.replace('https://www.irs.gov/b', '/b')))).toEqual([
      '/guides/x: the sources section does not link https://www.irs.gov/b',
    ]);
    expect(problemsOf(html(BYLINE, ''))).toEqual(['/guides/x: the page has no #sources section']);
  });
});
