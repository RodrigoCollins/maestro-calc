import { describe, expect, it } from 'vitest';
import { fixtureBox } from '../__testing__/fixture-box.ts';
import { thrownCode } from '../__testing__/thrown-code.ts';
import { FIELD_ERROR_CODES } from '../error-codes.ts';
import { isMoney, usd } from '../money/money.ts';
import { Rational } from '../rational/rational.ts';
import { err, ok } from '../result.ts';
import { cm, ft, ft2, inch, mm, yd } from '../units/catalog.ts';
import { multiply } from '../units/ops.ts';
import { isQuantityOf, quantity } from '../units/quantity.ts';
import { defineCalculator } from './define.ts';
import type { ValidateOptions } from './descriptors.ts';
import { validateRecord } from './validate.ts';

const r = (n: number, d = 1): Rational => Rational.of(n, d);
// A failed result for one field, with the params of a violated bound when there are any.
const failed = (field: string, code: string, params?: object): unknown =>
  err(params === undefined ? { field, code } : { field, code, params });

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
  const failure = (code: string, params?: object): unknown => failed('len', code, params);

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
    const lookalike = { exponents: { length: 1, mass: 0, angle: 0 }, canonical: Rational.of(2) };
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
    expect(validate({ len: '5 furlongs', cnt: 'x' })).toEqual({
      ok: false,
      errors: [
        { field: 'len', code: 'UNKNOWN_UNIT' },
        { field: 'cnt', code: 'MALFORMED' },
      ],
    });
  });
});

const long = '1'.repeat(129);

const show = (raw: unknown): string => {
  if (typeof raw === 'string') {
    return raw.length > 20 ? `a string of ${String(raw.length)} characters` : JSON.stringify(raw);
  }
  if (isMoney(raw)) return `usd(${raw.amount.toString()})`;
  return raw instanceof Object ? 'an object' : String(raw);
};
// One test per row: the raw value of field `key` validated alone (the accepted value, or the failed
// result), against what the spec expects.
const cases = (key: string, table: [raw: unknown, expected: unknown][]): void => {
  for (const [raw, expected] of table) {
    it(`${key}: ${show(raw)}`, () => {
      const result = validate({ [key]: raw });
      expect(result.ok ? result.value[key] : result).toEqual(expected);
    });
  }
};

describe('validateRecord count field (calculator-contract › Count edge cases [CC11])', () => {
  // spec: Count edge cases: no input is ever silently turned into 0
  cases('cnt', [
    ['abc', failed('cnt', 'MALFORMED')],
    ['-1', failed('cnt', 'MALFORMED')],
    ['1.5', failed('cnt', 'MALFORMED')],
    ['12abc', failed('cnt', 'MALFORMED')],
    ['', failed('cnt', 'EMPTY')],
    ['007', 7],
    [7, 7],
    [7.5, failed('cnt', 'MALFORMED')],
    ['101', failed('cnt', 'ABOVE_MAX', { max: '100' })],
    ['9007199254740992', failed('cnt', 'ABOVE_MAX', { max: '100' })],
    [null, failed('cnt', 'MALFORMED')],
    ['1,000', failed('cnt', 'DECIMAL_COMMA')],
    [long, failed('cnt', 'TOO_LONG')],
    // beyond the table of the spec
    ['0', 0],
    ['100', 100],
    ['00100', 100],
    [' 7 ', 7],
    ['  7  ', 7],
    ['\u00A0\t 7 \t\u00A0', 7],
    [0, 0],
    ['\t7\u00A0', 7],
    ['  ', failed('cnt', 'EMPTY')],
    ['a,b', failed('cnt', 'DECIMAL_COMMA')],
    ['+7', failed('cnt', 'MALFORMED')],
    ['7\n', failed('cnt', 'MALFORMED')],
    ['\u0667', failed('cnt', 'MALFORMED')],
    [-1, failed('cnt', 'MALFORMED')],
    [2 ** 53, failed('cnt', 'MALFORMED')],
    [true, failed('cnt', 'MALFORMED')],
    [' '.repeat(129), failed('cnt', 'TOO_LONG')],
  ]);

  it('compares a count beyond the safe integers without precision loss', () => {
    const field = { kind: 'count', key: 'cnt', urlKey: 'a', default: 1, min: 5 } as const;
    const check = (raw: string): unknown => validateRecord([field], { cnt: raw });
    const above = failed('cnt', 'ABOVE_MAX', { max: '9007199254740991' });
    expect(check('9007199254740991')).toEqual(ok({ cnt: Number.MAX_SAFE_INTEGER }));
    expect(check('9007199254740992')).toEqual(above);
    expect(check('99999999999999999999999')).toEqual(above);
    expect(check('4')).toEqual(failed('cnt', 'BELOW_MIN', { min: '5' }));
  });
});

