import { catFood } from '@maestro-calc/pets-core/cat-food';
import { describe, expect, it } from 'vitest';
import { CAT_PAGE, catView, KITTEN_PAGE } from './cat.ts';
import { patchOf } from './view.ts';

const patch = (raw: Readonly<Record<string, string>>) => {
  const result = patchOf(catFood, catView, { ...CAT_PAGE.initial, ...raw });
  if (result === undefined) throw new Error('did not run');
  return result;
};

describe('the cat page', () => {
  it('is at the address the routes pin, and starts from the engine defaults', () => {
    expect(CAT_PAGE.path).toBe('/cat-food-calculator');
    expect(catFood.validate(CAT_PAGE.initial).ok).toBe(true);
    expect(catFood.validate({}).ok).toBe(true);
    expect(CAT_PAGE.initial).toEqual({
      weight: '10',
      unit: 'lb',
      status: 'neutered',
      dryKcal: '350',
      wetKcal: '80',
      wetShare: '0',
    });
  });

  it('labels every input of the engine, and every option of its choices', () => {
    for (const page of [CAT_PAGE, KITTEN_PAGE]) {
      for (const input of catFood.inputs) {
        const copy = page.fields[input.key];
        expect(copy, input.key).toBeDefined();
        if (input.kind === 'select')
          expect(Object.keys(copy?.options ?? {}), input.key).toEqual([...input.options]);
      }
    }
  });

  it('keeps titles and descriptions where a result shows them whole', () => {
    for (const page of [CAT_PAGE, KITTEN_PAGE]) {
      expect(page.title.length).toBeLessThanOrEqual(65);
      expect(page.description.length).toBeGreaterThanOrEqual(50);
      expect(page.description.length).toBeLessThanOrEqual(160);
      expect(page.title.endsWith(' | Bowl Figures')).toBe(true);
    }
  });

  it('starts the kitten page from a kitten of 2 lb and still runs', () => {
    expect(KITTEN_PAGE.initial['status']).toBe('kitten');
    expect(catFood.validate(KITTEN_PAGE.initial).ok).toBe(true);
  });
});

describe('the cat result', () => {
  it('writes the 10 lb default as 3/4 cup of dry food, 261 kcal a day', () => {
    const { text, show } = patch({});
    expect(text['figure']).toBe('¾');
    expect(text['unit']).toBe('cups of dry food a day');
    expect(text['exact']).toBe('0.75 cups exactly');
    expect(text['kcal']).toBe('261');
    expect(text['treats']).toBe('26');
    expect(text['range']).toBe('261 to 305');
    expect(show).toEqual({ dry: true, wet: false });
  });

  it('draws the bowl for the day: 7 pieces for 261 kcal', () => {
    expect(patch({}).html['bowl']?.match(/class="kibble"/g)).toHaveLength(7);
  });

  it('writes cans for a wet food only: 4 kg neutered on 80 kcal cans is 3 cans', () => {
    const { text, show } = patch({ weight: '4', unit: 'kg', wetShare: '100' });
    expect(text['canFigure']).toBe('3');
    expect(text['canUnit']).toBe('cans of wet food a day');
    expect(text['canExact']).toBe('2.97 cans exactly');
    expect(show).toEqual({ dry: false, wet: true });
  });

  it('writes both for a mix: half the calories of 4 kg from each', () => {
    const { text, show } = patch({ weight: '4', unit: 'kg', wetShare: '50' });
    expect(text['figure']).toBe('¼');
    expect(text['canFigure']).toBe('1 ½');
    expect(show).toEqual({ dry: true, wet: true });
  });

  it('gives nothing for a field it cannot read', () => {
    expect(patchOf(catFood, catView, { ...CAT_PAGE.initial, wetShare: '120' })).toBeUndefined();
  });
});
