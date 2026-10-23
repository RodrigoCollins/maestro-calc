import { describe, expect, it, vi } from 'vitest';
import { fixtureBox } from '../__testing__/fixture-box.ts';
import { CoreError } from '../errors.ts';
import { usd } from '../money/money.ts';
import { Rational } from '../rational/rational.ts';
import { in2, inch } from '../units/catalog.ts';
import { quantity } from '../units/quantity.ts';
import { defineCalculator } from './define.ts';
import { RESULT_REASONS, type ResultReason } from './run.ts';

const area = quantity(144, in2);
const cost = usd(Rational.of(747, 50));
const good = { outputs: { area, cost }, shopping: [], warnings: [] };

interface Where {
  readonly output?: string;
  readonly index?: number;
}
type Row = [label: string, bad: unknown, reason: ResultReason, where: Where];
const row = (label: string, bad: unknown, reason: ResultReason, where: Where = {}): Row => [
  label,
  bad,
  reason,
  where,
];

/** What a failed action reports: the code, the reason and the locus carried as the cause. */
const failure = (action: () => unknown): { code: string; reason?: string; cause?: unknown } => {
  try {
    action();
  } catch (error) {
    if (error instanceof CoreError) {
      return {
        code: error.code,
        ...(error.reason === undefined ? {} : { reason: error.reason }),
        cause: error.cause,
      };
    }
    throw error;
  }
  return { code: 'NONE' };
};

const line = { materialId: 'a', purchaseUnit: 'b', qty: 1n };
const warn = { code: 'bigCount', params: {} };
const withOutputs = (outputs: unknown): unknown => ({ ...good, outputs });
const withShopping = (shopping: unknown): unknown => ({ ...good, shopping });
const withWarnings = (warnings: unknown): unknown => ({ ...good, warnings });

const rejected: Row[] = [
  // [CC24] the outputs are exactly the declared keys, own and enumerable
  row('omits an output', withOutputs({ area }), 'OUTPUT_KEYS'),
  row('adds an undeclared output', withOutputs({ area, cost, extra: area }), 'OUTPUT_KEYS'),
  row(
    'inherits every declared output',
    withOutputs(Object.assign(Object.create({ area, cost }), { x: 1, y: 2 })),
    'OUTPUT_KEYS',
  ),
  row(
    'inherits one declared output and adds an own extra',
    withOutputs(Object.assign(Object.create({ area }), { cost, extra: 1 })),
    'OUTPUT_KEYS',
  ),
  row(
    'hides a declared output from enumeration',
    withOutputs(Object.defineProperty({ cost, extra: area }, 'area', { value: area })),
    'OUTPUT_KEYS',
  ),
  row('returns outputs that are not an object', withOutputs(null), 'NOT_AN_OBJECT'),
  row(
    'returns outputs that are a list',
    withOutputs(Object.assign([], { area, cost })),
    'NOT_AN_OBJECT',
  ),
  row('returns a list as the result', Object.assign([], good), 'NOT_AN_OBJECT'),
  row('returns a promise', Promise.resolve(good), 'NOT_AN_OBJECT'),
  row('returns nothing', undefined, 'NOT_AN_OBJECT'),
  // the value of each output has the declared measure
  row(
    'returns area as a length',
    withOutputs({ area: quantity(12, inch), cost }),
    'OUTPUT_MEASURE',
    {
      output: 'area',
    },
  ),
  row('returns area as money', withOutputs({ area: cost, cost }), 'OUTPUT_MEASURE', {
    output: 'area',
  }),
  row('returns cost as a quantity', withOutputs({ area, cost: area }), 'OUTPUT_MEASURE', {
    output: 'cost',
  }),
  row('returns cost as a number', withOutputs({ area, cost: 15 }), 'OUTPUT_MEASURE', {
    output: 'cost',
  }),
  // shopping is a dense list of lines
  row('returns shopping that is not a list', withShopping(undefined), 'SHOPPING'),
  row('returns a negative qty', withShopping([{ ...line, qty: -1n }]), 'SHOPPING', { index: 0 }),
  row('returns a qty that is a number', withShopping([{ ...line, qty: 1 }]), 'SHOPPING', {
    index: 0,
  }),
  row('returns a line without a material', withShopping([{ ...line, materialId: 7 }]), 'SHOPPING', {
    index: 0,
  }),
  row(
    'returns a line without a purchase unit',
    withShopping([{ ...line, purchaseUnit: undefined }]),
    'SHOPPING',
    { index: 0 },
  ),
  row('returns a line that is null', withShopping([null]), 'SHOPPING', { index: 0 }),
  row('returns a bad line after a good one', withShopping([line, 'sheet']), 'SHOPPING', {
    index: 1,
  }),
  row('returns a hole in the shopping list', withShopping(new Array(1)), 'SHOPPING', { index: 0 }),
  row(
    'returns a hole between two lines',
    withShopping(Object.assign(new Array(3), { 0: line, 2: line })),
    'SHOPPING',
    { index: 1 },
  ),
  // warnings are a dense list of declared codes with scalar, finite params
  row('returns warnings that are not a list', withWarnings(undefined), 'WARNING'),
  row('emits an undeclared warning', withWarnings([{ code: 'nope', params: {} }]), 'WARNING', {
    index: 0,
  }),
  row('emits a warning without a code', withWarnings([{ params: {} }]), 'WARNING', { index: 0 }),
  row('emits a warning that is null', withWarnings([null]), 'WARNING', { index: 0 }),
  row('emits a warning that is not an object', withWarnings(['bigCount']), 'WARNING', { index: 0 }),
  row(
    'emits a warning code that is not a string',
    withWarnings([{ code: 1, params: {} }]),
    'WARNING',
    {
      index: 0,
    },
  ),
  row('emits a bad warning after a good one', withWarnings([warn, null]), 'WARNING', { index: 1 }),
  row('emits params that are not an object', withWarnings([{ ...warn, params: 5 }]), 'WARNING', {
    index: 0,
  }),
  row(
    'emits a param that is an object',
    withWarnings([{ ...warn, params: { cnt: 1, over: { n: 1 } } }]),
    'WARNING',
    { index: 0 },
  ),
  row('returns a hole in the warnings', withWarnings(new Array(1)), 'WARNING', { index: 0 }),
];

