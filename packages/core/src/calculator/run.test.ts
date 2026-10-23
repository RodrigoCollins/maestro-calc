import { describe, expect, it, vi } from 'vitest';
import { fixtureBox } from '../__testing__/fixture-box.ts';
import { thrownCode } from '../__testing__/thrown-code.ts';
import { usd } from '../money/money.ts';
import { Rational } from '../rational/rational.ts';
import { in2, inch } from '../units/catalog.ts';
import { quantity } from '../units/quantity.ts';
import { defineCalculator } from './define.ts';

const area = quantity(144, in2);
const cost = usd(Rational.of(747, 50));
const good = { outputs: { area, cost }, shopping: [], warnings: [] };

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
  describe.each([
    ['omits an output', { ...good, outputs: { area } }],
    ['adds an undeclared output', { ...good, outputs: { area, cost, extra: area } }],
    ['returns area as a length', { ...good, outputs: { area: quantity(12, inch), cost } }],
    ['returns area as money', { ...good, outputs: { area: cost, cost } }],
    ['returns cost as a quantity', { ...good, outputs: { area, cost: area } }],
    ['returns cost as a number', { ...good, outputs: { area, cost: 15 } }],
    ['emits an undeclared warning', { ...good, warnings: [{ code: 'nope', params: {} }] }],
    ['emits a warning without a code', { ...good, warnings: [{ params: {} }] }],
    ['emits a warning that is null', { ...good, warnings: [null] }],
    ['emits a warning that is not an object', { ...good, warnings: ['bigCount'] }],
    ['returns warnings that are not a list', { ...good, warnings: undefined }],
    [
      'returns a negative qty',
      { ...good, shopping: [{ materialId: 'a', purchaseUnit: 'b', qty: -1n }] },
    ],
    [
      'returns a qty that is a number',
      { ...good, shopping: [{ materialId: 'a', purchaseUnit: 'b', qty: 1 }] },
    ],
    [
      'returns a shopping line without a material',
      { ...good, shopping: [{ materialId: 7, purchaseUnit: 'b', qty: 1n }] },
    ],
    [
      'returns a shopping line without a purchase unit',
      { ...good, shopping: [{ materialId: 'a', purchaseUnit: undefined, qty: 1n }] },
    ],
    [
      'emits a warning whose params are not an object',
      { ...good, warnings: [{ code: 'bigCount', params: 5 }] },
    ],
    [
      'emits a warning whose param is an object',
      { ...good, warnings: [{ code: 'bigCount', params: { cnt: 1, over: { n: 1 } } }] },
    ],
    [
      'emits a warning whose code is not a string',
      { ...good, warnings: [{ code: 1, params: {} }] },
    ],
    ['returns a shopping line that is not an object', { ...good, shopping: [null] }],
    ['returns shopping that is not a list', { ...good, shopping: undefined }],
    ['returns outputs that are not an object', { ...good, outputs: null }],
    ['returns nothing', undefined],
  ])('a compute that %s', (_name, bad) => {
    it('makes run throw INVALID_RESULT', () => {
      expect(thrownCode(() => returning(bad).run({}))).toBe('INVALID_RESULT');
    });
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
