import { describe, expect, it } from 'vitest';
import { linkProblems, type LinkRules } from './links.ts';

const a = (href: string): string => `<a href="${href}">x</a>`;
const page = (main: string, footer = ''): string =>
  `<main>${main}</main><footer>${footer}</footer>`;

// the cost guides: the home lists every one, the hub links each, and each links the hub
describe('the cost guides of linkProblems', () => {
  const FOOTER = `${a('/guide')}${a('/frost')}`;
  const rules: LinkRules = {
    origin: 'https://lawnfigures.com',
    sitemap: ['/', '/guide', '/frost', '/cost', '/cost-a'],
    guides: [{ path: '/guide', calculators: [] }],
    calculators: [],
    methodology: '/methodology',
    frost: { index: '/frost', states: [] },
    costs: { hub: '/cost', pages: ['/cost-a'] },
  };
  const home = (costs: string): string =>
    page(
      `<section aria-labelledby="guides">${a('/guide')}</section><section aria-labelledby="costs">${costs}</section>`,
      FOOTER,
    );
  const linked = new Map([
    ['/', home(`${a('/cost')}${a('/cost-a')}`)],
    ['/guide', page(`${a('/')}${a('/frost')}`, FOOTER)],
    ['/frost', page(a('/guide'), FOOTER)],
    ['/cost', page(a('/cost-a'), FOOTER)],
    ['/cost-a', page(a('/cost'), FOOTER)],
  ]);

  it('passes when the home lists them all and the hub and each page link each other', () => {
    expect(linkProblems(linked, rules)).toEqual([]);
  });

  it('names a cost guide the home list leaves out', () => {
    const site = new Map([...linked, ['/', home(a('/cost'))]]);
    expect(linkProblems(site, rules)).toEqual(['/: the Lawn costs list must link /cost-a']);
  });

  it('names a page the hub does not link, and a page that does not link the hub', () => {
    const site = new Map([...linked, ['/cost', page('', FOOTER)], ['/cost-a', page('', FOOTER)]]);
    expect(linkProblems(site, rules)).toEqual([
      '/cost: must link the cost guide /cost-a',
      '/cost-a: must link the cost hub /cost',
    ]);
  });
});
