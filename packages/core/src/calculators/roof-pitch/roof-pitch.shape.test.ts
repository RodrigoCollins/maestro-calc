import { describe, expect, it } from 'vitest';
import { collectStrings } from '../../__testing__/collect-strings.ts';
import { isLanguageFree } from '../../__testing__/language-free.ts';
import { roofPitch } from './index.ts';

const ran = (raw: Readonly<Record<string, unknown>> = {}) => {
  const result = roofPitch.run(raw);
  if (!result.ok) throw new Error('run failed');
  return result.value;
};

describe('roof pitch descriptors and result shape (calc-roof-pitch › Inputs, Pitch and rafter)', () => {
  it('declares the 5 inputs, the 4 outputs and the 2 warnings in order', () => {
    expect(roofPitch.id).toBe('roof-pitch');
    expect(roofPitch.inputs.map(({ key, urlKey, kind }) => [key, urlKey, kind])).toEqual([
      ['rise', 'r', 'length'],
      ['run', 'n', 'length'],
      ['rafterRun', 'rr', 'length'],
      ['overhang', 'oh', 'length'],
      ['covering', 'c', 'select'],
    ]);
    expect(roofPitch.outputs.map(({ key, role, measure }) => [key, role, measure])).toEqual([
      ['pitch', 'primary', 'length'],
      ['angle', 'secondary', 'angle'],
      ['rafter', 'secondary', 'length'],
      ['rafterM', 'secondary', 'length'],
    ]);
    expect(roofPitch.warnings).toEqual(['belowMinimum', 'doubleUnderlayment']);
    expect(ran().shopping).toEqual([]);
  });

  it('holds only language-free strings, warnings included', () => {
    expect(collectStrings(ran({ rise: '1', covering: 'slate' })).every(isLanguageFree)).toBe(true);
  });
});
