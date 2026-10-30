import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { numRuns } from '../../__testing__/property-runs.ts';
import { roofingStateArb } from '../../__testing__/roofing-arbitraries.ts';
import { ROOFING_COVERAGE } from '../../__testing__/roofing-yields.ts';
import type { ValidateOptions } from '../../calculator/descriptors.ts';
import { decode, encode } from '../../url/codec.ts';
import { createRoofing } from './index.ts';

const roofing = createRoofing(ROOFING_COVERAGE);

/** The validated state of raw inputs; a rejected record is a failed test. */
const stateOf = (raw: Readonly<Record<string, unknown>>, options?: ValidateOptions) => {
  const result = roofing.validate(raw, options);
  if (!result.ok) throw new Error(`invalid: ${JSON.stringify(result.errors)}`);
  return result.value;
};

describe('roofing url state (calc-roofing › URL and catalog)', () => {
  it.each([
    ['the default state', {}, undefined, 'v=1'],
    [
      'a steeper roof with prices',
      { pitch: '9', bundlePrice: '35', rollPrice: '90' },
      undefined,
      'v=1&p=9&bp=35&rp=90',
    ],
    [
      'a metric footprint',
      { length: '12m' },
      { unitSystem: 'metric' as const },
      'v=1&u=m&l=60000/127',
    ],
  ])('encodes %s', (_name, raw, options, query) => {
    expect(encode(roofing, stateOf(raw, options), options ?? {})).toBe(query);
  });

  it.each([
    ['v=1&p=3', { pitch: '3' }, 'imperial'],
    ['v=1&u=m&w=240', { width: '20ft' }, 'metric'],
  ])('decodes %s', (query, raw, unitSystem) => {
    expect(decode(roofing, query)).toEqual({ state: stateOf(raw), unitSystem, issues: [] });
  });

  // spec: calc-roofing › [RF8] every valid state survives the link
  it('round-trips every valid state', () => {
    fc.assert(
      fc.property(roofingStateArb, fc.constantFrom('imperial', 'metric'), (state, unitSystem) => {
        const decoded = decode(roofing, encode(roofing, state, { unitSystem }));
        expect(decoded.state).toEqual(state);
        expect(decoded.unitSystem).toBe(unitSystem);
      }),
      { numRuns },
    );
  });
});
