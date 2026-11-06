import { describe, expect, it } from 'vitest';
import { Rational } from '../../rational/rational.ts';
import { inch, m } from '../../units/catalog.ts';
import { isQuantityOf, quantity, valueIn } from '../../units/quantity.ts';
import { feetInches } from './index.ts';

/** The run of `raw`; a failed run is a failed test. */
const runOf = (raw: Readonly<Record<string, unknown>>) => {
  const result = feetInches.run(raw);
  if (!result.ok) throw new Error(`run failed: ${JSON.stringify(result.errors)}`);
  return result.value;
};

/** The exact value of a length output in a unit. */
const exact = (raw: Readonly<Record<string, unknown>>, key: string, unit: typeof inch) => {
  const value = runOf(raw).outputs.find((output) => output.key === key)?.value;
  if (!isQuantityOf(value, 'length')) throw new Error(`${key} is not a length`);
  return valueIn(value, unit);
};

/** The exact value of a number output. */
const number = (raw: Readonly<Record<string, unknown>>, key: string) => {
  const value = runOf(raw).outputs.find((output) => output.key === key)?.value;
  if (!(value instanceof Rational)) throw new Error(`${key} is not a number`);
  return value;
};

const codes = (raw: Readonly<Record<string, unknown>>) =>
  runOf(raw).warnings.map(({ code }) => code);

describe('feet and inches defaults (calc-feet-inches › Inputs)', () => {
  // spec: calc-feet-inches › [FI1] 12 ft 6 in plus 3 ft 8 1/4 in, a factor of 2
  it('reads the defaults', () => {
    const state = feetInches.validate({});
    expect(state.ok && state.value).toEqual({
      first: quantity(150, inch),
      operation: 'add',
      second: quantity(Rational.of(177, 4), inch),
      factor: 2,
    });
  });

  it('refuses a factor of zero', () => {
    expect(feetInches.validate({ factor: '0' }).ok).toBe(false);
  });
});

/*
 * Hand-verified (exact fractions, 1 in = 0.0254 m): 150 + 44.25 = 194.25 in (16 ft 2 1/4 in,
 * 4.93395 m); 150 − 44.25 = 105.75 in; 150 × 2 = 300 in; 150 ÷ 2 = 75 in; 150 ÷ 7 = 150/7 in
 * (21.43 in, nearest 1/16: 21 7/16 in); 120 − 150 = −30 in, shown as 30 in and warned.
 */
describe('feet and inches arithmetic (calc-feet-inches › Operations)', () => {
  // spec: calc-feet-inches › [FI2] the default sum
  it('adds the two lengths', () => {
    expect(exact({}, 'result', inch)).toEqual(Rational.of(777, 4));
    expect(exact({}, 'resultIn', inch)).toEqual(Rational.of(777, 4));
    expect(exact({}, 'resultM', m)).toEqual(Rational.of(493395, 100000));
    expect(codes({})).toEqual([]);
  });

  // spec: calc-feet-inches › [FI3] subtract, multiply and divide
  it('subtracts, multiplies and divides', () => {
    expect(exact({ operation: 'subtract' }, 'result', inch)).toEqual(Rational.of(423, 4));
    expect(exact({ operation: 'multiply' }, 'result', inch)).toEqual(Rational.of(300));
    expect(exact({ operation: 'divide' }, 'result', inch)).toEqual(Rational.of(75));
    expect(exact({ operation: 'divide', factor: '7' }, 'result', inch)).toEqual(
      Rational.of(150, 7),
    );
    expect(
      exact({ operation: 'multiply', factor: '3', first: '1 1/16 in' }, 'result', inch),
    ).toEqual(Rational.of(51, 16));
  });

  // spec: calc-feet-inches › [FI4] a second length longer than the first gives the difference and a warning
  it('gives the difference and warns when the second length is longer', () => {
    const raw = { operation: 'subtract', first: '10 ft', second: '12 ft 6 in' };
    expect(exact(raw, 'result', inch)).toEqual(Rational.of(30));
    expect(codes(raw)).toEqual(['secondLonger']);
    expect(codes({ operation: 'subtract', second: '12 ft 6 in' })).toEqual([]);
    expect(exact({ operation: 'subtract', second: '12 ft 6 in' }, 'result', inch)).toEqual(
      Rational.ZERO,
    );
  });

  it('ignores the second length when multiplying and the factor when adding', () => {
    expect(exact({ operation: 'multiply', second: '1 in' }, 'result', inch)).toEqual(
      Rational.of(300),
    );
    expect(exact({ factor: '9' }, 'result', inch)).toEqual(Rational.of(777, 4));
  });
});

/*
 * Hand-verified (calc-feet-inches › [FI7]): 20 ft ÷ 16 in = 240 / 16 = 15 pieces, nothing left;
 * 20 ft ÷ 7 in = 240 / 7 = 34 2/7, 34 pieces (238 in), 2 in left; 10 ft ÷ 12 ft 6 in = 120 / 150
 * = 4/5, no whole piece, all 10 ft left; 12 ft 6 in ÷ 3 ft 8 1/4 in = 150 / 44.25 = 200/59,
 * 3 pieces (132.75 in), 17.25 in left.
 */
describe('feet and inches pieces (calc-feet-inches › Lengths that fit)', () => {
  // spec: calc-feet-inches › [FI7] how many of the second length fit in the first, and what is left
  it.each([
    ['20 ft', '16 in', 15n, Rational.of(15), Rational.ZERO],
    ['20 ft', '7 in', 34n, Rational.of(240, 7), Rational.of(2)],
    ['10 ft', '12 ft 6 in', 0n, Rational.of(4, 5), Rational.of(120)],
    ['12 ft 6 in', '3 ft 8 1/4 in', 3n, Rational.of(200, 59), Rational.of(69, 4)],
  ] as const)('fits %s ÷ %s', (first, second, pieces, ratio, left) => {
    const raw = { operation: 'fit', first, second };
    expect(number(raw, 'pieces')).toEqual(Rational.of(pieces));
    expect(number(raw, 'ratio')).toEqual(ratio);
    expect(exact(raw, 'result', inch)).toEqual(left);
    expect(exact(raw, 'resultIn', inch)).toEqual(left);
    expect(codes(raw)).toEqual([]);
  });

  // spec: calc-feet-inches › [FI8] a piece of zero length fits nothing and is warned
  it('fits no piece of zero length, leaves the whole first length and warns', () => {
    const raw = { operation: 'fit', first: '20 ft', second: '0' };
    expect(number(raw, 'pieces')).toEqual(Rational.ZERO);
    expect(number(raw, 'ratio')).toEqual(Rational.ZERO);
    expect(exact(raw, 'result', inch)).toEqual(Rational.of(240));
    expect(codes(raw)).toEqual(['zeroPiece']);
  });

  it('warns about a zero length only when fitting', () => {
    expect(codes({ second: '0' })).toEqual([]);
    expect(codes({ operation: 'divide', second: '0' })).toEqual([]);
  });
});
