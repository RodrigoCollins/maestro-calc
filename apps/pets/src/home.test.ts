import { describe, expect, it } from 'vitest';
import {
  HOME_AGES,
  HOME_CAT_AGES,
  HOME_GUIDES,
  HOME_TEXTS,
  HOME_TOOLS,
  HOME_TRUST,
} from './home.ts';
import { ROUTES } from './routes.ts';

describe('the home', () => {
  it('lists the eight calculators, each at a calculator route', () => {
    expect(HOME_TOOLS).toHaveLength(8);
    const calculators = ROUTES.filter(({ kind }) => kind === 'calculator').map(({ path }) => path);
    expect(HOME_TOOLS.map(({ href }) => href)).toEqual(calculators);
  });

  it('lists every guide and data page, so none is an orphan', () => {
    expect(HOME_GUIDES.map(({ href }) => href).sort()).toEqual(
      [
        '/can-dogs-eat',
        '/charts',
        '/dog-chocolate-toxicity-chart',
        '/dog-age-chart',
        '/cat-age-chart',
        '/dog-feeding-chart',
        '/dog-food-by-breed',
        '/how-to-read-pet-food-label',
        '/how-much-should-i-feed-my-dog',
        '/my-dog-ate-chocolate',
        '/puppy-feeding-chart',
        '/plants-toxic-to-cats',
        '/plants-toxic-to-dogs',
        '/pet-safe-houseplants',
      ].sort(),
    );
  });

  it('leads to every dog years page, 1 to 16', () => {
    expect(HOME_AGES.map(({ age }) => age)).toEqual(Array.from({ length: 16 }, (_, i) => i + 1));
    expect(HOME_AGES[0]).toEqual({
      href: '/1-year-in-dog-years',
      age: 1,
      label: '1 year in dog years',
    });
    expect(HOME_AGES[2]?.href).toBe('/3-years-in-dog-years');
    const articles = ROUTES.filter(({ id }) => id.startsWith('dog-years-')).map(({ path }) => path);
    expect(HOME_AGES.map(({ href }) => href)).toEqual(articles);
  });

  it('leads to every cat years page, 1 to 20', () => {
    expect(HOME_CAT_AGES.map(({ age }) => age)).toEqual(
      Array.from({ length: 20 }, (_, i) => i + 1),
    );
    expect(HOME_CAT_AGES[0]).toEqual({
      href: '/1-year-in-cat-years',
      age: 1,
      label: '1 year in cat years',
    });
    const articles = ROUTES.filter(({ id }) => id.startsWith('cat-years-')).map(({ path }) => path);
    expect(HOME_CAT_AGES.map(({ href }) => href)).toEqual(articles);
    expect(HOME_TEXTS.teasers.catAge).toContain('15');
  });

  it('links the about and privacy pages from the main content, so neither is an orphan', () => {
    expect(HOME_TRUST.links.map(({ href }) => href)).toEqual(['/about', '/privacy']);
    expect(HOME_TRUST.text).not.toBe('');
  });

  it('keeps title and description where a result shows them whole', () => {
    expect(HOME_TEXTS.title.length).toBeLessThanOrEqual(65);
    expect(HOME_TEXTS.description.length).toBeGreaterThanOrEqual(50);
    expect(HOME_TEXTS.description.length).toBeLessThanOrEqual(160);
  });

  it('sends the chocolate teaser reader to a veterinarian or the poison line', () => {
    expect(HOME_TEXTS.teasers.chocolate).toContain('call your veterinarian');
  });
});
