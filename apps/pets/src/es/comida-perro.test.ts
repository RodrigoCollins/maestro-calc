import { decode, Rational } from '@maestro-calc/core';
import { dogFood } from '@maestro-calc/pets-core/dog-food';
import { describe, expect, it } from 'vitest';
import { patchOf } from '../calc/view.ts';
import { FEED_SOURCES } from '../feed-by-weight.ts';
import { COMIDA_PERRO_ARTICLE, COMIDA_PERRO_PAGE, COMIDA_PERRO_STAGES } from './comida-perro.ts';
import { dogViewEs } from './comida-perro-view.ts';
import { CUANTO_COME, comidaHrefOf } from './cuanto-come.ts';

// Hand-worked with RER = 70 x kg^0.75 (Merck; AAHA 2021 Box 1) and Merck's factors.
// 20 kg: 20^0.75 = 9.4574, RER = 662.02 kcal; neutered x 1.6 = 1,059.23 kcal; / 3,600 kcal per kg
// x 1,000 = 294.23 g; AAHA's lowest neutered factor 1.4 gives 926.83 kcal.
const run = (raw: Readonly<Record<string, string>>) => {
  const patch = patchOf(dogFood, dogViewEs, { ...COMIDA_PERRO_PAGE.initial, ...raw });
  if (patch === undefined) throw new Error('no patch');
  return patch;
};

describe('the Spanish dog food view', () => {
  it('writes the 20 kg default as 294 g a day of a 3600 kcal/kg food, 1059 kcal', () => {
    expect(run({}).text).toEqual({
      figure: '294',
      unit: 'gramos al día',
      exact: '294,2 g exactos',
      kcal: '1059',
      treats: '106',
      range: '927 a 1059',
      withTreats: '265 g',
    });
  });

  it('draws the same bowl as the English page: 26 pieces for 1059 kcal', () => {
    expect(run({}).html['bowl']?.match(/class="kibble"/g)).toHaveLength(26);
  });

  it('writes cups with a decimal comma for a label per cup: 10 kg on 360 is 1 ¾', () => {
    const { text } = run({ weight: '10', basis: 'cup', kcal: '360' });
    expect(text['figure']).toBe('1 ¾');
    expect(text['unit']).toBe('tazas al día');
    // 629.83 / 360 = 1.7495
    expect(text['exact']).toBe('1,75 tazas exactas');
    expect(text['withTreats']).toBe('1 ½ tazas');
  });

  it('says one cup in the singular', () => {
    // 5 kg: 374.49 / 360 = 1.04 cups, 1 to the quarter
    const { text } = run({ weight: '5', basis: 'cup', kcal: '360' });
    expect(text['figure']).toBe('1');
    expect(text['unit']).toBe('taza al día');
  });

  it('writes cans for a label per can: 10 kg on 400 is 1 ½ cans', () => {
    const { text } = run({ weight: '10', basis: 'can', kcal: '400' });
    expect(text['figure']).toBe('1 ½');
    expect(text['unit']).toBe('latas al día');
    expect(text['exact']).toBe('1,57 latas exactas');
  });

  it('reads a weight typed in pounds as the English page does', () => {
    // 40 lb neutered: 984.61 kcal
    expect(run({ weight: '40', unit: 'lb' }).text['kcal']).toBe('985');
  });
});

