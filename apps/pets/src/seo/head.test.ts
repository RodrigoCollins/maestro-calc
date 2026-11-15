import { describe, expect, it } from 'vitest';
import { alternatesOf, headOf } from './head.ts';

const text = { title: 'T | Bowl Figures', description: 'D' };
const open = {
  origin: 'https://bowlfigures.com',
  indexable: true,
  deIndexable: false,
  frIndexable: false,
  esIndexable: false,
};
const closed = { ...open, indexable: false };

describe('headOf', () => {
  it('gives an indexed page of an open site its canonical and no robots line', () => {
    const head = headOf('/dog-food-calculator', text, true, open);
    expect(head.canonical).toBe('https://bowlfigures.com/dog-food-calculator');
    expect(head.robots).toBeUndefined();
    expect(head.preview['og:image']).toBe('https://bowlfigures.com/og.png');
  });

  it('gives the home the bare origin as its canonical', () => {
    expect(headOf('/', text, true, open).canonical).toBe('https://bowlfigures.com/');
  });

  it('keeps the 404 out of the index even on an open site', () => {
    const head = headOf('/404', text, false, open);
    expect(head).toMatchObject({ robots: 'noindex' });
    expect(head.canonical).toBeUndefined();
  });

  it('keeps every page out of the index while the site is closed', () => {
    const head = headOf('/dog-food-calculator', text, true, closed);
    expect(head).toMatchObject({ robots: 'noindex' });
    expect(head.canonical).toBeUndefined();
  });

  it('ships open by default', () => {
    expect(headOf('/', text, true).robots).toBeUndefined();
  });
});

const deOpen = { ...open, deIndexable: true };
const deClosed = open;

describe('headOf, German pages', () => {
  it('keeps a German page out of the index while German is closed, the English twin open', () => {
    const de = headOf('/de/hundejahre-rechner', text, true, deClosed);
    expect(de).toMatchObject({ robots: 'noindex' });
    expect(de.canonical).toBeUndefined();
    expect(headOf('/dog-age-calculator', text, true, deClosed).canonical).toBe(
      'https://bowlfigures.com/dog-age-calculator',
    );
  });

  it('gives a German page its own canonical once German is open', () => {
    const de = headOf('/de/hundejahre-rechner', text, true, deOpen);
    expect(de.canonical).toBe('https://bowlfigures.com/de/hundejahre-rechner');
    expect(de.robots).toBeUndefined();
  });

  it('closes German with the whole site', () => {
    expect(headOf('/de', text, true, { ...deOpen, indexable: false })).toMatchObject({
      robots: 'noindex',
    });
  });

  it('ships with German closed', () => {
    expect(headOf('/de', text, true).robots).toBe('noindex');
  });
});

describe('alternatesOf', () => {
  it('names en, de and x-default (English) on both twins once German is open', () => {
    const pair = [
      { hreflang: 'en', href: 'https://bowlfigures.com/dog-age-calculator' },
      { hreflang: 'de', href: 'https://bowlfigures.com/de/hundejahre-rechner' },
      { hreflang: 'x-default', href: 'https://bowlfigures.com/dog-age-calculator' },
    ];
    expect(alternatesOf('/dog-age-calculator', deOpen)).toEqual(pair);
    expect(alternatesOf('/de/hundejahre-rechner', deOpen)).toEqual(pair);
    expect(alternatesOf('/de', deOpen)[1]).toEqual({
      hreflang: 'de',
      href: 'https://bowlfigures.com/de',
    });
  });

  it('names none while German is closed, for a page with no twin, or on a closed site', () => {
    expect(alternatesOf('/dog-age-calculator', deClosed)).toEqual([]);
    expect(alternatesOf('/de/hundejahre-rechner', deClosed)).toEqual([]);
    expect(alternatesOf('/dog-food-calculator', deOpen)).toEqual([]);
    expect(alternatesOf('/dog-age-calculator', { ...deOpen, indexable: false })).toEqual([]);
  });

  it('ships with German closed', () => {
    expect(alternatesOf('/de/hundejahre-rechner')).toEqual([]);
  });
});

const frOpen = { ...open, frIndexable: true };
const bothOpen = { ...open, deIndexable: true, frIndexable: true };

