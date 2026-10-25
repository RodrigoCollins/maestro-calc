import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { CONCRETE_YIELDS } from '../../__testing__/concrete-yields.ts';
import { concreteStateArb } from '../../__testing__/concrete-arbitraries.ts';
import { numRuns } from '../../__testing__/property-runs.ts';
import type { ValidateOptions } from '../../calculator/descriptors.ts';
import { decode, encode } from '../../url/codec.ts';
import { createConcrete } from './index.ts';

const concrete = createConcrete(CONCRETE_YIELDS);

/** The validated state of raw inputs; a rejected record is a failed test. */
const stateOf = (raw: Readonly<Record<string, unknown>>, options?: ValidateOptions) => {
  const result = concrete.validate(raw, options);
  if (!result.ok) throw new Error(`invalid: ${JSON.stringify(result.errors)}`);
  return result.value;
};

describe('concrete url state (calc-concrete › Shareable state)', () => {
  // spec: calc-concrete › [CC27] Encoding
  it.each([
    ['the default state', {}, undefined, 'v=1'],
    ['F1', { shape: 'footing', length: '18ft', count: '3' }, undefined, 'v=1&sh=footing&l=216&n=3'],
    [
      'a metric state',
      { length: '240in', waste: '12.5', bag: '60', bagPrice: '6.50' },
      { unitSystem: 'metric' as const },
      'v=1&u=m&l=240&ws=25/2&bg=60&bp=13/2',
    ],
    ['steps alone', { shape: 'steps' }, undefined, 'v=1&sh=steps'],
    ['a ready-mix price', { readyMixPrice: '$150' }, undefined, 'v=1&rp=150'],
    ['a rise and a run', { rise: '8in', run: '10in' }, undefined, 'v=1&rs=8&rn=10'],
  ])('encodes %s', (_name, raw, options, query) => {
    expect(encode(concrete, stateOf(raw, options), options ?? {})).toBe(query);
  });

  // spec: calc-concrete › [CC28] Decoding links
  it.each([
    ['v=1&sh=column&n=4', { shape: 'column', count: '4' }, 'imperial'],
    ['l=240&utm_source=x', { length: '240in' }, 'imperial'],
    ['v=1&u=m&l=240', { length: '240in' }, 'metric'],
  ])('decodes %s', (query, raw, unitSystem) => {
    expect(decode(concrete, query)).toEqual({ state: stateOf(raw), unitSystem, issues: [] });
  });

  // spec: calc-concrete › [CC28] Decoding links (illegal values fall back to defaults)
  it('falls back to the defaults and reports one issue per illegal value', () => {
    const decoded = decode(concrete, 'v=1&sh=Slab&bg=50&ws=51&n=0&ns=51');
    expect(decoded.state).toEqual(stateOf({}));
    expect(decoded.unitSystem).toBe('imperial');
    expect(decoded.issues.map(({ code, key }) => [code, key])).toEqual([
      ['INVALID_VALUE', 'sh'],
      ['INVALID_VALUE', 'bg'],
      ['INVALID_VALUE', 'ws'],
      ['INVALID_VALUE', 'n'],
      ['INVALID_VALUE', 'ns'],
    ]);
  });
});

describe('concrete url round trip (calc-concrete › [CC29] Round trip)', () => {
  it.each(['imperial', 'metric'] as const)('decodes what it encoded, in %s', (unitSystem) => {
    fc.assert(
      fc.property(concreteStateArb, (state) => {
        const query = encode(concrete, state, { unitSystem });
        expect(decode(concrete, query)).toEqual({ state, unitSystem, issues: [] });
      }),
      { numRuns },
    );
  });
});
