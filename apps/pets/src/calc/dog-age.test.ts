import { dogAge } from '@maestro-calc/pets-core/dog-age';
import { describe, expect, it } from 'vitest';
import { DOG_AGE_PAGE, dogAgeView, SIZE_COPY, STAGE_NAMES } from './dog-age.ts';
import { patchOf } from './view.ts';

const patch = (raw: Readonly<Record<string, string>>) => {
  const result = patchOf(dogAge, dogAgeView, { ...DOG_AGE_PAGE.initial, ...raw });
  if (result === undefined) throw new Error('did not run');
  return result;
};

describe('the dog age page', () => {
  it('is at the address the routes pin, and starts from the engine defaults', () => {
    expect(DOG_AGE_PAGE.path).toBe('/dog-age-calculator');
    expect(DOG_AGE_PAGE.initial).toEqual({ from: 'dog', age: '3', size: 'medium' });
    expect(dogAge.validate(DOG_AGE_PAGE.initial).ok).toBe(true);
  });

  it('labels every input of the engine, and every option of its choices', () => {
    for (const input of dogAge.inputs) {
      const copy = DOG_AGE_PAGE.fields[input.key];
      expect(copy, input.key).toBeDefined();
      if (input.kind === 'select')
        expect(Object.keys(copy?.options ?? {}), input.key).toEqual([...input.options]);
    }
  });

  it('keeps title and description where a result shows them whole', () => {
    expect(DOG_AGE_PAGE.title.length).toBeLessThanOrEqual(65);
    expect(DOG_AGE_PAGE.description.length).toBeGreaterThanOrEqual(50);
    expect(DOG_AGE_PAGE.description.length).toBeLessThanOrEqual(160);
  });

  it('names the four sizes by weight and the four AAHA life stages', () => {
    expect(SIZE_COPY.medium).toEqual({ name: 'Medium', weight: '21 to 50 lb' });
    expect(Object.keys(SIZE_COPY)).toEqual(['small', 'medium', 'large', 'giant']);
    expect(STAGE_NAMES).toEqual(['Puppy', 'Young adult', 'Mature adult', 'Senior']);
  });

  it('says the seven-year rule is a myth, and answers how many dog years one human year is', () => {
    const notes = DOG_AGE_PAGE.notes.join(' ');
    expect(notes).toContain('seven');
    expect(notes).toContain('15 human years');
  });
});

describe('the dog age result', () => {
  it('writes the default, a 3-year-old medium dog, as 28 human years', () => {
    const { text, show } = patch({});
    expect(text['figure']).toBe('28');
    expect(text['unit']).toBe('human years');
    expect(text['exact']).toBe('for a 3-year-old medium dog (21 to 50 lb)');
    // 16 x ln 3 + 31 = 48.58
    expect(text['wang']).toBe('48.6 human years');
    expect(text['seven']).toBe('21 human years');
    expect(text['stage']).toBe('Young adult');
    expect(text['seniorAt']).toBe('10 years');
    expect(show).toEqual({ outside: false, wangOutside: false });
  });

  it('writes the half of the large and giant lines: a 3-year-old giant dog is 31.5', () => {
    expect(patch({ size: 'giant' }).text['figure']).toBe('31.5');
  });

  it('writes a half year as a figure with its decimal', () => {
    const { text } = patch({ age: '1.5', size: 'giant' });
    expect(text['figure']).toBe('20');
    expect(text['exact']).toBe('for a 1.5-year-old giant dog (over 100 lb)');
  });

  it('says an 8-year-old and an 18-year-old', () => {
    expect(patch({ age: '8' }).text['exact']).toBe('for an 8-year-old medium dog (21 to 50 lb)');
    expect(patch({ age: '18' }).text['exact']).toBe('for an 18-year-old medium dog (21 to 50 lb)');
    expect(patch({ age: '1.8' }).text['exact']).toBe('for a 1.8-year-old medium dog (21 to 50 lb)');
  });

  it('works a human age back to dog years, to the tenth', () => {
    // large: 2 + (50 - 24) / 5.5 = 6.73
    const { text } = patch({ from: 'human', age: '50', size: 'large' });
    expect(text['figure']).toBe('6.7');
    expect(text['unit']).toBe('dog years');
    expect(text['exact']).toBe('for 50 human years, a large dog (51 to 100 lb)');
    // e^((50 - 31) / 16) = 3.28
    expect(text['wang']).toBe('3.3 dog years');
    expect(text['seven']).toBe('7.1 dog years');
    expect(text['stage']).toBe('Mature adult');
  });

  it('shows the notes for an age past the sources and past the study of the DNA clock', () => {
    expect(patch({ age: '22' }).show).toEqual({ outside: true, wangOutside: true });
    expect(patch({ age: '18' }).show).toEqual({ outside: false, wangOutside: true });
  });

  it('gives nothing for a field it cannot read', () => {
    expect(patchOf(dogAge, dogAgeView, { ...DOG_AGE_PAGE.initial, age: 'old' })).toBeUndefined();
  });
});
