import { describe, expect, it } from 'vitest';
import { checkSite } from './checks.ts';
import { fixtureSite, validDist } from './__testing__/page-fixture.ts';

describe('checkSite', () => {
  it('finds nothing wrong with a valid dist', () => {
    expect(checkSite(validDist(), fixtureSite())).toEqual([]);
  });

  it('runs the file-set, head, structure, asset and content rules together', () => {
    const dist = validDist();
    dist.set('orphan.html', '<html></html>');
    dist.set(
      'about.html',
      (dist.get('about.html') ?? '')
        .replace('<h1>', '<h1>draft <h1>')
        .replace(/<meta name="description"[^>]*>/, ''),
    );
    dist.set('_astro/x.js', '');
    expect(
      checkSite(dist, fixtureSite())
        .map(({ file, rule }) => `${file} ${rule}`)
        .filter((line, index, all) => all.indexOf(line) === index),
    ).toEqual(
      expect.arrayContaining([
        'orphan.html file-set',
        'about.html description',
        'about.html h1',
        'about.html owner-review',
        '_astro/x.js js-file',
      ]),
    );
  });
});
