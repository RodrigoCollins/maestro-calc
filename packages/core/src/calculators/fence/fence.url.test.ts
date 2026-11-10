import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { CONCRETE_YIELDS } from '../../__testing__/concrete-yields.ts';
import { fenceStateArb } from '../../__testing__/fence-arbitraries.ts';
import { numRuns } from '../../__testing__/property-runs.ts';
import type { ValidateOptions } from '../../calculator/descriptors.ts';
import { decode, encode } from '../../url/codec.ts';
import { createFence } from './index.ts';

const fence = createFence(CONCRETE_YIELDS);

/** The validated state of raw inputs; a rejected record is a failed test. */
const stateOf = (raw: Readonly<Record<string, unknown>>, options?: ValidateOptions) => {
  const result = fence.validate(raw, options);
  if (!result.ok) throw new Error(`invalid: ${JSON.stringify(result.errors)}`);
  return result.value;
};

describe('fence url state (calc-fence › URL and catalog)', () => {
  it.each([
    ['the default state', {}, undefined, 'v=1'],
    [
      'a 50 ft picket fence, 4 ft high',
      { length: '50ft', height: '4ft', style: 'picket' },
      undefined,
      'v=1&l=600&h=48&s=picket',
    ],
    ['two gates and posts every 6 ft', { gates: '2', spacing: '6ft' }, undefined, 'v=1&sp=72&g=2'],
    ['a priced post', { postPrice: '19.98' }, undefined, 'v=1&pp=999/50'],
    ['a metric state', { length: '30' }, { unitSystem: 'metric' as const }, 'v=1&u=m&l=150000/127'],
  ])('encodes %s', (_name, raw, options, query) => {
    expect(encode(fence, stateOf(raw, options), options ?? {})).toBe(query);
  });

  it('decodes a link', () => {
    expect(decode(fence, 'v=1&l=2400&s=rail&r=2')).toEqual({
      state: stateOf({ length: '200ft', style: 'rail', rails: '2' }),
      unitSystem: 'imperial',
      issues: [],
    });
  });

  // spec: calc-fence › [FN16] every valid state survives the link
  it.each(['imperial', 'metric'] as const)('round-trips every valid state (%s)', (unitSystem) => {
    fc.assert(
      fc.property(fenceStateArb, (state) => {
        expect(decode(fence, encode(fence, state, { unitSystem }))).toEqual({
          state,
          unitSystem,
          issues: [],
        });
      }),
      { numRuns },
    );
  });
});
