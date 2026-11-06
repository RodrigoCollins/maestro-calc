import { describe, expect, it } from 'vitest';
import { fixtureBox } from '../__testing__/fixture-box.ts';
import { usd } from '../money/money.ts';
import { Rational } from '../rational/rational.ts';
import { in2 } from '../units/catalog.ts';
import { quantity } from '../units/quantity.ts';
import { shapeOf as checkedShapeOf } from './result-checks.ts';
import { shapeOf } from './result-shape.ts';

const area = quantity(144, in2);
const cost = usd(Rational.of(747, 50));
const line = { materialId: 'a', purchaseUnit: 'b', qty: 3n };
const warn = { code: 'bigCount', params: { count: 2, big: true, at: 'x' } };

/** Results that keep the contract, in the shapes a compute may build them. */
const VALID: readonly [string, unknown][] = [
  ['the outputs alone', { outputs: { area, cost }, shopping: [], warnings: [] }],
  ['the outputs in another order', { outputs: { cost, area }, shopping: [], warnings: [] }],
  [
    'a shopping line and a warning',
    { outputs: { area, cost }, shopping: [line], warnings: [warn] },
  ],
  [
    'a line of zero units',
    { outputs: { area, cost }, shopping: [{ ...line, qty: 0n }], warnings: [] },
  ],
];

describe('the unchecked result shape of a page script (calculator-contract › run)', () => {
  // the client build loads this module instead of `result-checks.ts`: on every result that keeps
  // the contract, which the property tests of each calculator run in Node, both give the same
  it.each(VALID)('is the checked shape for %s', (_label, result) => {
    expect(shapeOf(fixtureBox, result)).toEqual(checkedShapeOf(fixtureBox, result));
  });

  it('lists the outputs in declaration order with their roles', () => {
    const [, result] = VALID[1] ?? ['', {}];
    expect(shapeOf(fixtureBox, result).outputs).toEqual([
      { key: 'area', role: 'primary', value: area },
      { key: 'cost', role: 'secondary', value: cost },
    ]);
  });
});
