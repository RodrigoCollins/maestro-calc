import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { GRAVEL_DENSITIES } from '../../__testing__/gravel-yields.ts';
import { gravelStateArb } from '../../__testing__/gravel-arbitraries.ts';
import { numRuns } from '../../__testing__/property-runs.ts';
import type { ValidateOptions } from '../../calculator/descriptors.ts';
import { decode, encode } from '../../url/codec.ts';
import { createGravel } from './index.ts';

const gravel = createGravel(GRAVEL_DENSITIES);

/** The validated state of raw inputs; a rejected record is a failed test. */
const stateOf = (raw: Readonly<Record<string, unknown>>, options?: ValidateOptions) => {
  const result = gravel.validate(raw, options);
  if (!result.ok) throw new Error(`invalid: ${JSON.stringify(result.errors)}`);
  return result.value;
};

describe('gravel url state (calc-gravel › URL and catalog)', () => {
  it.each([
    ['the default state', {}, undefined, 'v=1'],
    [
      'a loose path',
      { placement: 'loose', length: '30ft', width: '3ft' },
      undefined,
      'v=1&l=360&w=36&pl=loose',
    ],
    [
      'a metric state with a price',
      { depth: '10cm', waste: '7.5', tonPrice: '42.50' },
      { unitSystem: 'metric' as const },
      'v=1&u=m&d=500/127&ws=15/2&tp=85/2',
    ],
  ])('encodes %s', (_name, raw, options, query) => {
    expect(encode(gravel, stateOf(raw, options), options ?? {})).toBe(query);
  });

  it.each([
    ['v=1&pl=loose', { placement: 'loose' }, 'imperial'],
    ['v=1&u=m&d=6', { depth: '6in' }, 'metric'],
  ])('decodes %s', (query, raw, unitSystem) => {
    expect(decode(gravel, query)).toEqual({ state: stateOf(raw), unitSystem, issues: [] });
  });

  // spec: calc-gravel › [GR6] every valid state survives the link
  it('round-trips every valid state', () => {
    fc.assert(
      fc.property(gravelStateArb, fc.constantFrom('imperial', 'metric'), (state, unitSystem) => {
        const decoded = decode(gravel, encode(gravel, state, { unitSystem }));
        expect(decoded.state).toEqual(state);
        expect(decoded.unitSystem).toBe(unitSystem);
      }),
      { numRuns },
    );
  });
});
