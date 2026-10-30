import { describe, expect, it } from 'vitest';
import { collectStrings } from '../../__testing__/collect-strings.ts';
import { isLanguageFree } from '../../__testing__/language-free.ts';
import { ROOFING_COVERAGE } from '../../__testing__/roofing-yields.ts';
import { createRoofing } from './index.ts';

const roofing = createRoofing(ROOFING_COVERAGE);

const ran = (raw: Readonly<Record<string, unknown>> = { bundlePrice: '35' }) => {
  const result = roofing.run(raw);
  if (!result.ok) throw new Error('run failed');
  return result.value;
};

describe('roofing descriptors and result shape (calc-roofing › Inputs, Roof area and materials)', () => {
  it('declares the 6 inputs in order', () => {
    expect(roofing.id).toBe('roofing');
    expect(roofing.inputs.map(({ key, urlKey, kind }) => [key, urlKey, kind])).toEqual([
      ['length', 'l', 'length'],
      ['width', 'w', 'length'],
      ['pitch', 'p', 'count'],
      ['waste', 'ws', 'percent'],
      ['bundlePrice', 'bp', 'money'],
      ['rollPrice', 'rp', 'money'],
    ]);
  });

  it('lists the outputs in order with their roles and measures, two lines and no warnings', () => {
    const { outputs, shopping, warnings } = ran();
    expect(outputs.map(({ key, role }) => [key, role])).toEqual([
      ['squares', 'primary'],
      ['areaFt2', 'secondary'],
      ['areaM2', 'secondary'],
      ['cost', 'secondary'],
    ]);
    expect(roofing.outputs.map(({ key, measure }) => [key, measure])).toEqual([
      ['squares', 'area'],
      ['areaFt2', 'area'],
      ['areaM2', 'area'],
      ['cost', 'money'],
    ]);
    expect(shopping.map(({ materialId }) => materialId)).toEqual(['shingles', 'underlayment']);
    expect(warnings).toEqual([]);
    expect(roofing.warnings).toEqual(['belowMinimum', 'doubleUnderlayment']);
  });

  it('holds only language-free strings', () => {
    expect(collectStrings(ran()).every(isLanguageFree)).toBe(true);
    expect(collectStrings(ran({ pitch: '1' })).every(isLanguageFree)).toBe(true);
  });
});
