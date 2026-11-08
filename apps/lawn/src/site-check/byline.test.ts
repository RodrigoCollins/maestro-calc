import { describe, expect, it } from 'vitest';
import { bylineProblems } from './byline.ts';

const ld = (day: string): string =>
  `<script type="application/ld+json">{"@type":"Article","dateModified":"${day}"}</script>`;
const page = (main: string, head = ''): string =>
  `<html><head>${head}</head><body><header><a href="/">Home</a></header><main class="lawn-main">${main}</main></body></html>`;
const byline = (inner: string, policy = '/editorial-policy'): string =>
  `<p class="lawn-byline astro-7mgjudca">By <a href="${policy}">the team</a>${inner}</p>`;
const dated = ' · Reviewed <time datetime="2026-11-07">November 7, 2026</time>';
const sources = ' · <a href="#sources">Sources</a>';
const section =
  '<section aria-labelledby="sources"><h2 id="sources">Sources</h2><ul><li><a href="https://s.test">S</a></li></ul></section>';
const entry = {
  path: '/guide',
  checked: '2026-11-07',
  sources: [{ name: 'S', url: 'https://s.test' }],
};
const good = page(
  `<p>Kicker</p><h1>Guide</h1>\n  ${byline(dated + sources)}<p>Lead</p>${section}`,
  ld('2026-11-07'),
);

describe('bylineProblems', () => {
  it('accepts a byline right under the h1, with its date and a sources link that resolves', () => {
    expect(bylineProblems(new Map([['/guide', good]]), [entry])).toEqual([]);
  });

  it('names a page that is missing, or has no byline under its h1', () => {
    expect(bylineProblems(new Map(), [entry])).toEqual([
      '/guide: a byline page the build does not hold',
    ]);
    const none = page(`<h1>Guide</h1><p>Lead</p>${byline(sources)}${section}`, ld('2026-11-07'));
    expect(bylineProblems(new Map([['/guide', none]]), [entry])).toEqual([
      '/guide: no byline right under the h1',
    ]);
  });

  it('wants the editorial policy, the review day in the byline and the JSON-LD, and the sources', () => {
    const wrong = page(
      `<h1>Guide</h1>${byline(' · Reviewed <time datetime="2026-01-01">x</time>', '/other')}`,
      ld('2026-01-01'),
    );
    expect(bylineProblems(new Map([['/guide', wrong]]), [entry])).toEqual([
      '/guide: the byline must credit the editorial team at /editorial-policy',
      '/guide: the byline must give the review day 2026-11-07',
      '/guide: the JSON-LD must give dateModified 2026-11-07',
      '/guide: the byline must link the #sources section',
      '/guide: the page has no #sources section',
    ]);
  });

  it('wants every source linked in the sources section, with ampersands escaped', () => {
    const more = {
      ...entry,
      sources: [
        ...entry.sources,
        { name: 'T', url: 'https://t.test/?a=1&b=2' },
        { name: 'No link' },
      ],
    };
    expect(bylineProblems(new Map([['/guide', good]]), [more])).toEqual([
      '/guide: the sources section does not link https://t.test/?a=1&b=2',
    ]);
  });
});
