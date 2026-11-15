import { describe, expect, it } from 'vitest';
import { alternatesOf, headOf } from './head.ts';

const text = { title: 'T | Bowl Figures', description: 'D' };
const open = { origin: 'https://bowlfigures.com', indexable: true, deIndexable: false };
const closed = { origin: 'https://bowlfigures.com', indexable: false, deIndexable: false };

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

const deOpen = { origin: 'https://bowlfigures.com', indexable: true, deIndexable: true };
const deClosed = { origin: 'https://bowlfigures.com', indexable: true, deIndexable: false };

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
    expect(alternatesOf('/dog-age-calculator')).toEqual([]);
  });
});
