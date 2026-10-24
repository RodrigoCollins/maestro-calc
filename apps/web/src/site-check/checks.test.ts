import { describe, expect, it } from 'vitest';
import { checkSite } from './checks.ts';
import { LATIN_FONT, fixtureSite, validBinary, validDist } from './__testing__/page-fixture.ts';

describe('checkSite', () => {
  it('finds nothing wrong with a valid dist', () => {
    expect(checkSite(validDist(), fixtureSite(), validBinary())).toEqual([]);
  });

  it('runs the file-set, head, structure, asset, content, budget and glyph rules together', () => {
    const dist = validDist();
    dist.set('orphan.html', '<html></html>');
    dist.set(
      'about.html',
      (dist.get('about.html') ?? '')
        .replace('<h1>', '<h1>draft <h1>')
        .replace(/<meta name="description"[^>]*>/, ''),
    );
    dist.set('_astro/x.js', '');
    const binary = validBinary(dist);
    const sizes = new Map(binary.sizes).set('index.html', 40_961);
    const fonts = new Map(binary.fonts).set('_astro/fonts/a.woff2', LATIN_FONT().subarray(0, 10));
    expect(
      checkSite(dist, fixtureSite(), { sizes, fonts })
        .map(({ file, rule }) => `${file} ${rule}`)
        .filter((line, index, all) => all.indexOf(line) === index),
    ).toEqual(
      expect.arrayContaining([
        'orphan.html file-set',
        'about.html description',
        'about.html h1',
        'about.html owner-review',
        '_astro/x.js js-file',
        'index.html html-budget',
        '_astro/fonts/a.woff2 glyphs',
      ]),
    );
  });
});
