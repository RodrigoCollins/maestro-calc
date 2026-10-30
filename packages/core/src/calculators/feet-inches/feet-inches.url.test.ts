import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { feetInchesStateArb } from '../../__testing__/feet-inches-arbitraries.ts';
import { numRuns } from '../../__testing__/property-runs.ts';
import { decode, encode } from '../../url/codec.ts';
import { feetInches } from './index.ts';

describe('feet and inches url state (calc-feet-inches › URL and catalog)', () => {
  it('encodes a subtraction and decodes it back', () => {
    const state = feetInches.validate({ operation: 'subtract', second: '2 ft' });
    if (!state.ok) throw new Error('invalid');
    expect(encode(feetInches, state.value, {})).toBe('v=1&o=subtract&b=24');
    expect(decode(feetInches, 'v=1&o=subtract&b=24').state).toEqual(state.value);
  });

  // spec: calc-feet-inches › [FI6] every valid state survives the link
  it('round-trips every valid state', () => {
    fc.assert(
      fc.property(
        feetInchesStateArb,
        fc.constantFrom('imperial', 'metric'),
        (state, unitSystem) => {
          const decoded = decode(feetInches, encode(feetInches, state, { unitSystem }));
          expect(decoded.state).toEqual(state);
          expect(decoded.unitSystem).toBe(unitSystem);
        },
      ),
      { numRuns },
    );
  });
});
