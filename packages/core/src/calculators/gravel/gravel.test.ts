import { describe, expect, it } from 'vitest';
import { GRAVEL_DENSITIES } from '../../__testing__/gravel-yields.ts';
import { CoreError } from '../../errors.ts';
import { usd } from '../../money/money.ts';
import { Rational } from '../../rational/rational.ts';
import { ft, ft3, inch, lbYd3, m3, ton, tonne, yd3 } from '../../units/catalog.ts';
import { isQuantity, quantity, valueIn, type Quantity } from '../../units/quantity.ts';
import { createGravel } from './index.ts';

const gravel = createGravel(GRAVEL_DENSITIES);

/** The outputs of a run, by key; a failed run is a failed test. */
const outputs = (raw: Readonly<Record<string, unknown>>) => {
  const result = gravel.run(raw);
  if (!result.ok) throw new Error(`run failed: ${JSON.stringify(result.errors)}`);
  return Object.fromEntries(result.value.outputs.map(({ key, value }) => [key, value]));
};

const quantityOf = (value: unknown): Quantity<'volume'> & Quantity<'mass'> => {
  if (!isQuantity(value)) throw new Error('not a quantity');
  return value as Quantity<'volume'> & Quantity<'mass'>;
};

/** The exact value of an output in a unit. */
const exact = (
  raw: Readonly<Record<string, unknown>>,
  key: string,
  unit: Parameters<typeof valueIn>[1],
) => valueIn(quantityOf(outputs(raw)[key]), unit as never);

const failure = (action: () => unknown): { code: string; reason?: string; cause?: unknown } => {
  try {
    action();
  } catch (error) {
    if (error instanceof CoreError) {
      return {
        code: error.code,
        ...(error.reason === undefined ? {} : { reason: error.reason }),
        cause: error.cause,
      };
    }
    throw error;
  }
  throw new Error('did not throw');
};

describe('gravel defaults (calc-gravel › Inputs)', () => {
  // spec: calc-gravel › [GR1] 20 ft by 10 ft by 4 in, compacted, 5 % extra, no price
  it('reads the defaults', () => {
    const state = gravel.validate({});
    expect(state.ok && state.value).toEqual({
      length: quantity(240, inch),
      width: quantity(120, inch),
      depth: quantity(4, inch),
      placement: 'compacted',
      waste: Rational.of(5),
      tonPrice: usd(0),
    });
  });
});

/*
 * Hand-verified: 20 ft × 10 ft × 4 in = 200/3 ft³ placed; with 5 % extra, 70 ft³ = 70/27 yd³. At
 * 3,660 lb/yd³ that is 70/27 × 3660 = 85400/9 lb = 427/90 short tons (4.744…). The loose volume to
 * order is 85400/9 ÷ 2580 = 4270/1161 yd³ (3.677…).
 */
describe('gravel weight and volume (calc-gravel › Weight and volume)', () => {
  // spec: calc-gravel › [GR2] the default driveway
  it('weighs the default compacted driveway and gives the loose volume to order', () => {
    expect(exact({}, 'placedYd3', ft3)).toEqual(Rational.of(200, 3));
    expect(exact({}, 'tons', ton)).toEqual(Rational.of(427, 90));
    expect(exact({}, 'tonnes', ton)).toEqual(Rational.of(427, 90));
    expect(exact({}, 'orderYd3', yd3)).toEqual(Rational.of(4270, 1161));
    expect(exact({}, 'orderM3', yd3)).toEqual(Rational.of(4270, 1161));
  });

  it('shows the hand-verified figures to two places', () => {
    const round = (value: Rational) => Number(value.toNumber().toFixed(2));
    expect(round(exact({}, 'placedYd3', yd3))).toBe(2.47);
    expect(round(exact({}, 'tons', ton))).toBe(4.74);
    expect(round(exact({}, 'tonnes', tonne))).toBe(4.3);
    expect(round(exact({}, 'orderYd3', yd3))).toBe(3.68);
    expect(round(exact({}, 'orderM3', m3))).toBe(2.81);
  });

  // spec: calc-gravel › [GR3] a loose layer orders its own volume: 70/27 × 2580 lb = 301/90 tons
  it('weighs a loose layer at the loose density and orders its total volume', () => {
    const loose = { placement: 'loose' };
    expect(exact(loose, 'tons', ton)).toEqual(Rational.of(301, 90));
    expect(exact(loose, 'orderYd3', yd3)).toEqual(Rational.of(70, 27));
    expect(exact(loose, 'placedYd3', ft3)).toEqual(Rational.of(200, 3));
  });

  it('weighs nothing for a zero depth and adds no extra at 0 %', () => {
    expect(exact({ depth: '0' }, 'tons', ton)).toEqual(Rational.ZERO);
    expect(exact({ waste: '0' }, 'tons', ton)).toEqual(Rational.of(1220, 270));
  });

  // spec: calc-gravel › [GR4] $45 a ton × 427/90 tons = $213.50
  it('costs the price per ton times the weight', () => {
    expect(outputs({ tonPrice: '45' })['cost']).toEqual(usd(Rational.of(4270, 20)));
    expect(outputs({})['cost']).toEqual(usd(0));
  });
});

describe('createGravel density validation (calc-gravel › Injected densities)', () => {
  const DENSITIES = {
    code: 'INVALID_DEFINITION',
    reason: 'GRAVEL_DENSITIES',
    cause: { id: 'gravel', reason: 'GRAVEL_DENSITIES' },
  };

  // spec: calc-gravel › [GR5] bad densities
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['a number', 3],
    ['a missing loose', { compacted: GRAVEL_DENSITIES.compacted }],
    ['an extra key', { ...GRAVEL_DENSITIES, wet: GRAVEL_DENSITIES.loose }],
    ['a zero compacted', { ...GRAVEL_DENSITIES, compacted: quantity(0, lbYd3) }],
    ['a negative loose', { ...GRAVEL_DENSITIES, loose: quantity(-1, lbYd3) }],
    ['a length for loose', { ...GRAVEL_DENSITIES, loose: quantity(1, ft) }],
    ['a number for compacted', { ...GRAVEL_DENSITIES, compacted: 3660 }],
    [
      'an inherited loose and an own extra',
      Object.assign(Object.create({ loose: GRAVEL_DENSITIES.loose }) as object, {
        compacted: GRAVEL_DENSITIES.compacted,
        wet: GRAVEL_DENSITIES.loose,
      }),
    ],
  ])('throws GRAVEL_DENSITIES for %s', (_name, densities) => {
    expect(failure(() => createGravel(densities as never))).toStrictEqual(DENSITIES);
  });

  it('keeps a snapshot, so a density the caller changes later is not seen', () => {
    const densities = { ...GRAVEL_DENSITIES };
    const own = createGravel(densities);
    densities.compacted = quantity(1, lbYd3);
    const result = own.run({});
    const tons = result.ok ? result.value.outputs.find(({ key }) => key === 'tons')?.value : 0;
    expect(valueIn(quantityOf(tons), ton)).toEqual(Rational.of(427, 90));
  });
});
