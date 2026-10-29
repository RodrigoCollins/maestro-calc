import { describe, expect, it } from 'vitest';
import { checkSite } from './checks.ts';
import {
  calculatorSite,
  fixtureSite,
  latinFont,
  validBuildBytes,
  validDist,
} from './__testing__/page-fixture.ts';

describe('checkSite', () => {
  it('finds nothing wrong with a valid dist', () => {
    expect(checkSite(validDist(), fixtureSite(), validBuildBytes())).toEqual([]);
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
    const buildBytes = validBuildBytes(dist);
    const sizes = new Map(buildBytes.sizes).set('index.html', 49_153);
    const fonts = new Map(buildBytes.fonts).set(
      '_astro/fonts/a.woff2',
      latinFont().subarray(0, 10),
    );
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

  it('finds nothing wrong with a valid dist that has a calculator page in each locale', () => {
    const site = calculatorSite();
    const dist = validDist(site);
    expect(checkSite(dist, site, validBuildBytes(dist))).toEqual([]);
  });

  // spec: site-quality › [SQ26] gate side: an inline script on a calculator page fails check:site
  it('fails an inline script added to a calculator page, naming the page and the rule', () => {
    const site = calculatorSite();
    const dist = validDist(site);
    dist.set(
      'concrete-calculator.html',
      (dist.get('concrete-calculator.html') ?? '').replace(
        '</body>',
        '<script>alert(1)</script></body>',
      ),
    );
    expect(checkSite(dist, site, validBuildBytes(dist))).toEqual([
      {
        file: 'concrete-calculator.html',
        rule: 'script',
        message: 'an inline script is not allowed',
      },
    ]);
  });
});
