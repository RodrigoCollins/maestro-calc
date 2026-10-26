import { encode, ft3, quantity, usd, type ValidateOptions } from '@maestro-calc/core';
import { enConcrete } from '@maestro-calc/i18n/catalogs/en/concrete';
import { CONCRETE_MIX_YIELDS } from '@maestro-calc/data/yields/concrete-mix';
import { describe, expect, it } from 'vitest';
import { concrete } from '../../lib/concrete.ts';
import type { Moment } from '../page-module.ts';
import { DASH, fieldText, fillMessage } from '../present.ts';
import { answerValues, bagFills, figuresOf } from './present.ts';

/** The state and the result of the concrete calculator for form strings; a failed run fails the test. */
const runOf = (raw: Readonly<Record<string, unknown>>, options?: ValidateOptions) => {
  const state = concrete.validate(raw, options);
  const result = concrete.run(raw, options);
  if (!state.ok || !result.ok) throw new Error('run failed');
  return { state: state.value, result: result.value };
};

/** The figures of a state in the US unit system. */
const figures = (raw: Readonly<Record<string, unknown>>) => {
  const { state, result } = runOf(raw);
  return figuresOf(state, result, CONCRETE_MIX_YIELDS, 'imperial');
};

describe('figures (calculator-page › [CP1], [CP2], [CP3], [CP15])', () => {
  // spec: calculator-page › [CP1] [CP3] [CP15] the default result
  it('gives the default figures and the bag yield line from the template', () => {
    const found = figures({});
    expect(found).toMatchObject({
      volumeYd3: '1.63',
      volumeFt3: '44.00',
      volumeM3: '1.25',
      netVolume: '40.00',
      bags: '74',
      bagLb: '80',
      bagYield: '0.60',
      bagCost: '$0.00',
      readyMixCost: '$0.00',
      bagCostVisible: false,
      readyMixCostVisible: false,
    });
    expect(fillMessage('About {yield} cubic feet per bag', { yield: found.bagYield })).toBe(
      'About 0.60 cubic feet per bag',
    );
  });

  // spec: calculator-page › [CP19]-[CP22] the live table, through the engine
  it.each([
    ['length 20', { length: '20' }, ['2.72', '73.33', '2.08', '66.67', '123']],
    ['bag 60', { bag: '60' }, ['1.63', '44.00', '1.25', '40.00', '98']],
    ['bag 40', { bag: '40' }, ['1.63', '44.00', '1.25', '40.00', '147']],
    ['waste 0', { waste: '0' }, ['1.48', '40.00', '1.13', '40.00', '67']],
    ['waste 15', { waste: '15' }, ['1.70', '46.00', '1.30', '40.00', '77']],
    ['footing', { shape: 'footing' }, ['0.43', '11.73', '0.33', '10.67', '20']],
    [
      'footing F1',
      { shape: 'footing', length: '216in', count: '3' },
      ['1.96', '52.80', '1.50', '48.00', '88'],
    ],
    ['column', { shape: 'column' }, ['0.26', '6.91', '0.20', '6.28', '12']],
    ['column C2', { shape: 'column', count: '4' }, ['1.02', '27.65', '0.78', '25.13', '47']],
    ['steps', { shape: 'steps' }, ['0.52', '14.12', '0.40', '12.83', '24']],
  ])('matches the spec row for %s', (_name, raw, [yards, feet, meters, net, bags]) => {
    expect(figures(raw)).toMatchObject({
      volumeYd3: yards,
      volumeFt3: feet,
      volumeM3: meters,
      netVolume: net,
      bags,
    });
  });

  // spec: calculator-page › [CP21] the yield line follows the bag
  it.each([
    ['60', '0.45'],
    ['40', '0.30'],
  ])('reads the yield of the %s lb bag as %s', (bag, bagYield) => {
    expect(figures({ bag })).toMatchObject({ bagLb: bag, bagYield });
  });

  // spec: calculator-page › [CP16] costs appear with a price
  it('shows the costs of the prices that are above zero', () => {
    expect(figures({ bagPrice: '6.50' })).toMatchObject({
      bagCost: '$481.00',
      bagCostVisible: true,
      readyMixCostVisible: false,
    });
    expect(figures({ bagPrice: '6.50', readyMixPrice: '150' })).toMatchObject({
      readyMixCost: '$244.44',
      readyMixCostVisible: true,
    });
  });

  // spec: calculator-page › [CP18] ready-mix is not rounded to a truck increment
  it('prices the exact volume of a 20 ft by 10 ft slab', () => {
    expect(figures({ length: '20', readyMixPrice: '150' })).toMatchObject({
      volumeYd3: '2.72',
      readyMixCost: '$407.41',
    });
  });

  // spec: calculator-page › [CP33] the unit system picks the large figure and the order
  it('orders the volumes by the unit system', () => {
    const { state, result } = runOf({});
    expect(figuresOf(state, result, CONCRETE_MIX_YIELDS, 'imperial').order).toEqual([
      'volumeYd3',
      'volumeFt3',
      'volumeM3',
    ]);
    expect(figuresOf(state, result, CONCRETE_MIX_YIELDS, 'metric').order).toEqual([
      'volumeM3',
      'volumeYd3',
      'volumeFt3',
    ]);
  });

  it('shows a zero-bag line and groups a very large bag count', () => {
    expect(figures({ length: '0' })).toMatchObject({ bags: '0', volumeYd3: '0.00' });
    expect(figures({ length: '1000', width: '1000', thickness: '10' }).bags).toBe('1,527,778');
  });
});