describe('headOf, French pages', () => {
  it('keeps a French page out of the index while French is closed, the English twin open', () => {
    const fr = headOf('/fr/age-chien-en-humain', text, true, deOpen);
    expect(fr).toMatchObject({ robots: 'noindex' });
    expect(fr.canonical).toBeUndefined();
  });

  it('gives a French page its own canonical once French is open, German closed or not', () => {
    expect(headOf('/fr/age-chien-en-humain', text, true, frOpen).canonical).toBe(
      'https://bowlfigures.com/fr/age-chien-en-humain',
    );
    expect(headOf('/de/hundejahre-rechner', text, true, frOpen).robots).toBe('noindex');
  });

  it('ships with French closed', () => {
    expect(headOf('/fr', text, true).robots).toBe('noindex');
  });
});

describe('alternatesOf, French', () => {
  it('names en, fr and x-default once French alone is open', () => {
    const pair = [
      { hreflang: 'en', href: 'https://bowlfigures.com/dog-age-calculator' },
      { hreflang: 'fr', href: 'https://bowlfigures.com/fr/age-chien-en-humain' },
      { hreflang: 'x-default', href: 'https://bowlfigures.com/dog-age-calculator' },
    ];
    expect(alternatesOf('/dog-age-calculator', frOpen)).toEqual(pair);
    expect(alternatesOf('/fr/age-chien-en-humain', frOpen)).toEqual(pair);
  });

  it('names every open twin, German then French, once both are open', () => {
    expect(
      alternatesOf('/de/hundejahre-rechner', bothOpen).map(({ hreflang }) => hreflang),
    ).toEqual(['en', 'de', 'fr', 'x-default']);
  });

  it('names none on a German page while German is closed, though French is open', () => {
    expect(alternatesOf('/de/hundejahre-rechner', frOpen)).toEqual([]);
    expect(alternatesOf('/fr/age-chien-en-humain', deOpen)).toEqual([]);
  });

  it('ships with French closed', () => {
    expect(alternatesOf('/fr/age-chien-en-humain')).toEqual([]);
  });
});

const esOpen = { ...open, esIndexable: true };

describe('headOf, Spanish pages', () => {
  it('gives a Spanish page its own canonical once Spanish is open, German and French closed', () => {
    const es = headOf('/es/edad-de-perro-en-anos-humanos', text, true, esOpen);
    expect(es.canonical).toBe('https://bowlfigures.com/es/edad-de-perro-en-anos-humanos');
    expect(es.robots).toBeUndefined();
    expect(headOf('/fr/age-chien-en-humain', text, true, esOpen).robots).toBe('noindex');
  });

  it('keeps a Spanish page out of the index while Spanish is closed', () => {
    expect(headOf('/es', text, true, open).robots).toBe('noindex');
  });

  it('ships with Spanish open: no legal notice to wait for, unlike German and French', () => {
    expect(headOf('/es', text, true).canonical).toBe('https://bowlfigures.com/es');
  });
});

describe('alternatesOf, Spanish', () => {
  it('names en, es and x-default on both twins once Spanish alone is open', () => {
    const pair = [
      { hreflang: 'en', href: 'https://bowlfigures.com/dog-age-calculator' },
      { hreflang: 'es', href: 'https://bowlfigures.com/es/edad-de-perro-en-anos-humanos' },
      { hreflang: 'x-default', href: 'https://bowlfigures.com/dog-age-calculator' },
    ];
    expect(alternatesOf('/dog-age-calculator', esOpen)).toEqual(pair);
    expect(alternatesOf('/es/edad-de-perro-en-anos-humanos', esOpen)).toEqual(pair);
  });

  it('names every open twin, German, French then Spanish', () => {
    const all = { ...open, deIndexable: true, frIndexable: true, esIndexable: true };
    expect(alternatesOf('/es', all).map(({ hreflang }) => hreflang)).toEqual([
      'en',
      'de',
      'fr',
      'es',
      'x-default',
    ]);
  });

  it('ships naming the Spanish twin of the English page, and no closed German or French one', () => {
    expect(alternatesOf('/can-dogs-eat-grapes').map(({ hreflang }) => hreflang)).toEqual([
      'en',
      'es',
      'x-default',
    ]);
    expect(alternatesOf('/fr/chien-peut-il-manger-du-raisin')).toEqual([]);
  });
});
