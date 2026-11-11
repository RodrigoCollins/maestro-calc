import { dogAge } from '@maestro-calc/pets-core/dog-age';
import { describe, expect, it } from 'vitest';
import { patchOf } from '../calc/view.ts';
import { DOG_AGE_SOURCES } from '../dog-years.ts';
import { HUNDEJAHRE_ARTICLE, HUNDEJAHRE_PAGE, HUNDEJAHRE_TABLE } from './hundejahre.ts';
import { dogAgeViewDe } from './hundejahre-view.ts';

const run = (raw: Record<string, string>) => {
  const patch = patchOf(dogAge, dogAgeViewDe, raw);
  if (patch === undefined) throw new Error('no patch');
  return patch;
};

describe('the German dog age view', () => {
  it('reads a 3-year-old medium dog as 28 human years, in German', () => {
    expect(run(HUNDEJAHRE_PAGE.initial).text).toEqual({
      figure: '28',
      unit: 'Menschenjahre',
      exact: 'für einen 3 Jahre alten mittelgroßen Hund (10 bis 23 kg)',
      // 16 ln 3 + 31 = 48.58
      wang: '48,6 Menschenjahre',
      seven: '21 Menschenjahre',
      stage: 'junger Erwachsener',
      seniorAt: '10 Jahren',
    });
  });

  it('works a human age back to dog years, with a decimal comma', () => {
    // AVMA medium: 47 at 7 and 51 at 8, so 50 human years is 7.75 dog years
    const { text } = run({ from: 'human', age: '50', size: 'medium' });
    expect(text['figure']).toBe('7,8');
    expect(text['unit']).toBe('Hundejahre');
    expect(text['exact']).toBe('für 50 Menschenjahre bei einem mittelgroßen Hund (10 bis 23 kg)');
  });

  it('writes a half year with a comma and names each size by its weight in kilograms', () => {
    // a giant dog: 24 at 2, then 7.5 a year, so 3.5 years is 35.25
    const { text, show } = run({ from: 'dog', age: '3.5', size: 'giant' });
    expect(text['figure']).toBe('35,3');
    expect(text['exact']).toBe('für einen 3,5 Jahre alten sehr großen Hund (über 45 kg)');
    expect(text['stage']).toBe('junger Erwachsener');
    expect(show).toEqual({ outside: false, wangOutside: false });
  });

  it('flags an age outside the charts and past the DNA clock', () => {
    expect(run({ from: 'dog', age: '18', size: 'small' }).show).toEqual({
      outside: false,
      wangOutside: true,
    });
  });
});

describe('the German dog age table', () => {
  it('gives the human age of each size and the DNA clock for 1 to 16 years', () => {
    expect(HUNDEJAHRE_TABLE.rows).toHaveLength(16);
    expect(HUNDEJAHRE_TABLE.rows[0]).toEqual(['1 Jahr', '15', '15', '15', '15', '31']);
    expect(HUNDEJAHRE_TABLE.rows[2]).toEqual(['3 Jahre', '28', '28', '29,5', '31,5', '49']);
    // AVMA medium at 10: 60; small 24 + 8 x 4 = 56; giant 24 + 8 x 7.5 = 84
    expect(HUNDEJAHRE_TABLE.rows[9]).toEqual(['10 Jahre', '56', '60', '68', '84', '68']);
  });
});

describe('the German dog age page', () => {
  it('fits a search result and answers the question in the h1', () => {
    expect(HUNDEJAHRE_PAGE.path).toBe('/de/hundejahre-rechner');
    expect(HUNDEJAHRE_PAGE.title.length).toBeLessThanOrEqual(65);
    expect(HUNDEJAHRE_PAGE.description.length).toBeGreaterThanOrEqual(50);
    expect(HUNDEJAHRE_PAGE.description.length).toBeLessThanOrEqual(160);
    expect(HUNDEJAHRE_PAGE.h1).toContain('Hundejahre in Menschenjahre');
  });

  it('cites every source of the English dog age pages', () => {
    const urls = new Set(HUNDEJAHRE_ARTICLE.sources.map(({ url }) => url));
    for (const { url } of Object.values(DOG_AGE_SOURCES)) expect(urls.has(url), url).toBe(true);
  });
});
