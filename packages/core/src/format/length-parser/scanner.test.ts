import { describe, expect, it } from 'vitest';
import { failure } from '../../__testing__/length-failure.ts';
import { cm, ft, inch, m, mm, yd } from '../../units/catalog.ts';
import type { Unit } from '../../units/unit.ts';
import { LENGTH_PARSE_CODES } from './codes.ts';
import { scan, type Token } from './scanner.ts';

const tokensOf = (text: string): readonly Token[] => {
  const scanned = scan(text);
  if (!scanned.ok) throw new Error(`scan failed: ${JSON.stringify(scanned.errors)}`);
  return scanned.value;
};

// Every offset below was counted by hand on the quoted text (zero-based, original text).
describe('LENGTH_PARSE_CODES (fraction-format › Length text grammar)', () => {
  it('lists the seven failure codes', () => {
    expect(LENGTH_PARSE_CODES).toEqual([
      'EMPTY',
      'TOO_LONG',
      'TOO_LARGE',
      'ZERO_DENOMINATOR',
      'UNKNOWN_UNIT',
      'DECIMAL_COMMA',
      'MALFORMED',
    ]);
  });
});

describe('scan pre-processing (fraction-format › Length text grammar)', () => {
  // spec: Empty and too long [FP8]
  it.each(['', '   ', '\t', '\u00A0', ' \t\u00A0 '])('rejects blank input %j as EMPTY', (text) => {
    expect(scan(text)).toStrictEqual(failure('EMPTY'));
  });

  // spec: Empty and too long [FP8]: 128 characters pass, 129 fail, counted before trimming
  it('accepts 128 characters and rejects 129 with TOO_LONG', () => {
    const at128 = `1${' '.repeat(126)}'`;
    expect(at128).toHaveLength(128);
    expect(tokensOf(at128).map((token) => token.kind)).toEqual(['uint', 'ws', 'unit']);
    const at129 = `1${' '.repeat(127)}'`;
    expect(at129).toHaveLength(129);
    expect(scan(at129)).toStrictEqual(failure('TOO_LONG'));
    expect(scan(`${' '.repeat(129)}5`)).toStrictEqual(failure('TOO_LONG'));
  });

  // spec: Comma rejected with a dedicated code [FP12]: offset is the first comma
  it.each([
    ['5,5', 1],
    ['1,000 ft', 1],
    ['1,000.5"', 1],
    [`5' 3,5"`, 4],
    ['1,2,3', 1],
  ])('rejects %j with DECIMAL_COMMA at %i', (text, offset) => {
    expect(scan(text)).toStrictEqual(failure('DECIMAL_COMMA', offset));
  });

  // Offsets count UTF-16 code units, like the DOM selection APIs: an astral character is two.
  it('counts offsets and lengths in UTF-16 code units', () => {
    expect(scan('\u{1F600},')).toStrictEqual(failure('DECIMAL_COMMA', 2));
    expect(scan(`1${' '.repeat(126)}\u{1F600}`)).toStrictEqual(failure('TOO_LONG'));
  });

  // spec: Result precedence: TOO_LONG, then EMPTY, then DECIMAL_COMMA, then anything else
  it('orders the codes TOO_LONG, EMPTY, DECIMAL_COMMA, then lexical faults', () => {
    expect(scan(','.repeat(129))).toStrictEqual(failure('TOO_LONG'));
    expect(scan('  ,  ')).toStrictEqual(failure('DECIMAL_COMMA', 2));
    expect(scan('\n,')).toStrictEqual(failure('DECIMAL_COMMA', 1));
    expect(scan('1234567890123456789,')).toStrictEqual(failure('DECIMAL_COMMA', 19));
    expect(scan('abc,')).toStrictEqual(failure('DECIMAL_COMMA', 3));
  });

  // spec: Length text grammar: other whitespace (newline, etc.) is MALFORMED
  it.each([
    ['5\n', 1],
    ['\n5', 0],
    ['1\n2', 1],
    ['5\r', 1],
    ['5\u2003', 1], // em space: not one of U+0020, U+0009, U+00A0
  ])('rejects %j with MALFORMED at %i', (text, offset) => {
    expect(scan(text)).toStrictEqual(failure('MALFORMED', offset));
  });

  // spec: Whitespace tolerance [FP4]: U+0020, tab and U+00A0 around the input are dropped, inside
  // they are one token; starts index the untrimmed text
  it('trims the edges and keeps inner whitespace as one token', () => {
    expect(tokensOf(`  5'   3  `)).toEqual([
      { kind: 'uint', start: 2, text: '5' },
      { kind: 'unit', start: 3, text: "'", unit: ft, symbol: true },
      { kind: 'ws', start: 4, text: '   ' },
      { kind: 'uint', start: 7, text: '3' },
    ]);
    expect(tokensOf('\t\u00A05\u00A0\t')).toEqual([{ kind: 'uint', start: 2, text: '5' }]);
    expect(tokensOf('5 \u00A0\t3')).toEqual([
      { kind: 'uint', start: 0, text: '5' },
      { kind: 'ws', start: 1, text: ' \u00A0\t' },
      { kind: 'uint', start: 4, text: '3' },
    ]);
  });
});

