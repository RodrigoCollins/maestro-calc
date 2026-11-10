import { describe, expect, it } from 'vitest';
import { CAT_GROWTH_GUIDE } from './cat-growth-guide.ts';
import { ROUTES } from './routes.ts';

const guide = CAT_GROWTH_GUIDE;
const text = JSON.stringify(guide);

describe('when do cats stop growing', () => {
  it('asks the exact question in its title and h1, at its address', () => {
    expect(guide.path).toBe('/when-do-cats-stop-growing');
    expect(guide.title).toBe('When Do Cats Stop Growing? | Bowl Figures');
    expect(guide.h1).toBe('When do cats stop growing?');
    expect(ROUTES.find(({ path }) => path === guide.path)?.kind).toBe('article');
  });

  it('answers first: 12 to 18 months, a kitten until 1 year, large breeds to 2 or later', () => {
    expect(guide.lead).toContain('12 and 18 months');
    expect(guide.lead).toContain('first birthday');
    expect(guide.lead).toContain('Maine Coon');
  });

  it('cites the 2021 AAHA/AAFP stages and their energy figures for a growing kitten', () => {
    expect(text).toContain('from birth up to 1 year');
    expect(text).toContain('200 kcal per kg of body weight a day at 10 weeks');
    expect(text).toContain('80 kcal per kg at 10 months');
  });

  it('reports what the growth plate studies found, neutering included, without advice of its own', () => {
    expect(text).toContain('Root, Johnston and Olson');
    expect(text).toContain('808 cats');
    expect(text).toContain('veterinarian');
  });

  // RER = 70 x kg^0.75; kitten 2.5 x RER, neutered adult 1.2 x RER (Merck).
  // 2 lb = 0.9072 kg: RER 65.07, 162.67 and 78.08; 4 lb = 1.8144 kg: RER 109.43, 273.58 and 131.32;
  // 8 lb = 3.6287 kg: RER 184.04, 460.10 and 220.85
  it('works a kitten’s calories against an adult’s of the same weight, from the engine', () => {
    const table = guide.table;
    expect(table?.columns).toHaveLength(3);
    expect(table?.rows.map(([w]) => w)).toEqual(['2', '3', '4', '5', '6', '7', '8']);
    expect(table?.rows.find(([w]) => w === '2')).toEqual(['2', '163', '78']);
    expect(table?.rows.find(([w]) => w === '4')).toEqual(['4', '274', '131']);
    expect(table?.rows.find(([w]) => w === '8')).toEqual(['8', '460', '221']);
    expect(table?.links.map(({ href }) => href)).toEqual([
      '/kitten-feeding-calculator',
      '/cat-feeding-chart',
    ]);
  });

  it('has a FAQ, links the cat calculators and cites dated veterinary sources', () => {
    expect(guide.questions?.length).toBeGreaterThanOrEqual(4);
    expect(guide.calculators).toEqual([
      '/kitten-feeding-calculator',
      '/cat-food-calculator',
      '/cat-age-calculator',
    ]);
    const urls = guide.sources.map(({ url }) => url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toContain('https://pubmed.ncbi.nlm.nih.gov/9238769/');
    expect(urls).toContain('https://pubmed.ncbi.nlm.nih.gov/24027051/');
    expect(guide.checked).toBe('2026-11-10');
  });
});
