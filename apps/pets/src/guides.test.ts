import { describe, expect, it } from 'vitest';
import { ATWATER_EXAMPLE, atwaterKcalPerKg, guideOf, GUIDES } from './guides.ts';
import { ROUTES } from './routes.ts';

describe('the Atwater estimate', () => {
  it('works the example: NFE 38%, (91 + 127.5 + 133) x 10 = 3,515 kcal per kg', () => {
    expect(atwaterKcalPerKg(ATWATER_EXAMPLE)).toBe(3515);
  });

  it('weighs protein at 3.5, fat at 8.5 and the rest as NFE at 3.5', () => {
    const base = { protein: 0, fat: 0, fiber: 0, moisture: 0, ash: 0 };
    // 10% protein, NFE 90%: (35 + 315) x 10
    expect(atwaterKcalPerKg({ ...base, protein: 10 })).toBe(3500);
    // 10% fat, NFE 90%: (85 + 315) x 10
    expect(atwaterKcalPerKg({ ...base, fat: 10 })).toBe(4000);
    // fiber, moisture and ash take from NFE: 100% water is nothing
    expect(atwaterKcalPerKg({ ...base, moisture: 100 })).toBe(0);
    expect(atwaterKcalPerKg({ ...base, fiber: 50 })).toBe(1750);
    expect(atwaterKcalPerKg({ ...base, ash: 50 })).toBe(1750);
  });
});

describe('the guides', () => {
  it('are at the addresses the routes pin, as articles', () => {
    expect(GUIDES.map(({ path }) => path)).toEqual([
      '/how-to-read-pet-food-label',
      '/dog-food-by-breed',
    ]);
    for (const { path } of GUIDES) expect(ROUTES.find((r) => r.path === path)?.kind).toBe('article');
  });

  it('keep titles and descriptions where a result shows them whole', () => {
    for (const guide of GUIDES) {
      expect(guide.title.length).toBeLessThanOrEqual(65);
      expect(guide.title.endsWith(' | Bowl Figures')).toBe(true);
      expect(guide.description.length).toBeGreaterThanOrEqual(50);
      expect(guide.description.length).toBeLessThanOrEqual(160);
    }
  });

  it('carry a review day, sources with addresses, and link calculators that exist', () => {
    const paths = ROUTES.map(({ path }) => path);
    for (const guide of GUIDES) {
      expect(guide.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(guide.sources.length).toBeGreaterThan(0);
      for (const { url } of guide.sources) expect(url).toMatch(/^https:\/\//);
      for (const calculator of guide.calculators) expect(paths).toContain(calculator);
      const ids = guide.sections.map(({ id }) => id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('finds a guide by its path, and refuses another', () => {
    expect(guideOf('/dog-food-by-breed').h1).toContain('breed');
    expect(() => guideOf('/nope')).toThrow('no guide /nope');
  });

  it('state the AAFCO calorie content rule and say the Atwater figure is an estimate', () => {
    const text = JSON.stringify(guideOf('/how-to-read-pet-food-label'));
    expect(text).toContain('Calorie Content');
    expect(text).toContain('kcal ME');
    expect(text).toContain('This is an estimate');
  });

  it('say breed is not in the formula and invent no breed factor', () => {
    const text = JSON.stringify(guideOf('/dog-food-by-breed'));
    expect(text).toContain('Breed is not a term in either');
    expect(text).not.toMatch(/Labrador|Chihuahua|Beagle/);
  });
});
