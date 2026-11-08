import { describe, expect, it } from 'vitest';
import { wageAreasOf, wagePathOf, WAGE_STEMS } from '../routes.ts';
import { OEWS } from './oews-2025.ts';
import { OCCUPATIONS } from './occupations.ts';
import { nationalOf, stateWageViewOf, tradeIndexViewOf, wageText } from './view.ts';

describe('wageText', () => {
  it('writes dollars and cents', () => {
    expect(wageText(22.1)).toBe('$22.10');
    expect(wageText(1234.5)).toBe('$1,234.50');
  });
});

describe('the committed data', () => {
  it('holds the national and most state figures of every trade, mean never below zero', () => {
    for (const { id } of OCCUPATIONS) {
      expect(nationalOf(id)).toHaveLength(2);
      expect(wageAreasOf(id).length).toBeGreaterThan(48);
      for (const [mean, median] of Object.values(OEWS[id] ?? {})) {
        expect(mean).toBeGreaterThan(5);
        expect(median).toBeGreaterThan(5);
      }
    }
  });

  it('refuses a trade or state it has no figure for', () => {
    expect(() => stateWageViewOf('painting', '99', 'es')).toThrow('no area 99');
    expect(() => nationalOf('nope' as 'painting')).toThrow('no national wage');
  });
});

describe('stateWageViewOf', () => {
  const [mean, median] = OEWS['painting']?.['48'] ?? [0, 0];
  const [nationalMean] = nationalOf('painting');

  it('writes the lead, the stats and the source in Spanish', () => {
    const view = stateWageViewOf('painting', '48', 'es');
    expect(view.title).toBe('Cuánto gana un pintor en Texas');
    expect(view.lead).toContain('En Texas, los pintores de construcción y mantenimiento ganaban');
    expect(view.lead).toContain(wageText(mean));
    expect(view.stats.map(({ label }) => label)).toEqual([
      'Promedio por hora',
      'Mediana por hora',
      'Promedio nacional',
      'Frente al promedio nacional',
    ]);
    expect(view.stats[1]?.value).toBe(wageText(median));
    expect(view.source).toContain('47-2141');
    expect(view.source).toContain('2026-11-08');
  });

  it('compares with the nation in dollars, more or less', () => {
    const view = stateWageViewOf('painting', '48', 'en');
    const diff = Math.abs(mean - nationalMean);
    expect(view.stats[3]?.value).toBe(
      `${wageText(Math.round(diff * 100) / 100)} ${mean > nationalMean ? 'more' : 'less'} an hour`,
    );
  });

  it('ranks the state among those with data, the highest average first', () => {
    const ranks = wageAreasOf('painting').map(
      ({ fips }) => stateWageViewOf('painting', fips, 'en').position,
    );
    expect([...ranks].sort((a, b) => a - b)).toEqual(ranks.map((_, index) => index + 1));
    expect(stateWageViewOf('painting', '48', 'en').rank).toContain('of ');
  });

  it('links the other trades of the same state', () => {
    const view = stateWageViewOf('painting', '48', 'es');
    expect(view.others.map(({ href }) => href)).toContain(wagePathOf('cleaning', '48', 'es'));
    expect(view.others.map(({ href }) => href)).not.toContain(wagePathOf('painting', '48', 'es'));
  });

  it('says so when a state pays what the nation does', () => {
    const [nm] = nationalOf('painting');
    const saved = OEWS['painting'];
    if (saved === undefined) throw new Error('data');
    const original = saved['48'];
    (saved as Record<string, readonly [number, number]>)['48'] = [nm, 1];
    try {
      expect(stateWageViewOf('painting', '48', 'en').stats[3]?.value).toBe('The same');
    } finally {
      if (original !== undefined)
        (saved as Record<string, readonly [number, number]>)['48'] = original;
    }
  });
});

describe('tradeIndexViewOf', () => {
  it('lists every state with data in the order of the language, and the nation', () => {
    const view = tradeIndexViewOf('painting', 'es');
    expect(view.rows).toHaveLength(wageAreasOf('painting').length);
    const names = view.rows.map(({ state }) => state);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'es')));
    expect(view.rows[0]?.href).toMatch(/^\/cuanto-gana-un-pintor-en-/);
    expect(view.national.href).toBe(WAGE_STEMS.painting.es);
    expect(view.title).toBe('Cuánto gana un pintor por estado');
  });
});
