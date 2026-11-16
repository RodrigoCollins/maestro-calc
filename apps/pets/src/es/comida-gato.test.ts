import { catFood } from '@maestro-calc/pets-core/cat-food';
import { describe, expect, it } from 'vitest';
import { patchOf } from '../calc/view.ts';
import { ACCESSED, METHOD_SECTIONS } from '../methodology.ts';
import { COMIDA_GATO_ARTICLE, COMIDA_GATO_PAGE, COMIDA_GATO_STAGES } from './comida-gato.ts';
import { catViewEs } from './comida-gato-view.ts';

// Hand-worked with RER = 70 x kg^0.75 (Merck; AAHA 2021 Box 1) and Merck's cat factors.
// 4 kg: 4^0.75 = 2 x sqrt(2) = 2.8284, RER = 197.99 kcal; neutered x 1.2 = 237.59 kcal;
// / 3,800 kcal per kg x 1,000 = 62.52 g; AAHA's highest neutered factor 1.4 gives 277.19 kcal.
const run = (raw: Readonly<Record<string, string>>) => {
  const patch = patchOf(catFood, catViewEs, { ...COMIDA_GATO_PAGE.initial, ...raw });
  if (patch === undefined) throw new Error('no patch');
  return patch;
};

describe('the Spanish cat food view', () => {
  it('writes the 4 kg default as 63 g a day of a 3800 kcal/kg food, 238 kcal', () => {
    const { text, show } = run({});
    expect(text['figure']).toBe('63');
    expect(text['unit']).toBe('gramos de alimento seco al día');
    expect(text['exact']).toBe('62,5 g exactos');
    expect(text['kcal']).toBe('238');
    expect(text['treats']).toBe('24');
    expect(text['range']).toBe('238 a 277');
    expect(show).toEqual({ dry: true, wet: false });
  });

  it('draws the same bowl as the English page: 6 pieces for 238 kcal', () => {
    const english = patchOf(catFood, catViewEs, { weight: '4', unit: 'kg', dryBasis: 'kg' });
    expect(run({}).html['bowl']).toBe(english?.html['bowl']);
  });

  it('writes cans or pouches for wet food only: 4 kg on 80 kcal is 3', () => {
    const { text, show } = run({ wetShare: '100' });
    expect(text['canFigure']).toBe('3');
    expect(text['canUnit']).toBe('latas o sobres de comida húmeda al día');
    expect(text['canExact']).toBe('2,97 exactamente');
    expect(show).toEqual({ dry: false, wet: true });
  });

  it('splits a mix by calories: half of 4 kg is 31 g and 1 ½ cans', () => {
    const { text, show } = run({ wetShare: '50' });
    expect(text['figure']).toBe('31');
    expect(text['canFigure']).toBe('1 ½');
    expect(show).toEqual({ dry: true, wet: true });
  });

  it('says one can in the singular', () => {
    // 2 kg neutered: 117.73 x 1.2 = 141.28 kcal / 160 = 0.88, 1 to the quarter
    const { text } = run({ weight: '2', wetShare: '100', wetKcal: '160' });
    expect(text['canFigure']).toBe('1');
    expect(text['canUnit']).toBe('lata o sobre de comida húmeda al día');
  });

  it('writes cups with a decimal comma for a label per cup: 4 kg on 350 is ¾', () => {
    const { text } = run({ dryBasis: 'cup', dryKcal: '350' });
    expect(text['figure']).toBe('¾');
    expect(text['unit']).toBe('taza de alimento seco al día');
    // 237.59 / 350 = 0.6788
    expect(text['exact']).toBe('0,68 tazas exactas');
  });

  it('reads a weight typed in pounds as the English page does', () => {
    // 10 lb neutered: 261.08 kcal
    expect(run({ weight: '10', unit: 'lb' }).text['kcal']).toBe('261');
  });
});

describe('the Spanish cat food page', () => {
  it('sits at its Spanish address and opens at a 4 kg cat on a label in kcal per kilo', () => {
    expect(COMIDA_GATO_PAGE.path).toBe('/es/calculadora-de-comida-para-gatos');
    expect(COMIDA_GATO_PAGE.initial).toEqual({
      weight: '4',
      unit: 'kg',
      status: 'neutered',
      dryKcal: '3800',
      wetKcal: '80',
      wetShare: '0',
      dryBasis: 'kg',
    });
    expect(catFood.validate(COMIDA_GATO_PAGE.initial).ok).toBe(true);
  });

  it('labels every input of the engine and every option, in the engine order', () => {
    for (const input of catFood.inputs) {
      const copy = COMIDA_GATO_PAGE.fields[input.key];
      expect(copy, input.key).toBeDefined();
      if (input.kind === 'select')
        expect(Object.keys(copy?.options ?? {}), input.key).toEqual([...input.options]);
    }
  });

  it('fits a search result and answers in the searched words', () => {
    expect(COMIDA_GATO_PAGE.title.length).toBeLessThanOrEqual(65);
    expect(COMIDA_GATO_PAGE.title).toMatch(/^Calculadora de comida para gatos/);
    expect(COMIDA_GATO_PAGE.description.length).toBeGreaterThanOrEqual(50);
    expect(COMIDA_GATO_PAGE.description.length).toBeLessThanOrEqual(160);
    expect(COMIDA_GATO_PAGE.h1).toMatch(/^Calculadora de comida para gatos/);
  });

  it('says the 3800 kcal/kg is an example and asks for the figure of the bag', () => {
    const notes = COMIDA_GATO_PAGE.notes.join(' ');
    expect(notes).toContain('3800 kcal por kilo solo como ejemplo');
    expect(notes).toContain('escribe la cifra de tu bolsa');
  });

  it('works the 4 kg default through in its article with the engine figures', () => {
    const worked = COMIDA_GATO_ARTICLE.sections[0]?.paragraphs.join(' ') ?? '';
    expect(worked).toContain('2,828');
    expect(worked).toContain('198,0 kcal');
    expect(worked).toContain('238 kcal');
    expect(worked).toContain('63 g');
  });

  it('tables each life stage of a 4 kg cat in kcal and grams', () => {
    expect(COMIDA_GATO_STAGES.rows.map((row) => row.slice(1))).toEqual([
      ['1,2', '238', '63'],
      ['1,4', '277', '73'],
      ['1,0', '198', '52'],
      ['0,8', '158', '42'],
      ['2,5', '495', '130'],
    ]);
  });

  it('cites the sources of the English cat page, with the day they were read', () => {
    expect(COMIDA_GATO_ARTICLE.checked).toBe('2026-11-16');
    const english = METHOD_SECTIONS.find(({ id }) => id === 'cat-food')?.sources ?? [];
    expect(english.length).toBeGreaterThan(0);
    expect(COMIDA_GATO_ARTICLE.sources.map(({ url }) => url)).toEqual(
      english.map(({ url }) => url),
    );
    expect(ACCESSED).toBe('2026-11-07');
    expect(JSON.stringify(COMIDA_GATO_ARTICLE.sections)).toContain('7 de noviembre de 2026');
  });

  it('answers the questions of the search in a short FAQ', () => {
    expect(COMIDA_GATO_ARTICLE.questions.map(({ question }) => question)).toEqual([
      '¿Cuántos gramos de comida debe comer un gato al día?',
      '¿Y si la etiqueta da las calorías por 100 g?',
      '¿Cómo combino comida seca y húmeda?',
      '¿Cuánto debe comer un gatito?',
    ]);
  });
});
