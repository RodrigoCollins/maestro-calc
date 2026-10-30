import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { drywallStateArb } from '../../__testing__/drywall-arbitraries.ts';
import { DRYWALL_FINISHING } from '../../__testing__/drywall-yields.ts';
import { numRuns } from '../../__testing__/property-runs.ts';
import type { ValidateOptions } from '../../calculator/descriptors.ts';
import { decode, encode } from '../../url/codec.ts';
import { createDrywall } from './index.ts';

const drywall = createDrywall(DRYWALL_FINISHING);

/** The validated state of raw inputs; a rejected record is a failed test. */
const stateOf = (raw: Readonly<Record<string, unknown>>, options?: ValidateOptions) => {
  const result = drywall.validate(raw, options);
  if (!result.ok) throw new Error(`invalid: ${JSON.stringify(result.errors)}`);
  return result.value;
};

describe('drywall url state (calc-drywall › URL and catalog)', () => {
  it.each([
    ['the default state', {}, undefined, 'v=1'],
    [
      'walls only in 4 by 12 sheets',
      { surfaces: 'walls', sheet: '4x12' },
      undefined,
      'v=1&sf=walls&sz=4x12',
    ],
    [
      'a metric state with a price',
      { height: '2.5m', sheetPrice: '12.50' },
      { unitSystem: 'metric' as const },
      'v=1&u=m&h=12500/127&sp=25/2',
    ],
  ])('encodes %s', (_name, raw, options, query) => {
    expect(encode(drywall, stateOf(raw, options), options ?? {})).toBe(query);
  });

  it.each([
    ['v=1&sz=4x12', { sheet: '4x12' }, 'imperial'],
    ['v=1&u=m&h=120', { height: '10ft' }, 'metric'],
  ])('decodes %s', (query, raw, unitSystem) => {
    expect(decode(drywall, query)).toEqual({ state: stateOf(raw), unitSystem, issues: [] });
  });

  // spec: calc-drywall › [DW8] every valid state survives the link
  it('round-trips every valid state', () => {
    fc.assert(
      fc.property(drywallStateArb, fc.constantFrom('imperial', 'metric'), (state, unitSystem) => {
        const decoded = decode(drywall, encode(drywall, state, { unitSystem }));
        expect(decoded.state).toEqual(state);
        expect(decoded.unitSystem).toBe(unitSystem);
      }),
      { numRuns },
    );
  });
});
