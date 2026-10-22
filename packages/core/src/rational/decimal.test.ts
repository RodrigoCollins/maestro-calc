import { describe, expect, it } from 'vitest';
import { err } from '../result.ts';
import { parseDecimal } from './decimal.ts';
import { Rational } from './rational.ts';

const parsed = (text: string): unknown => {
  const result = parseDecimal(text);
  return result.ok ? result.value : result;
};

const r = (n: bigint | number, d: bigint | number = 1): Rational => Rational.of(n, d);

describe('parseDecimal (exact-rational › Exact decimal parsing)', () => {
  // spec: exact-rational › Parser failure shape [ER1]
  it('returns a failure value, never throws, for "abc"', () => {
    expect(parseDecimal('abc')).toEqual({ ok: false, errors: [{ code: 'MALFORMED' }] });
    expect(parseDecimal('abc')).toEqual(err({ code: 'MALFORMED' }));
  });

  // spec: exact-rational › Decimal tenths [ER18]
  it('parses "0.1" as 1/10', () => {
    expect(parsed('0.1')).toEqual({ num: 1n, den: 10n });
  });

  // spec: exact-rational › Negative with trailing zero [ER19]
  it('parses "-0.250" as -1/4', () => {
    expect(parsed('-0.250')).toEqual({ num: -1n, den: 4n });
  });

  // spec: exact-rational › Leading-dot and integer [ER20]
  it.each([
    ['.5', 1n, 2n],
    ['12', 12n, 1n],
    ['1.50', 3n, 2n],
    ['00.5', 1n, 2n],
    ['+3', 3n, 1n],
    ['+.25', 1n, 4n],
    ['-12', -12n, 1n],
  ])('parses %s', (text, num, den) => {
    expect(parsed(text)).toEqual({ num, den });
  });

  // spec: exact-rational › Negative zero [ER21]
  it.each(['-0', '-0.0', '0', '+0.00'])('parses %s as 0/1', (text) => {
    expect(parsed(text)).toEqual({ num: 0n, den: 1n });
  });

  // spec: exact-rational › Long decimal exactness [ER22]
  it('keeps 22 decimal places exact and does not round to 1/3', () => {
    const value = parsed('0.3333333333333333333333');
    expect(value).toEqual(r(3333333333333333333333n, 10n ** 22n));
    expect(value).not.toEqual(r(1, 3));
  });

  // spec: exact-rational › Malformed decimals [ER23]
  it.each([
    '',
    ' 1',
    '1 ',
    '5.',
    '.',
    '-',
    '--1',
    '+-1',
    '1e3',
    '0x10',
    '５',
    'NaN',
    'Infinity',
    '1.2.3',
  ])('rejects %j as MALFORMED', (text) => {
    expect(parseDecimal(text)).toEqual({ ok: false, errors: [{ code: 'MALFORMED' }] });
  });

  // spec: exact-rational › Malformed decimals — Rational-layer safety cap [ER23]
  it('accepts 1024 characters and rejects 1025 as MALFORMED', () => {
    expect(parseDecimal('1'.repeat(1024)).ok).toBe(true);
    expect(parseDecimal('1'.repeat(1025))).toEqual({ ok: false, errors: [{ code: 'MALFORMED' }] });
    expect(parseDecimal(`0.${'1'.repeat(1022)}`).ok).toBe(true);
    expect(parseDecimal(`0.${'1'.repeat(1023)}`).ok).toBe(false);
  });

  // spec: exact-rational › Comma separators [ER24]
  it.each(['1,5', '1,000', '1,000.5', ',', 'abc,'])('rejects %j as DECIMAL_COMMA', (text) => {
    expect(parseDecimal(text)).toEqual({ ok: false, errors: [{ code: 'DECIMAL_COMMA' }] });
  });

  // spec: exact-rational › Floating-point trap (0.1 + 0.2) [ER7b]
  it('parses "0.3" equal to 1/10 + 2/10', () => {
    expect(parsed('0.3')).toEqual(r(1, 10).add(r(2, 10)));
    expect(r(1, 10).add(r(2, 10)).equals(r(3, 10))).toBe(true);
  });
});
