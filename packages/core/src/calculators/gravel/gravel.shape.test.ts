import { describe, expect, it } from 'vitest';
import { collectStrings } from '../../__testing__/collect-strings.ts';
import { GRAVEL_DENSITIES } from '../../__testing__/gravel-yields.ts';
import { isLanguageFree } from '../../__testing__/language-free.ts';
import { createGravel } from './index.ts';

const gravel = createGravel(GRAVEL_DENSITIES);

const ran = () => {
  const result = gravel.run({ tonPrice: '45' });
  if (!result.ok) throw new Error('run failed');
  return result.value;
};

describe('gravel descriptors and result shape (calc-gravel › Inputs, Weight and volume)', () => {
  it('declares the 6 inputs in order', () => {
    expect(gravel.id).toBe('gravel');
    expect(gravel.inputs.map(({ key, urlKey, kind }) => [key, urlKey, kind])).toEqual([
      ['length', 'l', 'length'],
      ['width', 'w', 'length'],
      ['depth', 'd', 'length'],
      ['placement', 'pl', 'select'],
      ['waste', 'ws', 'percent'],
      ['tonPrice', 'tp', 'money'],
    ]);
  });

  it('lists the outputs in order with their roles and measures, and no shopping or warnings', () => {
    const { outputs, shopping, warnings } = ran();
    expect(outputs.map(({ key, role }) => [key, role])).toEqual([
      ['tons', 'primary'],
      ['tonnes', 'secondary'],
      ['orderYd3', 'secondary'],
      ['orderM3', 'secondary'],
      ['placedYd3', 'intermediate'],
      ['cost', 'secondary'],
    ]);
    expect(gravel.outputs.map(({ key, measure }) => [key, measure])).toEqual([
      ['tons', 'mass'],
      ['tonnes', 'mass'],
      ['orderYd3', 'volume'],
      ['orderM3', 'volume'],
      ['placedYd3', 'volume'],
      ['cost', 'money'],
    ]);
    expect(shopping).toEqual([]);
    expect(warnings).toEqual([]);
  });

  it('holds only language-free strings', () => {
    expect(collectStrings(ran()).every(isLanguageFree)).toBe(true);
  });
});
