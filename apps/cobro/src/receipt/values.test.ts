import { Rational, usd, quantity, ft2 } from '@maestro-calc/core';
import { cleaningQuote } from '@maestro-calc/cobro-core/cleaning';
import { describe, expect, it } from 'vitest';
import { valuesOf } from './values.ts';

const run = (raw: Readonly<Record<string, unknown>>) => {
  const state = cleaningQuote.validate(raw);
  const ran = cleaningQuote.run(raw);
  if (!state.ok || !ran.ok) throw new Error('did not run');
  return {
    state: state.value as Readonly<Record<string, unknown>>,
    outputs: Object.fromEntries(ran.value.outputs.map(({ key, value }) => [key, value])),
  };
};

describe('valuesOf', () => {
  it('reads the labor fields of the state and the units and area of the outputs', () => {
    const { state, outputs } = run({ crew: '2', hours: '3.5' });
    expect(valuesOf(state, outputs)).toEqual({
      laborBy: 'hour',
      hours: Rational.of(7, 2),
      crew: 2,
      rate: usd(25),
      areaRate: usd(2),
      area: Rational.of(1500),
      units: Rational.ZERO,
      overhead: Rational.of(10),
      profit: Rational.of(15),
    });
  });

  it('names what is missing instead of guessing', () => {
    const { state, outputs } = run({});
    expect(() => valuesOf(state, { ...outputs, area: 1 })).toThrow('area is not an area');
    expect(() => valuesOf({ ...state, hours: 'x' }, outputs)).toThrow('hours is not a number');
    expect(() => valuesOf({ ...state, rate: 3 }, outputs)).toThrow('rate is not money');
    expect(valuesOf(state, { ...outputs, area: quantity(10, ft2) }).area).toEqual(Rational.of(10));
  });
});
