import { describe, expect, it } from 'vitest';
import { BYLINE_PAGES, bylinePageOf } from './bylines.ts';

describe('BYLINE_PAGES', () => {
  it('are the guides, the data pages, the dog and cat years pages, the food hub and its foods, the plant hubs and plants, then the feeding hub and its weights, and the puppy weight calculator', () => {
    expect(BYLINE_PAGES.map(({ path }) => path).slice(0, 11)).toEqual([
      '/how-to-read-pet-food-label',
      '/dog-food-by-breed',
      '/my-dog-ate-chocolate',
      '/when-do-cats-stop-growing',
      '/dog-in-heat',
      '/dog-feeding-chart',
      '/puppy-feeding-chart',
      '/dog-chocolate-toxicity-chart',
      '/dog-age-chart',
      '/cat-age-chart',
      '/cat-feeding-chart',
    ]);
    expect(BYLINE_PAGES.slice(11, 27).map(({ path }) => path)).toEqual([
      '/1-year-in-dog-years',
      ...Array.from({ length: 15 }, (_, i) => `/${String(i + 2)}-years-in-dog-years`),
    ]);
    expect(BYLINE_PAGES.slice(27, 47).map(({ path }) => path)).toEqual([
      '/1-year-in-cat-years',
      ...Array.from({ length: 19 }, (_, i) => `/${String(i + 2)}-years-in-cat-years`),
    ]);
    const foods = BYLINE_PAGES.slice(47, 89).map(({ path }) => path);
    expect(foods[0]).toBe('/can-dogs-eat');
    expect(foods).toHaveLength(42);
    expect(foods).toContain('/can-dogs-eat-grapes');
    const plants = BYLINE_PAGES.slice(89, -13).map(({ path }) => path);
    expect(plants.slice(0, 3)).toEqual([
      '/plants-toxic-to-cats',
      '/plants-toxic-to-dogs',
      '/pet-safe-houseplants',
    ]);
    expect(plants).toContain('/are-tulips-toxic-to-cats-and-dogs');
    const feeding = BYLINE_PAGES.slice(-13, -1).map(({ path }) => path);
    expect(feeding[0]).toBe('/how-much-should-i-feed-my-dog');
    expect(feeding).toContain('/how-much-to-feed-a-50-lb-dog');
    expect(feeding).toContain('/how-much-to-feed-an-80-lb-dog');
  });

  it('give every page a review day and at least one source with an address', () => {
    for (const { checked, sources } of BYLINE_PAGES) {
      expect(['2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10']).toContain(checked);
      expect(sources.length).toBeGreaterThan(0);
      for (const { url } of sources) expect(url).toMatch(/^https:\/\//);
    }
  });

  it('finds the data of a page, and refuses another', () => {
    expect(bylinePageOf('/dog-feeding-chart').sources.length).toBe(3);
    expect(() => bylinePageOf('/nope')).toThrow('no byline page /nope');
  });
});
