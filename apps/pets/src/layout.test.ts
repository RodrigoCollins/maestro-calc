import { describe, expect, it } from 'vitest';
import { HOME_AGES, HOME_CAT_AGES } from './home.ts';
import { footerLinks, LAYOUT_TEXTS, navLinks, switchesOf } from './layout.ts';
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

describe('the French header and footer', () => {
  it('lead to the French pages only, the hub, the dog age calculator and the chocolate guide first', () => {
    expect(navLinks('fr').map(({ href }) => href)).toEqual([
      '/fr/que-peut-manger-un-chien',
      '/fr/age-chien-en-humain',
      '/fr/mon-chien-a-mange-du-chocolat',
    ]);
  });

  it('link every French page that is not a food page, so none is an orphan', () => {
    const french = ROUTES.filter(
      ({ id, fr }) => fr !== undefined && id !== 'home' && !id.startsWith('food-'),
    );
    expect(
      footerLinks('fr')
        .map(({ href }) => href)
        .sort(),
    ).toEqual(french.map(({ fr }) => fr).sort());
  });
});

describe('the Spanish header and footer', () => {
  it('lead to the Spanish pages only, the feeding and food hubs, the dog age calculator and the chocolate guide first', () => {
    expect(navLinks('es').map(({ href }) => href)).toEqual([
      '/es/cuanto-debe-comer-un-perro-segun-su-peso',
      '/es/que-frutas-pueden-comer-los-perros',
      '/es/edad-de-perro-en-anos-humanos',
      '/es/que-pasa-si-un-perro-come-chocolate',
    ]);
  });

  it('link every Spanish page that is not a food or a plant page, so none is an orphan', () => {
    const spanish = ROUTES.filter(
      ({ id, es }) =>
        es !== undefined && id !== 'home' && !id.startsWith('food-') && !id.startsWith('plant-'),
    );
    expect(
      footerLinks('es')
        .map(({ href }) => href)
        .sort(),
    ).toEqual(spanish.map(({ es }) => es).sort());
  });
});

describe('switchesOf', () => {
  const closed = { de: false, fr: false, es: false };

  it('leads a German or a French page to its English twin, in English', () => {
    expect(switchesOf('/de/hundejahre-rechner', closed)).toEqual([
      { href: '/dog-age-calculator', lang: 'en', label: 'English' },
    ]);
    expect(switchesOf('/fr/age-chien-en-humain', closed)).toEqual([
      { href: '/dog-age-calculator', lang: 'en', label: 'English' },
    ]);
  });

  it('leads to a German or French twin only once that language is open', () => {
    expect(switchesOf('/dog-age-calculator', closed)).toEqual([]);
    expect(switchesOf('/dog-age-calculator', { de: true, fr: false, es: false })).toEqual([
      { href: '/de/hundejahre-rechner', lang: 'de', label: 'Deutsch' },
    ]);
    expect(switchesOf('/de/hundejahre-rechner', { de: true, fr: true, es: false })).toEqual([
      { href: '/dog-age-calculator', lang: 'en', label: 'English' },
      { href: '/fr/age-chien-en-humain', lang: 'fr', label: 'Français' },
    ]);
    expect(switchesOf('/cat-food-calculator', { de: true, fr: true, es: true })).toEqual([]);
  });

  it('leads a Spanish page to English and an English page to Spanish once Spanish is open', () => {
    const esOpen = { de: false, fr: false, es: true };
    expect(switchesOf('/es/edad-de-perro-en-anos-humanos', esOpen)).toEqual([
      { href: '/dog-age-calculator', lang: 'en', label: 'English' },
    ]);
    expect(switchesOf('/dog-age-calculator', esOpen)).toEqual([
      { href: '/es/edad-de-perro-en-anos-humanos', lang: 'es', label: 'Español' },
    ]);
  });
});
