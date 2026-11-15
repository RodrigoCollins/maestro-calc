import { dogAge } from '@maestro-calc/pets-core/dog-age';
import { describe, expect, it } from 'vitest';
import { patchOf } from '../calc/view.ts';
import { DOG_AGE_SOURCES } from '../dog-years.ts';
import { AGE_CHIEN_ARTICLE, AGE_CHIEN_PAGE, AGE_CHIEN_TABLE } from './age-chien.ts';
import { dogAgeViewFr } from './age-chien-view.ts';

const run = (raw: Record<string, string>) => {
  const patch = patchOf(dogAge, dogAgeViewFr, raw);
  if (patch === undefined) throw new Error('no patch');
  return patch;
};

describe('the French dog age view', () => {
  it('reads a 3-year-old medium dog as 28 human years, in French', () => {
    expect(run(AGE_CHIEN_PAGE.initial).text).toEqual({
      figure: '28',
      unit: 'ans en âge humain',
      exact: 'pour un chien de taille moyenne de 3 ans (10 à 23 kg)',
      // 16 ln 3 + 31 = 48.58
      wang: '48,6 ans en âge humain',
      seven: '21 ans en âge humain',
      stage: 'jeune adulte',
      seniorAt: '10 ans',
    });
  });

  it('works a human age back to dog years, with a decimal comma', () => {
    // AVMA medium: 47 at 7 and 51 at 8, so 50 human years is 7.75 dog years
    const { text } = run({ from: 'human', age: '50', size: 'medium' });
    expect(text['figure']).toBe('7,8');
    expect(text['unit']).toBe('ans en âge de chien');
    expect(text['exact']).toBe(
      'pour 50 ans d’âge humain chez un chien de taille moyenne (10 à 23 kg)',
    );
  });

  it('writes a half year with a comma, and the singular below two years', () => {
    // a giant dog: 24 at 2, then 7.5 a year, so 3.5 years is 35.25
    const { text, show } = run({ from: 'dog', age: '3.5', size: 'giant' });
    expect(text['figure']).toBe('35,3');
    expect(text['exact']).toBe('pour un chien de très grande taille de 3,5 ans (plus de 45 kg)');
    expect(show).toEqual({ outside: false, wangOutside: false });
    expect(run({ from: 'dog', age: '1.5', size: 'small' }).text['exact']).toBe(
      'pour un chien de petite taille de 1,5 an (jusqu’à 9 kg)',
    );
  });

  it('flags an age past the DNA clock', () => {
    expect(run({ from: 'dog', age: '18', size: 'small' }).show).toEqual({
      outside: false,
      wangOutside: true,
    });
  });
});

describe('the French dog age table', () => {
  it('gives the human age of each size and the DNA clock for 1 to 16 years', () => {
    expect(AGE_CHIEN_TABLE.rows).toHaveLength(16);
    expect(AGE_CHIEN_TABLE.rows[0]).toEqual(['1 an', '15', '15', '15', '15', '31']);
    expect(AGE_CHIEN_TABLE.rows[2]).toEqual(['3 ans', '28', '28', '29,5', '31,5', '49']);
    // AVMA medium at 10: 60; small 24 + 8 x 4 = 56; giant 24 + 8 x 7.5 = 84
    expect(AGE_CHIEN_TABLE.rows[9]).toEqual(['10 ans', '56', '60', '68', '84', '68']);
  });
});

describe('the French dog age page', () => {
  it('fits a search result and answers the question in the h1', () => {
    expect(AGE_CHIEN_PAGE.path).toBe('/fr/age-chien-en-humain');
    expect(AGE_CHIEN_PAGE.title.length).toBeLessThanOrEqual(65);
    expect(AGE_CHIEN_PAGE.description.length).toBeGreaterThanOrEqual(50);
    expect(AGE_CHIEN_PAGE.description.length).toBeLessThanOrEqual(160);
    expect(AGE_CHIEN_PAGE.h1).toContain('Âge du chien en âge humain');
  });

  it('cites every source of the English dog age pages', () => {
    const urls = new Set(AGE_CHIEN_ARTICLE.sources.map(({ url }) => url));
    for (const { url } of Object.values(DOG_AGE_SOURCES)) expect(urls.has(url), url).toBe(true);
  });
});
