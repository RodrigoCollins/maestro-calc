import { describe, expect, it } from 'vitest';
import { collectStrings } from '../../__testing__/collect-strings.ts';
import { isLanguageFree } from '../../__testing__/language-free.ts';
import { topsoil } from './index.ts';

const ran = () => {
  const result = topsoil.run({ bagPrice: '5' });
  if (!result.ok) throw new Error('run failed');
  return result.value;
};

describe('topsoil descriptors and result shape (calc-topsoil › Inputs, Volume, bags and costs)', () => {
  it('declares the 7 inputs in order', () => {
    expect(topsoil.id).toBe('topsoil');
    expect(topsoil.inputs.map(({ key, urlKey, kind }) => [key, urlKey, kind])).toEqual([
      ['length', 'l', 'length'],
      ['width', 'w', 'length'],
      ['depth', 'd', 'length'],
      ['waste', 'ws', 'percent'],
      ['bag', 'bg', 'select'],
      ['bagPrice', 'bp', 'money'],
      ['yardPrice', 'yp', 'money'],
    ]);
  });

  it('lists the outputs in order with their roles, one shopping line and no warnings', () => {
    const { outputs, shopping, warnings } = ran();
    expect(outputs.map(({ key, role }) => [key, role])).toEqual([
      ['volumeYd3', 'primary'],
      ['volumeFt3', 'secondary'],
      ['volumeM3', 'secondary'],
      ['netVolume', 'intermediate'],
      ['bagCost', 'secondary'],
      ['bulkCost', 'secondary'],
    ]);
    expect(shopping).toHaveLength(1);
    expect(warnings).toEqual([]);
  });

  it('holds only language-free strings', () => {
    expect(collectStrings(ran()).every(isLanguageFree)).toBe(true);
  });
});
