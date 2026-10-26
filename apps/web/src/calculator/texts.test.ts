import { quantity, inch, Rational, usd } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { mixedCalculator, unwrap } from '../__testing__/page-fixtures.ts';
import { concrete } from '../lib/concrete.ts';
import { baseOf, byTextKey, keptText, rawTextOf, textKeysOf, textOf, textsOf } from './texts.ts';

const valid = (raw: Readonly<Record<string, unknown>> = {}) => unwrap(concrete.validate(raw));
const input = (key: string) => {
  const found = concrete.inputs.find((candidate) => candidate.key === key);
  if (found === undefined) throw new Error(`no input ${key}`);
  return found;
};

describe('texts from the definition (calculator-web-core › Generic controller behaviour)', () => {
  // spec: calculator-web-core › [CWC5] the fifteen text keys, in definition order
  it('lists the text keys of concrete in definition order', () => {
    expect(textKeysOf(concrete)).toEqual([
      'length',
      'width',
      'thickness',
      'footingWidth',
      'footingDepth',
      'diameter',
      'height',
      'stepWidth',
      'rise',
      'run',
      'stepCount',
      'count',
      'waste',
      'bagPrice',
      'readyMixPrice',
    ]);
  });

  it('builds a record with one value per text key', () => {
    const lengths = byTextKey(mixedCalculator, (key) => key.length);
    expect(lengths).toEqual({ span: 4, pieces: 6, rate: 4, price: 5 });
    expect(Object.keys(lengths)).toEqual(textKeysOf(mixedCalculator));
  });

  // spec: calculator-web-core › [CWC5] texts from the definition
  it('writes the default texts of concrete', () => {
    expect(textsOf(concrete, valid(), 'imperial')).toEqual({
      length: '12 ft',
      width: '10 ft',
      thickness: '4 in',
      footingWidth: '16 in',
      footingDepth: '8 in',
      diameter: '12 in',
      height: '8 ft',
      stepWidth: '4 ft',
      rise: '7 in',
      run: '11 in',
      stepCount: '3',
      count: '1',
      waste: '10',
      bagPrice: '',
      readyMixPrice: '',
    });
  });

  // spec: calculator-web-core › [CWC14] metric toggle keeps exact values
  it('writes the lengths in the metric unit of each field', () => {
    const metric = textsOf(concrete, valid(), 'metric');
    expect([metric.length, metric.width, metric.thickness]).toEqual([
      '3.6576 m',
      '3.048 m',
      '10.16 cm',
    ]);
  });

  // spec: calculator-web-core › [CWC5] one text per kind, from a calculator that is not concrete
  it('writes a count, a percent, a money and a length of a synthetic calculator', () => {
    const state = unwrap(mixedCalculator.validate({ price: '6.5', rate: '12.5', pieces: '4' }));
    expect(textKeysOf(mixedCalculator)).toEqual(['span', 'pieces', 'rate', 'price']);
    expect(textsOf(mixedCalculator, state, 'imperial')).toEqual({
      span: '10 ft',
      pieces: '4',
      rate: '12.5',
      price: '6.50',
    });
  });

  it('writes a zero price as an empty text', () => {
    expect(textOf(input('bagPrice'), usd(0), 'imperial')).toBe('');
  });

  it.each([
    ['a length that is not a quantity', input('length'), 'x'],
    ['a count that is not a number', input('count'), 'x'],
    ['a price that is not money', input('bagPrice'), 'x'],
    ['a quantity for a count', input('count'), quantity(1, inch)],
    ['a select', input('shape'), 'slab'],
    ['a boolean', mixedCalculator.inputs[4], true],
  ])('refuses to write %s', (_what, subject, value) => {
    expect(() => textOf(subject, value as never, 'imperial')).toThrow(/holds no/);
  });

  // spec: calculator-web-core › [CWC6] an empty money field is an explicit undefined
  it.each([
    ['', undefined],
    ['   ', undefined],
    ['6.50', '6.50'],
  ])('reads the price text %j as %j', (text, expected) => {
    expect(rawTextOf(input('bagPrice'), text)).toBe(expected);
  });

  it('reads every other empty text as typed', () => {
    expect(rawTextOf(input('length'), '')).toBe('');
    expect(rawTextOf(input('waste'), ' ')).toBe(' ');
  });

  // spec: calculator-web-core › Generic controller behaviour: a percent goes back as text only
  it('carries percents as text and every other value as it is', () => {
    const state = valid({ bagPrice: '6.50' });
    const base = baseOf(concrete, state);
    expect(base['waste']).toBe('10');
    expect(base['length']).toBe(state.length);
    expect(base['bagPrice']).toBe(state.bagPrice);
    expect(base['shape']).toBe('slab');
    expect(Object.keys(base)).toEqual(concrete.inputs.map(({ key }) => key));
  });

  // spec: calculator-web-core › [CWC15] an invalid bare number stays in the unit it was typed in
  it.each([
    ['length', '150', 'imperial', '150 ft'],
    ['thickness', '150', 'imperial', '150 in'],
    ['thickness', '400', 'metric', '400 cm'],
    ['length', '5000', 'metric', '5000 m'],
    ['thickness', '150 in', 'metric', '150 in'],
    ['thickness', '5 furlongs', 'metric', '5 furlongs'],
    ['thickness', '1,5', 'imperial', '1,5'],
    ['waste', '51', 'imperial', '51'],
    ['count', 'abc', 'metric', 'abc'],
  ] as const)('keeps %s %j typed in %s as %j', (key, text, system, expected) => {
    expect(keptText(input(key), text, system)).toBe(expected);
  });

  it('uses the exact value of a quantity it is given', () => {
    expect(textOf(input('length'), quantity(Rational.of(150), inch), 'imperial')).toBe(
      '12 ft 6 in',
    );
  });
});
