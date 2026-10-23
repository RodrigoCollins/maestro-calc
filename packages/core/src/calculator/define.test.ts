import { describe, expect, it } from 'vitest';
import { usd } from '../money/money.ts';
import { in2, inch } from '../units/catalog.ts';
import { multiply } from '../units/ops.ts';
import { quantity } from '../units/quantity.ts';
import { defineCalculator } from './define.ts';

const side = {
  kind: 'length',
  key: 'side',
  urlKey: 'a',
  default: quantity(2, inch),
  defaultUnit: 'in',
  metricDefaultUnit: 'cm',
} as const;
const outputs = [
  { key: 'area', measure: 'area', role: 'primary' },
  { key: 'cost', measure: 'money', role: 'secondary' },
] as const;

describe('defineCalculator (calculator-contract › Field kinds and descriptors)', () => {
  // spec: calculator-contract › Descriptor metadata is queryable [CC1]
  it('keeps the declared metadata and runs the given compute', () => {
    const box = defineCalculator({
      id: 'box',
      inputs: [side],
      outputs,
      warnings: ['bigSide'],
      retiredUrlKeys: ['z'],
      compute: (inputs) => ({
        outputs: { area: multiply(inputs.side, inputs.side), cost: usd(3) },
        shopping: [],
        warnings: [{ code: 'bigSide', params: { side: 2 } }],
      }),
    });
    expect([box.id, box.inputs, box.outputs]).toEqual(['box', [side], outputs]);
    expect([box.warnings, box.retiredUrlKeys]).toEqual([['bigSide'], ['z']]);
    // 3 in x 3 in = 9 in2
    const result = box.compute({ side: quantity(3, inch) });
    expect(result.outputs).toEqual({ area: quantity(9, in2), cost: usd(3) });
    expect(Object.isFrozen(box)).toBe(true);
  });

  it('defaults the warnings and the retired URL keys to empty lists', () => {
    const plain = defineCalculator({
      id: 'plain',
      inputs: [side],
      outputs,
      compute: (inputs) => ({
        outputs: { area: multiply(inputs.side, inputs.side), cost: usd(0) },
        shopping: [],
        warnings: [],
      }),
    });
    expect([plain.warnings, plain.retiredUrlKeys]).toEqual([[], []]);
  });
});
