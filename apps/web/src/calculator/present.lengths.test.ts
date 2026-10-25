import { inch, m, quantity, Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { concrete } from '../lib/concrete.ts';
import { boundText, dimensionText, fieldText } from './present.ts';

const inches = (value: number, den = 1) => quantity(Rational.of(value, den), inch);

describe('dimension text (calculator-page › [CP33])', () => {
  // spec: calculator-page › Display conventions: US feet and inches, 1/64 at most
  it.each([
    [inches(144), '12 ft'],
    [inches(4), '4 in'],
    [inches(150), '12 ft 6 in'],
    [inches(127, 2), '5 ft 3 1/2 in'],
    [inches(0), '0 in'],
    [inches(1, 2), '1/2 in'],
    [inches(25, 2), '1 ft 1/2 in'],
    [inches(16), '1 ft 4 in'],
    [inches(12000), '1,000 ft'],
    [inches(12006), '1,000 ft 6 in'],
    [inches(767, 64), '11 63/64 in'],
    [inches(3071, 256), '1 ft'],
    [inches(20000, 127), '13 ft 1 31/64 in'],
  ])('writes length %# in the US system as %s', (length, text) => {
    expect(dimensionText(length, 'imperial')).toBe(text);
  });

  // spec: calculator-page › [CP33] metric sentences have 2 places
  it.each([
    [inches(144), '3.66 m'],
    [inches(120), '3.05 m'],
    [inches(4), '10.16 cm'],
    [inches(0), '0.00 cm'],
    [quantity(1, m), '1.00 m'],
    [quantity(Rational.of(99, 100), m), '99.00 cm'],
    [quantity(1000, m), '1,000.00 m'],
  ])('writes length %# in the metric system as %s', (length, text) => {
    expect(dimensionText(length, 'metric')).toBe(text);
  });
});

describe('field text (calculator-page › [CP33], [CP50])', () => {
  const big = { defaultUnit: 'ft', metricDefaultUnit: 'm' } as const;
  const small = { defaultUnit: 'in', metricDefaultUnit: 'cm' } as const;

  // spec: calculator-page › Form controls: the default texts and [CP25] the restored text
  it.each([
    [inches(144), big, '12 ft'],
    [inches(120), big, '10 ft'],
    [inches(96), big, '8 ft'],
    [inches(216), big, '18 ft'],
    [inches(0), big, '0 ft'],
    [inches(150), big, '12 ft 6 in'],
    [inches(127, 2), big, '5 ft 3 1/2 in'],
    [inches(127, 3), big, '3 ft 6 1/3 in'],
    [inches(1, 2), big, '1/2 in'],
    [inches(4), small, '4 in'],
    [inches(16), small, '16 in'],
    [inches(12), small, '12 in'],
    [inches(11, 2), small, '5 1/2 in'],
    [inches(0), small, '0 in'],
    [inches(20000, 127), big, '20000/127 in'],
    [inches(20000, 127), small, '20000/127 in'],
  ])('writes length %# of a field in the US system as %s', (length, field, text) => {
    expect(fieldText(length, field, 'imperial')).toBe(text);
  });

  // spec: calculator-page › [CP33] exact metric text, [CP50] exact inches when no decimal exists
  it.each([
    [inches(144), big, '3.6576 m'],
    [inches(120), big, '3.048 m'],
    [inches(4), small, '10.16 cm'],
    [inches(0), big, '0 m'],
    [inches(20000, 127), big, '4 m'],
    [inches(5), big, '0.127 m'],
    [inches(127, 3), small, '127/3 in'],
    [inches(1, 3), big, '1/3 in'],
  ])('writes length %# of a field in the metric system as %s', (length, field, text) => {
    expect(fieldText(length, field, 'metric')).toBe(text);
  });

  it('writes a millimetre field in millimetres', () => {
    expect(
      fieldText(inches(25, 127), { defaultUnit: 'in', metricDefaultUnit: 'mm' }, 'metric'),
    ).toBe('5 mm');
  });
});

describe('bound text (calculator-page › [CP31])', () => {
  const field = (key: string) => {
    const found = concrete.inputs.find((input) => input.key === key);
    if (found === undefined) throw new Error(`no input ${key}`);
    return found;
  };

  // spec: calculator-page › [CP31] bounds are formatted in the unit of the field
  it.each([
    ['length', '12000', 'imperial', '1,000 ft'],
    ['thickness', '120', 'imperial', '120 in'],
    ['length', '12000', 'metric', '304.8 m'],
    ['thickness', '120', 'metric', '304.8 cm'],
    ['waste', '50', 'imperial', '50%'],
    ['waste', '25/2', 'imperial', '12.5%'],
    ['count', '1000', 'imperial', '1,000'],
    ['count', '1', 'imperial', '1'],
    ['bagPrice', '10000', 'imperial', '$10,000.00'],
  ] as const)('writes the bound of %s (%s, %s) as %s', (key, bound, system, text) => {
    expect(boundText(field(key), bound, system)).toBe(text);
  });

  it('refuses a bound for a select, which has none, and a bound that is not a number', () => {
    expect(() => boundText(field('shape'), '1', 'imperial')).toThrow(TypeError);
    expect(() => boundText(field('length'), 'abc', 'imperial')).toThrow(TypeError);
  });
});