describe('scan tokens (fraction-format › Length text grammar)', () => {
  // spec: Huge digit runs [FP10]
  it('accepts an 18-digit run and rejects a 19-digit run with TOO_LARGE', () => {
    expect(tokensOf('123456789012345678')).toEqual([
      { kind: 'uint', start: 0, text: '123456789012345678' },
    ]);
    expect(scan('1234567890123456789')).toStrictEqual(failure('TOO_LARGE', 0));
    expect(scan('5 1234567890123456789"')).toStrictEqual(failure('TOO_LARGE', 2));
  });

  // spec: Huge digit runs [FP10]: the fractional run is a digit run of its own
  it('limits the fractional run of a decimal too', () => {
    expect(scan('0.1234567890123456789')).toStrictEqual(failure('TOO_LARGE', 2));
    expect(tokensOf('0.123456789012345678').map((token) => token.text)).toEqual([
      '0',
      '.',
      '123456789012345678',
    ]);
  });

  // spec: Length text grammar: feet marks ' ′ ’, inch marks " ″ ”, minus - and U+2212
  it('maps the typographic marks to feet, inch and minus tokens', () => {
    const marks = (text: string) =>
      tokensOf(text).map(({ kind, text: lexeme }) => [kind, lexeme] as const);
    expect(tokensOf(`'′’`)).toEqual([
      { kind: 'unit', start: 0, text: "'", unit: ft, symbol: true },
      { kind: 'unit', start: 1, text: '′', unit: ft, symbol: true },
      { kind: 'unit', start: 2, text: '’', unit: ft, symbol: true },
    ]);
    expect(tokensOf(`"″”`)).toEqual([
      { kind: 'unit', start: 0, text: '"', unit: inch, symbol: true },
      { kind: 'unit', start: 1, text: '″', unit: inch, symbol: true },
      { kind: 'unit', start: 2, text: '”', unit: inch, symbol: true },
    ]);
    expect(marks('-\u2212+./')).toEqual([
      ['minus', '-'],
      ['minus', '\u2212'],
      ['plus', '+'],
      ['dot', '.'],
      ['slash', '/'],
    ]);
  });

  // spec: Length text grammar: unit words are case-insensitive and map to one unit each
  it.each<[string, Unit<'length'>]>([
    ['ft', ft],
    ['foot', ft],
    ['feet', ft],
    ['in', inch],
    ['inch', inch],
    ['inches', inch],
    ['yd', yd],
    ['yard', yd],
    ['yards', yd],
    ['mm', mm],
    ['cm', cm],
    ['m', m],
    ['meter', m],
    ['meters', m],
    ['metre', m],
    ['metres', m],
  ])('reads the word %s in any case', (word, unit) => {
    for (const spelling of [
      word,
      word.toUpperCase(),
      `${word[0]?.toUpperCase() ?? ''}${word.slice(1)}`,
    ]) {
      expect(tokensOf(spelling)).toEqual([
        { kind: 'unit', start: 0, text: spelling, unit, symbol: false },
      ]);
    }
  });

  // spec: Unknown unit [FP11]: the unit token is the maximal [A-Za-z]+[0-9]* run
  it.each([
    ['5 furlongs', 2],
    ['5 sq ft', 2],
    ['5 m2', 2],
    ['5 ft2', 2],
    ['5ft2', 1],
    ['2 yd3', 2],
    ['5.5 furlongs', 4],
    [`5' 3 furlongs`, 5],
    ['1/2 sq', 4],
    ['5 e3', 2],
    ['1ex3', 1],
    ['5x', 1],
    ['5e', 1],
  ])('rejects %j with UNKNOWN_UNIT at %i', (text, offset) => {
    expect(scan(text)).toStrictEqual(failure('UNKNOWN_UNIT', offset));
  });

  // spec: Length text grammar: e/E or x/X plus a digit, glued to a digit, is numeric notation
  it.each(['1e3', '1E9', '0x10', '5X2', '12e1'])('rejects %j as numeric notation', (text) => {
    const offset = text.search(/[eExX]/);
    expect(scan(text)).toStrictEqual(failure('MALFORMED', offset));
  });

  // spec: Length text grammar: input with no number at all is MALFORMED; a word that does not
  // follow a number is never an unknown unit
  it.each([
    ['abc', 0],
    ['abc 5', 0],
    [`5' abc`, 3],
    ['-furlongs', 1],
    ['5-m2', 2],
  ])('rejects the word in %j as MALFORMED at %i', (text, offset) => {
    expect(scan(text)).toStrictEqual(failure('MALFORMED', offset));
  });

  // spec: Malformed inputs [FP13]: full-width digits and unmapped characters
  it.each([
    ["５'", 0],
    ['5 )', 2],
    ['5;', 1],
    ['5😀', 1],
    ['٣', 0],
  ])('rejects the character in %j as MALFORMED at %i', (text, offset) => {
    expect(scan(text)).toStrictEqual(failure('MALFORMED', offset));
  });
});
