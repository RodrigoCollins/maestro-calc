import { describe, expect, it } from 'vitest';
import { collectStrings } from '../../__testing__/collect-strings.ts';
import { isLanguageFree } from '../../__testing__/language-free.ts';
import { boardFeet } from './index.ts';

const ran = () => {
  const result = boardFeet.run({ price: '3' });
  if (!result.ok) throw new Error('run failed');
  return result.value;
};

describe('board feet descriptors and result shape (calc-board-feet › Inputs, Board feet, volume and cost)', () => {
  it('declares the 5 inputs in order', () => {
    expect(boardFeet.id).toBe('board-feet');
    expect(boardFeet.inputs.map(({ key, urlKey, kind }) => [key, urlKey, kind])).toEqual([
      ['thickness', 't', 'length'],
      ['width', 'w', 'length'],
      ['length', 'l', 'length'],
      ['pieces', 'n', 'count'],
      ['price', 'pp', 'money'],
    ]);
  });

  it('lists the outputs in order with their roles, no shopping line and no warnings', () => {
    const { outputs, shopping, warnings } = ran();
    expect(outputs.map(({ key, role }) => [key, role])).toEqual([
      ['boardFeet', 'primary'],
      ['boardFeetEach', 'secondary'],
      ['volumeFt3', 'secondary'],
      ['volumeM3', 'secondary'],
      ['cost', 'secondary'],
    ]);
    expect(shopping).toEqual([]);
    expect(warnings).toEqual([]);
  });

  it('holds only language-free strings', () => {
    expect(collectStrings(ran()).every(isLanguageFree)).toBe(true);
  });
});
