import { describe, expect, it } from 'vitest';
import { DESCRIPTION, TITLE_MAX, descriptionOf, titleOf } from './meta.ts';

describe('titleOf', () => {
  it('names the site after the page while the title fits a result', () => {
    expect(titleOf('How many hours is 9 am to 5 pm? 8 hours')).toBe(
      'How many hours is 9 am to 5 pm? 8 hours | Cuánto Le Cobro',
    );
  });

  it('drops the site name rather than let a result cut the answer', () => {
    const name = '¿Cuánto es un diferencial de turno del 10% sobre $15 la hora? $16.50';
    expect(`${name} | Cuánto Le Cobro`.length).toBeGreaterThan(TITLE_MAX);
    expect(titleOf(name)).toBe(name);
  });
});

describe('descriptionOf', () => {
  it('keeps whole sentences of the answer while they fit', () => {
    const lead = `${'A'.repeat(90)}. ${'B'.repeat(60)}. ${'C'.repeat(40)}.`;
    expect(descriptionOf(lead)).toBe(`${'A'.repeat(90)}. ${'B'.repeat(60)}.`);
  });

  it('never splits a number at its decimal point', () => {
    expect(descriptionOf('It is $16.50 an hour. Then 8.00 hours.')).toBe(
      'It is $16.50 an hour. Then 8.00 hours.',
    );
  });

  it('adds the figures that fit after the answer', () => {
    const rows = ['A week: $600', 'Every two weeks: $1,200', 'Twice a month: $1,300'];
    expect(descriptionOf('$15 an hour is $31,200 a year.', rows)).toBe(
      '$15 an hour is $31,200 a year. A week: $600; Every two weeks: $1,200; Twice a month: $1,300.',
    );
    const long = descriptionOf(`${'A'.repeat(120)}.`, rows);
    expect(long).toBe(`${'A'.repeat(120)}. A week: $600; Every two weeks: $1,200.`);
    expect(long.length).toBeLessThanOrEqual(DESCRIPTION.max);
  });

  it('keeps the first sentence even when it is too long, for the site check to name', () => {
    expect(descriptionOf(`${'A'.repeat(200)}. B.`)).toBe(`${'A'.repeat(200)}.`);
  });
});
