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
