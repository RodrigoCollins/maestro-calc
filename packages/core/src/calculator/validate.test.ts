import { describe, expect, it } from 'vitest';
import { fixtureBox } from '../__testing__/fixture-box.ts';
import { usd } from '../money/money.ts';
import { Rational } from '../rational/rational.ts';
import { err, ok } from '../result.ts';
import { ft, ft2, inch, mm, yd } from '../units/catalog.ts';
import { multiply } from '../units/ops.ts';
import { isQuantityOf, quantity } from '../units/quantity.ts';
import { defineCalculator } from './define.ts';
import { validateRecord, type ValidateOptions } from './validate.ts';

const validate = (
  raw: Readonly<Record<string, unknown>>,
  options?: ValidateOptions,
): ReturnType<typeof validateRecord> => validateRecord(fixtureBox.inputs, raw, options);

const defaults = {
  len: quantity(12, inch),
  cnt: 3,
  pct: Rational.of(10),
  sel: 'x',
  flg: false,
  prc: usd(Rational.of(249, 50)),
};

describe('validateRecord (calculator-contract › Total validation without silent coercion)', () => {
  // spec: calculator-contract › Empty record yields defaults [CC9]
  it('takes the default of every field absent from the record', () => {
    expect(validate({})).toEqual(ok(defaults));
  });

  // spec: calculator-contract › Unknown keys and undefined [CC20]
  it('treats undefined as absent and ignores undeclared keys', () => {
    expect(validate({ zzz: 1, len: undefined })).toEqual(ok(defaults));
    expect(validate({ zzz: 'x', cnt: undefined, sel: undefined, flg: undefined })).toEqual(
      ok(defaults),
    );
  });

  it('returns the value with its keys in declaration order', () => {
    const result = validateRecord(fixtureBox.inputs, {});
    expect(result.ok && Object.keys(result.value)).toEqual([
      'len',
      'cnt',
      'pct',
      'sel',
      'flg',
      'prc',
    ]);
  });

  // An inherited property is not a value the caller gave: a field may be named like one.
  it('does not read inherited properties as values', () => {
    const inherited = defineCalculator({
      id: 'inherited',
      inputs: [
        { kind: 'count', key: 'valueOf', urlKey: 'a', default: 4 },
        { kind: 'boolean', key: 'toString', urlKey: 'b', default: true },
      ],
      outputs: [{ key: 'area', measure: 'area', role: 'primary' }],
      compute: () => ({
        outputs: { area: multiply(quantity(1, inch), quantity(1, inch)) },
        shopping: [],
        warnings: [],
      }),
    });
    expect(validateRecord(inherited.inputs, {})).toEqual(ok({ valueOf: 4, toString: true }));
  });

  // Kinds are added one at a time (tasks 9.7 and 9.8): until a kind parses, a given value is
  // refused rather than accepted unchecked, and the errors follow the declaration order.
  it('refuses a given value that no kind parses yet, in declaration order', () => {
    expect(validate({ cnt: '7', len: 'abc', zzz: 1 })).toEqual({
      ok: false,
      errors: [
        { field: 'len', code: 'MALFORMED' },
        { field: 'cnt', code: 'MALFORMED' },
      ],
    });
    expect(validate({ flg: true })).toEqual(err({ field: 'flg', code: 'MALFORMED' }));
  });
});

