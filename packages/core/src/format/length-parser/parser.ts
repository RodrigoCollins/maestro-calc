import { Rational } from '../../rational/rational.ts';
import { err, ok, type Result } from '../../result.ts';
import { inch } from '../../units/catalog.ts';
import { quantity, type Quantity } from '../../units/quantity.ts';
import type { Unit } from '../../units/unit.ts';
import type { LengthParseError } from './codes.ts';
import { scan, type PlainToken, type Token, type UnitToken } from './scanner.ts';

export interface LengthParseOptions {
  /** The unit of a number written without any unit marker. Default `in`. */
  readonly defaultUnit?: Unit<'length'>;
}

/**
 * Where the parser is in the token list. Every reader returns `undefined` when its part of the
 * grammar does not match and leaves `pos` on the first token it could not use, which is where a
 * MALFORMED error points. `zeroAt` is set when a denominator is `0` (a ZERO_DENOMINATOR error).
 */
interface Cursor {
  readonly tokens: readonly Token[];
  pos: number;
  zeroAt: number | undefined;
}

const takeKind = (cursor: Cursor, kind: PlainToken['kind']): boolean => {
  const found = cursor.tokens[cursor.pos]?.kind === kind;
  if (found) cursor.pos += 1;
  return found;
};

const takeUint = (cursor: Cursor): PlainToken | undefined => {
  const token = cursor.tokens[cursor.pos];
  if (token?.kind !== 'uint') return undefined;
  cursor.pos += 1;
  return token;
};

const takeUnit = (cursor: Cursor): UnitToken | undefined => {
  const token = cursor.tokens[cursor.pos];
  if (token?.kind !== 'unit') return undefined;
  cursor.pos += 1;
  return token;
};

/** Runs `read`; when it does not match, the cursor goes back to where it was. */
const attempt = <T>(cursor: Cursor, read: (cursor: Cursor) => T | undefined): T | undefined => {
  const start = cursor.pos;
  const value = read(cursor);
  if (value === undefined) cursor.pos = start;
  return value;
};

/** `"/" uint`: the denominator token of a fraction. */
const takeDenominator = (cursor: Cursor): PlainToken | undefined =>
  takeKind(cursor, 'slash') ? takeUint(cursor) : undefined;

interface MixedTail {
  readonly numerator: PlainToken;
  readonly denominator: PlainToken;
}

/** `( ws | "-" ) uint "/" uint`: what follows the whole part of a mixed number. */
const takeMixedTail = (cursor: Cursor): MixedTail | undefined => {
  if (!takeKind(cursor, 'ws') && !takeKind(cursor, 'minus')) return undefined;
  const numerator = takeUint(cursor);
  if (numerator === undefined) return undefined;
  const denominator = takeDenominator(cursor);
  return denominator === undefined ? undefined : { numerator, denominator };
};

const ratio = (
  cursor: Cursor,
  numerator: PlainToken,
  denominator: PlainToken,
): Rational | undefined => {
  const divisor = BigInt(denominator.text);
  if (divisor === 0n) {
    cursor.zeroAt = denominator.start;
    return undefined;
  }
  return Rational.of(BigInt(numerator.text), divisor);
};

/** The digits after a decimal point that was just read; the point must be followed by digits. */
const decimalDigits = (cursor: Cursor, whole: string): Rational | undefined => {
  const digits = takeUint(cursor);
  return digits === undefined
    ? undefined
    : Rational.of(BigInt(whole + digits.text), 10n ** BigInt(digits.text.length));
};

/** `number := mixed | fraction | decimal`, read without rounding. */
const parseNumber = (cursor: Cursor): Rational | undefined => {
  const whole = takeUint(cursor);
  if (whole === undefined) return takeKind(cursor, 'dot') ? decimalDigits(cursor, '') : undefined;
  const denominator = attempt(cursor, takeDenominator);
  if (denominator !== undefined) return ratio(cursor, whole, denominator);
  const tail = attempt(cursor, takeMixedTail);
  if (tail !== undefined) {
    const fraction = ratio(cursor, tail.numerator, tail.denominator);
    return fraction?.add(Rational.of(BigInt(whole.text)));
  }
  return takeKind(cursor, 'dot')
    ? decimalDigits(cursor, whole.text)
    : Rational.of(BigInt(whole.text));
};

/** `simple := number ws* UNIT?`. */
const parseValue = (
  cursor: Cursor,
  defaultUnit: Unit<'length'>,
): Quantity<'length'> | undefined => {
  const amount = parseNumber(cursor);
  if (amount === undefined) return undefined;
  takeKind(cursor, 'ws');
  const mark = takeUnit(cursor);
  return quantity(amount, mark === undefined ? defaultUnit : mark.unit);
};

/**
 * Converts length text to an exact length: never rounds, never goes through `number`, never
 * throws. Fails with exactly one error; see `LengthParseError` for the code list and `offset`.
 */
export const parseLength = (
  text: string,
  { defaultUnit = inch }: LengthParseOptions = {},
): Result<Quantity<'length'>, LengthParseError> => {
  const scanned = scan(text);
  if (!scanned.ok) return scanned;
  const cursor: Cursor = { tokens: scanned.value, pos: 0, zeroAt: undefined };
  const value = parseValue(cursor, defaultUnit);
  if (cursor.zeroAt !== undefined) return err({ code: 'ZERO_DENOMINATOR', offset: cursor.zeroAt });
  if (value === undefined || cursor.pos < cursor.tokens.length) {
    return err({ code: 'MALFORMED', offset: cursor.tokens[cursor.pos]?.start ?? text.length });
  }
  return ok(value);
};
