import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { failure } from '../../__testing__/length-failure.ts';
import { numRuns } from '../../__testing__/property-runs.ts';
import { ft, inch, yd } from '../../units/catalog.ts';
import { DIMENSIONS, sameVector } from '../../units/dimension.ts';
import { valueIn } from '../../units/quantity.ts';
import type { Unit } from '../../units/unit.ts';
import { LENGTH_PARSE_CODES } from './codes.ts';
import { parseLength } from './parser.ts';

const BLANKS = [' ', '\t', '\u00A0'];

/**
 * The text without the parser's own trailing blanks. `String.trimEnd` would also strip U+FEFF and
 * U+3000, which the scanner rejects as unknown characters at their own index (the fuzz property
 * found ` \uFEFF`: offset 1, `trimEnd` length 0), so it is not the right bound.
 */
const withoutTrailingBlanks = (text: string): string => text.replace(/[ \t\u00A0]+$/u, '');

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
    // intentional precedence: the zero denominator is reported before the stray `.5` is read
    ['3/0.5', 2],
  ])('rejects %j with ZERO_DENOMINATOR at %i', (text, offset) => {
    expect(parsed(text)).toEqual(failure('ZERO_DENOMINATOR', offset));
  });

  // spec: Unknown unit [FP11]
  it('rejects an unknown unit word with the offset of the word', () => {
    expect(parsed('5 furlongs')).toEqual(failure('UNKNOWN_UNIT', 2));
    expect(parsed('5ft2')).toEqual(failure('UNKNOWN_UNIT', 1));
    // the unit token is the maximal [A-Za-z]+[0-9]* run, so `ft3` is one (unknown) word, except
    // before an inch mark, where it is the feet mark and the inches (`5ft3in`, [FPX1])
    expect(parsed('5ft3')).toEqual(failure('UNKNOWN_UNIT', 1));
    expect(parsed('5ft3in')).toBe('63');
  });

  // spec: Length text grammar: a decimal point consumes the next token whether or not digits
  // follow, so the error points past the point; the other malformed rows are in the table below
  it('does not read 1.x, 1." or 1 2 as the number 1', () => {
    expect(parsed('1.x')).toEqual(failure('MALFORMED', 2));
    expect(parsed('1."')).toEqual(failure('MALFORMED', 2));
    expect(parsed('1 2')).toEqual(failure('MALFORMED', 2));
  });
});

