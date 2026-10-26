import { defineCalculator, inch, quantity } from '@maestro-calc/core';
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
  outputs: [{ key: 'total', measure: 'length', role: 'primary' }],
  compute: () => unused,
});
