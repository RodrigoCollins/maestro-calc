import { describe, expect, it } from 'vitest';
import { bylineProblems, type BylinePage } from './byline.ts';

const page = (over: { byline?: string; sources?: string; ld?: string } = {}): string =>
  [
    '<html><head>',
    over.ld ?? '<script type="application/ld+json">{"dateModified":"2026-11-07"}</script>',
    '</head><body><h1>T</h1>',
    over.byline ??
      '<p class="bf-byline">By <a href="/editorial-policy">Bowl Figures editorial team</a> · Checked <time datetime="2026-11-07">Nov 7, 2026</time> · <a href="#sources">Sources</a></p>',
    over.sources ??
      '<section aria-labelledby="sources"><h2 id="sources">Sources</h2><a href="https://a.test/x?a=1&amp;b=2">A</a></section>',
    '</body></html>',
  ].join('');

const PAGES: BylinePage[] = [
  {
    path: '/guide',
    checked: '2026-11-07',
    sources: [{ name: 'A', url: 'https://a.test/x?a=1&b=2' }, { name: 'No link' }],
  },
];
const run = (html: string, pages = PAGES, indexable = true) =>
  bylineProblems(new Map([['/guide', html]]), pages, '/editorial-policy', indexable);

describe('bylineProblems', () => {
  it('accepts a page with its byline, review day, JSON-LD day and linked sources', () => {
    expect(run(page())).toEqual([]);
  });

  it('names a page the build does not hold', () => {
    expect(bylineProblems(new Map(), PAGES, '/editorial-policy', true)).toEqual([
      '/guide: a byline page the build does not hold',
    ]);
  });

  it('wants the byline right under the h1', () => {
    expect(run(page({ byline: '<p>no class</p>' }))).toEqual(['/guide: no byline right under the h1']);
  });

  it('wants the team credited at the policy and the sources linked from the byline', () => {
    const byline = '<p class="bf-byline">By us <time datetime="2026-11-07">x</time></p>';
    expect(run(page({ byline }))).toEqual([
      '/guide: the byline must credit the editorial team at /editorial-policy',
      '/guide: the byline must link the #sources section',
    ]);
  });

  it('wants the review day the data carries, and none it does not', () => {
    const wrong = page({
      byline:
        '<p class="bf-byline"><a href="/editorial-policy">t</a><time datetime="2026-01-01">x</time><a href="#sources">s</a></p>',
    });
    expect(run(wrong)).toEqual(['/guide: the byline must give the review day 2026-11-07']);
    const undated = [{ path: '/guide', sources: [] }];
    expect(run(page(), undated)).toEqual([
      '/guide: the byline gives a review day the page data does not carry',
    ]);
    const bare =
      '<p class="bf-byline"><a href="/editorial-policy">t</a><a href="#sources">s</a></p>';
    expect(run(page({ byline: bare }), undated)).toEqual([]);
    expect(run(page({ byline: bare }))).toEqual([
      '/guide: the byline must give the review day 2026-11-07',
    ]);
  });

  it('holds an open site to the JSON-LD day and a closed one to nothing', () => {
    const ld = '<script type="application/ld+json">{"dateModified":"2026-01-01"}</script>';
    expect(run(page({ ld }))).toEqual(['/guide: the JSON-LD must give dateModified 2026-11-07']);
    expect(run(page({ ld }), PAGES, false)).toEqual([]);
  });

  it('wants a sources section that links every source with a link', () => {
    expect(run(page({ sources: '' }))).toEqual(['/guide: the page has no #sources section']);
    const partial = '<section aria-labelledby="sources"><a href="https://other.test">o</a></section>';
    expect(run(page({ sources: partial }))).toEqual([
      '/guide: the sources section does not link https://a.test/x?a=1&b=2',
    ]);
  });
});
