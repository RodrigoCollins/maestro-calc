import { describe, expect, it } from 'vitest';
import { CoreError } from '../errors.ts';
import { Rational } from './rational.ts';

const thrownCode = (action: () => unknown): string | undefined => {
  try {
    action();
  } catch (error) {
    if (error instanceof CoreError) return error.code;
    throw error;
  }
  return undefined;
};

const r = (n: bigint | number, d: bigint | number = 1): Rational => Rational.of(n, d);

describe('Rational construction (exact-rational › Normalized representation)', () => {
  // spec: exact-rational › Reduction (6/8) [ER2]
  it('reduces 6/8 to 3/4 and 12/18 to 2/3', () => {
    expect(r(6, 8)).toEqual({ num: 3n, den: 4n });
    expect(r(12, 18)).toEqual({ num: 2n, den: 3n });
  });

  // spec: exact-rational › Sign moves to the numerator [ER3]
  it('moves the sign to the numerator', () => {
    expect(r(3, -6)).toEqual({ num: -1n, den: 2n });
    expect(r(-3, -6)).toEqual({ num: 1n, den: 2n });
    expect(r(-3, 6)).toEqual({ num: -1n, den: 2n });
  });

  // spec: exact-rational › Zero is unique [ER4]
  it('represents zero as 0/1 whatever the denominator', () => {
    expect(r(0, 5)).toEqual({ num: 0n, den: 1n });
    expect(r(0, -7)).toEqual({ num: 0n, den: 1n });
    expect(r(0, 5)).toEqual(r(0, -7));
  });

  // spec: exact-rational › Zero denominator [ER5]
  it('throws ZERO_DENOMINATOR for a zero denominator', () => {
    expect(thrownCode(() => r(1, 0))).toBe('ZERO_DENOMINATOR');
    expect(thrownCode(() => r(0, 0))).toBe('ZERO_DENOMINATOR');
    expect(thrownCode(() => r(1n, 0n))).toBe('ZERO_DENOMINATOR');
  });

  // spec: exact-rational › Unsafe or fractional number input [ER6]
  it.each([1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 9007199254740992])(
    'throws NOT_AN_INTEGER for the number %s as numerator or denominator',
    (value) => {
      expect(thrownCode(() => r(value))).toBe('NOT_AN_INTEGER');
      expect(thrownCode(() => r(1, value))).toBe('NOT_AN_INTEGER');
    },
  );

  // spec: exact-rational › Unsafe or fractional number input [ER6]
  it('accepts the largest safe integer and negatives', () => {
    expect(r(9007199254740991)).toEqual({ num: 9007199254740991n, den: 1n });
    expect(r(-9007199254740991)).toEqual({ num: -9007199254740991n, den: 1n });
    expect(r(-4)).toEqual({ num: -4n, den: 1n });
  });

  // spec: exact-rational › Normalized representation — bigint or number arguments
  it('accepts bigint arguments of any size', () => {
    expect(r(10n ** 30n, 3n * 10n ** 30n)).toEqual({ num: 1n, den: 3n });
    expect(r(2n ** 100n, 2n ** 101n)).toEqual({ num: 1n, den: 2n });
  });

  // spec: exact-rational › Normalized representation — instances are immutable
  it('freezes instances', () => {
    const value = r(1, 2);
    const mutable: { num: bigint } = value;
    expect(Object.isFrozen(value)).toBe(true);
    expect(() => {
      mutable.num = 5n;
    }).toThrow(TypeError);
    expect(value.num).toBe(1n);
  });

  // design: Rational — constants ZERO and ONE
  it('exposes the constants ZERO and ONE', () => {
    expect(Rational.ZERO).toEqual({ num: 0n, den: 1n });
    expect(Rational.ONE).toEqual({ num: 1n, den: 1n });
  });
});

