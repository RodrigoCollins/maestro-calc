import { describe, expect, it } from 'vitest';
import { reserveCss, type Reserve } from './reserve.ts';

describe('reserveCss (calculator-page › [CP64], design K6)', () => {
  // spec: calculator-page › [CP64] the exact minified output of one property
  it('writes the base count and one media block for a single step of the answer', () => {
    expect(reserveCss({ answer: [5, [30, 4]] })).toBe(
      '.calculator{--answer-lines:5}@media(min-width:30rem){.calculator{--answer-lines:4}}',
    );
  });

  it('writes the base count alone for a property with no step', () => {
    expect(reserveCss({ notice: [3] })).toBe('.calculator{--notice-lines:3}');
  });

  // spec: calculator-page › [CP64] both properties share one base rule and one block per breakpoint
  it('joins the answer and the notice: one base rule, one block per distinct breakpoint, ascending', () => {
    expect(reserveCss({ answer: [5, [30, 4]], notice: [6, [20, 5], [30, 4]] })).toBe(
      '.calculator{--answer-lines:5;--notice-lines:6}' +
        '@media(min-width:20rem){.calculator{--notice-lines:5}}' +
        '@media(min-width:30rem){.calculator{--answer-lines:4;--notice-lines:4}}',
    );
  });

  // an empty reserve has nothing to write, so no empty `<style>` reaches a head
  it('returns nothing for an empty reserve', () => {
    expect(reserveCss({})).toBeUndefined();
  });

  // spec: calculator-page › [CP64] the builder throws on a breakpoint that is not increasing rem
  it.each([
    ['equal rem values', { answer: [5, [30, 4], [30, 3]] }],
    ['decreasing rem values', { answer: [5, [30, 4], [20, 3]] }],
    ['a zero breakpoint', { answer: [5, [0, 4]] }],
    ['a negative breakpoint', { answer: [5, [-1, 4]] }],
    ['a breakpoint that is not finite', { notice: [5, [Number.POSITIVE_INFINITY, 4]] }],
    ['a px breakpoint', { answer: [5, ['480px', 4]] }],
  ] as unknown as readonly [string, Reserve][])('throws on %s', (_what, reserve) => {
    expect(() => reserveCss(reserve)).toThrow(/breakpoint/);
  });

  // spec: calculator-page › [CP64] a count is a positive integer, base and steps alike
  it.each([
    ['a zero base', { answer: [0] }],
    ['a fractional base', { answer: [2.5] }],
    ['a negative step', { notice: [5, [30, -1]] }],
    ['a fractional step', { notice: [5, [30, 1.5]] }],
    ['a step that is not a number', { notice: [5, [30, Number.NaN]] }],
  ] as unknown as readonly [string, Reserve][])('throws on %s', (_what, reserve) => {
    expect(() => reserveCss(reserve)).toThrow(/count/);
  });
});
