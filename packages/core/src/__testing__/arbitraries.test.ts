import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { nonZeroRationalArb, rationalArb } from './arbitraries.ts';

const HUGE = 2n ** 64n;
const LIMIT = 2n ** 80n;
const abs = (value: bigint): bigint => (value < 0n ? -value : value);

describe('rational arbitraries (design: property tests reach the interesting regions)', () => {
  const samples = fc.sample(rationalArb, { numRuns: 2000, seed: 1 });
  const some = (predicate: (value: (typeof samples)[number]) => boolean): boolean =>
    samples.some(predicate);
  const share = (predicate: (value: (typeof samples)[number]) => boolean): number =>
    samples.filter(predicate).length / samples.length;

  // spec: exact-rational › Properties hold [ER15]: zero, small and huge parts all get exercised
  it('covers zero, small, huge and negative values within 2^80', () => {
    expect(some((value) => value.isZero())).toBe(true);
    expect(some((value) => value.num !== 0n && abs(value.num) <= 16n)).toBe(true);
    expect(some((value) => abs(value.num) > HUGE)).toBe(true);
    expect(some((value) => value.num < 0n)).toBe(true);
    expect(some((value) => value.den <= 16n)).toBe(true);
    expect(some((value) => value.den > HUGE)).toBe(true);
    expect(samples.every((value) => abs(value.num) <= LIMIT && value.den <= LIMIT)).toBe(true);
  });

  // The mix is weighted (numerators: 1 zero, 2 small, 7 huge), so each region is hit often.
  it('weights zero, small and huge parts so each region is hit often', () => {
    expect(share((value) => value.isZero())).toBeGreaterThan(0.05);
    expect(share((value) => value.num !== 0n && abs(value.num) <= 16n)).toBeGreaterThan(0.15);
    expect(share((value) => abs(value.num) > HUGE)).toBeGreaterThan(0.5);
    expect(share((value) => value.den <= 16n)).toBeGreaterThan(0.2);
    expect(share((value) => value.den > HUGE)).toBeGreaterThan(0.5);
  });

  it('keeps the non-zero arbitrary free of zero', () => {
    const values = fc.sample(nonZeroRationalArb, { numRuns: 500, seed: 1 });
    expect(values.some((value) => value.isZero())).toBe(false);
  });
});
