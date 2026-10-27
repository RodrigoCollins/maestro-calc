import { expect } from 'vitest';
import { CALCULATOR_LIMITS } from '../../site-check/budgets.ts';

/** A built entry below this many bytes lost its graph: the budget would hold for the wrong reason. */
const AT_LEAST = 10_000;

const fmt = (bytes: number): string => bytes.toLocaleString('en-US');

/**
 * Prints the size of a built entry against the calculator JavaScript budget that `check:site`
 * enforces, and asserts it is within it (site-quality › Byte budgets; calculator-page › [CP42]).
 */
export const expectWithinJsBudget = (label: string, size: number, note = ''): void => {
  console.info(`${label} (library build): ${fmt(size)} B of ${fmt(CALCULATOR_LIMITS.js)} B${note}`);
  expect(size).toBeGreaterThan(AT_LEAST);
  expect(size).toBeLessThanOrEqual(CALCULATOR_LIMITS.js);
};