describe('a result the presenter cannot read is a programming error', () => {
  const { state, result } = runOf({});
  const without = (key: string) => ({
    ...result,
    outputs: result.outputs.filter((output) => output.key !== key),
  });
  const swapped = (key: string, value: unknown) => ({
    ...result,
    outputs: result.outputs.map((output) => (output.key === key ? { ...output, value } : output)),
  });
  const read = (broken: unknown) => () =>
    figuresOf(state, broken as typeof result, CONCRETE_MIX_YIELDS, 'imperial');

  it.each([
    ['an output is missing', without('netVolume'), 'no output netVolume'],
    ['a volume holds money', swapped('volumeFt3', usd(1)), 'volumeFt3 is not a volume'],
    ['a cost holds a volume', swapped('bagCost', quantity(1, ft3)), 'bagCost is not money'],
    ['the shopping line is missing', { ...result, shopping: [] }, 'no shopping line'],
  ])('throws when %s', (_name, broken, message) => {
    expect(read(broken)).toThrow(message);
  });

  it('throws when the yield of the chosen bag is missing', () => {
    expect(() => figuresOf(state, result, {}, 'imperial')).toThrow('no yield for the 80 lb bag');
  });
});

describe('answer sentences (calculator-page › [CP1], [CP2], [CP33]; i18n-catalog › [ICW13])', () => {
  const values = (
    raw: Readonly<Record<string, unknown>>,
    system: 'imperial' | 'metric',
    primary: string,
  ) => {
    const { state, result } = runOf(raw, { unitSystem: system });
    return answerValues(
      { system, choices: { shape: state.shape, bag: state.bag }, valid: state, result },
      primary,
    );
  };

  it('gives the placeholders of the slab sentence', () => {
    expect(values({}, 'imperial', '1.63 cubic yards')).toEqual({
      length: '12 ft',
      width: '10 ft',
      thickness: '4 in',
      volume: '1.63 cubic yards',
      waste: '10',
      bagLb: '80',
      bags: '74',
    });
  });

  // spec: calculator-page › [CP1] the default sentence, from the catalog template
  it('fills the English slab template into the sentence of the default page', () => {
    const template = enConcrete['calc.concrete.page.answer.slab'];
    expect(fillMessage(template, values({}, 'imperial', '1.63 cubic yards'))).toBe(
      'Slab (12 ft × 10 ft, 4 in thick): 1.63 cubic yards with 10% extra. Bags of 80 lb: 74.',
    );
  });

  // spec: calculator-page › [CP33] the metric sentence
  it('gives the metric text and the primary text under the metric system', () => {
    expect(values({}, 'metric', '1.25 cubic meters')).toMatchObject({
      length: '3.66 m',
      width: '3.05 m',
      thickness: '10.16 cm',
      volume: '1.25 cubic meters',
      bags: '74',
    });
  });

  it('gives the placeholders of the other three shapes', () => {
    expect(values({ shape: 'footing', count: '3' }, 'imperial', '1.30 cubic yards')).toEqual({
      count: '3',
      length: '12 ft',
      width: '1 ft 4 in',
      depth: '8 in',
      volume: '1.30 cubic yards',
      waste: '10',
      bagLb: '80',
      bags: '59',
    });
    expect(values({ shape: 'column' }, 'imperial', 'x')).toMatchObject({
      count: '1',
      diameter: '1 ft',
      height: '8 ft',
    });
    expect(values({ shape: 'steps' }, 'imperial', 'x')).toMatchObject({
      stepCount: '3',
      stepWidth: '4 ft',
      rise: '7 in',
      run: '11 in',
    });
  });
});

