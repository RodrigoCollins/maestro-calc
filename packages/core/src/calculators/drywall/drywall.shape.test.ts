import { describe, expect, it } from 'vitest';
import { collectStrings } from '../../__testing__/collect-strings.ts';
import { DRYWALL_FINISHING } from '../../__testing__/drywall-yields.ts';
import { isLanguageFree } from '../../__testing__/language-free.ts';
import { createDrywall } from './index.ts';

const drywall = createDrywall(DRYWALL_FINISHING);

const ran = () => {
  const result = drywall.run({ sheetPrice: '12' });
  if (!result.ok) throw new Error('run failed');
  return result.value;
};

describe('drywall descriptors and result shape (calc-drywall › Inputs, Area and materials)', () => {
  it('declares the 9 inputs in order', () => {
    expect(drywall.id).toBe('drywall');
    expect(drywall.inputs.map(({ key, urlKey, kind }) => [key, urlKey, kind])).toEqual([
      ['length', 'l', 'length'],
      ['width', 'w', 'length'],
      ['height', 'h', 'length'],
      ['doors', 'dr', 'count'],
      ['windows', 'wn', 'count'],
      ['surfaces', 'sf', 'select'],
      ['sheet', 'sz', 'select'],
      ['waste', 'ws', 'percent'],
      ['sheetPrice', 'sp', 'money'],
    ]);
  });

  it('lists the outputs in order with their roles and measures, three lines and no warnings', () => {
    const { outputs, shopping, warnings } = ran();
    expect(outputs.map(({ key, role }) => [key, role])).toEqual([
      ['areaFt2', 'primary'],
      ['areaM2', 'secondary'],
      ['compound', 'secondary'],
      ['tape', 'secondary'],
      ['cost', 'secondary'],
    ]);
    expect(drywall.outputs.map(({ key, measure }) => [key, measure])).toEqual([
      ['areaFt2', 'area'],
      ['areaM2', 'area'],
      ['compound', 'volume'],
      ['tape', 'length'],
      ['cost', 'money'],
    ]);
    expect(shopping.map(({ materialId }) => materialId)).toEqual([
      'drywall',
      'joint-compound',
      'joint-tape',
    ]);
    expect(warnings).toEqual([]);
  });

  it('holds only language-free strings', () => {
    expect(collectStrings(ran()).every(isLanguageFree)).toBe(true);
  });
});
