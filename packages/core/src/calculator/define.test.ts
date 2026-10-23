import { describe, expect, it } from 'vitest';
import { CoreError } from '../errors.ts';
import { usd } from '../money/money.ts';
import { Rational } from '../rational/rational.ts';
import { ft, in2, inch } from '../units/catalog.ts';
import { multiply } from '../units/ops.ts';
import { quantity } from '../units/quantity.ts';
import { defineCalculator, DEFINITION_REASONS } from './define.ts';

const r = (n: number, d = 1): Rational => Rational.of(n, d);

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

// Definitions below are built untyped on purpose: the typed signature already rejects most of them,
// and the runtime check is what protects an untyped or cast caller.
type Definition = Parameters<typeof defineCalculator>[0];
const compute = (): never => {
  throw new Error('compute is never called by a definition test');
};
const count = { kind: 'count', key: 'cnt', urlKey: 'b', default: 3, min: 0, max: 100 };
const select = { kind: 'select', key: 'sel', urlKey: 'c', default: 'x', options: ['x', 'y'] };
const area = { key: 'area', measure: 'area', role: 'primary' };
const baseline = { id: 'box', inputs: [side, count, select], outputs: [area], compute };
const define = (patch: Record<string, unknown>): unknown =>
  defineCalculator({ ...baseline, ...patch } as unknown as Definition);
const reasonOf = (patch: Record<string, unknown>): unknown => {
  try {
    define(patch);
  } catch (error) {
    if (error instanceof CoreError) return [error.code, error.reason];
    throw error;
  }
  return undefined;
};
const withInputs = (...inputs: unknown[]): Record<string, unknown> => ({ inputs });
const withOutputs = (...outputs: unknown[]): Record<string, unknown> => ({ outputs });
const withSide = (patch: Record<string, unknown>): Record<string, unknown> =>
  withInputs({ ...side, ...patch });
const withCount = (patch: Record<string, unknown>): Record<string, unknown> =>
  withInputs({ ...count, ...patch });
const withOutput = (patch: Record<string, unknown>): Record<string, unknown> =>
  withOutputs({ ...area, ...patch });
const displayed = (display: Record<string, unknown>): Record<string, unknown> =>
  withOutput({ display });