describe('validateRecord percent field (calculator-contract › Percent edge cases [CC16])', () => {
  cases('pct', [
    ['12.5%', r(25, 2)],
    ['12.5', r(25, 2)],
    ['-0', r(0)],
    ['100', r(100)],
    ['100.0001', failed('pct', 'ABOVE_MAX', { max: '100' })],
    ['12.5 %', failed('pct', 'MALFORMED')],
    ['abc', failed('pct', 'MALFORMED')],
    ['-1', failed('pct', 'BELOW_MIN', { min: '0' })],
    ['12,5', failed('pct', 'DECIMAL_COMMA')],
    // beyond the table of the spec
    ['100%', r(100)],
    [' 12.5% ', r(25, 2)],
    ['  12.5%  ', r(25, 2)],
    ['.5', r(1, 2)],
    ['0', r(0)],
    ['%', failed('pct', 'MALFORMED')],
    ['12.5%%', failed('pct', 'MALFORMED')],
    ['12,5%', failed('pct', 'DECIMAL_COMMA')],
    ['', failed('pct', 'EMPTY')],
    [12.5, failed('pct', 'MALFORMED')],
    // a Rational is not text: the percent field reads strings only, even if the value is in range
    [r(25, 2), failed('pct', 'MALFORMED')],
    [null, failed('pct', 'MALFORMED')],
    [long, failed('pct', 'TOO_LONG')],
  ]);
});

describe('validateRecord money field (calculator-contract › Money edge cases [CC17])', () => {
  cases('prc', [
    ['$4.98', usd(r(249, 50))],
    ['4.987', usd(r(4987, 1000))],
    ['1,000', failed('prc', 'DECIMAL_COMMA')],
    ['-1', failed('prc', 'MALFORMED')],
    ['10000', usd(r(10000))],
    ['10000.01', failed('prc', 'ABOVE_MAX', { max: '10000' })],
    ['', failed('prc', 'EMPTY')],
    [usd(-1), failed('prc', 'BELOW_MIN', { min: '0' })],
    // beyond the table of the spec
    [' $5 ', usd(r(5))],
    ['0', usd(r(0))],
    [usd(r(5)), usd(r(5))],
    [usd(r(10001)), failed('prc', 'ABOVE_MAX', { max: '10000' })],
    ['1234567890123456789', failed('prc', 'TOO_LARGE')],
    ['$', failed('prc', 'MALFORMED')],
    [5, failed('prc', 'MALFORMED')],
    [{ currency: 'USD', amount: r(5) }, failed('prc', 'MALFORMED')],
    [null, failed('prc', 'MALFORMED')],
    [long, failed('prc', 'TOO_LONG')],
  ]);
});

// Totality: no raw value, however odd, makes a field throw; each yields a value or one error whose
// code is in the closed list. `-0` is the one exotic value that is accepted, as the count 0.
const exotic: [label: string, raw: unknown][] = [
  ['a symbol', Symbol('s')],
  ['a function', () => 1],
  ['an empty array', []],
  ['an array of numbers', [1, 2]],
  ['a nested object', { a: { b: [1] } }],
  ['a bigint beyond 2^64', 10n ** 40n],
  ['negative zero', -0],
  ['NaN', Number.NaN],
  ['Infinity', Number.POSITIVE_INFINITY],
  ['-Infinity', Number.NEGATIVE_INFINITY],
  ['an exponent beyond any range', '1e99999'],
  ['a hexadecimal string', '0x10'],
  ['fullwidth digits', '\uFF11\uFF12'],
  ['a zero-width space inside', '1\u200B2'],
  ['a zero denominator', '1/0'],
  ['128 nines', '9'.repeat(128)],
  ['128 nines and a unit', `${'9'.repeat(128)} in`],
];

describe('validateRecord never throws (calculator-contract › Total validation)', () => {
  const keys = ['len', 'cnt', 'pct', 'sel', 'flg', 'prc'];
  it.each(
    keys.flatMap((key) =>
      exotic.map(([label, raw]): [string, string, unknown] => [key, label, raw]),
    ),
  )('%s: %s', (key, label, raw) => {
    const result = validate({ [key]: raw });
    const accepted = key === 'cnt' && label === 'negative zero';
    const failures = result.ok ? [] : result.errors;
    expect(result.ok).toBe(accepted);
    expect(failures.map(({ field }) => field)).toEqual(accepted ? [] : [key]);
    for (const { code } of failures) expect(FIELD_ERROR_CODES).toContain(code);
  });
});

