import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { numRuns } from '../__testing__/property-runs.ts';
import { err } from '../result.ts';
import { parseMoney, MONEY_PARSE_CODES } from './parse.ts';

/** The exact amount as text (`249/50`), or the failure result itself. */
const parsed = (text: string): unknown => {
  const result = parseMoney(text);
  return result.ok ? result.value.amount.toString() : result;
};

const failure = (code: string): unknown => err({ code });

// Every accepted amount below was recomputed with Python `fractions.Fraction` before it was written.
describe('parseMoney (money › Money text grammar)', () => {
  // spec: money › Accepted spellings [MN8]
  it.each([
    ['4.98', '249/50'],
    ['$4.98', '249/50'],
    ['$0.37', '37/100'],
    ['.5', '1/2'],
    ['$12', '12'],
    ['4.987', '4987/1000'],
    ['007', '7'],
    ['$.5', '1/2'],
    ['0', '0'],
    ['1234567890123456.78', '61728394506172839/50'],
  ])('reads %j as %s', (text, amount) => {
    expect(parsed(text)).toBe(amount);
  });

  it('builds money in US dollars', () => {
    const result = parseMoney('$1.5');
    expect(result.ok && result.value.currency).toBe('USD');
  });

  // spec: money › Rejections [MN9]
  it.each([
    ['1,000', 'DECIMAL_COMMA'],
    ['4,98', 'DECIMAL_COMMA'],
    ['-5', 'MALFORMED'],
    ['$-5', 'MALFORMED'],
    ['$ 5', 'MALFORMED'],
    ['5$', 'MALFORMED'],
    ['USD 5', 'MALFORMED'],
    ['$', 'MALFORMED'],
    ['1e3', 'MALFORMED'],
    ['1.5.5', 'MALFORMED'],
    ['', 'EMPTY'],
    ['1234567890123456789', 'TOO_LARGE'],
  ])('rejects %j with %s', (text, code) => {
    expect(parsed(text)).toEqual(failure(code));
  });

  it.each(['+5', '5.', '.', '$.', ' 5', '5 ', '5\n', '1 000', '٣', '５', '0x10', '$$5', '5$5'])(
    'rejects %j as MALFORMED',
    (text) => {
      expect(parsed(text)).toEqual(failure('MALFORMED'));
    },
  );

  // spec: money › Money text grammar: the 18-digit cap applies to every digit run
  it('accepts an 18-digit run and rejects a 19-digit one, in the integer and fraction parts', () => {
    expect(parsed('123456789012345678')).toBe('123456789012345678');
    expect(parsed('0.123456789012345678')).toBe('61728394506172839/500000000000000000');
    expect(parsed('1234567890123456789')).toEqual(failure('TOO_LARGE'));
    expect(parsed('$0.1234567890123456789')).toEqual(failure('TOO_LARGE'));
    expect(parsed('.1234567890123456789')).toEqual(failure('TOO_LARGE'));
  });

  // spec: money › Money text grammar: precedence EMPTY, DECIMAL_COMMA, TOO_LARGE, MALFORMED
  it('reports the first applicable code in the documented order', () => {
    expect(parsed('1,234567890123456789')).toEqual(failure('DECIMAL_COMMA'));
    expect(parsed('-1234567890123456789')).toEqual(failure('TOO_LARGE'));
    expect(parsed('abc1234567890123456789')).toEqual(failure('TOO_LARGE'));
    expect(parsed('-1,5')).toEqual(failure('DECIMAL_COMMA'));
    expect(MONEY_PARSE_CODES).toEqual(['EMPTY', 'DECIMAL_COMMA', 'TOO_LARGE', 'MALFORMED']);
  });

  it('never throws, fails with exactly one known code, and succeeds with non-negative money', () => {
    const alphabet = fc.constantFrom(...'0123456789$.,-+ e\n'.split(''), '٣', '５', '\u00A0');
    fc.assert(
      fc.property(fc.string({ unit: alphabet, maxLength: 40 }), (text) => {
        const result = parseMoney(text);
        if (result.ok) return result.value.amount.sign() !== -1;
        const [error, ...rest] = result.errors;
        return rest.length === 0 && MONEY_PARSE_CODES.includes(error.code);
      }),
      { numRuns },
    );
  });

  // The exact value is checked against an independent computation with bigint.
  it('reads digits.digits exactly: num / den = digits / 10^places', () => {
    const digits = fc.stringMatching(/^[0-9]{1,18}$/);
    fc.assert(
      fc.property(digits, digits, fc.boolean(), (integer, fraction, dollar) => {
        const result = parseMoney(`${dollar ? '$' : ''}${integer}.${fraction}`);
        if (!result.ok) return false;
        const { num, den } = result.value.amount;
        return num * 10n ** BigInt(fraction.length) === BigInt(integer + fraction) * den;
      }),
      { numRuns },
    );
  });
});
