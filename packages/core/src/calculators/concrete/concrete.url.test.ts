import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { CONCRETE_YIELDS } from '../../__testing__/concrete-yields.ts';
import { numRuns } from '../../__testing__/property-runs.ts';
import type { ValidateOptions } from '../../calculator/descriptors.ts';
import { usd } from '../../money/money.ts';
import { Rational } from '../../rational/rational.ts';
import { inch } from '../../units/catalog.ts';
import { quantity } from '../../units/quantity.ts';
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

/** A length in inches up to `max`, with a small denominator. */
const inches = (max: number) =>
  fc
    .integer({ min: 1, max: 8 })
    .chain((den) =>
      fc
        .bigInt({ min: 0n, max: BigInt(max) * BigInt(den) })
        .map((num) => quantity(Rational.of(num, BigInt(den)), inch)),
    );

const cents = fc.integer({ min: 0, max: 1_000_000 }).map((value) => usd(Rational.of(value, 100)));

const stateArb = fc.record({
  shape: fc.constantFrom('slab', 'footing', 'column', 'steps'),
  length: inches(12000),
  width: inches(12000),
  thickness: inches(120),
  footingWidth: inches(120),
  footingDepth: inches(120),
  diameter: inches(240),
  height: inches(1200),
  stepWidth: inches(1200),
  rise: inches(60),
  run: inches(60),
  stepCount: fc.integer({ min: 0, max: 50 }),
  count: fc.integer({ min: 1, max: 1000 }),
  waste: fc.integer({ min: 0, max: 500 }).map((tenths) => Rational.of(tenths, 10)),
  bag: fc.constantFrom('40', '60', '80'),
  bagPrice: cents,
  readyMixPrice: cents,
});

describe('concrete url round trip (calc-concrete › [CC29] Round trip)', () => {
  it.each(['imperial', 'metric'] as const)('decodes what it encoded, in %s', (unitSystem) => {
    fc.assert(
      fc.property(stateArb, (state) => {
        const query = encode(concrete, state, { unitSystem });
        expect(decode(concrete, query)).toEqual({ state, unitSystem, issues: [] });
      }),
      { numRuns },
    );
  });
});
