import { catAge } from '@maestro-calc/pets-core/cat-age';
import { describe, expect, it } from 'vitest';
import {
  CARE_STAGE_NAMES,
  CAT_AGE_PAGE,
  catAgeView,
  CAT_STAGE_NAMES,
  VISITS_TEXT,
} from './cat-age.ts';
import { patchOf } from './view.ts';

const patch = (raw: Readonly<Record<string, string>>) => {
  const result = patchOf(catAge, catAgeView, { ...CAT_AGE_PAGE.initial, ...raw });
  if (result === undefined) throw new Error('did not run');
  return result;
};

describe('the cat age page', () => {
  it('is at the address the routes pin, and starts from the engine defaults', () => {
    expect(CAT_AGE_PAGE.path).toBe('/cat-age-calculator');
    expect(CAT_AGE_PAGE.initial).toEqual({ from: 'cat', age: '5' });
    expect(catAge.validate(CAT_AGE_PAGE.initial).ok).toBe(true);
  });

  it('labels every input of the engine, and every option of its choices', () => {
    for (const input of catAge.inputs) {
      const copy = CAT_AGE_PAGE.fields[input.key];
      expect(copy, input.key).toBeDefined();
      if (input.kind === 'select')
        expect(Object.keys(copy?.options ?? {}), input.key).toEqual([...input.options]);
    }
  });

  it('keeps title and description where a result shows them whole', () => {
    expect(CAT_AGE_PAGE.title.length).toBeLessThanOrEqual(65);
    expect(CAT_AGE_PAGE.description.length).toBeGreaterThanOrEqual(50);
    expect(CAT_AGE_PAGE.description.length).toBeLessThanOrEqual(160);
  });

  it('names the four age stages of 2021, the six of International Cat Care, and the visits', () => {
    expect(CAT_STAGE_NAMES).toEqual(['Kitten', 'Young adult', 'Mature adult', 'Senior']);
    expect(CARE_STAGE_NAMES).toEqual([
      'Kitten',
      'Junior',
      'Adult',
      'Mature',
      'Senior',
      'Super senior',
    ]);
    expect(VISITS_TEXT).toEqual({ 1: 'at least once a year', 2: 'at least every 6 months' });
  });

  it('says the seven-year rule is a myth, how to enter a kitten, and where the sources part', () => {
    const notes = CAT_AGE_PAGE.notes.join(' ');
    expect(notes).toContain('Not seven');
    expect(notes).toContain('15 human years');
    expect(notes).toContain('3 months is 0.25');
    expect(notes).toContain('Cornell');
    expect(notes).toContain('indoor');
  });
});

describe('the cat age result', () => {
  it('writes the default, a 5-year-old cat, as 36 human years', () => {
    const { text, show } = patch({});
    expect(text['figure']).toBe('36');
    expect(text['unit']).toBe('human years');
    expect(text['exact']).toBe('for a 5-year-old cat');
    // Cornell: 21 + 3 x 4
    expect(text['cornell']).toBe('33 human years');
    expect(text['seven']).toBe('35 human years');
    expect(text['stage']).toBe('Young adult');
    expect(text['care']).toBe('Adult');
    expect(text['visits']).toBe('at least once a year');
    expect(show).toEqual({ outside: false, cornellOutside: false });
  });

  it('names a kitten by its months, and writes the decimal of a figure between the rows', () => {
    const { text, show } = patch({ age: '0.75' });
    expect(text['figure']).toBe('13.2');
    expect(text['exact']).toBe('for a 9-month-old kitten');
    expect(text['stage']).toBe('Kitten');
    expect(text['care']).toBe('Junior');
    expect(show).toEqual({ outside: false, cornellOutside: true });
    expect(patch({ age: '0.3' }).text['exact']).toBe('for a 0.3-year-old kitten');
  });

  it('says an 8-year-old, an 11-year-old and an 18-year-old', () => {
    expect(patch({ age: '8' }).text['exact']).toBe('for an 8-year-old cat');
    expect(patch({ age: '11' }).text['exact']).toBe('for an 11-year-old cat');
    expect(patch({ age: '18' }).text['exact']).toBe('for an 18-year-old cat');
  });

  it('asks for a visit every 6 months from 11, a senior', () => {
    const { text } = patch({ age: '11' });
    expect(text['figure']).toBe('60');
    expect(text['stage']).toBe('Senior');
    expect(text['care']).toBe('Senior');
    expect(text['visits']).toBe('at least every 6 months');
  });

  it('works a human age back to cat years, to the tenth', () => {
    // 2 + (50 - 24) / 4 = 8.5; Cornell 2 + (50 - 21) / 4 = 9.25
    const { text } = patch({ from: 'human', age: '50' });
    expect(text['figure']).toBe('8.5');
    expect(text['unit']).toBe('cat years');
    expect(text['exact']).toBe('for 50 human years');
    expect(text['cornell']).toBe('9.3 cat years');
    expect(text['seven']).toBe('7.1 cat years');
    expect(text['stage']).toBe('Mature adult');
    expect(patch({ from: 'human', age: '36' }).text['figure']).toBe('5');
    expect(patch({ from: 'human', age: '16' }).text['cornell']).toBe('1 cat year');
  });

  it('shows the note past the 25 years of the table', () => {
    expect(patch({ age: '26' }).show).toEqual({ outside: true, cornellOutside: false });
  });

  it('gives nothing for a field it cannot read', () => {
    expect(patchOf(catAge, catAgeView, { ...CAT_AGE_PAGE.initial, age: 'old' })).toBeUndefined();
  });
});
