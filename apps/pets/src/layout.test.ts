import { describe, expect, it } from 'vitest';
import { HOME_AGES, HOME_CAT_AGES } from './home.ts';
import { footerLinks, LAYOUT_TEXTS, navLinks, switchOf } from './layout.ts';
import { ROUTES } from './routes.ts';

describe('the header and footer', () => {
  it('link the nine calculators people come for, as the header', () => {
    expect(navLinks().map(({ href }) => href)).toEqual([
      '/dog-food-calculator',
      '/cat-food-calculator',
      '/puppy-feeding-calculator',
      '/kitten-feeding-calculator',
      '/dog-chocolate-toxicity-calculator',
      '/dog-pregnancy-calculator',
      '/dog-age-calculator',
      '/cat-age-calculator',
      '/puppy-weight-calculator',
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
        !id.startsWith('food-') &&
        !id.startsWith('feed-') &&
        !id.startsWith('plant-'),
    );
    expect(footer).toContain('/can-dogs-eat');
    expect(footer).toContain('/how-much-should-i-feed-my-dog');
    expect(footer).toContain('/plants-toxic-to-cats');
    expect([...footer].sort()).toEqual(articles.map(({ path }) => path).sort());
    const ages = ROUTES.filter(({ id }) => id.startsWith('dog-years-')).map(({ path }) => path);
    expect(ages).toHaveLength(16);
    expect(HOME_AGES.map(({ href }) => href)).toEqual(ages);
    const cats = ROUTES.filter(({ id }) => id.startsWith('cat-years-')).map(({ path }) => path);
    expect(cats).toHaveLength(20);
    expect(HOME_CAT_AGES.map(({ href }) => href)).toEqual(cats);
  });

  it('say every figure is a starting point to check with a veterinarian', () => {
    expect(LAYOUT_TEXTS.en.warning).toContain('veterinarian');
    expect(LAYOUT_TEXTS.de.warning).toContain('Tierarzt');
  });
});

describe('the German header and footer', () => {
  it('lead to the German pages only, the hub, the dog age calculator and the chocolate guide first', () => {
    expect(navLinks('de').map(({ href }) => href)).toEqual([
      '/de/was-duerfen-hunde-essen',
      '/de/hundejahre-rechner',
      '/de/hund-hat-schokolade-gefressen',
    ]);
    expect(footerLinks('de').map(({ href }) => href)).toEqual([
      '/de/was-duerfen-hunde-essen',
      '/de/hundejahre-rechner',
      '/de/hund-hat-schokolade-gefressen',
      '/de/ueber-uns',
      '/de/redaktionelle-grundsaetze',
      '/de/datenschutz',
    ]);
  });

  it('link every German page that is not a food page, so none is an orphan', () => {
    const german = ROUTES.filter(
      ({ id, de }) => de !== undefined && id !== 'home' && !id.startsWith('food-'),
    );
    expect(
      footerLinks('de')
        .map(({ href }) => href)
        .sort(),
    ).toEqual(german.map(({ de }) => de).sort());
  });
});

describe('switchOf', () => {
  it('leads a German page to its English twin, in English', () => {
    expect(switchOf('/de/hundejahre-rechner', false)).toEqual({
      href: '/dog-age-calculator',
      lang: 'en',
      label: 'English',
    });
  });

  it('leads an English page to its German twin only once German is open', () => {
    expect(switchOf('/dog-age-calculator', false)).toBeUndefined();
    expect(switchOf('/dog-age-calculator', true)).toEqual({
      href: '/de/hundejahre-rechner',
      lang: 'de',
      label: 'Deutsch',
    });
    expect(switchOf('/dog-food-calculator', true)).toBeUndefined();
  });
});
