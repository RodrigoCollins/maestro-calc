import { describe, expect, it } from 'vitest';
import { BYLINE_PAGES, bylinePageOf } from './bylines.ts';

describe('BYLINE_PAGES', () => {
  it('are the guides, the data pages, then the dog years pages', () => {
    expect(BYLINE_PAGES.map(({ path }) => path).slice(0, 7)).toEqual([
      '/how-to-read-pet-food-label',
      '/dog-food-by-breed',
      '/my-dog-ate-chocolate',
      '/dog-feeding-chart',
      '/puppy-feeding-chart',
      '/dog-chocolate-toxicity-chart',
      '/dog-age-chart',
    ]);
    expect(BYLINE_PAGES.slice(7).map(({ path }) => path)).toEqual([
      '/1-year-in-dog-years',
      ...Array.from({ length: 15 }, (_, i) => `/${String(i + 2)}-years-in-dog-years`),
    ]);
  });

  it('give every page a review day and at least one source with an address', () => {
    for (const { checked, sources } of BYLINE_PAGES) {
      expect(['2026-11-07', '2026-11-08']).toContain(checked);
      expect(sources.length).toBeGreaterThan(0);
      for (const { url } of sources) expect(url).toMatch(/^https:\/\//);
    }
  });

  it('finds the data of a page, and refuses another', () => {
    expect(bylinePageOf('/dog-feeding-chart').sources.length).toBe(3);
    expect(() => bylinePageOf('/nope')).toThrow('no byline page /nope');
  });
});
