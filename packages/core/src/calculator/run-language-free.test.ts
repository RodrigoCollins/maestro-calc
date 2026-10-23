import { describe, expect, it } from 'vitest';
import { collectStrings } from '../__testing__/collect-strings.ts';
import { fixtureBox } from '../__testing__/fixture-box.ts';
import { isLanguageFree } from '../__testing__/language-free.ts';
import { usd } from '../money/money.ts';
import { Rational } from '../rational/rational.ts';
import { in2 } from '../units/catalog.ts';
import { quantity } from '../units/quantity.ts';
import { defineCalculator } from './define.ts';

const good = {
  outputs: { area: quantity(144, in2), cost: usd(Rational.of(747, 50)) },
  shopping: [],
  warnings: [],
};

/** The run result of a fixture-box whose `compute` returns `computed`, reached by a cast. */
const ran = (computed: unknown): unknown =>
  defineCalculator({
    id: 'fixture-box',
    inputs: fixtureBox.inputs,
    outputs: fixtureBox.outputs,
    warnings: fixtureBox.warnings,
    compute: () => computed as ReturnType<typeof fixtureBox.compute>,
  }).run({});

describe('the result of run (calculator-contract › Language-free results)', () => {
  // spec: calculator-contract › Language-free results [CC25]
  it('holds only identifiers, canonical Rationals and the currency code', () => {
    const strings = collectStrings(fixtureBox.run({}));
    expect(strings).toEqual(['area', 'primary', '144', 'cost', 'secondary', 'USD', '747/50']);
    expect(strings.filter((text) => !isLanguageFree(text))).toEqual([]);
  });

  it('collects the strings of shopping lines and warnings too', () => {
    const shopping = [{ materialId: 'plywood-sheet', purchaseUnit: 'sheet', qty: 5n }];
    const warnings = [{ code: 'bigCount', params: { cnt: 101, unit: 'in' } }];
    expect(collectStrings(ran({ ...good, shopping, warnings }))).toEqual([
      'area',
      'primary',
      '144',
      'cost',
      'secondary',
      'USD',
      '747/50',
      'plywood-sheet',
      'sheet',
      'bigCount',
      'in',
    ]);
  });

  it('flags a string that carries markup, prose or a Rational that is not reduced', () => {
    const shopping = [
      { materialId: '<b>', purchaseUnit: 'a sheet', qty: 1n },
      { materialId: '2/4', purchaseUnit: '1/1', qty: 1n },
    ];
    const bad = collectStrings(ran({ ...good, shopping })).filter((text) => !isLanguageFree(text));
    expect(bad).toEqual(['<b>', 'a sheet', '2/4', '1/1']);
  });
});