describe('validateRecord select and boolean fields (calculator-contract › Select and boolean [CC18])', () => {
  cases('sel', [
    ['y', 'y'],
    ['x', 'x'],
    ['Y', failed('sel', 'UNKNOWN_OPTION')],
    ['z', failed('sel', 'UNKNOWN_OPTION')],
    [1, failed('sel', 'UNKNOWN_OPTION')],
    [null, failed('sel', 'UNKNOWN_OPTION')],
    [' x', failed('sel', 'UNKNOWN_OPTION')],
    ['', failed('sel', 'UNKNOWN_OPTION')],
    [long, failed('sel', 'TOO_LONG')],
  ]);

  cases('flg', [
    [false, false],
    [true, true],
    ['true', failed('flg', 'MALFORMED')],
    [1, failed('flg', 'MALFORMED')],
    [0, failed('flg', 'MALFORMED')],
    [null, failed('flg', 'MALFORMED')],
    [long, failed('flg', 'TOO_LONG')],
  ]);
});

describe('Calculator.validate (calculator-contract › Total validation without silent coercion)', () => {
  // spec: calculator-contract › Full valid record [CC10]
  it('validates a full record: 5\' 3" is 63 in, 12.5% is 25/2, $5 is usd(5)', () => {
    const raw = { len: `5' 3"`, cnt: '7', pct: '12.5%', sel: 'y', flg: true, prc: '$5' };
    expect(fixtureBox.validate(raw)).toEqual(
      ok({
        len: quantity(63, inch),
        cnt: 7,
        pct: Rational.of(25, 2),
        sel: 'y',
        flg: true,
        prc: usd(5),
      }),
    );
  });

  // spec: calculator-contract › Multiple errors in declaration order [CC19]
  it('reports every bad field once, in declaration order, and returns no value', () => {
    const result = fixtureBox.validate({ cnt: 'x', len: 'abc', pct: '5' });
    expect(result).toEqual({
      ok: false,
      errors: [
        { field: 'len', code: 'MALFORMED' },
        { field: 'cnt', code: 'MALFORMED' },
      ],
    });
    expect(result).not.toHaveProperty('value');
  });

  it('keeps one error per field and the params of a violated bound', () => {
    const result = fixtureBox.validate({
      len: "101'",
      cnt: '101',
      pct: '101',
      sel: 'z',
      prc: '-1',
    });
    expect(result).toEqual({
      ok: false,
      errors: [
        { field: 'len', code: 'ABOVE_MAX', params: { max: '1200' } },
        { field: 'cnt', code: 'ABOVE_MAX', params: { max: '100' } },
        { field: 'pct', code: 'ABOVE_MAX', params: { max: '100' } },
        { field: 'sel', code: 'UNKNOWN_OPTION' },
        { field: 'prc', code: 'MALFORMED' },
      ],
    });
  });

  // spec: calculator-contract › Unit system selects the default unit for bare numbers [CC15]
  it('passes the unit system to the length field', () => {
    const metric = fixtureBox.validate({ len: '5' }, { unitSystem: 'metric' });
    expect(metric).toEqual(ok({ ...defaults, len: quantity(5, cm) }));
    expect(fixtureBox.validate({ len: '5' })).toEqual(ok({ ...defaults, len: quantity(5, inch) }));
  });

  it('validates the defaults of a record with unknown keys, like validateRecord', () => {
    expect(fixtureBox.validate({ zzz: 1 })).toEqual(validateRecord(fixtureBox.inputs, {}));
    expect(fixtureBox.validate({})).toEqual(ok(defaults));
  });
});

describe('validate container (calculator-contract › raw MUST be an object)', () => {
  const notObjects: [string, unknown][] = [
    ['null', null],
    ['undefined', undefined],
    ['a number', 5],
    ['a string', 'str'],
    ['a boolean', true],
    ['a bigint', 10n],
    ['a symbol', Symbol('raw')],
    ['a function', () => 1],
  ];
  it.each(notObjects)('%s throws NOT_AN_OBJECT', (_label, raw) => {
    const container = raw as Record<string, unknown>;
    expect(thrownCode(() => fixtureBox.validate(container))).toBe('NOT_AN_OBJECT');
    expect(thrownCode(() => validate(container))).toBe('NOT_AN_OBJECT');
  });

  it('accepts an array and a null-prototype object, reading own keys only', () => {
    const bare = Object.create(null) as Record<string, unknown>;
    bare['cnt'] = '7';
    expect(validate(bare)).toEqual(ok({ ...defaults, cnt: 7 }));
    expect(fixtureBox.validate([] as unknown as Record<string, unknown>)).toEqual(ok(defaults));
  });
});