// Expected values below were computed by hand from the exact unit factors (1 in = 127/5 mm,
// 1 m = 5000/127 in) and checked with Python `fractions.Fraction`.
describe('validateRecord length field (calculator-contract › Total validation, length)', () => {
  // the canonical inches of the value as a string, or the whole failed result
  const inches = (raw: unknown, options?: ValidateOptions): unknown => {
    const result = validate({ len: raw }, options);
    const len = result.ok ? result.value['len'] : undefined;
    return isQuantityOf(len, 'length') ? len.canonical.toString() : result;
  };
  const failure = (code: string, params?: object): unknown =>
    err(params === undefined ? { field: 'len', code } : { field: 'len', code, params });

  // spec: calculator-contract › Length bounds are inclusive [CC12]
  it.each([
    ['-1', failure('BELOW_MIN', { min: '0' })],
    ['0', '0'],
    ["100'", '1200'],
    ['1200', '1200'],
    ["101'", failure('ABOVE_MAX', { max: '1200' })],
    ['1200 1/64', failure('ABOVE_MAX', { max: '1200' })],
    ['1199 63/64', '76799/64'],
  ])('checks the inclusive bounds of %j', (raw, expected) => {
    expect(inches(raw)).toEqual(expected);
  });

  // spec: calculator-contract › Length parser errors surface [CC13]
  it.each([
    ['abc', 'MALFORMED'],
    ['1/0', 'ZERO_DENOMINATOR'],
    ['5 furlongs', 'UNKNOWN_UNIT'],
    ['', 'EMPTY'],
    ['1,5', 'DECIMAL_COMMA'],
    ['1234567890123456789', 'TOO_LARGE'],
  ])('reports the parser code of %j as %s', (raw, code) => {
    expect(inches(raw)).toEqual(failure(code));
  });

  // spec: calculator-contract › Metric input to a length field [CC14]
  it('accepts any unit of the length dimension: 1 m is 5000/127 in', () => {
    expect(inches('1 m')).toBe('5000/127');
    expect(inches('2.54 cm')).toBe('1');
  });

  // spec: calculator-contract › Unit system selects the default unit for bare numbers [CC15]
  it('applies the default unit of the unit system to a bare number', () => {
    expect(inches('5')).toBe('5');
    expect(inches('5', {})).toBe('5');
    expect(inches('5', { unitSystem: 'imperial' })).toBe('5');
    expect(inches('5', { unitSystem: 'metric' })).toBe('250/127');
    // an explicit unit always wins
    expect(inches("5'", { unitSystem: 'metric' })).toBe('60');
  });

  // 5 of each default unit, in inches: in 5, ft 60, yd 180, mm 25/127, cm 250/127, m 25000/127
  it.each([
    ['in', 'mm', 'imperial', '5'],
    ['ft', 'mm', 'imperial', '60'],
    ['yd', 'mm', 'imperial', '180'],
    ['in', 'mm', 'metric', '25/127'],
    ['in', 'cm', 'metric', '250/127'],
    ['in', 'm', 'metric', '25000/127'],
  ] as const)(
    'reads 5 as the %s/%s default in the %s system',
    (defaultUnit, metricDefaultUnit, unitSystem, expected) => {
      const field = {
        kind: 'length',
        key: 'len',
        urlKey: 'a',
        default: quantity(1, inch),
        defaultUnit,
        metricDefaultUnit,
      } as const;
      const result = validateRecord([field], { len: '5' }, { unitSystem });
      const len = result.ok ? result.value['len'] : undefined;
      expect(isQuantityOf(len, 'length') && len.canonical.toString()).toBe(expected);
    },
  );

  it('accepts a length quantity and applies the bounds to it', () => {
    expect(inches(quantity(2, ft))).toBe('24');
    expect(inches(quantity(5, mm))).toBe('25/127');
    expect(inches(quantity(101, ft))).toEqual(failure('ABOVE_MAX', { max: '1200' }));
    expect(inches(quantity(-1, yd))).toEqual(failure('BELOW_MIN', { min: '0' }));
  });

  it('refuses a value that is not a string or a length quantity', () => {
    const lookalike = { exponents: { length: 1, mass: 0 }, canonical: Rational.of(2) };
    for (const raw of [quantity(2, ft2), lookalike, 5, true, null, {}, ['5']]) {
      expect(inches(raw)).toEqual(failure('MALFORMED'));
    }
  });

  // spec: calculator-contract › Total validation (128-character limit before trimming)
  it('reports a string longer than 128 characters as TOO_LONG', () => {
    expect(inches('1'.repeat(129))).toEqual(failure('TOO_LONG'));
    expect(inches('1'.repeat(128))).toEqual(failure('TOO_LARGE'));
    expect(inches(' '.repeat(129))).toEqual(failure('TOO_LONG'));
  });

  it('reports one error per field and still validates the other fields', () => {
    expect(validate({ len: '5 furlongs', cnt: '7' })).toEqual({
      ok: false,
      errors: [
        { field: 'len', code: 'UNKNOWN_UNIT' },
        { field: 'cnt', code: 'MALFORMED' },
      ],
    });
  });
});
