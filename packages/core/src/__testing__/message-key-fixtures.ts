import { defineCalculator } from '../calculator/define.ts';
import { Rational } from '../rational/rational.ts';
import { inch, lb } from '../units/catalog.ts';
import { multiply } from '../units/ops.ts';
import { quantity } from '../units/quantity.ts';

/**
 * Two selects with their own options, a boolean between them and two warnings: the one definition
 * the runtime and the type tests of the message keys both read, so the two sets cannot drift.
 */
export const picker = defineCalculator({
  id: 'picker',
  inputs: [
    { kind: 'select', key: 'shape', urlKey: 'a', default: 'round', options: ['round', 'flat'] },
    { kind: 'boolean', key: 'trim', urlKey: 'b', default: false },
    { kind: 'select', key: 'grade', urlKey: 'c', default: 'one', options: ['one'] },
  ],
  outputs: [{ key: 'weight', measure: 'mass', role: 'primary' }],
  warnings: ['heavy', 'bulky'],
  compute: () => ({ outputs: { weight: quantity(1, lb) }, shopping: [], warnings: [] }),
});

const length = <const Key extends string>(key: Key, urlKey: string) =>
  ({
    kind: 'length',
    key,
    urlKey,
    default: quantity(Rational.of(12), inch),
    defaultUnit: 'in',
    metricDefaultUnit: 'cm',
  }) as const;

/** The shape of the proof calculator: two lengths, three area outputs, no select, no warning. */
export const rectangle = defineCalculator({
  id: 'rectangle-area',
  inputs: [length('length', 'l'), length('width', 'w')],
  outputs: [
    { key: 'areaFt2', measure: 'area', role: 'primary' },
    { key: 'areaYd2', measure: 'area', role: 'secondary' },
    { key: 'areaM2', measure: 'area', role: 'secondary' },
  ],
  compute: ({ length: l, width: w }) => {
    const area = multiply(l, w);
    return { outputs: { areaFt2: area, areaYd2: area, areaM2: area }, shopping: [], warnings: [] };
  },
});
