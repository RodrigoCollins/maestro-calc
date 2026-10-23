import { describe, expect, it } from 'vitest';
import { CoreError } from '../errors.ts';
import { usd } from '../money/money.ts';
import { Rational } from '../rational/rational.ts';
import { ft, in2, inch } from '../units/catalog.ts';
import { multiply } from '../units/ops.ts';
import { quantity } from '../units/quantity.ts';
import { defineCalculator, DEFINITION_REASONS, type DefinitionReason } from './define.ts';

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

  // The registry shares one definition with every page: nothing reachable from it may change.
  it('freezes the metadata at every level, so no list or descriptor can be altered', () => {
    const mode = {
      kind: 'select',
      key: 'mode',
      urlKey: 'b',
      default: 'x',
      options: ['x', 'y'],
    } as const;
    const lengthOutput = {
      key: 'len',
      measure: 'length',
      role: 'primary',
      display: { unit: 'ft', format: 'decimal', places: 2 },
    } as const;
    const frozen = defineCalculator({
      id: 'frozen',
      inputs: [side, mode],
      outputs: [lengthOutput],
      warnings: ['bigSide'],
      retiredUrlKeys: ['z'],
      compute: () => ({ outputs: { len: quantity(1, ft) }, shopping: [], warnings: [] }),
    });
    expect([
      Object.isFrozen(frozen.inputs),
      Object.isFrozen(frozen.inputs[0]),
      Object.isFrozen(frozen.inputs[1]),
      Object.isFrozen(frozen.inputs[1].options),
      Object.isFrozen(frozen.outputs),
      Object.isFrozen(frozen.outputs[0]),
      Object.isFrozen(frozen.outputs[0].display),
      Object.isFrozen(frozen.warnings),
      Object.isFrozen(frozen.retiredUrlKeys),
    ]).toEqual(Array<boolean>(9).fill(true));
    // a mutation attempt throws in strict mode instead of silently changing what validate reads
    expect(() => Array.prototype.push.call(frozen.inputs[1].options, 'z')).toThrow(TypeError);
    expect(frozen.validate({ mode: 'z' })).toEqual({
      ok: false,
      errors: [{ field: 'mode', code: 'UNKNOWN_OPTION' }],
    });
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
    expect([Object.isFrozen(plain.warnings), Object.isFrozen(plain.retiredUrlKeys)]).toEqual([
      true,
      true,
    ]);
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
// The rejection of a patched baseline: the code, the reason and the locus carried as the cause.
const rejection = (patch: Record<string, unknown>): unknown => {
  try {
    define(patch);
  } catch (error) {
    if (error instanceof CoreError) {
      return { code: error.code, reason: error.reason, locus: error.cause };
    }
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
// A row is the reason, a label, the patch of the baseline and the key of the input, output or
// warning where the fault is (none when it belongs to the calculator as a whole).
type Patch = Record<string, unknown>;
type Row = [reason: DefinitionReason, label: string, patch: Patch, field: string | undefined];
const row = (reason: DefinitionReason, label: string, patch: Patch, field?: string): Row => [
  reason,
  label,
  patch,
  field,
];
const rejected: Row[] = [
  // [CC6] identifiers
  ...['Rect Area', 'rect area', 'rect--area', 'rect-', '-rect', '1rect', ''].map((id) =>
    row('INVALID_ID', `id ${id}`, { id }),
  ),
  ...['1abc', 'Abc', 'a-b', 'a b', ''].flatMap((key) => [
    row('INVALID_KEY', `input key ${key}`, withSide({ key }), key),
    row('INVALID_KEY', `output key ${key}`, withOutput({ key }), key),
    row('INVALID_KEY', `warning code ${key}`, { warnings: [key] }, key),
  ]),
  ...['abcd', '', 'A', '1a', 'a-', 'a b'].map((urlKey) =>
    row('INVALID_URL_KEY', `urlKey ${urlKey}`, withSide({ urlKey }), 'side'),
  ),
  // [CC4] reserved keys
  row('RESERVED_URL_KEY', 'urlKey v', withSide({ urlKey: 'v' }), 'side'),
  row('RESERVED_URL_KEY', 'urlKey u', withSide({ urlKey: 'u' }), 'side'),
  row(
    'RESERVED_URL_KEY',
    'a retired key',
    { ...withSide({ urlKey: 'q' }), retiredUrlKeys: ['q'] },
    'side',
  ),
  // [CC3] duplicates: the field is the second one
  row('DUPLICATE_KEY', 'input keys', withInputs(side, { ...count, key: 'side' }), 'side'),
  row('DUPLICATE_KEY', 'warning codes', { warnings: ['big', 'big'] }, 'big'),
  row('DUPLICATE_URL_KEY', 'two a', withInputs(side, { ...count, urlKey: 'a' }), 'cnt'),
  // [CC8]
  row('NO_INPUTS', 'no inputs', withInputs()),
  row('NO_OPTIONS', 'no options', withInputs({ ...select, options: [] }), 'sel'),
  row('DUPLICATE_OPTION', 'x twice', withInputs({ ...select, options: ['x', 'x'] }), 'sel'),
  ...['X', 'x_y', '-x', 'x-', 'x--y', ''].map((option) =>
    row(
      'INVALID_OPTION_ID',
      `option ${option}`,
      withInputs({ ...select, options: ['x', option] }),
      'sel',
    ),
  ),
  // [CC6] units and bounds
  row('INVALID_UNIT', 'metricDefaultUnit ft', withSide({ metricDefaultUnit: 'ft' }), 'side'),
  row('INVALID_UNIT', 'metricDefaultUnit in', withSide({ metricDefaultUnit: 'in' }), 'side'),
  row('INVALID_UNIT', 'defaultUnit m', withSide({ defaultUnit: 'm' }), 'side'),
  row('INVALID_UNIT', 'defaultUnit cm', withSide({ defaultUnit: 'cm' }), 'side'),
  row(
    'INVALID_BOUNDS',
    'percent min 50 max 10',
    withInputs({ kind: 'percent', key: 'p', urlKey: 'p', default: r(20), min: r(50), max: r(10) }),
    'p',
  ),
  row(
    'INVALID_BOUNDS',
    'negative money min',
    withInputs({ kind: 'money', key: 'm', urlKey: 'm', default: usd(0), min: usd(-1) }),
    'm',
  ),
  row(
    'INVALID_BOUNDS',
    'money min above max',
    withInputs({ kind: 'money', key: 'm', urlKey: 'm', default: usd(5), min: usd(6), max: usd(5) }),
    'm',
  ),
  row(
    'INVALID_BOUNDS',
    'length min above max',
    withSide({ min: quantity(2, ft), max: quantity(1, ft) }),
    'side',
  ),
  row('INVALID_BOUNDS', 'count min above max', withCount({ min: 5, max: 4, default: 5 }), 'cnt'),
  row('INVALID_BOUNDS', 'negative count min', withCount({ min: -1 }), 'cnt'),
  row('INVALID_BOUNDS', 'fractional count min', withCount({ min: 1.5 }), 'cnt'),
  row('INVALID_BOUNDS', 'unsafe count max', withCount({ max: 2 ** 53 }), 'cnt'),
  // [CC5] defaults
  row('DEFAULT_INVALID', 'count below min', withCount({ min: 5, max: 10, default: 3 }), 'cnt'),
  row('DEFAULT_INVALID', 'count above max', withCount({ default: 101 }), 'cnt'),
  row('DEFAULT_INVALID', 'negative count', withCount({ default: -1 }), 'cnt'),
  row('DEFAULT_INVALID', 'fractional count', withCount({ default: 1.5 }), 'cnt'),
  row('DEFAULT_INVALID', 'select outside options', withInputs({ ...select, default: 'z' }), 'sel'),
  row(
    'DEFAULT_INVALID',
    'percent above 100',
    withInputs({ kind: 'percent', key: 'p', urlKey: 'p', default: r(201, 2) }),
    'p',
  ),
  row(
    'DEFAULT_INVALID',
    'negative money',
    withInputs({ kind: 'money', key: 'm', urlKey: 'm', default: usd(-1) }),
    'm',
  ),
  row('DEFAULT_INVALID', 'length above max', withSide({ max: quantity(1, inch) }), 'side'),
  // [CC7] outputs
  row('NO_OUTPUTS', 'no outputs', withOutputs()),
  row(
    'DUPLICATE_OUTPUT_KEY',
    'two area',
    withOutputs(area, { ...area, role: 'secondary' }),
    'area',
  ),
  row('PRIMARY_COUNT', 'no primary', withOutput({ role: 'secondary' })),
  row('PRIMARY_COUNT', 'two primaries', withOutputs(area, { ...area, key: 'other' })),
  row(
    'INVALID_DISPLAY',
    'area in ft',
    displayed({ unit: 'ft', format: 'decimal', places: 2 }),
    'area',
  ),
  row(
    'INVALID_DISPLAY',
    'places 13',
    displayed({ unit: 'ft2', format: 'decimal', places: 13 }),
    'area',
  ),
  row(
    'INVALID_DISPLAY',
    'places -1',
    displayed({ unit: 'ft2', format: 'decimal', places: -1 }),
    'area',
  ),
  row(
    'INVALID_DISPLAY',
    'places 1.5',
    displayed({ unit: 'ft2', format: 'decimal', places: 1.5 }),
    'area',
  ),
  row(
    'INVALID_DISPLAY',
    'fraction on an area',
    displayed({ unit: 'ft2', format: 'fraction', denominator: 16 }),
    'area',
  ),
  row(
    'INVALID_KEY',
    'a bad second output key',
    withOutputs(area, { ...area, key: '1abc', role: 'secondary' }),
    '1abc',
  ),
  row('INVALID_KEY', 'a bad second warning code', { warnings: ['big', '1abc'] }, '1abc'),
  row(
    'INVALID_DISPLAY',
    'money with a display',
    withOutputs(area, {
      key: 'cost',
      measure: 'money',
      role: 'secondary',
      display: { unit: 'ft2', format: 'decimal', places: 2 },
    }),
    'cost',
  ),
  ...[65, 1, 2.5].map((denominator) =>
    row(
      'INVALID_DISPLAY',
      `denominator ${String(denominator)}`,
      withOutputs({
        key: 'len',
        measure: 'length',
        role: 'primary',
        display: { unit: 'in', format: 'fraction', denominator },
      }),
      'len',
    ),
  ),
];

describe('defineCalculator validation (calculator-contract › Definition-time validation)', () => {
  it('lists every reason of the spec once', () => {
    expect([...DEFINITION_REASONS].sort()).toEqual(
      [...new Set(rejected.map(([reason]) => reason))].sort(),
    );
  });

  // the locus names the calculator and, when one applies, the faulty input, output or warning
  it.each(rejected)('throws INVALID_DEFINITION %s for %s', (reason, _label, patch, field) => {
    const id = typeof patch['id'] === 'string' ? patch['id'] : 'box';
    expect(rejection(patch)).toStrictEqual({
      code: 'INVALID_DEFINITION',
      reason,
      locus: field === undefined ? { id } : { id, field },
    });
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
    expect(rejection(patch)).toBeUndefined();
  });
});
