import { describe, expect, it } from 'vitest';
import { CONCRETE_YIELDS } from '../../__testing__/concrete-yields.ts';
import { usd } from '../../money/money.ts';
import { Rational } from '../../rational/rational.ts';
import { inch } from '../../units/catalog.ts';
import { valueIn } from '../../units/quantity.ts';
import { createConcrete } from './index.ts';

const concrete = createConcrete(CONCRETE_YIELDS);

/** key, urlKey, default in inches, default unit, metric unit, min and max in inches. */
const LENGTHS = [
  ['length', 'l', 144, 'ft', 'm', 0, 12000],
  ['width', 'w', 120, 'ft', 'm', 0, 12000],
  ['thickness', 't', 4, 'in', 'cm', 0, 120],
  ['footingWidth', 'fw', 16, 'in', 'cm', 0, 120],
  ['footingDepth', 'fd', 8, 'in', 'cm', 0, 120],
  ['diameter', 'd', 12, 'in', 'cm', 0, 240],
  ['height', 'h', 96, 'ft', 'm', 0, 1200],
  ['stepWidth', 'sw', 48, 'ft', 'm', 0, 1200],
  ['rise', 'rs', 7, 'in', 'cm', 0, 60],
  ['run', 'rn', 11, 'in', 'cm', 0, 60],
] as const;

describe('concrete descriptors (calc-concrete › Descriptor and permanent URL contract)', () => {
  // spec: calc-concrete › [CC1] Metadata (inputs, in order)
  it('declares the 17 inputs in the order of the table', () => {
    expect(concrete.id).toBe('concrete');
    expect(concrete.inputs.map(({ key, urlKey, kind }) => [key, urlKey, kind])).toEqual([
      ['shape', 'sh', 'select'],
      ['length', 'l', 'length'],
      ['width', 'w', 'length'],
      ['thickness', 't', 'length'],
      ['footingWidth', 'fw', 'length'],
      ['footingDepth', 'fd', 'length'],
      ['diameter', 'd', 'length'],
      ['height', 'h', 'length'],
      ['stepWidth', 'sw', 'length'],
      ['rise', 'rs', 'length'],
      ['run', 'rn', 'length'],
      ['stepCount', 'ns', 'count'],
      ['count', 'n', 'count'],
      ['waste', 'ws', 'percent'],
      ['bag', 'bg', 'select'],
      ['bagPrice', 'bp', 'money'],
      ['readyMixPrice', 'rp', 'money'],
    ]);
  });

  // spec: calc-concrete › [CC1] Metadata (lengths: defaults, default units, bounds)
  it.each(LENGTHS)(
    'declares %s with its default, units and bounds',
    (key, urlKey, standard, unit, metric, min, max) => {
      const input = concrete.inputs.find((candidate) => candidate.key === key);
      if (input?.kind !== 'length') throw new Error(`${key} is not a length`);
      expect(input.urlKey).toBe(urlKey);
      expect(valueIn(input.default, inch)).toEqual(Rational.of(standard));
      expect(input.defaultUnit).toBe(unit);
      expect(input.metricDefaultUnit).toBe(metric);
      expect(input.min && valueIn(input.min, inch)).toEqual(Rational.of(min));
      expect(input.max && valueIn(input.max, inch)).toEqual(Rational.of(max));
    },
  );

  // spec: calc-concrete › [CC1] Metadata (counts, percent, selects, money)
  it('declares the counts, the percent, the selects and the prices', () => {
    const byKey = Object.fromEntries(concrete.inputs.map((input) => [input.key, input]));
    expect(byKey['stepCount']).toMatchObject({ default: 3, min: 0, max: 50 });
    expect(byKey['count']).toMatchObject({ default: 1, min: 1, max: 1000 });
    expect(byKey['waste']).toMatchObject({
      default: Rational.of(10),
      min: Rational.ZERO,
      max: Rational.of(50),
    });
    expect(byKey['shape']).toMatchObject({
      default: 'slab',
      options: ['slab', 'footing', 'column'],
    });
    expect(byKey['bag']).toMatchObject({ default: '80', options: ['40', '60', '80'] });
    expect(byKey['bagPrice']).toMatchObject({ default: usd(0), max: usd(10000) });
    expect(byKey['readyMixPrice']).toMatchObject({ default: usd(0), max: usd(10000) });
  });

  // spec: calc-concrete › [CC1] Metadata (outputs and display hints, no warnings)
  it('declares the six outputs with their roles and display hints and no warnings', () => {
    expect(concrete.outputs).toEqual([
      {
        key: 'volumeYd3',
        measure: 'volume',
        role: 'primary',
        display: { unit: 'yd3', format: 'decimal', places: 2 },
      },
      {
        key: 'volumeFt3',
        measure: 'volume',
        role: 'secondary',
        display: { unit: 'ft3', format: 'decimal', places: 2 },
      },
      {
        key: 'volumeM3',
        measure: 'volume',
        role: 'secondary',
        display: { unit: 'm3', format: 'decimal', places: 2 },
      },
      {
        key: 'netVolume',
        measure: 'volume',
        role: 'intermediate',
        display: { unit: 'ft3', format: 'decimal', places: 2 },
      },
      { key: 'bagCost', measure: 'money', role: 'secondary' },
      { key: 'readyMixCost', measure: 'money', role: 'secondary' },
    ]);
    expect(concrete.warnings).toEqual([]);
  });

  // spec: calc-concrete › [CC3] urlKeys are legal
  it('uses legal, distinct url keys and none of the reserved v and u', () => {
    const keys = concrete.inputs.map(({ urlKey }) => urlKey);
    for (const key of keys) expect(key).toMatch(/^[a-z][a-z0-9]{0,2}$/);
    expect(keys).not.toContain('v');
    expect(keys).not.toContain('u');
    expect(new Set(keys).size).toBe(keys.length);
  });

  // spec: calc-concrete › [CC1] Metadata (one shopping line, language-free identifiers)
  it('declares exactly one shopping line, for the chosen bag', () => {
    for (const bag of ['40', '60', '80']) {
      const result = concrete.run({ bag });
      if (!result.ok) throw new Error('run failed');
      expect(
        result.value.shopping.map(({ materialId, purchaseUnit }) => [materialId, purchaseUnit]),
      ).toEqual([['concrete-mix', `bag-${bag}`]]);
    }
  });
});
