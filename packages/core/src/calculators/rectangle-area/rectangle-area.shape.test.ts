import { describe, expect, it } from 'vitest';
import { collectStrings } from '../../__testing__/collect-strings.ts';
import { isLanguageFree } from '../../__testing__/language-free.ts';
import { rectangleArea } from './index.ts';

const ran = () => {
  const result = rectangleArea.run({ length: "10'", width: '12\' 6"' });
  if (!result.ok) throw new Error('run failed');
  return result.value;
};

describe('rectangle-area result shape (calc-rectangle-area › Result shape)', () => {
  // spec: Result shape [RA10]
  it('lists the three areas in order with their roles, and no shopping or warnings', () => {
    const { outputs, shopping, warnings } = ran();
    expect(outputs.map(({ key, role }) => [key, role])).toEqual([
      ['areaFt2', 'primary'],
      ['areaYd2', 'secondary'],
      ['areaM2', 'secondary'],
    ]);
    // an area has two length dimensions and no mass
    for (const { value } of outputs) expect(value.exponents).toEqual({ length: 2, mass: 0 });
    expect(shopping).toEqual([]);
    expect(warnings).toEqual([]);
  });

  // spec: Result shape › every string is an identifier (language-free) [RA10]
  it('holds only language-free strings', () => {
    const strings = collectStrings(ran());
    expect(strings).toEqual([
      'areaFt2',
      'primary',
      '18000',
      'areaYd2',
      'secondary',
      '18000',
      'areaM2',
      'secondary',
      '18000',
    ]);
    expect(strings.filter((text) => !isLanguageFree(text))).toEqual([]);
  });
});
