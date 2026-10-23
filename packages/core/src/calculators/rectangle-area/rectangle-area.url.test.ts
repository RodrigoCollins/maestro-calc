import { describe, expect, it } from 'vitest';
import { Rational } from '../../rational/rational.ts';
import { inch, m } from '../../units/catalog.ts';
import { quantity } from '../../units/quantity.ts';
import { decode, encode } from '../../url/codec.ts';
import { rectangleArea } from './index.ts';

const state = (length: number, width: number) => ({
  length: quantity(length, inch),
  width: quantity(width, inch),
});

describe('rectangle-area url state (calc-rectangle-area › Shareable state)', () => {
  // spec: Encoding [RA12]
  it('encodes only the fields that differ from 10 ft, under the keys l and w', () => {
    expect(encode(rectangleArea, state(150, 120))).toBe('v=1&l=150');
    expect(encode(rectangleArea, state(120, 120))).toBe('v=1');
  });

  it('encodes 5 ft 3-1/2 in by 2 ft as exact inches', () => {
    expect(
      encode(rectangleArea, { ...state(0, 24), length: quantity(Rational.of(127, 2), inch) }),
    ).toBe('v=1&l=127/2&w=24');
  });

  it('encodes the case D state under the metric unit system as exact fractions of an inch', () => {
    const validated = rectangleArea.validate(
      { length: '3 m', width: '2 m' },
      { unitSystem: 'metric' },
    );
    if (!validated.ok) throw new Error('validate failed');
    expect(encode(rectangleArea, validated.value, { unitSystem: 'metric' })).toBe(
      'v=1&u=m&l=15000/127&w=10000/127',
    );
    // the same lengths built from the unit constant
    expect(validated.value).toEqual({ length: quantity(3, m), width: quantity(2, m) });
  });

  // spec: Decoding links [RA13]
  it.each([
    ['v=1&l=150', state(150, 120), 'imperial', []],
    ['v=1&l=abc&w=24', state(120, 24), 'imperial', [{ code: 'INVALID_VALUE', key: 'l' }]],
    ['l=150&w=24&utm_source=x', state(150, 24), 'imperial', []],
  ])('decodes %s', (query, expected, unitSystem, issues) => {
    expect(decode(rectangleArea, query)).toEqual({ state: expected, unitSystem, issues });
  });

  it('decodes a percent-encoded fraction under the metric unit system', () => {
    expect(decode(rectangleArea, 'v=1&u=m&l=127%2F2')).toEqual({
      state: { ...state(0, 120), length: quantity(Rational.of(127, 2), inch) },
      unitSystem: 'metric',
      issues: [],
    });
  });
});
