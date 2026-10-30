import { describe, expect, it } from 'vitest';
import { collectStrings } from '../../__testing__/collect-strings.ts';
import { isLanguageFree } from '../../__testing__/language-free.ts';
import { PAINT_COVERAGE } from '../../__testing__/paint-yields.ts';
import { createPaint } from './index.ts';

const paint = createPaint(PAINT_COVERAGE);

const ran = () => {
  const result = paint.run({ gallonPrice: '40' });
  if (!result.ok) throw new Error('run failed');
  return result.value;
};

describe('paint descriptors and result shape (calc-paint › Inputs, Area and gallons)', () => {
  it('declares the 7 inputs in order', () => {
    expect(paint.id).toBe('paint');
    expect(paint.inputs.map(({ key, urlKey, kind }) => [key, urlKey, kind])).toEqual([
      ['length', 'l', 'length'],
      ['width', 'w', 'length'],
      ['height', 'h', 'length'],
      ['doors', 'dr', 'count'],
      ['windows', 'wn', 'count'],
      ['coats', 'c', 'count'],
      ['gallonPrice', 'gp', 'money'],
    ]);
  });

  it('lists the outputs in order with their roles and measures, one gallon line and no warnings', () => {
    const { outputs, shopping, warnings } = ran();
    expect(outputs.map(({ key, role }) => [key, role])).toEqual([
      ['gallons', 'primary'],
      ['liters', 'secondary'],
      ['paintArea', 'secondary'],
      ['wallArea', 'intermediate'],
      ['cost', 'secondary'],
    ]);
    expect(paint.outputs.map(({ key, measure }) => [key, measure])).toEqual([
      ['gallons', 'volume'],
      ['liters', 'volume'],
      ['paintArea', 'area'],
      ['wallArea', 'area'],
      ['cost', 'money'],
    ]);
    expect(shopping).toEqual([{ materialId: 'paint', purchaseUnit: 'gallon', qty: 2n }]);
    expect(warnings).toEqual([]);
  });

  it('holds only language-free strings', () => {
    expect(collectStrings(ran()).every(isLanguageFree)).toBe(true);
  });
});
