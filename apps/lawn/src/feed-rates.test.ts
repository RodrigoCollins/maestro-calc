import { decode } from '@maestro-calc/core';
import { lawnFertilizer } from '@maestro-calc/lawn-core/lawn-fertilizer';
import { describe, expect, it } from 'vitest';
import { feedingOf, fertilizerHrefOf } from './feed-rates.ts';

describe('fertilizerHrefOf', () => {
  it('links the calculator with the target of one feeding filled in', () => {
    const href = fertilizerHrefOf(0.5);
    expect(href.startsWith('/lawn-fertilizer-calculator?v=1&t=')).toBe(true);
    const query = href.slice(href.indexOf('?') + 1);
    expect(decode(lawnFertilizer, query).state.target.toNumber()).toBe(0.5);
    expect(decode(lawnFertilizer, query).issues).toEqual([]);
  });

  it('links the bare calculator at its default of 1 lb', () => {
    expect(fertilizerHrefOf(1)).toBe('/lawn-fertilizer-calculator');
  });
});

describe('feedingOf', () => {
  // The calculator defaults: 5,000 sq ft, a 24-0-6 bag of 15 lb.
  it('works one feeding of 1 lb of N out on the calculator defaults', () => {
    // 1 / 0.24 = 4.17 lb a 1,000 sq ft; x 5 = 20.83 lb; 20.83 / 15 = 1.39, so 2 bags
    expect(feedingOf(1)).toEqual({ perThousand: '4.2', pounds: '20.8', bags: '2' });
  });

  it('works a half pound and three quarters out the same way', () => {
    // 0.5 / 0.24 = 2.08 lb; x 5 = 10.42 lb, one bag of 15 lb
    expect(feedingOf(0.5)).toEqual({ perThousand: '2.1', pounds: '10.4', bags: '1' });
    // 0.75 / 0.24 = 3.125 lb; x 5 = 15.63 lb, two bags of 15 lb
    expect(feedingOf(0.75)).toEqual({ perThousand: '3.1', pounds: '15.6', bags: '2' });
  });
});
