import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { paintStateArb } from '../../__testing__/paint-arbitraries.ts';
import { PAINT_COVERAGE } from '../../__testing__/paint-yields.ts';
import { numRuns } from '../../__testing__/property-runs.ts';
import type { ValidateOptions } from '../../calculator/descriptors.ts';
import { decode, encode } from '../../url/codec.ts';
import { createPaint } from './index.ts';

const paint = createPaint(PAINT_COVERAGE);

/** The validated state of raw inputs; a rejected record is a failed test. */
const stateOf = (raw: Readonly<Record<string, unknown>>, options?: ValidateOptions) => {
  const result = paint.validate(raw, options);
  if (!result.ok) throw new Error(`invalid: ${JSON.stringify(result.errors)}`);
  return result.value;
};

describe('paint url state (calc-paint › URL and catalog)', () => {
  it.each([
    ['the default state', {}, undefined, 'v=1'],
    [
      'a long room with no windows and three coats',
      { length: '20ft', windows: '0', coats: '3' },
      undefined,
      'v=1&l=240&wn=0&c=3',
    ],
    [
      'a metric state with a price',
      { height: '2.5m', gallonPrice: '42.50' },
      { unitSystem: 'metric' as const },
      'v=1&u=m&h=12500/127&gp=85/2',
    ],
  ])('encodes %s', (_name, raw, options, query) => {
    expect(encode(paint, stateOf(raw, options), options ?? {})).toBe(query);
  });

  it.each([
    ['v=1&dr=2', { doors: '2' }, 'imperial'],
    ['v=1&u=m&h=120', { height: '10ft' }, 'metric'],
  ])('decodes %s', (query, raw, unitSystem) => {
    expect(decode(paint, query)).toEqual({ state: stateOf(raw), unitSystem, issues: [] });
  });

  // spec: calc-paint › [PA7] every valid state survives the link
  it('round-trips every valid state', () => {
    fc.assert(
      fc.property(paintStateArb, fc.constantFrom('imperial', 'metric'), (state, unitSystem) => {
        const decoded = decode(paint, encode(paint, state, { unitSystem }));
        expect(decoded.state).toEqual(state);
        expect(decoded.unitSystem).toBe(unitSystem);
      }),
      { numRuns },
    );
  });
});
