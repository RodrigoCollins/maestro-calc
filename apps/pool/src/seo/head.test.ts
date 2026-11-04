import { describe, expect, it } from 'vitest';
import { embedHeadOf, headOf } from './head.ts';

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
