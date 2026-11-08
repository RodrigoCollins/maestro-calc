import { describe, expect, it } from 'vitest';
import { HOME_GUIDES, HOME_TEXTS, HOME_TOOLS } from './home.ts';
import { ROUTES } from './routes.ts';

describe('the home', () => {
  it('lists the six calculators, each at a calculator route', () => {
    expect(HOME_TOOLS).toHaveLength(6);
    const calculators = ROUTES.filter(({ kind }) => kind === 'calculator').map(({ path }) => path);
    expect(HOME_TOOLS.map(({ href }) => href)).toEqual(calculators);
  });

  it('lists every guide and data page, so none is an orphan', () => {
    expect(HOME_GUIDES.map(({ href }) => href).sort()).toEqual(
      [
        '/charts',
        '/dog-chocolate-toxicity-chart',
        '/dog-feeding-chart',
        '/dog-food-by-breed',
        '/how-to-read-pet-food-label',
        '/my-dog-ate-chocolate',
        '/puppy-feeding-chart',
      ].sort(),
    );
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
