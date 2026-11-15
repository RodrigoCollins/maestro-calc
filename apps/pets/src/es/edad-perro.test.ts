import { dogAge } from '@maestro-calc/pets-core/dog-age';
import { describe, expect, it } from 'vitest';
import { patchOf } from '../calc/view.ts';
import { DOG_AGE_SOURCES } from '../dog-years.ts';
import { EDAD_PERRO_ARTICLE, EDAD_PERRO_PAGE, EDAD_PERRO_TABLE } from './edad-perro.ts';
import { dogAgeViewEs } from './edad-perro-view.ts';

const run = (raw: Record<string, string>) => {
  const patch = patchOf(dogAge, dogAgeViewEs, raw);
  if (patch === undefined) throw new Error('no patch');
  return patch;
};

describe('the Spanish dog age view', () => {
  it('reads a 3-year-old medium dog as 28 human years, in Spanish', () => {
    expect(run(EDAD_PERRO_PAGE.initial).text).toEqual({
      figure: '28',
      unit: 'años humanos',
      exact: 'para un perro mediano de 3 años (de 10 a 23 kg)',
      // 16 ln 3 + 31 = 48.58
      wang: '48,6 años humanos',
      seven: '21 años humanos',
      stage: 'adulto joven',
      seniorAt: '10 años',
    });
  });

  it('works a human age back to dog years, with a decimal comma', () => {
    // AVMA medium: 47 at 7 and 51 at 8, so 50 human years is 7.75 dog years
    const { text } = run({ from: 'human', age: '50', size: 'medium' });
    expect(text['figure']).toBe('7,8');
    expect(text['unit']).toBe('años de perro');
    expect(text['exact']).toBe('para 50 años humanos en un perro mediano (de 10 a 23 kg)');
  });

  it('writes a half year with a comma, and the singular only for one year', () => {
    // a giant dog: 24 at 2, then 7.5 a year, so 3.5 years is 35.25
    const { text, show } = run({ from: 'dog', age: '3.5', size: 'giant' });
    expect(text['figure']).toBe('35,3');
    expect(text['exact']).toBe('para un perro gigante de 3,5 años (más de 45 kg)');
    expect(show).toEqual({ outside: false, wangOutside: false });
    expect(run({ from: 'dog', age: '1', size: 'small' }).text['exact']).toBe(
      'para un perro pequeño de 1 año (hasta 9 kg)',
    );
  });

  it('flags an age past the DNA clock', () => {
    expect(run({ from: 'dog', age: '18', size: 'small' }).show).toEqual({
      outside: false,
      wangOutside: true,
    });
  });
});

describe('the Spanish dog age table', () => {
  it('gives the human age of each size and the DNA clock for 1 to 16 years', () => {
    expect(EDAD_PERRO_TABLE.rows).toHaveLength(16);
    expect(EDAD_PERRO_TABLE.rows[0]).toEqual(['1 año', '15', '15', '15', '15', '31']);
    expect(EDAD_PERRO_TABLE.rows[2]).toEqual(['3 años', '28', '28', '29,5', '31,5', '49']);
    // AVMA medium at 10: 60; small 24 + 8 x 4 = 56; giant 24 + 8 x 7.5 = 84
    expect(EDAD_PERRO_TABLE.rows[9]).toEqual(['10 años', '56', '60', '68', '84', '68']);
  });
});

describe('the Spanish dog age page', () => {
  it('fits a search result and answers in the searched words', () => {
    expect(EDAD_PERRO_PAGE.path).toBe('/es/edad-de-perro-en-anos-humanos');
    expect(EDAD_PERRO_PAGE.title.length).toBeLessThanOrEqual(65);
    expect(EDAD_PERRO_PAGE.title).toMatch(/^Edad de perro en años humanos/);
    expect(EDAD_PERRO_PAGE.description.length).toBeGreaterThanOrEqual(50);
    expect(EDAD_PERRO_PAGE.description.length).toBeLessThanOrEqual(160);
    expect(EDAD_PERRO_PAGE.h1).toContain('edad de perros');
  });

  it('cites every source of the English dog age pages', () => {
    const urls = new Set(EDAD_PERRO_ARTICLE.sources.map(({ url }) => url));
    for (const { url } of Object.values(DOG_AGE_SOURCES)) expect(urls.has(url), url).toBe(true);
  });
});
