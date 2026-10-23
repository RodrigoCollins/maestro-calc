import { describe, expect, it } from 'vitest';
import { failure } from '../../__testing__/length-failure.ts';
import { ft, inch, yd } from '../../units/catalog.ts';
import { valueIn } from '../../units/quantity.ts';
import type { Unit } from '../../units/unit.ts';
import { parseLength } from './parser.ts';

/** The parsed value in inches as exact text (`63`, `127/2`), or the failure result itself. */
const parsed = (text: string, defaultUnit?: Unit<'length'>): unknown => {
  const result = parseLength(text, defaultUnit === undefined ? {} : { defaultUnit });
  return result.ok ? valueIn(result.value, inch).toString() : result;
};

// Every expected value below was recomputed with exact fractions (1 ft = 12 in, 1 yd = 36 in,
// 1 in = 25.4 mm) before it was written down.
describe('parseLength pre-processing (fraction-format › Length text grammar)', () => {
  // spec: Empty and too long [FP8]
  it.each(['', '   ', '\t \u00A0'])('fails blank input %j with EMPTY and no offset', (text) => {
    expect(parseLength(text)).toStrictEqual(failure('EMPTY'));
  });

  // spec: Empty and too long [FP8]: 128 characters is 12 in, 129 characters is TOO_LONG
  it('accepts 128 characters and rejects 129', () => {
    expect(parsed(`1${' '.repeat(126)}'`)).toBe('12');
    expect(parseLength(`1${' '.repeat(127)}'`)).toStrictEqual(failure('TOO_LONG'));
  });

  // spec: Comma rejected with a dedicated code [FP12]
  it.each([
    ['5,5', 1],
    ['1,000 ft', 1],
    ['1,000.5"', 1],
    [`5' 3,5"`, 4],
  ])('rejects %j with DECIMAL_COMMA', (text, offset) => {
    expect(parsed(text)).toEqual(failure('DECIMAL_COMMA', offset));
  });

  // spec: Result precedence: TOO_LONG, then EMPTY, then DECIMAL_COMMA
  it('applies the precedence TOO_LONG, EMPTY, DECIMAL_COMMA, MALFORMED', () => {
    expect(parsed('1,'.repeat(65))).toEqual(failure('TOO_LONG'));
    expect(parsed('  ,  ')).toEqual(failure('DECIMAL_COMMA', 2));
    expect(parsed('abc,\n')).toEqual(failure('DECIMAL_COMMA', 3));
  });

  // spec: Length text grammar: other whitespace (newline, etc.) is MALFORMED
  it('rejects an embedded newline with MALFORMED', () => {
    expect(parsed('5\n')).toEqual(failure('MALFORMED', 1));
    expect(parsed('5\n3')).toEqual(failure('MALFORMED', 1));
  });

  // spec: Whitespace tolerance [FP4]: U+0020, tab and U+00A0 are trimmed at both ends
  it('ignores leading and trailing space, tab and no-break space', () => {
    expect(parsed(' \t\u00A05 ft\u00A0\t ')).toBe('60');
  });
});

