import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { roofPitchStateArb } from '../../__testing__/roof-pitch-arbitraries.ts';
import { numRuns } from '../../__testing__/property-runs.ts';
import { decode, encode } from '../../url/codec.ts';
import { roofPitch } from './index.ts';

describe('roof pitch url state (calc-roof-pitch › URL and catalog)', () => {
  it('encodes the default as v=1 and a slate roof at 4 in 12', () => {
    const state = (raw: Readonly<Record<string, unknown>>) => {
      const result = roofPitch.validate(raw);
      if (!result.ok) throw new Error('invalid');
      return result.value;
    };
    expect(encode(roofPitch, state({}), {})).toBe('v=1');
    expect(encode(roofPitch, state({ rise: '4', covering: 'slate' }), {})).toBe('v=1&r=4&c=slate');
  });

  // spec: calc-roof-pitch › [RP6] every valid state survives the link
  it('round-trips every valid state', () => {
    fc.assert(
      fc.property(roofPitchStateArb, fc.constantFrom('imperial', 'metric'), (state, unitSystem) => {
        const decoded = decode(roofPitch, encode(roofPitch, state, { unitSystem }));
        expect(decoded.state).toEqual(state);
      }),
      { numRuns },
    );
  });
});