describe('the Spanish dog food page', () => {
  it('sits at its Spanish address and opens at a 20 kg dog on a label in kcal per kilo', () => {
    expect(COMIDA_PERRO_PAGE.path).toBe('/es/calculadora-de-comida-para-perros');
    expect(COMIDA_PERRO_PAGE.initial).toEqual({
      weight: '20',
      unit: 'kg',
      status: 'neutered',
      basis: 'kg',
      kcal: '3600',
    });
    expect(dogFood.validate(COMIDA_PERRO_PAGE.initial).ok).toBe(true);
  });

  it('labels every input of the engine and every option, in the engine order', () => {
    for (const input of dogFood.inputs) {
      const copy = COMIDA_PERRO_PAGE.fields[input.key];
      expect(copy, input.key).toBeDefined();
      if (input.kind === 'select')
        expect(Object.keys(copy?.options ?? {}), input.key).toEqual([...input.options]);
    }
  });

  it('fits a search result and answers in the searched words', () => {
    expect(COMIDA_PERRO_PAGE.title.length).toBeLessThanOrEqual(65);
    expect(COMIDA_PERRO_PAGE.title).toMatch(/^Calculadora de comida para perros/);
    expect(COMIDA_PERRO_PAGE.description.length).toBeGreaterThanOrEqual(50);
    expect(COMIDA_PERRO_PAGE.description.length).toBeLessThanOrEqual(160);
    expect(COMIDA_PERRO_PAGE.h1).toMatch(/^Calculadora de comida para perros/);
  });

  it('works the 20 kg default through in its article with the engine figures', () => {
    const worked = COMIDA_PERRO_ARTICLE.sections[0]?.paragraphs.join(' ') ?? '';
    expect(worked).toContain('662,0 kcal');
    expect(worked).toContain('1059 kcal');
    expect(worked).toContain('294 g');
  });

  it('tables each life stage of a 20 kg dog in kcal and grams', () => {
    expect(COMIDA_PERRO_STAGES.rows.map((row) => row.slice(1))).toEqual([
      ['1,6', '1059', '294'],
      ['1,8', '1192', '331'],
      ['1,4', '927', '257'],
      ['1,0', '662', '184'],
      ['3,0', '1986', '552'],
      ['2,0', '1324', '368'],
    ]);
  });

  it('cites the Merck and AAHA sources of the English feeding pages, read on a date', () => {
    expect(COMIDA_PERRO_ARTICLE.checked).toBe('2026-11-15');
    const urls = COMIDA_PERRO_ARTICLE.sources.map(({ url }) => url);
    for (const source of [FEED_SOURCES.merck, FEED_SOURCES.merckTable, FEED_SOURCES.aaha])
      expect(urls).toContain(source.url);
  });
});

describe('the Spanish "cuánto debe comer un perro según su peso" page', () => {
  it('answers first: a neutered 20 kg dog, its calories and grams', () => {
    expect(CUANTO_COME.path).toBe('/es/cuanto-debe-comer-un-perro-segun-su-peso');
    expect(CUANTO_COME.lead).toContain('1059 kcal');
    expect(CUANTO_COME.lead).toContain('294 g');
    expect(CUANTO_COME.h1).toMatch(/^¿Cuánto debe comer un perro según su peso\?/);
    expect(CUANTO_COME.title.length).toBeLessThanOrEqual(65);
    expect(CUANTO_COME.description.length).toBeGreaterThanOrEqual(50);
    expect(CUANTO_COME.description.length).toBeLessThanOrEqual(160);
  });

  it('tables 2 to 50 kg: kcal, grams at 3600 kcal/kg and cups at 360 kcal', () => {
    expect(CUANTO_COME.rows.map(({ cells }) => cells)).toEqual([
      ['2 kg', '188', '52', '½'],
      ['5 kg', '374', '104', '1'],
      ['10 kg', '630', '175', '1 ¾'],
      ['15 kg', '854', '237', '2 ¼'],
      ['20 kg', '1059', '294', '3'],
      ['25 kg', '1252', '348', '3 ½'],
      ['30 kg', '1436', '399', '4'],
      ['35 kg', '1612', '448', '4 ½'],
      ['40 kg', '1781', '495', '5'],
      ['50 kg', '2106', '585', '5 ¾'],
    ]);
  });

  it('links each row to the calculator with that weight in kilos filled in', () => {
    const href = comidaHrefOf(35);
    const [path, query = ''] = href.split('?');
    expect(path).toBe('/es/calculadora-de-comida-para-perros');
    const { state } = decode(dogFood, query);
    expect(state.weight).toEqual(Rational.of(35));
    expect(state.unit).toBe('kg');
    expect(state.basis).toBe('kg');
    expect(state.kcal).toEqual(Rational.of(3600));
    // the page's own start is its clean address
    expect(comidaHrefOf(20)).toBe('/es/calculadora-de-comida-para-perros');
    expect(CUANTO_COME.rows[2]?.href).toBe(comidaHrefOf(10));
  });

  it('compares the formula with the WSAVA ranges of the same kilos', () => {
    const text = JSON.stringify(CUANTO_COME.sections);
    // WSAVA 5 kg: 280 to 351 kcal; Merck: 374
    expect(text).toContain('280 a 351 kcal');
    expect(text).toContain('374');
    // WSAVA 45 kg: 1460 to 1824; Merck 1946
    expect(text).toContain('1460 a 1824 kcal');
    expect(text).toContain('1946');
  });

  it('cites every source of the English hub, on the day the Spanish page was written', () => {
    expect(CUANTO_COME.checked).toBe('2026-11-15');
    const urls = CUANTO_COME.sources.map(({ url }) => url);
    for (const source of [
      FEED_SOURCES.merck,
      FEED_SOURCES.merckTable,
      FEED_SOURCES.aaha,
      FEED_SOURCES.wsava,
      FEED_SOURCES.wsavaBcs,
      FEED_SOURCES.kealy,
    ])
      expect(urls).toContain(source.url);
  });
});