// spec: calculator-contract › Definition-time validation: every reason, one fault per row
const rejected: [reason: string, label: string, patch: Record<string, unknown>][] = [
  // [CC6] identifiers
  ...['Rect Area', 'rect area', 'rect--area', 'rect-', '-rect', '1rect', ''].map(
    (id): [string, string, Record<string, unknown>] => ['INVALID_ID', `id ${id}`, { id }],
  ),
  ...['1abc', 'Abc', 'a-b', 'a b', ''].flatMap(
    (key): [string, string, Record<string, unknown>][] => [
      ['INVALID_KEY', `input key ${key}`, withSide({ key })],
      ['INVALID_KEY', `output key ${key}`, withOutput({ key })],
      ['INVALID_KEY', `warning code ${key}`, { warnings: [key] }],
    ],
  ),
  ...['abcd', '', 'A', '1a', 'a-', 'a b'].map(
    (urlKey): [string, string, Record<string, unknown>] => [
      'INVALID_URL_KEY',
      `urlKey ${urlKey}`,
      withSide({ urlKey }),
    ],
  ),
  // [CC4] reserved keys
  ['RESERVED_URL_KEY', 'urlKey v', withSide({ urlKey: 'v' })],
  ['RESERVED_URL_KEY', 'urlKey u', withSide({ urlKey: 'u' })],
  ['RESERVED_URL_KEY', 'a retired key', { ...withSide({ urlKey: 'q' }), retiredUrlKeys: ['q'] }],
  // [CC3] duplicates
  ['DUPLICATE_KEY', 'input keys', withInputs(side, { ...count, key: 'side' })],
  ['DUPLICATE_KEY', 'warning codes', { warnings: ['big', 'big'] }],
  ['DUPLICATE_URL_KEY', 'two a', withInputs(side, { ...count, urlKey: 'a' })],
  // [CC8]
  ['NO_INPUTS', 'no inputs', withInputs()],
  ['NO_OPTIONS', 'no options', withInputs({ ...select, options: [] })],
  ['DUPLICATE_OPTION', 'x twice', withInputs({ ...select, options: ['x', 'x'] })],
  ...['X', 'x_y', '-x', 'x-', 'x--y', ''].map(
    (option): [string, string, Record<string, unknown>] => [
      'INVALID_OPTION_ID',
      `option ${option}`,
      withInputs({ ...select, options: ['x', option] }),
    ],
  ),
  // [CC6] units and bounds
  ['INVALID_UNIT', 'metricDefaultUnit ft', withSide({ metricDefaultUnit: 'ft' })],
  ['INVALID_UNIT', 'metricDefaultUnit in', withSide({ metricDefaultUnit: 'in' })],
  ['INVALID_UNIT', 'defaultUnit m', withSide({ defaultUnit: 'm' })],
  ['INVALID_UNIT', 'defaultUnit cm', withSide({ defaultUnit: 'cm' })],
  [
    'INVALID_BOUNDS',
    'percent min 50 max 10',
    withInputs({ kind: 'percent', key: 'p', urlKey: 'p', default: r(20), min: r(50), max: r(10) }),
  ],
  [
    'INVALID_BOUNDS',
    'negative money min',
    withInputs({ kind: 'money', key: 'm', urlKey: 'm', default: usd(0), min: usd(-1) }),
  ],
  [
    'INVALID_BOUNDS',
    'money min above max',
    withInputs({ kind: 'money', key: 'm', urlKey: 'm', default: usd(5), min: usd(6), max: usd(5) }),
  ],
  [
    'INVALID_BOUNDS',
    'length min above max',
    withSide({ min: quantity(2, ft), max: quantity(1, ft) }),
  ],
  ['INVALID_BOUNDS', 'count min above max', withCount({ min: 5, max: 4, default: 5 })],
  ['INVALID_BOUNDS', 'negative count min', withCount({ min: -1 })],
  ['INVALID_BOUNDS', 'fractional count min', withCount({ min: 1.5 })],
  ['INVALID_BOUNDS', 'unsafe count max', withCount({ max: 2 ** 53 })],
  // [CC5] defaults
  ['DEFAULT_INVALID', 'count below min', withCount({ min: 5, max: 10, default: 3 })],
  ['DEFAULT_INVALID', 'count above max', withCount({ default: 101 })],
  ['DEFAULT_INVALID', 'negative count', withCount({ default: -1 })],
  ['DEFAULT_INVALID', 'fractional count', withCount({ default: 1.5 })],
  ['DEFAULT_INVALID', 'select outside options', withInputs({ ...select, default: 'z' })],
  [
    'DEFAULT_INVALID',
    'percent above 100',
    withInputs({ kind: 'percent', key: 'p', urlKey: 'p', default: r(201, 2) }),
  ],
  [
    'DEFAULT_INVALID',
    'negative money',
    withInputs({ kind: 'money', key: 'm', urlKey: 'm', default: usd(-1) }),
  ],
  ['DEFAULT_INVALID', 'length above max', withSide({ max: quantity(1, inch) })],
  // [CC7] outputs
  ['NO_OUTPUTS', 'no outputs', withOutputs()],
  ['DUPLICATE_OUTPUT_KEY', 'two area', withOutputs(area, { ...area, role: 'secondary' })],
  ['PRIMARY_COUNT', 'no primary', withOutput({ role: 'secondary' })],
  ['PRIMARY_COUNT', 'two primaries', withOutputs(area, { ...area, key: 'other' })],
  ['INVALID_DISPLAY', 'area in ft', displayed({ unit: 'ft', format: 'decimal', places: 2 })],
  ['INVALID_DISPLAY', 'places 13', displayed({ unit: 'ft2', format: 'decimal', places: 13 })],
  ['INVALID_DISPLAY', 'places -1', displayed({ unit: 'ft2', format: 'decimal', places: -1 })],
  ['INVALID_DISPLAY', 'places 1.5', displayed({ unit: 'ft2', format: 'decimal', places: 1.5 })],
  [
    'INVALID_DISPLAY',
    'fraction on an area',
    displayed({ unit: 'ft2', format: 'fraction', denominator: 16 }),
  ],
  [
    'INVALID_KEY',
    'a bad second output key',
    withOutputs(area, { ...area, key: '1abc', role: 'secondary' }),
  ],
  ['INVALID_KEY', 'a bad second warning code', { warnings: ['big', '1abc'] }],
  [
    'INVALID_DISPLAY',
    'money with a display',
    withOutputs(area, {
      key: 'cost',
      measure: 'money',
      role: 'secondary',
      display: { unit: 'ft2', format: 'decimal', places: 2 },
    }),
  ],
  ...[65, 1, 2.5].map((denominator): [string, string, Record<string, unknown>] => [
    'INVALID_DISPLAY',
    `denominator ${String(denominator)}`,
    withOutputs({
      key: 'len',
      measure: 'length',
      role: 'primary',
      display: { unit: 'in', format: 'fraction', denominator },
    }),
  ]),
];

