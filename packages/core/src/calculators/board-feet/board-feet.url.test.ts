import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { boardFeetStateArb } from '../../__testing__/board-feet-arbitraries.ts';
import { numRuns } from '../../__testing__/property-runs.ts';
import type { ValidateOptions } from '../../calculator/descriptors.ts';
import { decode, encode } from '../../url/codec.ts';
import { boardFeet } from './index.ts';

/** The validated state of raw inputs; a rejected record is a failed test. */
const stateOf = (raw: Readonly<Record<string, unknown>>, options?: ValidateOptions) => {
  const result = boardFeet.validate(raw, options);
  if (!result.ok) throw new Error(`invalid: ${JSON.stringify(result.errors)}`);
  return result.value;
};

describe('board feet url state (calc-board-feet › URL and catalog)', () => {
  it.each([
    ['the default state', {}, undefined, 'v=1'],
    ['a 2x6x10', { width: '6in', length: '10ft' }, undefined, 'v=1&w=6&l=120'],
    ['ten pieces at $1.50', { pieces: '10', price: '1.50' }, undefined, 'v=1&n=10&pp=3/2'],
    [
      'a metric state',
      { thickness: '5cm' },
      { unitSystem: 'metric' as const },
      'v=1&u=m&t=250/127',
    ],
  ])('encodes %s', (_name, raw, options, query) => {
    expect(encode(boardFeet, stateOf(raw, options), options ?? {})).toBe(query);
  });

  it('decodes a link', () => {
    expect(decode(boardFeet, 'v=1&t=4&l=96')).toEqual({
      state: stateOf({ thickness: '4in', length: '8ft' }),
      unitSystem: 'imperial',
      issues: [],
    });
  });

  // spec: calc-board-feet › [BF6] every valid state survives the link
  it.each(['imperial', 'metric'] as const)('round-trips every valid state (%s)', (unitSystem) => {
    fc.assert(
      fc.property(boardFeetStateArb, (state) => {
        expect(decode(boardFeet, encode(boardFeet, state, { unitSystem }))).toEqual({
          state,
          unitSystem,
          issues: [],
        });
      }),
      { numRuns },
    );
  });
});