/** A fixture-box whose `compute` returns `bad`, which only an untyped cast can reach. */
const returning = (bad: unknown): typeof fixtureBox =>
  defineCalculator({
    id: 'fixture-box',
    inputs: fixtureBox.inputs,
    outputs: fixtureBox.outputs,
    warnings: fixtureBox.warnings,
    compute: () => bad as ReturnType<typeof fixtureBox.compute>,
  });

describe('Calculator.run (calculator-contract › Pure, language-free compute)', () => {
  // spec: calculator-contract › Determinism and non-mutation [CC21]
  it('computes the same result twice from frozen validated inputs', () => {
    const validated = fixtureBox.validate({});
    if (!validated.ok) throw new Error('the defaults must validate');
    const inputs = Object.freeze(validated.value);
    expect(fixtureBox.compute(inputs)).toEqual(fixtureBox.compute(inputs));
    expect(fixtureBox.compute(inputs).outputs.area).toEqual(area);
  });

  // spec: calculator-contract › Validation failure short-circuits compute [CC22]
  it('returns the field errors and never calls compute', () => {
    const compute = vi.fn(() => good);
    const box = defineCalculator({
      id: 'fixture-box',
      inputs: fixtureBox.inputs,
      outputs: fixtureBox.outputs,
      warnings: fixtureBox.warnings,
      compute,
    });
    expect(box.run({ cnt: 'x' })).toEqual({
      ok: false,
      errors: [{ field: 'cnt', code: 'MALFORMED' }],
    });
    expect(compute).not.toHaveBeenCalled();
  });

  // spec: calculator-contract › Ordered outputs [CC23]
  it('lists the outputs in declaration order with their roles', () => {
    expect(fixtureBox.run({})).toEqual({
      ok: true,
      value: {
        outputs: [
          { key: 'area', role: 'primary', value: area },
          { key: 'cost', role: 'secondary', value: cost },
        ],
        shopping: [],
        warnings: [],
      },
    });
  });

  it('passes the validated inputs and the unit system on to compute', () => {
    const compute = vi.fn(() => good);
    const box = defineCalculator({
      id: 'fixture-box',
      inputs: fixtureBox.inputs,
      outputs: fixtureBox.outputs,
      warnings: fixtureBox.warnings,
      compute,
    });
    box.run({ len: '5', cnt: '4' }, { unitSystem: 'metric' });
    expect(compute).toHaveBeenCalledOnce();
    expect(compute).toHaveBeenCalledWith(
      expect.objectContaining({ len: quantity(Rational.of(250, 127), inch), cnt: 4 }),
    );
  });

  it('returns the shopping lines and warnings of a valid result as given', () => {
    const lines = [{ materialId: 'plywood-sheet', purchaseUnit: 'sheet', qty: 5n }];
    const warnings = [{ code: 'bigCount', params: { cnt: 101, over: true, unit: 'in' } }];
    expect(returning({ ...good, shopping: lines, warnings }).run({})).toMatchObject({
      ok: true,
      value: { shopping: lines, warnings },
    });
  });

  // spec: calculator-contract › Result shape enforcement [CC24]
  it('lists every reason of the contract once', () => {
    expect([...RESULT_REASONS].sort()).toEqual(
      [...new Set(rejected.map(([, , reason]) => reason))].sort(),
    );
  });

  it.each(rejected)(
    'a compute that %s makes run throw INVALID_RESULT %s',
    (_name, bad, reason, where) => {
      expect(failure(() => returning(bad).run({}))).toStrictEqual({
        code: 'INVALID_RESULT',
        reason,
        cause: { id: 'fixture-box', ...where },
      });
    },
  );

  it('pins what run does when compute itself fails', () => {
    const boom = new RangeError('boom');
    const throwing = defineCalculator({
      id: 'fixture-box',
      inputs: fixtureBox.inputs,
      outputs: fixtureBox.outputs,
      warnings: fixtureBox.warnings,
      compute: () => {
        throw boom;
      },
    });
    expect(() => throwing.run({})).toThrow(boom);
    const getter = {
      get outputs(): never {
        throw boom;
      },
    };
    expect(() => returning(getter).run({})).toThrow(boom);
  });

  // spec: calculator-contract › Ordered outputs [CC23]
  it('lists the outputs in declaration order whatever order compute built them in', () => {
    const reversed = returning({ ...good, outputs: { cost, area } }).run({});
    expect(reversed.ok && reversed.value.outputs.map(({ key }) => key)).toEqual(['area', 'cost']);
  });

  it('accepts any of several declared warning codes', () => {
    const twoWarnings = defineCalculator({
      id: 'fixture-box',
      inputs: fixtureBox.inputs,
      outputs: fixtureBox.outputs,
      warnings: ['first', 'second'],
      compute: () => ({ ...good, warnings: [{ code: 'second', params: {} }] }),
    });
    expect(twoWarnings.run({})).toMatchObject({
      ok: true,
      value: { warnings: [{ code: 'second', params: {} }] },
    });
  });

  it('accepts a shopping line of zero units', () => {
    const lines = [{ materialId: 'plywood-sheet', purchaseUnit: 'sheet', qty: 0n }];
    expect(returning({ ...good, shopping: lines }).run({}).ok).toBe(true);
  });
});
