import { defineCalculator, inch, quantity, Rational, usd } from '@maestro-calc/core';
import { PageModuleError } from '../calculator/page-module.ts';

/*
 * Synthetic calculators for the generic web layer (calculator-web-core): each one is built with
 * core's `defineCalculator`, so the page-module code runs against real definitions that name no
 * registry calculator. Test support only: it sits outside the coverage and the generic-code scans.
 */

/** The error a call throws, so a test can read its code, name and cause. */
export const pageModuleErrorOf = (call: () => unknown): PageModuleError => {
  try {
    call();
  } catch (thrown) {
    if (thrown instanceof PageModuleError) return thrown;
    throw thrown;
  }
  throw new Error('the call did not throw');
};

const zero = quantity(0, inch);
const unused = { outputs: { total: zero }, shopping: [], warnings: [] } as const;

/** The one output every fixture has: its primary, shown in feet to two places. */
const total = {
  key: 'total',
  measure: 'length',
  role: 'primary',
  display: { unit: 'ft', format: 'decimal', places: 2 },
} as const;

const count = <const K extends string, const U extends string>(key: K, urlKey: U) =>
  ({ kind: 'count', key, urlKey, default: 1 }) as const;

/**
 * A select whose option `huge` shows five of the five count fields, next to a boolean and a second
 * select, so the choice slot can be asked for keys it must refuse.
 */
export const choiceCalculator = defineCalculator({
  id: 'choice-fixture',
  inputs: [
    {
      kind: 'select',
      key: 'mode',
      urlKey: 'm1',
      options: ['small', 'large', 'huge'],
      default: 'small',
    },
    count('one', 'c1'),
    count('two', 'c2'),
    count('three', 'c3'),
    count('four', 'c4'),
    count('five', 'c5'),
    { kind: 'boolean', key: 'flag', urlKey: 'b1', default: false },
    { kind: 'select', key: 'other', urlKey: 'm2', options: ['x', 'y'], default: 'x' },
  ],
  outputs: [total],
  compute: () => unused,
});

/** The value of a successful result; a failure fails the test that asked for it. */
export const unwrap = <T>(
  result: { readonly ok: true; readonly value: T } | { readonly ok: false },
): T => {
  if (!result.ok) throw new Error('the result is an error');
  return result.value;
};

/**
 * Percent inputs for the stepper slot: `tip` runs from 0 to `max`; `open` has no bounds, `floor`
 * has no minimum, `ceil` has no maximum; `qty` is not a percent.
 */
export const percentCalculator = (max: number) =>
  defineCalculator({
    id: 'percent-fixture',
    inputs: [
      {
        kind: 'percent',
        key: 'tip',
        urlKey: 'p1',
        default: Rational.of(5),
        min: Rational.ZERO,
        max: Rational.of(max),
      },
      { kind: 'percent', key: 'open', urlKey: 'p2', default: Rational.of(5) },
      {
        kind: 'percent',
        key: 'floor',
        urlKey: 'p3',
        default: Rational.of(5),
        max: Rational.of(10),
      },
      { kind: 'percent', key: 'ceil', urlKey: 'p4', default: Rational.of(5), min: Rational.ZERO },
      count('qty', 'c1'),
    ],
    outputs: [total],
    compute: () => unused,
  });

const alpha = { materialId: 'alpha', purchaseUnit: 'box-a', qty: 1234n } as const;
const beta = { materialId: 'beta', purchaseUnit: 'bag-b', qty: 7n } as const;

/**
 * Two shopping lines that the engine returns in the opposite order of the page's (`beta` first).
 * With `size` 2 the engine drifts and returns only `beta`.
 */
export const shoppingCalculator = defineCalculator({
  id: 'shopping-fixture',
  inputs: [{ kind: 'count', key: 'size', urlKey: 'c1', default: 1, min: 1, max: 3 }],
  outputs: [total],
  compute: ({ size }) => ({
    outputs: { total: zero },
    shopping: size === 2 ? [beta] : [beta, alpha],
    warnings: [],
  }),
});

/** One input of each kind a page types into or chooses from, so the texts can be derived for all. */
export const mixedCalculator = defineCalculator({
  id: 'mixed-fixture',
  inputs: [
    {
      kind: 'length',
      key: 'span',
      urlKey: 'l1',
      default: quantity(120, inch),
      defaultUnit: 'ft',
      metricDefaultUnit: 'm',
    },
    count('pieces', 'c1'),
    { kind: 'percent', key: 'rate', urlKey: 'p1', default: Rational.of(5) },
    { kind: 'money', key: 'price', urlKey: 'm1', default: usd(0) },
    { kind: 'boolean', key: 'flag', urlKey: 'b1', default: false },
    { kind: 'select', key: 'mode', urlKey: 's1', options: ['one', 'two'], default: 'one' },
  ],
  outputs: [total],
  compute: () => unused,
});

/** A calculator whose primary output is money, which has no display hint. */
export const moneyCalculator = defineCalculator({
  id: 'money-fixture',
  inputs: [count('qty', 'c1')],
  outputs: [{ key: 'cost', measure: 'money', role: 'primary' }],
  compute: () => ({ outputs: { cost: usd(5) }, shopping: [], warnings: [] }),
});