describe('defineCalculator validation (calculator-contract › Definition-time validation)', () => {
  it('lists every reason of the spec once', () => {
    expect([...DEFINITION_REASONS].sort()).toEqual(
      [...new Set(rejected.map(([reason]) => reason))].sort(),
    );
  });

  it.each(rejected)('throws INVALID_DEFINITION %s for %s', (reason, _label, patch) => {
    expect(reasonOf(patch)).toEqual(['INVALID_DEFINITION', reason]);
  });

  // the accepted side of every boundary above
  it.each([
    ['id with digits and hyphens', { id: 'rect-2-area' }],
    ['keys with capitals and digits', withSide({ key: 'aB1' })],
    ['urlKey of one character', withSide({ urlKey: 'a' })],
    ['urlKey of three characters', withSide({ urlKey: 'abc' })],
    ['urlKey with a digit', withSide({ urlKey: 'a1' })],
    ['option ids with digits and hyphens', withInputs({ ...select, options: ['x', '1', 'a1-b2'] })],
    ['a retired key that no field uses', { retiredUrlKeys: ['q'] }],
    ['metric default units mm and m', withSide({ metricDefaultUnit: 'mm' })],
    ['imperial default unit yd', withSide({ defaultUnit: 'yd' })],
    ['imperial default unit ft', withSide({ defaultUnit: 'ft' })],
    ['metric default unit m', withSide({ metricDefaultUnit: 'm' })],
    ['a boolean input', withInputs({ kind: 'boolean', key: 'flg', urlKey: 'f', default: false })],
    ['a count without bounds', withInputs({ kind: 'count', key: 'c', urlKey: 'c', default: 3 })],
    ['a count with equal bounds', withCount({ min: 4, max: 4, default: 4 })],
    ['a count at the safe maximum', withCount({ max: Number.MAX_SAFE_INTEGER, default: 0 })],
    ['a length with equal bounds', withSide({ min: quantity(2, inch), max: quantity(2, inch) })],
    [
      'a money minimum of $0',
      withInputs({ kind: 'money', key: 'm', urlKey: 'm', default: usd(0), min: usd(0) }),
    ],
    [
      'a percent default on its bounds',
      withInputs({ kind: 'percent', key: 'p', urlKey: 'p', default: r(100) }),
    ],
    ['a decimal display with 0 places', displayed({ unit: 'ft2', format: 'decimal', places: 0 })],
    ['a decimal display with 12 places', displayed({ unit: 'm2', format: 'decimal', places: 12 })],
    [
      'a fraction display with denominator 2',
      withOutputs({
        key: 'len',
        measure: 'length',
        role: 'primary',
        display: { unit: 'ft', format: 'fraction', denominator: 2 },
      }),
    ],
    [
      'a fraction display with denominator 64',
      withOutputs({
        key: 'len',
        measure: 'length',
        role: 'primary',
        display: { unit: 'mm', format: 'fraction', denominator: 64 },
      }),
    ],
    [
      'a secondary money output',
      withOutputs(area, { key: 'cost', measure: 'money', role: 'secondary' }),
    ],
    [
      'an intermediate output',
      withOutputs(area, { key: 'half', measure: 'area', role: 'intermediate' }),
    ],
  ])('accepts %s', (_label, patch) => {
    expect(reasonOf(patch)).toBeUndefined();
  });
});
