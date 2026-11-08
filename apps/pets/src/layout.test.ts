import { describe, expect, it } from 'vitest';
import { footerLinks, LAYOUT_TEXTS, navLinks } from './layout.ts';
import { ROUTES } from './routes.ts';

describe('the header and footer', () => {
  it('link the five calculators people come for, as the header', () => {
    expect(navLinks().map(({ href }) => href)).toEqual([
      '/dog-food-calculator',
      '/cat-food-calculator',
      '/puppy-feeding-calculator',
      '/kitten-feeding-calculator',
      '/dog-chocolate-toxicity-calculator',
      '/dog-pregnancy-calculator',
    ]);
  });

  it('link every article of the site from the footer, so no page is an orphan', () => {
    const footer = footerLinks().map(({ href }) => href);
    const articles = ROUTES.filter(({ kind }) => kind === 'article').map(({ path }) => path);
    expect([...footer].sort()).toEqual([...articles].sort());
  });

  it('say every figure is a starting point to check with a veterinarian', () => {
    expect(LAYOUT_TEXTS.warning).toContain('veterinarian');
  });
});
