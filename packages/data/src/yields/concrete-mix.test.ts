import { ft3, in3, quantity, Rational, valueIn } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import * as yieldsModule from './concrete-mix.ts';
import { CONCRETE_MIX_YIELDS } from './concrete-mix.ts';

describe('CONCRETE_MIX_YIELDS (material-data-contract › Yields-only module)', () => {
  // spec: material-data-contract › [MDC5] Yields-only module (exports)
  it('exports nothing else', () => {
    expect(Object.keys(yieldsModule)).toEqual(['CONCRETE_MIX_YIELDS']);
  });

  // spec: material-data-contract › [MDC5] Yields-only module (sizes)
  it.each([
    ['bag-40', Rational.of(2592, 5), Rational.of(3, 10)],
    ['bag-60', Rational.of(3888, 5), Rational.of(9, 20)],
    ['bag-80', Rational.of(5184, 5), Rational.of(3, 5)],
  ] as const)('holds %s as an exact volume', (key, cubicInches, cubicFeet) => {
    expect(valueIn(CONCRETE_MIX_YIELDS[key], in3)).toEqual(cubicInches);
    expect(valueIn(CONCRETE_MIX_YIELDS[key], ft3)).toEqual(cubicFeet);
    expect(CONCRETE_MIX_YIELDS[key]).toEqual(quantity(cubicFeet, ft3));
  });

  it('has exactly the three bag keys and is frozen', () => {
    expect(Object.keys(CONCRETE_MIX_YIELDS)).toEqual(['bag-40', 'bag-60', 'bag-80']);
    expect(Object.isFrozen(CONCRETE_MIX_YIELDS)).toBe(true);
  });
});
