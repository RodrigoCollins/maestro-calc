import { describe, expect, it } from 'vitest';
import { bylineProblems } from './byline.ts';

const page = (main: string): string =>
  `<html><body><header><a href="/">Home</a></header><main class="pool-page">${main}</main></body></html>`;
const byline = (inner: string): string =>
  `<p class="pool-byline astro-7mgjudca">By <a href="/editorial-policy">the team</a>${inner}</p>`;
const dated = ` · Reviewed <time datetime="2026-11-05">November 5, 2026</time>`;
const sources = ' · <a href="#sources">Sources</a>';
const section =
  '<section aria-labelledby="sources"><h2 id="sources">Sources</h2><ul><li><a href="https://s.test">S</a></li></ul></section>';

describe('bylineProblems', () => {
  it('accepts a byline right under the h1, with its date and a sources link that resolves', () => {
    const site = new Map([
      [
        '/chart',
        page(`<p>Kicker</p><h1>Chart</h1>\n  ${byline(dated + sources)}<p>Lead</p>${section}`),
      ],
      [
        '/es/guia',
        page(
          `<h1>Guía</h1>${byline(sources).replace('/editorial-policy', '/es/politica-editorial')}${section}`,
        ),
      ],
    ]);
    expect(
      bylineProblems(site, [
        { path: '/chart', checked: '2026-11-05', sources: [{ name: 'S', url: 'https://s.test' }] },
        { path: '/es/guia', sources: [{ name: 'S', url: 'https://s.test' }] },
      ]),
    ).toEqual([]);
  });

  it('names a page that is missing, has no byline under its h1, or links the wrong policy', () => {
    const site = new Map([
      ['/late', page(`<h1>Late</h1><p>Lead</p>${byline(sources)}${section}`)],
      ['/es/x', page(`<h1>X</h1>${byline(sources)}${section}`)],
    ]);
    const one = [{ name: 'S', url: 'https://s.test' }];
    expect(
      bylineProblems(site, [
        { path: '/gone', sources: one },
        { path: '/late', sources: one },
        { path: '/es/x', sources: one },
      ]),
    ).toEqual([
      '/gone: a byline page the build does not hold',
      '/late: no byline right under the h1',
      '/es/x: the byline must credit the editorial team at /es/politica-editorial',
    ]);
  });

  it('wants the date the data carries, no other, and a sources section with every source', () => {
    const site = new Map([
      ['/a', page(`<h1>A</h1>${byline(sources)}${section}`)],
      ['/b', page(`<h1>B</h1>${byline(dated + sources)}${section}`)],
      ['/c', page(`<h1>C</h1>${byline(sources)}<a href="https://s.test">S</a>`)],
      ['/d', page(`<h1>D</h1>${byline('')}${section}`)],
      ['/e', page(`<h1>E</h1>${byline(sources)}${section}`)],
    ]);
    const one = [{ name: 'S', url: 'https://s.test' }];
    expect(
      bylineProblems(site, [
        { path: '/a', checked: '2026-11-05', sources: one },
        { path: '/b', sources: one },
        { path: '/c', sources: one },
        { path: '/d', sources: one },
        { path: '/e', sources: [...one, { name: 'T', url: 'https://t.test' }] },
      ]),
    ).toEqual([
      '/a: the byline must give the review day 2026-11-05',
      '/b: the byline gives a review day the page data does not carry',
      '/c: the page has no #sources section',
      '/d: the byline must link the #sources section',
      '/e: the sources section does not link https://t.test',
    ]);
  });
});
