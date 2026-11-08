import { dogFood } from '@maestro-calc/pets-core/dog-food';
import { describe, expect, it } from 'vitest';
import { DOG_PAGE, dogView, PUPPY_PAGE } from './dog.ts';
import { patchOf } from './view.ts';

const patch = (raw: Readonly<Record<string, string>>) => {
  const result = patchOf(dogFood, dogView, { ...DOG_PAGE.initial, ...raw });
  if (result === undefined) throw new Error('did not run');
  return result;
};

describe('the dog page', () => {
  it('is at the address the routes pin, and starts from the engine defaults', () => {
    expect(DOG_PAGE.path).toBe('/dog-food-calculator');
    const state = dogFood.validate(DOG_PAGE.initial);
    expect(state.ok).toBe(true);
    expect(DOG_PAGE.initial).toEqual({
      weight: '40',
      unit: 'lb',
      status: 'neutered',
      basis: 'cup',
      kcal: '360',
    });
  });

  it('labels every input of the engine, and every option of its choices', () => {
    for (const input of dogFood.inputs) {
      const copy = DOG_PAGE.fields[input.key];
      expect(copy, input.key).toBeDefined();
      if (input.kind === 'select')
        expect(Object.keys(copy?.options ?? {}), input.key).toEqual([...input.options]);
    }
  });

  it('keeps titles and descriptions where a result shows them whole', () => {
    for (const page of [DOG_PAGE, PUPPY_PAGE]) {
      expect(page.title.length).toBeLessThanOrEqual(65);
      expect(page.description.length).toBeGreaterThanOrEqual(50);
      expect(page.description.length).toBeLessThanOrEqual(160);
      expect(page.title.endsWith(' | Bowl Figures')).toBe(true);
    }
  });

  it('answers the search "how much food should I feed my dog" in its title and description', () => {
    expect(DOG_PAGE.title).toBe('How Much to Feed a Dog: Dog Food Calculator | Bowl Figures');
    expect(DOG_PAGE.description).toMatch(/^How much food should you feed your dog a day\?/);
  });

  it('starts the puppy page from a puppy under 4 months and still runs', () => {
    expect(PUPPY_PAGE.initial['status']).toBe('puppy-young');
    expect(dogFood.validate(PUPPY_PAGE.initial).ok).toBe(true);
    for (const input of dogFood.inputs) {
      const copy = PUPPY_PAGE.fields[input.key];
      expect(copy, input.key).toBeDefined();
    }
  });
});

describe('the dog result', () => {
  it('writes the 40 lb default as 2 3/4 cups of a 360 kcal food, 985 kcal a day', () => {
    const { text } = patch({});
    expect(text['figure']).toBe('2 ¾');
    expect(text['unit']).toBe('cups a day');
    expect(text['exact']).toBe('2.74 cups exactly');
    expect(text['kcal']).toBe('985');
    expect(text['treats']).toBe('98');
    expect(text['range']).toBe('862 to 985');
    expect(text['withTreats']).toBe('2 ½ cups');
  });

  it('draws the bowl for the day: 25 pieces for 985 kcal', () => {
    const { html } = patch({});
    expect(html['bowl']?.match(/class="kibble"/g)).toHaveLength(25);
  });

  it('writes grams for a label in kcal per kilogram: 175 g for 10 kg on 3,600', () => {
    const { text } = patch({ weight: '10', unit: 'kg', basis: 'kg', kcal: '3600' });
    expect(text['figure']).toBe('175');
    expect(text['unit']).toBe('grams a day');
    expect(text['exact']).toBe('175.0 g exactly');
    expect(text['withTreats']).toBe('157 g');
  });

  it('writes cans for a label in kcal per can: 1 1/2 cans for 10 kg on 400', () => {
    const { text } = patch({ weight: '10', unit: 'kg', basis: 'can', kcal: '400' });
    expect(text['figure']).toBe('1 ½');
    expect(text['unit']).toBe('cans a day');
    expect(text['exact']).toBe('1.57 cans exactly');
  });

  it('reads a basis left out as the cup, the engine default', () => {
    const result = patchOf(dogFood, dogView, { weight: '40' });
    expect(result?.text['unit']).toBe('cups a day');
  });

  it('gives nothing for a field it cannot read', () => {
    expect(patchOf(dogFood, dogView, { ...DOG_PAGE.initial, weight: 'heavy' })).toBeUndefined();
  });

  it('shows no flags, variables or conditional parts', () => {
    const { show, vars, flags } = patch({});
    expect([show, vars, flags]).toEqual([{}, {}, {}]);
  });
});