describe('parseLength simple forms (fraction-format › Length text grammar)', () => {
  // spec: Feet only, inches only, bare numbers [FP2]
  it.each<[string, Unit<'length'>, string]>([
    ["5'", inch, '60'],
    ['3/4', inch, '3/4'],
    ['3/4', ft, '9'],
    ['5', inch, '5'],
    ['5', ft, '60'],
    ['3-1/2', inch, '7/2'],
    ['3 1/2', inch, '7/2'],
    ['3-1/2', ft, '42'],
    ['3\u22121/2', inch, '7/2'], // U+2212 MINUS SIGN as the mixed-number separator
  ])('reads %j with default unit %s as %s in', (text, defaultUnit, expected) => {
    expect(parsed(text, defaultUnit)).toBe(expected);
  });

  // spec: Length text grammar: `defaultUnit` defaults to `in` and applies only without a unit
  it('defaults to inches and lets a written unit win over the default', () => {
    expect(parsed('5')).toBe('5');
    expect(parsed('5 yd', ft)).toBe('180');
    expect(parsed('2"', yd)).toBe('2');
  });

  // spec: Length text grammar: decimals, mixed numbers and every unit
  it.each([
    ['63.5in', '127/2'],
    ['.5', '1/2'],
    ['0.5', '1/2'],
    ['007', '7'],
    ['1.50', '3/2'],
    ['63 1/2in', '127/2'],
    ['5 "', '5'],
    ['5inch', '5'],
    ['5 inches', '5'],
    ['5 foot', '60'],
    ['5 feet', '60'],
    ['5 ft', '60'],
    ['5′', '60'],
    ['5’', '60'],
    ['5″', '5'],
    ['5”', '5'],
  ])('reads %j as %s in', (text, expected) => {
    expect(parsed(text)).toBe(expected);
  });

  // spec: Metric and other units [FP6]
  it.each([
    ['1.5 m', '7500/127'],
    ['10 mm', '50/127'],
    ['2.54 cm', '1'],
    ['1 yd', '36'],
    ['0.1 ft', '6/5'],
    ['1 1/2 ft', '18'],
    ['5 FT', '60'],
    ['2 yard', '72'],
    ['2 yards', '72'],
    ['1 meter', '5000/127'],
    ['1 meters', '5000/127'],
    ['1 metre', '5000/127'],
    ['1 metres', '5000/127'],
    ['5 In', '5'],
    ['1/2 mm', '5/254'],
    ['2.5m', '12500/127'],
  ])('reads %j as %s in', (text, expected) => {
    expect(parsed(text)).toBe(expected);
  });

  // spec: Exactness (no rounding in parse) [FP7]
  it('keeps thirds and sevenths exact', () => {
    expect(parsed('1/3"')).toBe('1/3');
    expect(parsed('3/7"')).toBe('3/7');
    expect(parsed('10/4"')).toBe('5/2');
  });

  // spec: Huge digit runs [FP10]: 18 digits are exact, 19 are TOO_LARGE
  it('reads 18 digits exactly and rejects 19', () => {
    expect(parsed('123456789012345678"')).toBe('123456789012345678');
    expect(parsed('1234567890123456789"')).toEqual(failure('TOO_LARGE', 0));
    expect(parsed('0.1234567890123456789')).toEqual(failure('TOO_LARGE', 2));
    expect(parsed('0.123456789012345678')).toBe('61728394506172839/500000000000000000');
  });

  // spec: Length text grammar: bounds belong to validate, not to the parser
  it('accepts a denominator beyond 64 and 1200 1/64 as a length', () => {
    expect(parsed('1200 1/64')).toBe('76801/64');
    expect(parsed('1/1000')).toBe('1/1000');
  });

  // spec: Zero denominator [FP9]: the offset is the denominator digits
  it.each([
    ['1/0"', 2],
    ['3 1/0', 4],
    ['3-1/00', 4],
    ['0/0', 2],
  ])('rejects %j with ZERO_DENOMINATOR at %i', (text, offset) => {
    expect(parsed(text)).toEqual(failure('ZERO_DENOMINATOR', offset));
  });

  // spec: Unknown unit [FP11]
  it('rejects an unknown unit word with the offset of the word', () => {
    expect(parsed('5 furlongs')).toEqual(failure('UNKNOWN_UNIT', 2));
    expect(parsed('5ft2')).toEqual(failure('UNKNOWN_UNIT', 1));
  });

  // spec: Malformed inputs [FP13]: the part of the table that needs no compound form
  it.each(['"', "'", 'ft', 'abc', '3//4', '1 / 2', '.', '1.', '1/', '1/2.5', '3.5 1/2', '5 3 1/2'])(
    'rejects %j with MALFORMED',
    (text) => {
      expect(parseLength(text)).toMatchObject({ ok: false, errors: [{ code: 'MALFORMED' }] });
    },
  );

  // spec: Malformed inputs [FP13]: a unit, then more input
  it.each(['1 yd 2 ft', '5" 3', '5 m 5', '1/2 3/4', '1 1/2 1/2'])(
    'rejects %j: only one number and one unit fit a simple form',
    (text) => {
      expect(parseLength(text)).toMatchObject({ ok: false, errors: [{ code: 'MALFORMED' }] });
    },
  );

  // spec: Length text grammar: a malformed fraction is not read as a shorter valid one; a point
  // must be followed by digits, so the error points at the end of the input or the next token
  it('does not read 1/ or 1. as the number 1', () => {
    expect(parsed('1/')).toEqual(failure('MALFORMED', 1));
    expect(parsed('1.')).toEqual(failure('MALFORMED', 2));
    expect(parsed('.')).toEqual(failure('MALFORMED', 1));
    expect(parsed('1.x')).toEqual(failure('MALFORMED', 2));
    expect(parsed('1."')).toEqual(failure('MALFORMED', 2));
    expect(parsed('1 2')).toEqual(failure('MALFORMED', 2));
  });
});