describe('Rational field arithmetic (exact-rational › Field arithmetic)', () => {
  // spec: exact-rational › Floating-point trap (0.1 + 0.2) [ER7]
  it('adds 1/10 and 2/10 to exactly 3/10', () => {
    expect(r(1, 10).add(r(2, 10))).toEqual({ num: 3n, den: 10n });
  });

  // spec: exact-rational › Unlike denominators [ER8]
  it('adds 1/2 and 1/3 to 5/6', () => {
    expect(r(1, 2).add(r(1, 3))).toEqual({ num: 5n, den: 6n });
    expect(r(1, 2).add(r(-1, 2))).toEqual(Rational.ZERO);
  });

  // design: Rational — sub is add of the negation
  it('subtracts 1/2 - 1/3 = 1/6 and 1/3 - 1/2 = -1/6', () => {
    expect(r(1, 2).sub(r(1, 3))).toEqual({ num: 1n, den: 6n });
    expect(r(1, 3).sub(r(1, 2))).toEqual({ num: -1n, den: 6n });
  });

  // spec: exact-rational › Multiplication reduces [ER9]
  it('multiplies 2/3 by 3/4 to 1/2', () => {
    expect(r(2, 3).mul(r(3, 4))).toEqual({ num: 1n, den: 2n });
    expect(r(-2, 3).mul(r(3, 4))).toEqual({ num: -1n, den: 2n });
  });

  // spec: exact-rational › Division [ER10]
  it('divides 1/2 by 3/4 to 2/3', () => {
    expect(r(1, 2).div(r(3, 4))).toEqual({ num: 2n, den: 3n });
    expect(r(1, 2).div(r(-3, 4))).toEqual({ num: -2n, den: 3n });
  });

  // spec: exact-rational › Thirds are exact [ER11]
  it('multiplies 1/3 by 3 to exactly 1', () => {
    expect(r(1, 3).mul(r(3))).toEqual(Rational.ONE);
  });

  // spec: exact-rational › Division by zero [ER12]
  it('throws DIVISION_BY_ZERO when dividing by zero or inverting zero', () => {
    expect(thrownCode(() => r(5, 7).div(Rational.ZERO))).toBe('DIVISION_BY_ZERO');
    expect(thrownCode(() => Rational.ZERO.div(Rational.ZERO))).toBe('DIVISION_BY_ZERO');
    expect(thrownCode(() => Rational.ZERO.inv())).toBe('DIVISION_BY_ZERO');
  });

  // design: Rational — inv swaps the parts and keeps the sign on the numerator
  it('inverts 2/3 to 3/2 and -2/3 to -3/2', () => {
    expect(r(2, 3).inv()).toEqual({ num: 3n, den: 2n });
    expect(r(-2, 3).inv()).toEqual({ num: -3n, den: 2n });
  });

  // spec: exact-rational › Huge operands stay exact [ER13]
  it('stays exact beyond 2^64', () => {
    const huge = 10n ** 30n;
    expect(r(huge, 3).mul(r(3))).toEqual({ num: huge, den: 1n });
    expect(r(2n ** 100n + 1n).sub(r(2n ** 100n))).toEqual(Rational.ONE);
  });

  // spec: exact-rational › Ordering [ER14]
  it('orders -1/2 < -1/3 < 0 < 1/3 with compare', () => {
    const ascending = [r(-1, 2), r(-1, 3), Rational.ZERO, r(1, 3)];
    for (const [i, a] of ascending.entries()) {
      for (const [j, b] of ascending.entries()) {
        expect(a.compare(b), `${String(i)} vs ${String(j)}`).toBe(Math.sign(i - j));
      }
    }
  });

  // spec: exact-rational › Field arithmetic — equals, sign, isZero, isInteger [ER14]
  it('reports equality, sign, zero and integrality', () => {
    expect(r(2, 4).equals(r(1, 2))).toBe(true);
    expect(r(1, 2).equals(r(1, 3))).toBe(false);
    expect(r(-1, 2).equals(r(1, 2))).toBe(false);
    expect([r(-1, 2).sign(), Rational.ZERO.sign(), r(1, 3).sign()]).toEqual([-1, 0, 1]);
    expect([Rational.ZERO.isZero(), r(1, 3).isZero(), r(-1, 3).isZero()]).toEqual([
      true,
      false,
      false,
    ]);
    expect([r(4).isInteger(), r(8, 2).isInteger(), r(0).isInteger(), r(7, 2).isInteger()]).toEqual([
      true,
      true,
      true,
      false,
    ]);
  });

  // spec: exact-rational › Field arithmetic — neg and abs [ER14]
  it('negates and takes absolute values of negatives and zero', () => {
    expect(r(-1, 2).neg()).toEqual({ num: 1n, den: 2n });
    expect(r(1, 2).neg()).toEqual({ num: -1n, den: 2n });
    expect(Rational.ZERO.neg()).toEqual(Rational.ZERO);
    expect(r(-1, 2).abs()).toEqual({ num: 1n, den: 2n });
    expect(r(1, 2).abs()).toEqual({ num: 1n, den: 2n });
    expect(Rational.ZERO.abs()).toEqual(Rational.ZERO);
  });
});

