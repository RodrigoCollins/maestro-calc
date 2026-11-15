import { describe, expect, it } from 'vitest';
import { enabledOffers, offerProblems } from '@maestro-calc/site-kit/affiliate';
import { OFFERS } from './offers.ts';

describe('the affiliate offers of the site', () => {
  it('are well formed: unique ids, a why in every language of the site', () => {
    expect(offerProblems(OFFERS, ['en', 'es'])).toEqual([]);
  });

  it('are the employer tools the manager pages may show once a program approves the site', () => {
    expect(OFFERS.map(({ id }) => id)).toEqual([
      'clockify',
      'jibble',
      'connecteam',
      'deputy',
      'gusto',
      '7shifts',
    ]);
  });

  it('ship disabled with no url until a program approves the site', () => {
    expect(OFFERS.every(({ enabled, url }) => !enabled && url === '')).toBe(true);
    expect(enabledOffers(OFFERS)).toEqual([]);
  });
});
