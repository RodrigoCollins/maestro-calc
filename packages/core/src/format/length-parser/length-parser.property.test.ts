import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { numRuns } from '../../__testing__/property-runs.ts';
import { Rational } from '../../rational/rational.ts';
import { inch } from '../../units/catalog.ts';
import { quantity, valueIn } from '../../units/quantity.ts';
import { formatFeetInches } from '../feet-inches.ts';
import { parseLength } from './parser.ts';

const LIMIT = 10n ** 15n;
const denominatorArb = fc.integer({ min: 2, max: 64 });

/** `k` with `|k/d| < 10^15`: zero, small values and magnitudes far beyond 10^9, both signs. */
const ticksArb = (d: number): fc.Arbitrary<bigint> => {
  const bound = LIMIT * BigInt(d) - 1n;
  return fc.oneof(
    fc.constant(0n),
    fc.bigInt({ min: -2000n, max: 2000n }),
    fc.bigInt({ min: -bound, max: bound }),
    fc.constantFrom(bound, -bound),
  );
};

const lengthArb = denominatorArb.chain((d) => ticksArb(d).map((k): [bigint, number] => [k, d]));

const textOf = (k: bigint, d: number): string =>
  formatFeetInches(quantity(Rational.of(k, d), inch), { denominator: d }).text;

const valueOf = (text: string): Rational | undefined => {
  const result = parseLength(text);
  return result.ok ? valueIn(result.value, inch) : undefined;
};

describe('format/parse round trip (fraction-format › Format/parse round trip)', () => {
  // spec: Property-based round trip [FR1]: parse(format(k/d, d)) = k/d for every d in 2..64
  it('parses the formatted text of k/d back to exactly k/d inches', () => {
    fc.assert(
      fc.property(lengthArb, ([k, d]) => valueOf(textOf(k, d))?.equals(Rational.of(k, d)) === true),
      { numRuns },
    );
  });

  // spec: Idempotent formatting [FR2]: format(parse(t), d) = t for every canonical text t
  it('formats the parsed canonical text back to the same text', () => {
    fc.assert(
      fc.property(lengthArb, ([k, d]) => {
        const text = textOf(k, d);
        const value = parseLength(text);
        return value.ok && formatFeetInches(value.value, { denominator: d }).text === text;
      }),
      { numRuns },
    );
  });

  // spec: Idempotent formatting [FR2]: the three canonical texts and their denominators
  it.each([
    [`5' 3 1/2"`, 2],
    [`1' 0"`, 2],
    [`-0' 1/64"`, 64],
  ])('formats %j at denominator %i back to itself', (text, d) => {
    const value = parseLength(text);
    expect(value.ok && formatFeetInches(value.value, { denominator: d }).text).toBe(text);
  });

  // spec: Property-based round trip [FR1]: the edges of the bound, hand-checked
  it('round-trips zero, the smallest tick and the largest magnitude below 10^15', () => {
    expect(textOf(0n, 7)).toBe(`0' 0"`);
    expect(valueOf(`0' 0"`)?.equals(Rational.ZERO)).toBe(true);
    // 10^15 - 1/64 in: 999999999999999 whole in = 83333333333333 x 12 + 3, plus 63/64 in
    const nearLimit = textOf(LIMIT * 64n - 1n, 64);
    expect(nearLimit).toBe(`83333333333333' 3 63/64"`);
    expect(valueOf(nearLimit)?.equals(Rational.of(LIMIT * 64n - 1n, 64))).toBe(true);
    expect(valueOf(`-${nearLimit}`)?.equals(Rational.of(1n - LIMIT * 64n, 64))).toBe(true);
  });
});
