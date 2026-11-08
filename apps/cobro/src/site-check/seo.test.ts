import { describe, expect, it } from 'vitest';
import { alwaysNoindex, asLaunched, robotsProblems, switchProblems } from './seo.ts';

const NOINDEX = '<meta name="robots" content="noindex">';

describe('the launch switch', () => {
  const pages = new Map([
    ['index.html', `<head>${NOINDEX}</head>`],
    ['404.html', `<head>${NOINDEX}</head>`],
    ['embed/x.html', `<head>${NOINDEX}</head>`],
  ]);

  it('keeps the 404 and the embeds out of search whatever the switch says', () => {
    expect(alwaysNoindex('404.html')).toBe(true);
    expect(alwaysNoindex('embed/x.html')).toBe(true);
    expect(alwaysNoindex('index.html')).toBe(false);
  });

  it('takes the noindex off the pages meant to be indexed, and only those', () => {
    const launched = asLaunched(pages);
    expect(launched.get('index.html')).toBe('<head></head>');
    expect(launched.get('404.html')).toContain('noindex');
    expect(launched.get('embed/x.html')).toContain('noindex');
  });

  it('accepts a closed site that is noindex everywhere', () => {
    expect(switchProblems(pages, false)).toEqual([]);
  });

  it('names the pages that disagree with the switch', () => {
    expect(switchProblems(pages, true)).toEqual([
      'index.html: must not be noindex while indexable is true',
    ]);
    expect(switchProblems(new Map([['index.html', '<head></head>']]), false)).toEqual([
      'index.html: must be noindex while indexable is false',
    ]);
  });
});

describe('robotsProblems', () => {
  const origin = 'https://cuantolecobro.com';

  it('accepts a robots.txt that lets crawlers in and names the sitemap', () => {
    expect(
      robotsProblems(`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`, origin),
    ).toEqual([]);
  });

  it('names what is missing', () => {
    expect(robotsProblems(undefined, origin)).toEqual(['robots.txt: not in the build']);
    expect(robotsProblems('User-agent: *\nDisallow: /\n', origin)).toEqual([
      'robots.txt: must allow /',
      `robots.txt: must name ${origin}/sitemap.xml`,
    ]);
  });
});
