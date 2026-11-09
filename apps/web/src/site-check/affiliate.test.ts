import { describe, expect, it } from 'vitest';
import { affiliateBlockHtml } from '@maestro-calc/site-kit/affiliate';
import { fixtureSite, validDist } from './__testing__/page-fixture.ts';
import { affiliateProblems } from './affiliate.ts';
import { checkSite, contextOf } from './checks.ts';

const offer = {
  id: 'tool',
  network: 'cj',
  name: 'Tool',
  why: { en: 'Fits.', es: 'Encaja.' },
  url: 'https://example.com/tool',
  enabled: true,
} as const;

/** The valid fixture dist with `markup` added before the end of the body of its first page. */
const withMarkup = (markup: string) => {
  const site = fixtureSite();
  const dist = validDist(site);
  const [file, html] = [...dist].find(([name]) => name.endsWith('.html')) ?? ['', ''];
  dist.set(file, html.replace('</body>', `${markup}</body>`));
  return { file, problems: affiliateProblems(contextOf(dist, site, new Map())) };
};

describe('affiliateProblems', () => {
  it('passes the valid fixture and a page holding a recommendation block', () => {
    expect(withMarkup('').problems).toEqual([]);
    expect(withMarkup(affiliateBlockHtml(offer, 'en')).problems).toEqual([]);
  });

  it('names a sponsored link outside the block, under the affiliate rule', () => {
    const { file, problems } = withMarkup(
      '<a href="https://x.com" rel="sponsored noopener" target="_blank">x</a>',
    );
    expect(problems).toEqual([
      {
        file,
        rule: 'affiliate',
        message: 'the sponsored link to https://x.com must be inside a data-affiliate block',
      },
    ]);
  });

  it('runs as part of checkSite', () => {
    const site = fixtureSite();
    const dist = validDist(site);
    const [file, html] = [...dist].find(([name]) => name.endsWith('.html')) ?? ['', ''];
    dist.set(file, html.replace('</body>', '<a rel="sponsored">x</a></body>'));
    const found = checkSite(dist, site, { sizes: new Map(), fonts: new Map() }).filter(
      ({ rule }) => rule === 'affiliate',
    );
    expect(found.map(({ file: name }) => name)).toEqual([file]);
  });
});