describe('Rational integer rounding (exact-rational › Integer rounding primitives)', () => {
  // spec: exact-rational › Floor and ceil of halves [ER16]
  it.each([
    [7, 2, 3n, 4n],
    [-7, 2, -4n, -3n],
    [-1, 2, -1n, 0n],
    [1, 3, 0n, 1n],
  ])('floor and ceil of %i/%i are %s and %s', (n, d, floor, ceil) => {
    expect(r(n, d).floor()).toBe(floor);
    expect(r(n, d).ceil()).toBe(ceil);
  });

  // spec: exact-rational › Integers fixed [ER17]
  it.each([
    [-4, -4n],
    [0, 0n],
    [6, 6n],
  ])('maps the integer %i to itself', (n, expected) => {
    expect(r(n).floor()).toBe(expected);
    expect(r(n).ceil()).toBe(expected);
  });
});

describe('Rational canonical string codec (exact-rational › Canonical string codec)', () => {
  const parsed = (text: string): unknown => {
    const result = Rational.fromString(text);
    return result.ok ? result.value : result;
  };

  // spec: exact-rational › Canonical output [ER25]
  it.each([
    [127, 2, '127/2'],
    [-5, 2, '-5/2'],
    [4, 1, '4'],
    [0, 1, '0'],
    [-7, 1, '-7'],
  ])('writes %i/%i as %j', (n, d, text) => {
    expect(r(n, d).toString()).toBe(text);
  });

  // spec: exact-rational › Non-reduced input accepted and normalized [ER26]
  it.each([
    ['4/2', 2n, 1n],
    ['-6/8', -3n, 4n],
    ['7', 7n, 1n],
    ['-0', 0n, 1n],
    ['0/5', 0n, 1n],
    ['10/4', 5n, 2n],
  ])('reads %j as a normalized value', (text, num, den) => {
    expect(parsed(text)).toEqual({ num, den });
  });

  // spec: exact-rational › Invalid canonical text [ER27]
  it.each([
    '',
    '1/',
    '/2',
    '1/-2',
    '+1/2',
    '1.5',
    ' 1/2',
    '1/2/3',
    '1 /2',
    '--1',
    '1,5',
    '1,000/2',
  ])('rejects %j as MALFORMED', (text) => {
    expect(Rational.fromString(text)).toEqual({ ok: false, errors: [{ code: 'MALFORMED' }] });
  });

  // spec: exact-rational › Invalid canonical text — Rational-layer safety cap [ER27]
  it('accepts 1024 characters and rejects 1025 as MALFORMED', () => {
    expect(Rational.fromString('1'.repeat(1024)).ok).toBe(true);
    expect(Rational.fromString(`1/${'1'.repeat(1022)}`).ok).toBe(true);
    expect(Rational.fromString('1'.repeat(1025))).toEqual({
      ok: false,
      errors: [{ code: 'MALFORMED' }],
    });
    expect(Rational.fromString(`1/${'1'.repeat(1023)}`).ok).toBe(false);
  });

  // spec: exact-rational › Zero denominator text [ER28]
  it.each(['1/0', '0/0', '-3/00'])('rejects %j as ZERO_DENOMINATOR', (text) => {
    expect(Rational.fromString(text)).toEqual({
      ok: false,
      errors: [{ code: 'ZERO_DENOMINATOR' }],
    });
  });

  // spec: exact-rational › Canonical string codec — round trip
  it('round trips values beyond 2^64', () => {
    const value = r(-(2n ** 100n) - 1n, 3n * 10n ** 30n);
    expect(parsed(value.toString())).toEqual(value);
  });
});