describe('parseLength compound forms (fraction-format › Length text grammar)', () => {
  // spec: Equivalent spellings of 63.5 inches [FP1]: 5 x 12 + 3.5 = 63.5 = 127/2
  it.each([
    `5' 3-1/2"`,
    '5ft 3 1/2in',
    '63.5in',
    `5' 3.5"`,
    `5'-3 1/2"`,
    `5'3 1/2`,
    '5′ 3 1/2″',
    '5’ 3 1/2”',
  ])('reads %j as 127/2 in', (text) => {
    expect(parsed(text)).toBe('127/2');
  });

  // spec: fraction-format delta › Length text grammar [FPX1]: feet and inches typed together
  it.each(['12ft6in', '12ft6 in', '12ft 6in', '12FT6IN', '12feet6inches', '12ft6"', '12ft6″'])(
    'reads %j as 150 in',
    (text) => {
      expect(parsed(text)).toBe('150');
    },
  );

  // spec: fraction-format delta › Length text grammar [FPX2]: abbreviation periods
  it.each([
    ['12 ft. 6 in.', '150'],
    ['12 ft.6 in.', '150'],
    ['12ft.6in.', '150'],
    ['5 in.', '5'],
    ['5 m.', '25000/127'],
    ['5 ft.', '60'],
  ])('reads %j as %s in', (text, inches) => {
    expect(parsed(text)).toBe(inches);
  });

  // spec: fraction-format delta › Length text grammar [FPX3]: what stays a failure
  it.each([
    ['5ft2', 'UNKNOWN_UNIT', 1],
    ['5 ft2 in', 'UNKNOWN_UNIT', 2],
    ['5 m2', 'UNKNOWN_UNIT', 2],
    ['12ft6inx', 'UNKNOWN_UNIT', 2],
    ['12ft6in2', 'UNKNOWN_UNIT', 2],
    ['5 in.5', 'MALFORMED', 5],
    ['5 ft..', 'MALFORMED', 6],
    ['5 ft. .', 'MALFORMED', 7],
  ] as const)('keeps %j a %s failure at %i', (text, code, offset) => {
    expect(parsed(text)).toStrictEqual(failure(code, offset));
  });

  // spec: Feet only, inches only, bare numbers [FP2b]
  it.each([
    [`5'3"`, '63'],
    ['5 ft 3 in', '63'],
    ['5ft 3in', '63'],
    ['5 feet 3 inches', '63'],
    ['5 foot 3 inch', '63'],
    [`5 ' 3 "`, '63'],
    [`5'3`, '63'],
    [`5' 0"`, '60'],
    [`0' 3/4"`, '3/4'],
    [`5'-3"`, '63'],
    [`5'\u22123"`, '63'], // U+2212 MINUS SIGN separates feet and inches like a hyphen
    [`5'3 "`, '63'],
    [`5' 3/4"`, '243/4'],
  ])('reads %j as %s in', (text, expected) => {
    expect(parsed(text)).toBe(expected);
  });

  // spec: Signs and unicode minus [FP3]: the sign applies to the whole value
  it.each([
    [`-5' 3"`, '-63'],
    [`\u22125' 3"`, '-63'],
    [`+5'`, '60'],
    ['-0"', '0'],
    [`0' 0"`, '0'],
    [`-0' 0"`, '0'],
    [`+5' 3 1/2"`, '127/2'],
    ['-3 1/2', '-7/2'],
    ['-1.5 m', '-7500/127'],
    ['\u2212.5', '-1/2'],
    ['+1/3"', '1/3'],
  ])('reads %j as %s in', (text, expected) => {
    expect(parsed(text)).toBe(expected);
  });

  // spec: Whitespace tolerance [FP4]
  it('reads runs of spaces and a no-break space between the parts', () => {
    expect(parsed(`  5'   3  1/2"  `)).toBe('127/2');
    expect(parsed(`5'\u00A03"`)).toBe('63');
    expect(parsed(`5\t'\t3\t"`)).toBe('63');
  });

  // spec: Inches beyond 11 and large feet [FP5]
  it('does not limit the inches to 11 or the feet to a few digits', () => {
    expect(parsed(`5' 15"`)).toBe('75');
    expect(parsed(`100'`)).toBe('1200');
    expect(parsed(`123456789012345678' 1"`)).toBe('1481481468148148137');
  });

  // spec: Zero denominator [FP9]: in the inches of a compound too
  it('rejects a zero denominator in the inches', () => {
    expect(parsed(`5' 1/0"`)).toEqual(failure('ZERO_DENOMINATOR', 5));
  });

  // spec: Malformed inputs [FP13]: the whole table, each with its hand-counted offset (the first
  // token the parser could not use, or the text length when the input ended too early)
  it.each([
    ['"', 0],
    ["'", 0],
    ['ft', 0],
    ['abc', 0],
    [`5' 3 1/2 1/2"`, 9],
    [`5.5' 3"`, 4],
    [`5' -3"`, 3],
    [`5" 3'`, 2],
    ['3//4', 1],
    ['1 / 2', 2],
    ['1e3', 1],
    ['1E9', 1],
    ['0x10', 1],
    ["５'", 0],
    [`5'3'`, 3],
    ['--5', 1],
    ['- 5', 1],
    ['5 3 1/2', 2],
    ['5 /2', 2],
    ['5-/2', 1],
    ['.', 1],
    ['1.', 2],
    [`5'-`, 3],
    ['3.5 1/2', 4],
    ['1/2.5', 3],
    ['1 yd 2 ft', 4],
    ['5 ft 2', 6],
    ['5\n3', 1],
    ['1/', 1],
    [`5" 3`, 2],
    ['5 m 5', 3],
    ['1/2 3/4', 4],
    ['1 1/2 1/2', 6],
    [`5'3''`, 3],
  ])('rejects %j with MALFORMED at %i', (text, offset) => {
    expect(parsed(text)).toEqual(failure('MALFORMED', offset));
  });

  // spec: Length text grammar: the inch mark is optional only after a symbol feet mark; fractional
  // feet are not allowed in a compound; the hyphen separator touches both neighbours
  it.each([
    ['5ft 3', 5],
    ['5 foot 2', 8],
    ['1 1/2 ft 3 in', 8],
    ['1/2\' 3"', 4],
    [`5' - 3"`, 3],
    [`5'- 3"`, 3],
    [`5' 3 ft`, 5],
    [`5' 3 m`, 5],
    ['-+5', 1],
    ['+-5', 1],
    ['++5', 1],
    ['5 ft ft', 5],
    [`5' +3"`, 3],
    [`5' \u22123"`, 3],
  ])('rejects %j with MALFORMED at %i', (text, offset) => {
    expect(parsed(text)).toEqual(failure('MALFORMED', offset));
  });

  // spec: Length text grammar: offsets index the untrimmed original text
  it('counts offsets from the start of the untrimmed text', () => {
    expect(parsed('  5 furlongs')).toEqual(failure('UNKNOWN_UNIT', 4));
    expect(parsed('  1/0"')).toEqual(failure('ZERO_DENOMINATOR', 4));
    expect(parsed('\u00A0\t5 3 1/2')).toEqual(failure('MALFORMED', 4));
    expect(parsed('  5,5')).toEqual(failure('DECIMAL_COMMA', 3));
  });

  // spec: Length text grammar: input that ends too early points at the end of its last token, not
  // at the trailing whitespace that was dropped
  it('points at the end of the last token when the input ends too early', () => {
    expect(parsed('1. ')).toEqual(failure('MALFORMED', 2));
    expect(parsed('5 ft 2 ')).toEqual(failure('MALFORMED', 6));
    expect(parsed('\u00A0\t1.\u00A0 ')).toEqual(failure('MALFORMED', 4));
  });

  // spec: Length text grammar: the function never throws and a success is always a length
  // The offset invariant: EMPTY and TOO_LONG carry none; any other failure points at or before the
  // end of the last token. It starts a token (a non-blank) or ends one (a blank right after a
  // non-blank, as in `. 0`, where the point wants digits); it never lands inside a run of blanks.
  it('never throws, fails with one known code and a sound offset, and succeeds with a length', () => {
    const alphabet = fc.constantFrom(
      ...'0123456789 \t\n/.-+,\'"ftinmcydxe'.split(''),
      '\u00A0',
      '\u2212',
      '′',
      '″',
      '’',
      '”',
      '５',
      'é',
      '\uD83D',
      '\uDE00',
      '\u200B',
      '\uFEFF',
      '\u202E',
      '\u3000',
    );
    fc.assert(
      fc.property(fc.string({ unit: alphabet, maxLength: 140 }), (text) => {
        const result = parseLength(text);
        if (result.ok) return sameVector(result.value.exponents, DIMENSIONS.length);
        const [error, ...rest] = result.errors;
        const end = withoutTrailingBlanks(text).length;
        const unlocated = error.code === 'EMPTY' || error.code === 'TOO_LONG';
        const offsetOk = unlocated
          ? error.offset === undefined
          : error.offset !== undefined &&
            Number.isInteger(error.offset) &&
            error.offset >= 0 &&
            error.offset <= end &&
            (!BLANKS.includes(text[error.offset] ?? '') ||
              !BLANKS.includes(text[error.offset - 1] ?? ''));
        return rest.length === 0 && LENGTH_PARSE_CODES.includes(error.code) && offsetOk;
      }),
      { numRuns },
    );
  });
});