describe('metric entry (calculator-page › [CP34], [CP50])', () => {
  // spec: calculator-page › [CP34] 4 m, 3 m and 10 cm are exact inches in the link
  it('encodes the S3 metric state with exact inches', () => {
    const { state } = runOf({ length: '4', width: '3', thickness: '10' }, { unitSystem: 'metric' });
    expect(encode(concrete, state, { unitSystem: 'metric' })).toBe(
      'v=1&u=m&l=20000/127&w=15000/127&t=500/127',
    );
  });

  // spec: calculator-page › [CP50] a metric entry shown in the US system is exact inches
  it('shows 4 m as exact inches in the US system and as 4 m in the metric one', () => {
    const { state } = runOf({ length: '4' }, { unitSystem: 'metric' });
    expect(fieldText(state.length, { defaultUnit: 'ft', metricDefaultUnit: 'm' }, 'imperial')).toBe(
      '20000/127 in',
    );
    expect(fieldText(state.length, { defaultUnit: 'ft', metricDefaultUnit: 'm' }, 'metric')).toBe(
      '4 m',
    );
  });

  // spec: calculator-page › [CP33] the toggle never changes the state, only its text
  it('computes the same volumes whichever system the text is written in', () => {
    const us = figures({ length: '12', width: '10', thickness: '4in' });
    const { state, result } = runOf(
      { length: '3.6576', width: '3.048', thickness: '10.16' },
      {
        unitSystem: 'metric',
      },
    );
    expect(figuresOf(state, result, CONCRETE_MIX_YIELDS, 'metric')).toMatchObject({
      volumeYd3: us.volumeYd3,
      volumeM3: us.volumeM3,
      bags: us.bags,
    });
  });
});

describe('the bag line of the shopping slot (calculator-page › [CP21], [CP54])', () => {
  const momentOf = (bag: string, withResult: boolean): Moment<typeof concrete> => {
    const { state, result } = runOf({ bag });
    return {
      system: 'imperial',
      choices: { shape: 'slab', bag },
      valid: state,
      result: withResult ? result : undefined,
    };
  };

  // spec: calculator-page › [CP21] the pounds and the yield follow the bag
  it.each([
    ['80', '0.60'],
    ['60', '0.45'],
    ['40', '0.30'],
  ])('fills the %s lb bag with a yield of %s cubic feet', (bag, bagYield) => {
    expect(bagFills(momentOf(bag, true), CONCRETE_MIX_YIELDS)).toEqual({
      bagLb: bag,
      yield: bagYield,
    });
  });

  // spec: calculator-page › [CP30] every figure is a dash while a field is invalid
  it('keeps the pounds and shows a dash for the yield without a result', () => {
    expect(bagFills(momentOf('60', false), CONCRETE_MIX_YIELDS)).toEqual({
      bagLb: '60',
      yield: DASH,
    });
  });

  it('throws when the yield of the chosen bag is missing', () => {
    expect(() => bagFills(momentOf('80', true), {})).toThrow('no yield for the 80 lb bag');
  });
});