describe('Rational lossy exit and serialization guard (exact-rational › Lossy exit)', () => {
  const ulpOfTen = 2 ** -49;
  const JSON_GUARD = 'Rational is not JSON serializable; persist toString()';

  // spec: exact-rational › Nearest double [ER29]
  it('returns the nearest double for small parts', () => {
    expect(r(1, 10).toNumber()).toBe(0.1);
    expect(r(1, 3).toNumber()).toBe(0.3333333333333333);
    expect(r(-7, 2).toNumber()).toBe(-3.5);
    expect(Rational.ZERO.toNumber()).toBe(0);
  });

  // spec: exact-rational › Nearest double — both magnitudes at the 2^53 - 1 boundary [ER29]
  it('divides directly when both parts are at most 2^53 - 1', () => {
    expect(r(9007199254740991, 9007199254740990).toNumber()).toBe(1.0000000000000002);
    expect(r(-9007199254740991).toNumber()).toBe(-9007199254740991);
  });

  // spec: exact-rational › Huge numerator and denominator [ER30]
  it('never yields NaN or Infinity for (10^400 + 1) / 10^399', () => {
    const value = r(10n ** 400n + 1n, 10n ** 399n).toNumber();
    expect(Number.isFinite(value)).toBe(true);
    expect(Math.abs(value - 10)).toBeLessThanOrEqual(ulpOfTen);
    const negative = r(-(10n ** 400n) - 1n, 10n ** 399n).toNumber();
    expect(Number.isFinite(negative)).toBe(true);
    expect(Math.abs(negative + 10)).toBeLessThanOrEqual(ulpOfTen);
  });

  // spec: exact-rational › Huge numerator and denominator — shifting on either side [ER30]
  it('stays within one ulp when only the denominator is huge', () => {
    expect(r(10n ** 399n, 10n ** 400n + 1n).toNumber()).toBe(0.1);
    expect(r(3n * 2n ** 70n, 2n ** 71n).toNumber()).toBe(1.5);
  });

  // spec: exact-rational › Lossy exit — range limits [ER30]
  it('saturates to a signed Infinity above the double range and to zero below it', () => {
    expect(r(10n ** 400n).toNumber()).toBe(Number.POSITIVE_INFINITY);
    expect(r(-(10n ** 400n)).toNumber()).toBe(Number.NEGATIVE_INFINITY);
    expect(r(1n, 10n ** 400n).toNumber()).toBe(0);
  });

  // spec: exact-rational › Lossy exit — representable extremes survive the scaling [ER30]
  it('keeps values near the edges of the double range', () => {
    expect(r(2n ** 1000n).toNumber()).toBe(2 ** 1000);
    expect(r(1n, 2n ** 1060n).toNumber()).toBe(2 ** -1060);
    expect(r(2n ** 2000n, 2n ** 1990n).toNumber()).toBe(1024);
  });

  // spec: exact-rational › JSON guard [ER31]
  it('throws a TypeError from JSON.stringify, directly and nested', () => {
    // The default bigint failure is also a TypeError, so the guard's own message is asserted.
    expect(() => JSON.stringify(r(1, 3))).toThrow(new TypeError(JSON_GUARD));
    expect(() => JSON.stringify({ x: r(1, 3) })).toThrow(new TypeError(JSON_GUARD));
  });

  // design: Rational — leak guards; persistence uses toString
  it('converts to text only, and refuses implicit numeric conversion', () => {
    const value = r(127, 2);
    expect(String(value)).toBe('127/2');
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- exercises the string hint
    expect(`${value}`).toBe(value.toString());
    expect(() => Number(value)).toThrow(TypeError);
    expect(() => (value as unknown as number) + 1).toThrow(TypeError);
    expect(() => (value as unknown as number) > 1).toThrow(TypeError);
  });
});
