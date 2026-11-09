import { describe, expect, it } from 'vitest';
import { BYLINE_PAGES, bylinePageOf } from './bylines.ts';

describe('BYLINE_PAGES', () => {
  it('are the guides, the data pages, the dog and cat years pages, then the food hub and its foods', () => {
    expect(BYLINE_PAGES.map(({ path }) => path).slice(0, 8)).toEqual([
      '/how-to-read-pet-food-label',
      '/dog-food-by-breed',
      '/my-dog-ate-chocolate',
      '/dog-feeding-chart',
      '/puppy-feeding-chart',
      '/dog-chocolate-toxicity-chart',
      '/dog-age-chart',
      '/cat-age-chart',
    ]);
    expect(BYLINE_PAGES.slice(8, 24).map(({ path }) => path)).toEqual([
      '/1-year-in-dog-years',
      ...Array.from({ length: 15 }, (_, i) => `/${String(i + 2)}-years-in-dog-years`),
    ]);
    expect(BYLINE_PAGES.slice(24, 44).map(({ path }) => path)).toEqual([
      '/1-year-in-cat-years',
      ...Array.from({ length: 19 }, (_, i) => `/${String(i + 2)}-years-in-cat-years`),
    ]);
    const foods = BYLINE_PAGES.slice(44).map(({ path }) => path);
    expect(foods[0]).toBe('/can-dogs-eat');
    expect(foods).toHaveLength(42);
    expect(foods).toContain('/can-dogs-eat-grapes');
  });

  it('give every page a review day and at least one source with an address', () => {
    for (const { checked, sources } of BYLINE_PAGES) {
      expect(['2026-11-07', '2026-11-08', '2026-11-09']).toContain(checked);
      expect(sources.length).toBeGreaterThan(0);
      for (const { url } of sources) expect(url).toMatch(/^https:\/\//);
    }
  });

  it('finds the data of a page, and refuses another', () => {
    expect(bylinePageOf('/dog-feeding-chart').sources.length).toBe(3);
    expect(() => bylinePageOf('/nope')).toThrow('no byline page /nope');
  });
});
