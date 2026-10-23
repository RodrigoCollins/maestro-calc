import { describe, expect, it } from 'vitest';
import type { InputDescriptor } from '../calculator/descriptors.ts';
import { usd } from '../money/money.ts';
import { Rational } from '../rational/rational.ts';
import { in2, inch } from '../units/catalog.ts';
import { quantity } from '../units/quantity.ts';
import { fixtureBox } from './fixture-box.ts';

// The bounds and defaults as canonical strings, so the table below can be read against the spec.
const plain = (input: InputDescriptor): unknown => {
  const { key, kind, urlKey } = input;
  switch (input.kind) {
    case 'length':
      return {
        key,
        kind,
        urlKey,
        default: input.default.canonical.toString(),
        defaultUnit: input.defaultUnit,
        metricDefaultUnit: input.metricDefaultUnit,
        min: input.min?.canonical.toString(),
        max: input.max?.canonical.toString(),
      };
    case 'money':
      return {
        key,
        kind,
        urlKey,
        default: input.default.amount.toString(),
        min: input.min?.amount.toString(),
        max: input.max?.amount.toString(),
      };
    case 'percent':
      return { key, kind, urlKey, default: input.default.toString() };
    default:
      return { ...input };
  }
};

describe('fixture-box (calculator-contract › Descriptor metadata is queryable)', () => {
  // spec: calculator-contract › Descriptor metadata is queryable [CC1]
  it('lists the six inputs in declaration order with their metadata', () => {
    expect(fixtureBox.inputs.map(plain)).toEqual([
      {
        key: 'len',
        kind: 'length',
        urlKey: 'a',
        default: '12',
        defaultUnit: 'in',
        metricDefaultUnit: 'cm',
        min: '0',
        max: '1200',
      },
      { key: 'cnt', kind: 'count', urlKey: 'b', default: 3, min: 0, max: 100 },
      { key: 'pct', kind: 'percent', urlKey: 'c', default: '10' },
      { key: 'sel', kind: 'select', urlKey: 'd', default: 'x', options: ['x', 'y'] },
      { key: 'flg', kind: 'boolean', urlKey: 'e', default: false },
      { key: 'prc', kind: 'money', urlKey: 'f', default: '249/50', min: '0', max: '10000' },
    ]);
  });

  it('lists the percent bounds and the two outputs with role and display', () => {
    expect(fixtureBox.inputs[2]).toMatchObject({ min: Rational.ZERO, max: Rational.of(100) });
    expect(fixtureBox.outputs).toEqual([
      {
        key: 'area',
        measure: 'area',
        role: 'primary',
        display: { unit: 'ft2', format: 'decimal', places: 2 },
      },
      { key: 'cost', measure: 'money', role: 'secondary' },
    ]);
    expect([fixtureBox.id, fixtureBox.warnings, fixtureBox.retiredUrlKeys]).toEqual([
      'fixture-box',
      ['bigCount'],
      [],
    ]);
  });

  // spec: calculator-contract › Ordered outputs [CC23]: 12 x 12 = 144 in2, 3 x 249/50 = 747/50
  it('computes the area as len x len and the cost as prc x cnt', () => {
    const result = fixtureBox.compute({
      len: quantity(12, inch),
      cnt: 3,
      pct: Rational.of(10),
      sel: 'x',
      flg: false,
      prc: usd(Rational.of(249, 50)),
    });
    expect(result.outputs).toEqual({
      area: quantity(144, in2),
      cost: usd(Rational.of(747, 50)),
    });
    expect([result.shopping, result.warnings]).toEqual([[], []]);
  });
});
