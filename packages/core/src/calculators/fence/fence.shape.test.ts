import { describe, expect, it } from 'vitest';
import { collectStrings } from '../../__testing__/collect-strings.ts';
import { CONCRETE_YIELDS } from '../../__testing__/concrete-yields.ts';
import { isLanguageFree } from '../../__testing__/language-free.ts';
import { Rational } from '../../rational/rational.ts';
import { ft3, inch } from '../../units/catalog.ts';
import { quantity, valueIn } from '../../units/quantity.ts';
import { createFence } from './index.ts';

const fence = createFence(CONCRETE_YIELDS);

/** key, urlKey, default in inches, default unit, metric unit, min and max in inches. */
const LENGTHS = [
  ['length', 'l', 1200, 'ft', 'm', 12, 60000],
  ['height', 'h', 72, 'ft', 'm', 12, 144],
  ['spacing', 'sp', 96, 'ft', 'm', 12, 144],
  ['boardWidth', 'bw', 5.5, 'in', 'cm', 1, 12],
  ['gap', 'gp', 2.5, 'in', 'cm', 0, 12],
  ['boardSpace', 'bs', 4, 'in', 'cm', 0, 12],
  ['postWidth', 'pw', 3.5, 'in', 'cm', 1, 12],
] as const;

const ran = () => {
  const result = fence.run({ postPrice: '20', railPrice: '8', boardPrice: '3', bagPrice: '6' });
  if (!result.ok) throw new Error('run failed');
  return result.value;
};

describe('fence descriptors and result shape (calc-fence › Inputs, Materials, Holes and cost)', () => {
  // spec: calc-fence › [FN1] the 15 inputs, in order, the style's fields right after it
  it('declares the 15 inputs in order', () => {
    expect(fence.id).toBe('fence');
    expect(fence.inputs.map(({ key, urlKey, kind }) => [key, urlKey, kind])).toEqual([
      ['length', 'l', 'length'],
      ['height', 'h', 'length'],
      ['spacing', 'sp', 'length'],
      ['style', 's', 'select'],
      ['boardWidth', 'bw', 'length'],
      ['gap', 'gp', 'length'],
      ['boardSpace', 'bs', 'length'],
      ['rails', 'r', 'count'],
      ['gates', 'g', 'count'],
      ['postWidth', 'pw', 'length'],
      ['bag', 'bg', 'select'],
      ['postPrice', 'pp', 'money'],
      ['railPrice', 'rp', 'money'],
      ['boardPrice', 'bp', 'money'],
      ['bagPrice', 'cp', 'money'],
    ]);
  });

  it.each(LENGTHS)(
    'declares %s with its default, units and bounds',
    (key, urlKey, standard, unit, metric, min, max) => {
      const input = fence.inputs.find((candidate) => candidate.key === key);
      if (input?.kind !== 'length') throw new Error(`${key} is not a length`);
      expect(input.urlKey).toBe(urlKey);
      expect(valueIn(input.default, inch)).toEqual(Rational.of(standard * 2, 2));
      expect(input.defaultUnit).toBe(unit);
      expect(input.metricDefaultUnit).toBe(metric);
      expect(input.min && valueIn(input.min, inch)).toEqual(Rational.of(min * 2, 2));
      expect(input.max && valueIn(input.max, inch)).toEqual(Rational.of(max * 2, 2));
    },
  );

  it('declares the selects and the counts', () => {
    const byKey = Object.fromEntries(fence.inputs.map((input) => [input.key, input]));
    expect(byKey['style']).toMatchObject({
      default: 'privacy',
      options: ['privacy', 'picket', 'rail'],
    });
    expect(byKey['bag']).toMatchObject({ default: '80', options: ['40', '60', '80'] });
    expect(byKey['rails']).toMatchObject({ default: 3, min: 1, max: 6 });
    expect(byKey['gates']).toMatchObject({ default: 0, min: 0, max: 50 });
  });

  // spec: calc-fence › [FN2] the outputs, the four shopping lines and no warnings
  it('lists the outputs in order with their roles, four shopping lines and no warnings', () => {
    const { outputs, shopping, warnings } = ran();
    expect(outputs.map(({ key, role }) => [key, role])).toEqual([
      ['posts', 'primary'],
      ['postLength', 'secondary'],
      ['holeDiameter', 'secondary'],
      ['holeDepth', 'secondary'],
      ['concreteFt3', 'secondary'],
      ['gravelFt3', 'secondary'],
      ['postCost', 'secondary'],
      ['railCost', 'secondary'],
      ['boardCost', 'secondary'],
      ['bagCost', 'secondary'],
    ]);
    expect(shopping.map(({ materialId, purchaseUnit }) => [materialId, purchaseUnit])).toEqual([
      ['fence-post', 'post'],
      ['fence-rail', 'rail'],
      ['fence-board', 'board'],
      ['concrete-mix', 'bag-80'],
    ]);
    expect(warnings).toEqual([]);
  });

  it('holds only language-free strings', () => {
    expect(collectStrings(ran()).every(isLanguageFree)).toBe(true);
  });

  // spec: calc-fence › [FN3] the factory checks the bag yields it is given
  it.each([
    ['null', null],
    ['a missing bag', { 'bag-40': CONCRETE_YIELDS['bag-40'], 'bag-60': CONCRETE_YIELDS['bag-60'] }],
    ['a zero yield', { ...CONCRETE_YIELDS, 'bag-80': quantity(0, ft3) }],
    ['an extra key', { ...CONCRETE_YIELDS, 'bag-90': quantity(1, ft3) }],
  ])('refuses %s as bag yields', (_name, yields) => {
    expect(() => createFence(yields as never)).toThrow();
  });
});
