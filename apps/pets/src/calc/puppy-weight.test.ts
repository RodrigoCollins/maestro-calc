import { puppyWeight } from '@maestro-calc/pets-core/puppy-weight';
import { describe, expect, it } from 'vitest';
import { PUPPY_WEIGHT_PAGE, puppyWeightView } from './puppy-weight.ts';
import { patchOf } from './view.ts';

const patch = (raw: Readonly<Record<string, string>>) => {
  const result = patchOf(puppyWeight, puppyWeightView, { ...PUPPY_WEIGHT_PAGE.initial, ...raw });
  if (result === undefined) throw new Error('did not run');
  return result;
};

describe('the puppy weight page', () => {
  it('is at the address the routes pin, and starts from the engine defaults', () => {
    expect(PUPPY_WEIGHT_PAGE.path).toBe('/puppy-weight-calculator');
    expect(PUPPY_WEIGHT_PAGE.initial).toEqual({
      weight: '21',
      unit: 'lb',
      age: '13',
      size: 'large',
    });
    const defaults = puppyWeight.validate({});
    const initial = puppyWeight.validate(PUPPY_WEIGHT_PAGE.initial);
    expect(initial.ok && defaults.ok && initial.value).toEqual(defaults.ok && defaults.value);
  });

  it('labels every input of the engine, and every option of its choices', () => {
    for (const input of puppyWeight.inputs) {
      const copy = PUPPY_WEIGHT_PAGE.fields[input.key];
      expect(copy, input.key).toBeDefined();
      if (input.kind === 'select')
        expect(Object.keys(copy?.options ?? {}), input.key).toEqual([...input.options]);
    }
  });

  it('asks the question people search, and keeps title and description whole', () => {
    expect(PUPPY_WEIGHT_PAGE.h1).toBe('How big will my puppy get?');
    expect(PUPPY_WEIGHT_PAGE.title).toBe(
      'How Big Will My Puppy Get? Puppy Weight Calculator | Bowl Figures',
    );
    expect(PUPPY_WEIGHT_PAGE.title.length).toBeLessThanOrEqual(65);
    expect(PUPPY_WEIGHT_PAGE.description.length).toBeGreaterThanOrEqual(50);
    expect(PUPPY_WEIGHT_PAGE.description.length).toBeLessThanOrEqual(160);
  });

  it('names the size classes by the adult weights of the table, in both units', () => {
    const sizes = PUPPY_WEIGHT_PAGE.fields['size']?.options ?? {};
    expect(sizes['small']).toContain('25 kg');
    expect(sizes['large']).toContain('25 to 45 kg');
    expect(sizes['giant']).toContain('45 kg');
    expect(sizes['small']).toContain('55 lb');
    expect(sizes['giant']).toContain('99 lb');
  });

  it('says it is an estimate, why it is a range, and to ask the veterinarian', () => {
    const notes = PUPPY_WEIGHT_PAGE.notes.join(' ');
    expect(notes).toContain('estimate');
    expect(notes).toContain('mixed');
    expect(notes).toContain('veterinarian');
    for (const note of [
      PUPPY_WEIGHT_PAGE.early,
      PUPPY_WEIGHT_PAGE.grown,
      PUPPY_WEIGHT_PAGE.outsideClass,
    ])
      expect(note.length).toBeGreaterThan(40);
  });
});

describe('the puppy weight result', () => {
  it('writes the default, 21 lb at 13 weeks, large: about 60 lb, range 57 to 81', () => {
    const { text, show } = patch({});
    expect(text['figure']).toBe('60');
    expect(text['unit']).toBe('lb as an adult');
    // 60 x 0.45359237 = 27.2 kg
    expect(text['exact']).toBe('about 27.2 kg, for a 21 lb puppy at 13 weeks');
    // small 21 / 0.37 = 56.8, giant 21 / 0.26 = 80.8
    expect(text['range']).toBe('57 to 81 lb');
    expect(text['share']).toBe('35%');
    expect(text['months']).toBe('3 months');
    expect(text['grownBy']).toBe('18 months');
    expect(show).toEqual({ early: false, grown: false, outsideClass: false });
  });

  it('writes kilograms to the tenth and the pounds beside them', () => {
    // 10 kg / 0.35 = 28.57 kg = 62.99 lb; small 27.03, giant 38.46
    const { text } = patch({ weight: '10', unit: 'kg' });
    expect(text['figure']).toBe('28.6');
    expect(text['unit']).toBe('kg as an adult');
    expect(text['exact']).toBe('about 63 lb, for a 10 kg puppy at 13 weeks');
    expect(text['range']).toBe('27 to 38.5 kg');
  });

  it('writes the share and the months between the rows, and 1 week', () => {
    // 16 weeks = 3.7 months; small: 37 + (9/13) x 15 = 47.4%, 10 / 0.474 = 21.1
    const { text } = patch({ weight: '10', age: '16', size: 'small' });
    expect(text['figure']).toBe('21');
    expect(text['share']).toBe('47%');
    expect(text['months']).toBe('3.7 months');
    expect(text['grownBy']).toBe('15 months');
    expect(patch({ weight: '10', age: '16.5', size: 'small' }).text['exact']).toBe(
      'about 9.2 kg, for a 10 lb puppy at 16.5 weeks',
    );
  });

  it('shows the note under 12 weeks, once grown, and outside the size class', () => {
    expect(patch({ weight: '4', age: '8', size: 'small' }).show).toEqual({
      early: true,
      grown: false,
      outsideClass: false,
    });
    expect(patch({ weight: '20', age: '65', size: 'small' }).show['grown']).toBe(true);
    expect(patch({ weight: '30', size: 'small' }).show['outsideClass']).toBe(true);
  });

  it('gives nothing for a field it cannot read', () => {
    expect(
      patchOf(puppyWeight, puppyWeightView, { ...PUPPY_WEIGHT_PAGE.initial, weight: 'heavy' }),
    ).toBeUndefined();
  });
});
