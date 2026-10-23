import { err, ok, type Result } from '../../result.ts';
import { cm, ft, inch, m, mm, yd } from '../../units/catalog.ts';
import type { Unit } from '../../units/unit.ts';
import type { LengthParseError } from './codes.ts';

const MAX_LENGTH = 128;
const MAX_DIGITS = 18;

/** A token that carries no unit: a whitespace run, a digit run or one punctuation mark. */
export interface PlainToken {
  readonly kind: 'ws' | 'uint' | 'dot' | 'slash' | 'minus' | 'plus';
  readonly start: number;
  readonly text: string;
}

/** A feet mark, an inch mark or a unit word; `symbol` tells `'` from `ft` and `"` from `in`. */
export interface UnitToken {
  readonly kind: 'unit';
  readonly start: number;
  readonly text: string;
  readonly unit: Unit<'length'>;
  readonly symbol: boolean;
}

/** `start` is the index of the first character of the token in the original text. */
export type Token = PlainToken | UnitToken;

const MARKS = new Map<string, Unit<'length'>>([
  ["'", ft],
  ['′', ft],
  ['’', ft],
  ['"', inch],
  ['″', inch],
  ['”', inch],
]);

const PUNCTUATION = new Map<string, PlainToken['kind']>([
  ['.', 'dot'],
  ['/', 'slash'],
  ['-', 'minus'],
  ['\u2212', 'minus'], // U+2212 MINUS SIGN, as typed on phone keyboards
  ['+', 'plus'],
]);

const WORDS = new Map<string, Unit<'length'>>([
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
]);

// One linear pass: a whitespace run, a digit run, a word `[A-Za-z]+[0-9]*`, or any other single
// character. Every alternative is anchored at the current position and none can backtrack. With the
// `u` flag the last alternative takes a whole code point, so an astral character is one lexeme
// (two UTF-16 units wide); `match.index` stays a UTF-16 index into the original text.
const LEXEMES = /([ \t\u00A0]+)|([0-9]+)|([A-Za-z]+[0-9]*)|[^]/gu;
const BLANK = /^[ \t\u00A0]*$/;
const NUMERIC_NOTATION = /^[eExX][0-9]/;

const malformed = (offset: number): Result<never, LengthParseError> =>
  err({ code: 'MALFORMED', offset });

/** The kind of the last token that is not whitespace. */
const lastKind = (tokens: readonly Token[]): Token['kind'] | undefined => {
  const significant = tokens.filter((token) => token.kind !== 'ws');
  return significant[significant.length - 1]?.kind;
};

const wordToken = (
  word: string,
  start: number,
  before: readonly Token[],
): Result<Token, LengthParseError> => {
  // A word glued to a digit that is a lone `e` or `x` plus digits (`e3`, `x10`) is exponent or hex
  // notation. A word is letters then digits, so a leading e/x followed by a digit is exactly that.
  if (before[before.length - 1]?.kind === 'uint' && NUMERIC_NOTATION.test(word)) {
    return malformed(start);
  }
  const unit = WORDS.get(word.toLowerCase());
  if (unit !== undefined) return ok({ kind: 'unit', start, text: word, unit, symbol: false });
  return lastKind(before) === 'uint'
    ? err({ code: 'UNKNOWN_UNIT', offset: start })
    : malformed(start);
};

const markOrPunctuationToken = (char: string, start: number): Result<Token, LengthParseError> => {
  const unit = MARKS.get(char);
  if (unit !== undefined) return ok({ kind: 'unit', start, text: char, unit, symbol: true });
  const kind = PUNCTUATION.get(char);
  return kind === undefined ? malformed(start) : ok({ kind, start, text: char });
};

/**
 * Pre-processes and tokenizes length text. Rejects, in this order: more than 128 characters
 * (`TOO_LONG`, counted before trimming), blank input (`EMPTY`), any comma (`DECIMAL_COMMA`), then
 * the first lexical fault (`TOO_LARGE`, `UNKNOWN_UNIT`, `MALFORMED`). Whitespace at either end is
 * dropped; every token keeps its index in the original text. Lengths and offsets are counted in
 * UTF-16 code units (the unit of `String.length` and of the DOM selection APIs), so an astral
 * character such as an emoji counts as two.
 */
export const scan = (text: string): Result<readonly Token[], LengthParseError> => {
  if (text.length > MAX_LENGTH) return err({ code: 'TOO_LONG' });
  if (BLANK.test(text)) return err({ code: 'EMPTY' });
  const comma = text.indexOf(',');
  if (comma !== -1) return err({ code: 'DECIMAL_COMMA', offset: comma });
  const tokens: Token[] = [];
  for (const match of text.matchAll(LEXEMES)) {
    const [lexeme, spaces, digits, word] = match;
    const start = match.index;
    if (spaces !== undefined) {
      const inner = start > 0 && start + lexeme.length < text.length;
      if (inner) tokens.push({ kind: 'ws', start, text: spaces });
    } else if (digits !== undefined) {
      if (digits.length > MAX_DIGITS) return err({ code: 'TOO_LARGE', offset: start });
      tokens.push({ kind: 'uint', start, text: digits });
    } else {
      const token =
        word === undefined ? markOrPunctuationToken(lexeme, start) : wordToken(word, start, tokens);
      if (!token.ok) return token;
      tokens.push(token.value);
    }
  }
  return ok(tokens);
};
