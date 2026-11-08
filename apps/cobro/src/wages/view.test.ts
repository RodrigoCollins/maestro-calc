import { decode, type Money } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { moneyText } from '../format.ts';
import { CALCULATORS } from '../lib/calculators.ts';
import { TRADE_PATHS, wageAreasOf, wagePathOf, WAGE_STEMS } from '../routes.ts';
import { OEWS } from './oews-2025.ts';
import { OCCUPATIONS } from './occupations.ts';
import { hubViewOf, nationalOf, stateWageViewOf, tradeIndexViewOf, wageText } from './view.ts';

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
      'Promedio al año (2,080 h)',
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
    const hrefs = view.trades.rows.map(({ href }) => href);
    expect(hrefs).toContain(wagePathOf('cleaning', '48', 'es'));
    expect(hrefs).not.toContain(wagePathOf('painting', '48', 'es'));
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

describe('the figures each state page works out from its own data', () => {
  // painters in Texas, BLS May 2025: mean $22.13, median $21.86; the nation $26.64 and $23.75
  const en = stateWageViewOf('painting', '48', 'en');
  const es = stateWageViewOf('painting', '48', 'es');

  it('turns the hourly figures into a week of 40 hours and a BLS year of 2,080 hours', () => {
    const [first, second] = en.year.paragraphs;
    // 40 x 22.13 = 885.20; 2,080 x 22.13 = 46,030.40; 2,080 x 21.86 = 45,468.80
    expect(first).toContain('$885.20 a week');
    expect(first).toContain('$46,030 a year');
    expect(first).toContain('$45,469 a year');
    // 22.13 - 21.86 = 0.27, 1.2% of the median
    expect(second).toContain('$0.27 above the median (1.2%)');
    expect(es.year.paragraphs[0]).toContain('$46,030 al año');
    expect(en.stats.map(({ label }) => label)).toContain('Average per year (2,080 h)');
  });

  it('compares with the nation in dollars, percent and a year of work', () => {
    // 26.64 - 22.13 = 4.51, 16.9% of 26.64; 2,080 x 4.51 = 9,380.80
    expect(en.nation.paragraphs[0]).toContain('$4.51 below the national average of $26.64');
    expect(en.nation.paragraphs[0]).toContain('16.9% less');
    expect(en.nation.paragraphs[0]).toContain('$9,381 less a year');
    expect(es.nation.paragraphs[0]).toContain('16.9 % menos');
  });

  it('ranks the state in its Census division and lists the division with the gap to it', () => {
    expect(en.region.h2).toBe('Texas and its Census division, West South Central');
    // Texas and Louisiana both average $22.13, Oklahoma $21.85, Arkansas $20.28
    expect(en.region.paragraph).toContain(
      'shares the highest average of the division, $22.13, with Louisiana',
    );
    expect(en.region.rows.map(({ state }) => state)).toEqual([
      'Louisiana',
      'Texas',
      'Oklahoma',
      'Arkansas',
    ]);
    const texas = en.region.rows.find(({ state }) => state === 'Texas');
    expect(texas?.href).toBeUndefined();
    expect(en.region.rows.find(({ state }) => state === 'Arkansas')?.versus).toBe('-$1.85');
    expect(en.region.rows.find(({ state }) => state === 'Arkansas')?.href).toBe(
      wagePathOf('painting', '05', 'en'),
    );
    expect(es.region.h2).toBe('Texas y su división del Censo, Centro Suroeste');
  });

  it('names the highest and the lowest of a division when the state is in between', () => {
    // Oklahoma painters, $21.85: below Texas and Louisiana ($22.13), above Arkansas ($20.28)
    const view = stateWageViewOf('painting', '40', 'en');
    expect(view.region.paragraph).toContain('3 of the 4');
    expect(view.region.paragraph).toContain('Arkansas, $20.28');
  });

  it('ranks the trade among the trades of the site in the same state', () => {
    // Texas: concrete 23.69, drywall 23.58, painting 22.13, landscaping 18.27, cleaning 14.56
    expect(en.trades.rows.map(({ mean }) => mean)).toEqual([
      '$23.69',
      '$23.58',
      '$22.13',
      '$18.27',
      '$14.56',
    ]);
    expect(en.trades.paragraph).toContain('3 of the 5');
    // 23.69 - 22.13 = 1.56
    expect(en.trades.versus).toBe('Against painting');
    expect(en.trades.rows[0]?.versus).toBe('+$1.56');
    expect(en.trades.rows[2]?.href).toBeUndefined();
    expect(en.trades.rows[0]?.href).toBe(wagePathOf('concrete', '48', 'en'));
  });

  it('measures the median against the state minimum wage', () => {
    // Texas pays the federal $7.25: 21.86 - 7.25 = 14.61, 21.86 / 7.25 = 3.0 times
    expect(en.minimum.paragraphs[0]).toContain('$7.25');
    expect(en.minimum.paragraphs[0]).toContain('$14.61 above it, 3.0 times the minimum');
    // California, $16.90 from the DOL table
    expect(stateWageViewOf('painting', '06', 'en').minimum.paragraphs[0]).toContain('$16.90');
    expect(stateWageViewOf('painting', '36', 'en').minimum.paragraphs.join(' ')).toContain(
      '$16.00',
    );
  });

  it('prices the starting job of the quote calculator at the state median, through the engine', () => {
    // 8 h x $21.86 = 174.88 labor, 80.00 paint, 10% overhead 25.49, 15% profit 42.06: 322.43
    expect(en.quote.paragraph).toContain('$174.88');
    expect(en.quote.paragraph).toContain('$322.43');
    // the same job at the national median, $23.75: 190 + 80 + 27 + 44.55 = 341.55
    expect(en.quote.paragraph).toContain('$341.55');
    const [path, query = ''] = en.quote.href.split('?');
    expect(path).toBe(TRADE_PATHS.painting.en);
    const opened = decode(CALCULATORS.painting, query).state as { rate: Money };
    expect(moneyText(opened.rate)).toBe('$21.86');
  });

  it('lists every source it read, the minimum wage of Florida from its constitution', () => {
    expect(en.sources.map(({ href }) => href)).toEqual([
      'https://www.bls.gov/oes/',
      'https://www.bls.gov/oes/current/oes_tec.htm',
      'https://www.dol.gov/agencies/whd/minimum-wage/state',
      'https://www2.census.gov/geo/pdfs/maps-data/maps/reference/us_regdiv.pdf',
    ]);
    expect(stateWageViewOf('painting', '12', 'en').sources[2]?.href).toBe(
      'https://www.flsenate.gov/Laws/Constitution',
    );
  });

  it('writes no two pages of one language with the same sentences', () => {
    const seen = new Set<string>();
    for (const { id } of OCCUPATIONS)
      for (const { fips } of wageAreasOf(id)) {
        const view = stateWageViewOf(id, fips, 'es');
        const key = [...view.year.paragraphs, view.region.paragraph, view.quote.paragraph].join();
        expect(seen.has(key)).toBe(false);
        seen.add(key);
      }
  });
});

describe('hubViewOf', () => {
  it('names the state that pays each trade the most and the least, from the data', () => {
    const view = hubViewOf('en');
    expect(view.spread.paragraphs).toHaveLength(OCCUPATIONS.length);
    // cleaning: Hawaii averages $25.18, Mississippi $12.43; 25.18 / 12.43 = 2.0 times
    const cleaning = view.spread.paragraphs[0] ?? '';
    expect(cleaning).toContain('Hawaii pays the highest, $25.18');
    expect(cleaning).toContain('Mississippi the lowest, $12.43');
    expect(cleaning).toContain('2.0 times');
    expect(hubViewOf('es').spread.paragraphs[0]).toContain('Hawái paga el más alto, $25.18');
  });

  it('explains how to read the figures, with the BLS technical notes among its sources', () => {
    const view = hubViewOf('es');
    expect(view.reading.paragraphs.join(' ')).toContain('2,080');
    expect(view.sources.map(({ href }) => href)).toContain(
      'https://www.bls.gov/oes/current/oes_tec.htm',
    );
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
