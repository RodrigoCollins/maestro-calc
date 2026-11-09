import { describe, expect, it } from 'vitest';
import { enabledOffers, offerProblems } from '@maestro-calc/site-kit/affiliate';
import { OFFERS } from './offers.ts';

describe('the affiliate offers of the site', () => {
  it('are well formed: https urls, unique ids, a why in every language of the site', () => {
    expect(offerProblems(OFFERS, ['es', 'en'])).toEqual([]);
    for (const { url } of OFFERS) expect(new URL(url).protocol).toBe('https:');
  });

  it('ship as disabled placeholders until a program approves the site', () => {
    expect(OFFERS.length).toBeGreaterThan(0);
    expect(OFFERS.every(({ enabled }) => !enabled)).toBe(true);
    expect(enabledOffers(OFFERS)).toEqual([]);
  });
});
