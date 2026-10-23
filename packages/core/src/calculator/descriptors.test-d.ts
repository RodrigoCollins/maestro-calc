import { describe, expectTypeOf, it } from 'vitest';
import { usd, type Money } from '../money/money.ts';
import { Rational } from '../rational/rational.ts';
import { inch } from '../units/catalog.ts';
import { multiply } from '../units/ops.ts';
import { quantity, type Quantity } from '../units/quantity.ts';
import type { Result } from '../result.ts';
import { defineCalculator } from './define.ts';
import type { FieldError } from './validate.ts';

// A `fixture-box`-shaped definition written inline (the shared fixture is built in task 9.5): the
// `const` generics must keep the keys, kinds, measures and option ids as literals.
const box = defineCalculator({
  id: 'fixture-box',
  inputs: [
    {
      kind: 'length',
      key: 'len',
      urlKey: 'a',
      default: quantity(12, inch),
      defaultUnit: 'in',
      metricDefaultUnit: 'cm',
      min: quantity(0, inch),
      max: quantity(1200, inch),
    },
    { kind: 'count', key: 'cnt', urlKey: 'b', default: 3, min: 0, max: 100 },
    { kind: 'percent', key: 'pct', urlKey: 'c', default: Rational.of(10), min: Rational.ZERO },
    { kind: 'select', key: 'sel', urlKey: 'd', default: 'x', options: ['x', 'y'] },
    { kind: 'boolean', key: 'flg', urlKey: 'e', default: false },
    { kind: 'money', key: 'prc', urlKey: 'f', default: usd(Rational.of(249, 50)) },
  ],
  outputs: [
    {
      key: 'area',
      measure: 'area',
      role: 'primary',
      display: { unit: 'ft2', format: 'decimal', places: 2 },
    },
    { key: 'cost', measure: 'money', role: 'secondary' },
  ],
  warnings: ['bigCount'],
  compute: (inputs) => {
    // spec: calculator-contract › Input type inference [CC2]
    expectTypeOf(inputs).toEqualTypeOf<{
      readonly len: Quantity<'length'>;
      readonly cnt: number;
      readonly pct: Rational;
      readonly sel: 'x' | 'y';
      readonly flg: boolean;
      readonly prc: Money;
    }>();
    // @ts-expect-error `zzz` is not a declared input
    String(inputs.zzz);
    // @ts-expect-error `'z'` is not one of the options of `sel`
    String(inputs.sel === 'z');
    return {
      outputs: { area: multiply(inputs.len, inputs.len), cost: inputs.prc },
      shopping: [],
      warnings: [],
    };
  },
});

// A minimal definition for the negative proofs: the compute return type is the thing under test.
const one = {
  id: 'one',
  inputs: [{ kind: 'boolean', key: 'flg', urlKey: 'a', default: false }],
  outputs: [
    { key: 'area', measure: 'area', role: 'primary' },
    { key: 'cost', measure: 'money', role: 'secondary' },
  ],
} as const;
const area = multiply(quantity(1, inch), quantity(1, inch));
const length = quantity(1, inch);

describe('calculator types (calculator-contract › Field kinds and descriptors)', () => {
  // spec: calculator-contract › Input type inference [CC2]
  it('requires exactly the declared outputs from compute', () => {
    expectTypeOf(box.compute).returns.toHaveProperty('outputs').toEqualTypeOf<{
      readonly area: Quantity<'area'>;
      readonly cost: Money;
    }>();
    expectTypeOf(box.compute)
      .returns.toHaveProperty('warnings')
      .items.toHaveProperty('code')
      .toEqualTypeOf<'bigCount'>();
    expectTypeOf(box.warnings).toEqualTypeOf<readonly ['bigCount']>();
    expectTypeOf(box.inputs[3].options).toEqualTypeOf<readonly ['x', 'y']>();
  });

  // An undeclared extra output is not a compile error (TypeScript does not check excess properties
  // of a returned object literal against an inferred return type); `run` rejects it at runtime.
  it('rejects a compute that omits an output or returns the wrong measure', () => {
    defineCalculator({
      ...one,
      // @ts-expect-error `cost` is declared but missing
      compute: () => ({ outputs: { area }, shopping: [], warnings: [] }),
    });
    defineCalculator({
      ...one,
      // @ts-expect-error `area` must be an area, not a length
      compute: () => ({ outputs: { area: length, cost: usd(0) }, shopping: [], warnings: [] }),
    });
    defineCalculator({
      ...one,
      // @ts-expect-error `cost` must be money, not a quantity
      compute: () => ({ outputs: { area, cost: area }, shopping: [], warnings: [] }),
    });
  });

  it('accepts only declared warning codes', () => {
    defineCalculator({
      ...one,
      warnings: ['bigCount'],
      compute: () => ({
        outputs: { area, cost: usd(0) },
        shopping: [],
        // @ts-expect-error `nope` is not a declared warning code
        warnings: [{ code: 'nope', params: {} }],
      }),
    });
  });

  // spec: calculator-contract › Total validation: Result of the inputs or of field errors
  it('types validate as a Result of the inferred inputs or of field errors', () => {
    expectTypeOf(box.validate({})).toEqualTypeOf<
      Result<Parameters<typeof box.compute>[0], FieldError>
    >();
    // @ts-expect-error the options accept only the two unit systems
    box.validate({}, { unitSystem: 'martian' });
  });
});
