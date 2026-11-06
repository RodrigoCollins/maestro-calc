import { describe, expect, it } from 'vitest';
import type { Route } from '../routes.ts';
import { alternatesOf, embedHeadOf, headOf } from './head.ts';

const text = { title: 'T', description: 'D' };
const site = { origin: 'https://x.test', indexable: true };

describe('headOf', () => {
  it('gives an indexed page its canonical, and the 404 noindex', () => {
    expect(headOf('/pool-salt-calculator', text, true, site)).toMatchObject({
      canonical: 'https://x.test/pool-salt-calculator',
    });
    expect(headOf('/404', text, false, site)).toMatchObject({ robots: 'noindex' });
  });
});

describe('alternatesOf', () => {
  const routes: readonly Route[] = [
    { id: 'about', kind: 'article', en: '/about', es: '/es/acerca' },
    { id: 'charts', kind: 'article', en: '/charts' },
  ];

  it('pairs a page with its twin both ways, x-default at the English page', () => {
    const pair = [
      { hreflang: 'en-US', href: 'https://x.test/about' },
      { hreflang: 'es-US', href: 'https://x.test/es/acerca' },
      { hreflang: 'x-default', href: 'https://x.test/about' },
    ];
    expect(alternatesOf('/about', 'https://x.test', routes)).toEqual(pair);
    expect(alternatesOf('/es/acerca', 'https://x.test', routes)).toEqual(pair);
  });

  // never an alternate to a page that does not exist
  it('gives a page with no twin, and a path off the table, no alternate', () => {
    expect(alternatesOf('/charts', 'https://x.test', routes)).toEqual([]);
    expect(alternatesOf('/404', 'https://x.test', routes)).toEqual([]);
  });
});

describe('embedHeadOf', () => {
  // an embed is the full page in another site's frame: search sees the full page only
  it('points an embed at the full page it embeds and keeps it out of search', () => {
    expect(embedHeadOf('/embed/pool-salt-calculator', text, site)).toMatchObject({
      canonical: 'https://x.test/pool-salt-calculator',
      robots: 'noindex',
      page: '/pool-salt-calculator',
    });
  });

  it('refuses a path that is not an embed', () => {
    expect(() => embedHeadOf('/pool-salt-calculator', text, site)).toThrow(
      'not an embed: /pool-salt-calculator',
    );
  });
});
