import { defineCalculator } from '../calculator/define.ts';
import { multiplyCount, usd } from '../money/money.ts';
import { Rational } from '../rational/rational.ts';
import { inch } from '../units/catalog.ts';
import { multiply } from '../units/ops.ts';
import { quantity } from '../units/quantity.ts';

/**
 * The calculator of the `calculator-contract` scenarios (spec table): one input of each kind and
 * the outputs `area` (primary, shown as ft2 with two places) and `cost` (secondary money). It is
 * test support, never exported from the package.
 */
export const fixtureBox = defineCalculator({
  id: 'fixture-box',
  inputs: [
    {
      kind: 'length',
      key: 'len',
      urlKey: 'a',
      default: quantity(12, inch),
      defaultUnit: 'in',
      metricDefaultUnit: 'cm',
      min: quantity(0, inch),
      max: quantity(1200, inch),
    },
    { kind: 'count', key: 'cnt', urlKey: 'b', default: 3, min: 0, max: 100 },
    {
      kind: 'percent',
      key: 'pct',
      urlKey: 'c',
      default: Rational.of(10),
      min: Rational.ZERO,
      max: Rational.of(100),
    },
    { kind: 'select', key: 'sel', urlKey: 'd', default: 'x', options: ['x', 'y'] },
    { kind: 'boolean', key: 'flg', urlKey: 'e', default: false },
    {
      kind: 'money',
      key: 'prc',
      urlKey: 'f',
      default: usd(Rational.of(249, 50)),
      min: usd(0),
      max: usd(10000),
    },
  ],
  outputs: [
    {
      key: 'area',
      measure: 'area',
      role: 'primary',
      display: { unit: 'ft2', format: 'decimal', places: 2 },
    },
    { key: 'cost', measure: 'money', role: 'secondary' },
  ],
  warnings: ['bigCount'],
  compute: (inputs) => ({
    outputs: {
      area: multiply(inputs.len, inputs.len),
      cost: multiplyCount(inputs.prc, inputs.cnt),
    },
    shopping: [],
    warnings: [],
  }),
});
