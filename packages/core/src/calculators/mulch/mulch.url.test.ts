import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { mulchStateArb } from '../../__testing__/mulch-arbitraries.ts';
import { numRuns } from '../../__testing__/property-runs.ts';
import type { ValidateOptions } from '../../calculator/descriptors.ts';
import { decode, encode } from '../../url/codec.ts';
import { mulch } from './index.ts';

/** The validated state of raw inputs; a rejected record is a failed test. */
const stateOf = (raw: Readonly<Record<string, unknown>>, options?: ValidateOptions) => {
  const result = mulch.validate(raw, options);
  if (!result.ok) throw new Error(`invalid: ${JSON.stringify(result.errors)}`);
  return result.value;
};

describe('mulch url state (calc-mulch › URL and catalog)', () => {
  it.each([
    ['the default state', {}, undefined, 'v=1'],
    ['a long bed in 3 cu ft bags', { length: '40ft', bag: '3' }, undefined, 'v=1&l=480&bg=3'],
    [
      'a metric state with prices',
      { depth: '5cm', bagPrice: '4.50', yardPrice: '38' },
      { unitSystem: 'metric' as const },
      'v=1&u=m&d=250/127&bp=9/2&yp=38',
    ],
  ])('encodes %s', (_name, raw, options, query) => {
    expect(encode(mulch, stateOf(raw, options), options ?? {})).toBe(query);
  });

  it('decodes a link', () => {
    expect(decode(mulch, 'v=1&bg=3&d=2')).toEqual({
      state: stateOf({ bag: '3', depth: '2in' }),
      unitSystem: 'imperial',
      issues: [],
    });
  });

  // spec: calc-mulch › [MU4] every valid state survives the link
  it.each(['imperial', 'metric'] as const)('round-trips every valid state (%s)', (unitSystem) => {
    fc.assert(
      fc.property(mulchStateArb, (state) => {
        expect(decode(mulch, encode(mulch, state, { unitSystem }))).toEqual({
          state,
          unitSystem,
          issues: [],
        });
      }),
      { numRuns },
    );
  });
});
