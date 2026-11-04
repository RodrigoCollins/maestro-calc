import { decimalInput, defineCalculator, Rational } from '@maestro-calc/core';

/** Minutes in an hour. */
const SIXTY = Rational.of(60);

/**
 * Pool fill time: a flow of F gallons a minute fills G gallons in G / F minutes, which is G / F /
 * 60 hours. The time is an exact Rational of hours (the page writes it as hours and minutes), the
 * minutes a plain number.
 */
export const poolFillTime = defineCalculator({
  id: 'pool-fill-time',
  inputs: [
    decimalInput({
      key: 'gallons',
      urlKey: 'g',
      default: Rational.of(20_000),
      max: Rational.of(1_000_000),
    }),
    decimalInput({
      key: 'flow',
      urlKey: 'f',
      default: Rational.of(10),
      min: Rational.of(1, 10),
      max: Rational.of(1000),
    }),
  ],
  outputs: [
    { key: 'time', measure: 'hours', role: 'primary' },
    { key: 'minutes', measure: 'number', role: 'secondary' },
  ],
  warnings: [],
  compute: ({ gallons, flow }) => {
    const minutes = gallons.div(flow);
    return {
      outputs: { time: minutes.div(SIXTY), minutes },
      shopping: [],
      warnings: [],
    };
  },
});
