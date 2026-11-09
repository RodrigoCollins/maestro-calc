import { describe, expect, it } from 'vitest';
import { HOME_AGES, HOME_CAT_AGES } from './home.ts';
import { footerLinks, LAYOUT_TEXTS, navLinks } from './layout.ts';
import { ROUTES } from './routes.ts';

describe('the header and footer', () => {
  it('link the eight calculators people come for, as the header', () => {
    expect(navLinks().map(({ href }) => href)).toEqual([
      '/dog-food-calculator',
      '/cat-food-calculator',
      '/puppy-feeding-calculator',
      '/kitten-feeding-calculator',
      '/dog-chocolate-toxicity-calculator',
      '/dog-pregnancy-calculator',
      '/dog-age-calculator',
      '/cat-age-calculator',
    ]);
  });

  // the dog and cat years pages are linked from the home, their age chart and each other
  // instead, and the food pages from the food hub (in the footer) and each other
  it('link every other article of the site from the footer, so no page is an orphan', () => {
    const footer = footerLinks().map(({ href }) => href);
    const articles = ROUTES.filter(
      ({ kind, id }) =>
        kind === 'article' &&
        !id.startsWith('dog-years-') &&
        !id.startsWith('cat-years-') &&
        !id.startsWith('food-'),
    );
    expect(footer).toContain('/can-dogs-eat');
    expect([...footer].sort()).toEqual(articles.map(({ path }) => path).sort());
    const ages = ROUTES.filter(({ id }) => id.startsWith('dog-years-')).map(({ path }) => path);
    expect(ages).toHaveLength(16);
    expect(HOME_AGES.map(({ href }) => href)).toEqual(ages);
    const cats = ROUTES.filter(({ id }) => id.startsWith('cat-years-')).map(({ path }) => path);
    expect(cats).toHaveLength(20);
    expect(HOME_CAT_AGES.map(({ href }) => href)).toEqual(cats);
  });

  it('say every figure is a starting point to check with a veterinarian', () => {
    expect(LAYOUT_TEXTS.warning).toContain('veterinarian');
  });
});
