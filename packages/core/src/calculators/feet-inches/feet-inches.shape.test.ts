import { describe, expect, it } from 'vitest';
import { collectStrings } from '../../__testing__/collect-strings.ts';
import { isLanguageFree } from '../../__testing__/language-free.ts';
import { feetInches } from './index.ts';

describe('feet and inches descriptors and result shape (calc-feet-inches › Inputs, Operations)', () => {
  it('declares the 4 inputs in order, the operation before the fields it drives', () => {
    expect(feetInches.id).toBe('feet-inches');
    expect(feetInches.inputs.map(({ key, urlKey, kind }) => [key, urlKey, kind])).toEqual([
      ['first', 'a', 'length'],
      ['operation', 'o', 'select'],
      ['second', 'b', 'length'],
      ['factor', 'n', 'count'],
    ]);
  });

  it('lists the outputs with their roles and displays, no shopping and one warning code', () => {
    const result = feetInches.run({});
    if (!result.ok) throw new Error('run failed');
    expect(feetInches.outputs.map(({ key, role, display }) => [key, role, display])).toEqual([
      ['result', 'primary', { unit: 'ft', format: 'fraction', denominator: 16 }],
      ['resultIn', 'secondary', { unit: 'in', format: 'decimal', places: 2 }],
      ['resultM', 'secondary', { unit: 'm', format: 'decimal', places: 3 }],
    ]);
    expect(result.value.shopping).toEqual([]);
    expect(feetInches.warnings).toEqual(['secondLonger']);
    expect(collectStrings(result.value).every(isLanguageFree)).toBe(true);
  });
});
