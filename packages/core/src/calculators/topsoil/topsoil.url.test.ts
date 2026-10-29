import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { topsoilStateArb } from '../../__testing__/topsoil-arbitraries.ts';
import { numRuns } from '../../__testing__/property-runs.ts';
import type { ValidateOptions } from '../../calculator/descriptors.ts';
import { decode, encode } from '../../url/codec.ts';
import { topsoil } from './index.ts';

/** The validated state of raw inputs; a rejected record is a failed test. */
const stateOf = (raw: Readonly<Record<string, unknown>>, options?: ValidateOptions) => {
  const result = topsoil.validate(raw, options);
  if (!result.ok) throw new Error(`invalid: ${JSON.stringify(result.errors)}`);
  return result.value;
};

describe('topsoil url state (calc-topsoil › URL and catalog)', () => {
  it.each([
    ['the default state', {}, undefined, 'v=1'],
    ['a long bed in 1 cu ft bags', { length: '40ft', bag: '1' }, undefined, 'v=1&l=480&bg=1'],
    [
      'a metric state with prices',
      { depth: '5cm', bagPrice: '4.50', yardPrice: '38' },
      { unitSystem: 'metric' as const },
      'v=1&u=m&d=250/127&bp=9/2&yp=38',
    ],
  ])('encodes %s', (_name, raw, options, query) => {
    expect(encode(topsoil, stateOf(raw, options), options ?? {})).toBe(query);
  });

  it('decodes a link', () => {
    expect(decode(topsoil, 'v=1&bg=1-5&d=2')).toEqual({
      state: stateOf({ bag: '1-5', depth: '2in' }),
      unitSystem: 'imperial',
      issues: [],
    });
  });

  // spec: calc-topsoil › [TS4] every valid state survives the link
  it.each(['imperial', 'metric'] as const)('round-trips every valid state (%s)', (unitSystem) => {
    fc.assert(
      fc.property(topsoilStateArb, (state) => {
        expect(decode(topsoil, encode(topsoil, state, { unitSystem }))).toEqual({
          state,
          unitSystem,
          issues: [],
        });
      }),
      { numRuns },
    );
  });
});
