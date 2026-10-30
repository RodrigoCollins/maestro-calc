import { describe, expect, it } from 'vitest';
import { ROOFING_COVERAGE } from '../../__testing__/roofing-yields.ts';
import { CoreError } from '../../errors.ts';
import { usd } from '../../money/money.ts';
import { Rational } from '../../rational/rational.ts';
import { ft, ft2, inch, m2, sq } from '../../units/catalog.ts';
import { isQuantityOf, quantity, valueIn } from '../../units/quantity.ts';
import { createRoofing } from './index.ts';

const roofing = createRoofing(ROOFING_COVERAGE);

/** The run of `raw`; a failed run is a failed test. */
const runOf = (raw: Readonly<Record<string, unknown>>) => {
  const result = roofing.run(raw);
  if (!result.ok) throw new Error(`run failed: ${JSON.stringify(result.errors)}`);
  return result.value;
};

const outputs = (raw: Readonly<Record<string, unknown>>) =>
  Object.fromEntries(runOf(raw).outputs.map(({ key, value }) => [key, value]));

/** The exact value of an area output in a unit. */
const exact = (
  raw: Readonly<Record<string, unknown>>,
  key: string,
  unit: Parameters<typeof valueIn>[1],
) => {
  const value = outputs(raw)[key];
  if (!isQuantityOf(value, 'area')) throw new Error(`${key} is not an area`);
  return valueIn(value, unit as never);
};

const shown = (value: Rational) => Number(value.toNumber().toFixed(2));

/** The quantities of the shopping lines: bundles, rolls. */
const lines = (raw: Readonly<Record<string, unknown>>) =>
  runOf(raw).shopping.map(({ materialId, purchaseUnit, qty }) => [materialId, purchaseUnit, qty]);

const codes = (raw: Readonly<Record<string, unknown>>) =>
  runOf(raw).warnings.map(({ code, params }) => [code, params]);

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

/** √1.25 truncated to twenty decimals, the slope factor of 6 in 12. */
const SIX_IN_TWELVE = Rational.of(111803398874989484820n, 10n ** 20n);

describe('roofing defaults (calc-roofing › Inputs)', () => {
  // spec: calc-roofing › [RF1] a 40 ft by 30 ft footprint, 6 in 12, 10 % extra, no prices
  it('reads the defaults', () => {
    const state = roofing.validate({});
    expect(state.ok && state.value).toEqual({
      length: quantity(480, inch),
      width: quantity(360, inch),
      pitch: 6,
      waste: Rational.of(10),
      bundlePrice: usd(0),
      rollPrice: usd(0),
    });
  });
});

/*
 * Hand-verified (exact fractions): the footprint is 40 × 30 = 1,200 ft²; at 6 in 12 the slope factor
 * is √(1 + (6/12)²) = √1.25 = 1.11803398874989484820 (truncated), so the roof is
 * 1,341.64078649987381784 ft² = 13.42 squares = 124.64 m². Bundles: × 1.1 = 1,475.80…, ÷ 100/3 =
 * 44.27…, so 45. Underlayment at 4 in 12 or more is one layer lapped 2 in with 4 in end laps: a roll
 * covers (3,000 − 4) in × (48 − 2) in = 137,816 in² = 957.06 ft², so 1,475.80 ÷ 957.06 = 1.54…, 2
 * rolls. Below 4 in 12 two layers: (48 − 2) / 2 = 23 in of exposure, 478.53 ft² a roll.
 */
describe('roofing area and materials (calc-roofing › Roof area and materials)', () => {
  // spec: calc-roofing › [RF2] the default roof
  it('measures the roof from the footprint and the pitch and gives the materials', () => {
    expect(exact({}, 'areaFt2', ft2)).toEqual(Rational.of(1200).mul(SIX_IN_TWELVE));
    expect(exact({}, 'squares', sq)).toEqual(Rational.of(12).mul(SIX_IN_TWELVE));
    expect(shown(exact({}, 'squares', sq))).toBe(13.42);
    expect(shown(exact({}, 'areaFt2', ft2))).toBe(1341.64);
    expect(shown(exact({}, 'areaM2', m2))).toBe(124.64);
    expect(lines({})).toEqual([
      ['shingles', 'bundle', 45n],
      ['underlayment', 'roll', 2n],
    ]);
    expect(codes({})).toEqual([]);
  });

  // spec: calc-roofing › [RF3] a flat footprint is the roof; 12 in 12 is √2 times it
  it('follows the pitch', () => {
    expect(exact({ pitch: '0' }, 'areaFt2', ft2)).toEqual(Rational.of(1200));
    expect(lines({ pitch: '0' }).map(([, , qty]) => qty)).toEqual([40n, 3n]);
    expect(shown(exact({ pitch: '12' }, 'areaFt2', ft2))).toBe(1697.06);
    expect(lines({ pitch: '12' }).map(([, , qty]) => qty)).toEqual([57n, 2n]);
    expect(lines({ waste: '0' }).map(([, , qty]) => qty)).toEqual([41n, 2n]);
    const large = { length: '60', width: '40', pitch: '8', waste: '15' };
    expect(shown(exact(large, 'areaFt2', ft2))).toBe(2884.44);
    expect(lines(large).map(([, , qty]) => qty)).toEqual([100n, 4n]);
  });

  // spec: calc-roofing › [RF4] IRC R905.1.1, Table R905.1.1(2): two layers from 2 in 12 up to 4 in 12
  it('doubles the underlayment below 4 in 12', () => {
    expect(shown(exact({ pitch: '3' }, 'areaFt2', ft2))).toBe(1236.93);
    expect(lines({ pitch: '3' })).toEqual([
      ['shingles', 'bundle', 41n],
      ['underlayment', 'roll', 3n],
    ]);
    expect(codes({ pitch: '3' })).toEqual([['doubleUnderlayment', {}]]);
    expect(codes({ pitch: '2' })).toEqual([['doubleUnderlayment', {}]]);
    expect(lines({ pitch: '4' }).map(([, , qty]) => qty)).toEqual([42n, 2n]);
    expect(codes({ pitch: '4' })).toEqual([]);
  });

  // spec: calc-roofing › [RF5] IRC R905.2.2: asphalt shingles need 2 in 12 or more
  it('warns below the shingle minimum and still counts two layers', () => {
    expect(codes({ pitch: '1' })).toEqual([['belowMinimum', { minimum: 2 }]]);
    expect(codes({ pitch: '0' })).toEqual([['belowMinimum', { minimum: 2 }]]);
    expect(lines({ pitch: '1' }).map(([, , qty]) => qty)).toEqual([40n, 3n]);
  });

  // spec: calc-roofing › [RF6] $35 a bundle × 45 + $90 a roll × 2 = $1,755.00
  it('costs the bundles and the rolls at their prices', () => {
    expect(outputs({ bundlePrice: '35', rollPrice: '90' })['cost']).toEqual(usd(1755));
    expect(outputs({ bundlePrice: '35' })['cost']).toEqual(usd(1575));
    expect(outputs({})['cost']).toEqual(usd(0));
  });

  it('covers nothing on an empty footprint', () => {
    expect(exact({ length: '0' }, 'areaFt2', ft2)).toEqual(Rational.ZERO);
    expect(lines({ length: '0' }).map(([, , qty]) => qty)).toEqual([0n, 0n]);
  });
});

describe('createRoofing coverage validation (calc-roofing › Injected coverage)', () => {
  const COVERAGE = {
    code: 'INVALID_DEFINITION',
    reason: 'ROOFING_COVERAGE',
    cause: { id: 'roofing', reason: 'ROOFING_COVERAGE' },
  };

  // spec: calc-roofing › [RF7] bad coverage
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['a number', 3],
    [
      'a missing roll length',
      { bundle: ROOFING_COVERAGE.bundle, rollWidth: ROOFING_COVERAGE.rollWidth },
    ],
    ['an extra key', { ...ROOFING_COVERAGE, nails: ROOFING_COVERAGE.rollWidth }],
    ['a zero bundle', { ...ROOFING_COVERAGE, bundle: quantity(0, ft2) }],
    ['a length for the bundle', { ...ROOFING_COVERAGE, bundle: quantity(33, ft) }],
    ['an area for the width', { ...ROOFING_COVERAGE, rollWidth: quantity(4, ft2) }],
    ['a plain number', { ...ROOFING_COVERAGE, rollLength: 250 }],
    ['a roll no wider than its side lap', { ...ROOFING_COVERAGE, rollWidth: quantity(2, inch) }],
    ['a roll no longer than its end lap', { ...ROOFING_COVERAGE, rollLength: quantity(4, inch) }],
    [
      'an inherited key and an own extra',
      Object.assign(Object.create({ rollLength: ROOFING_COVERAGE.rollLength }) as object, {
        bundle: ROOFING_COVERAGE.bundle,
        rollWidth: ROOFING_COVERAGE.rollWidth,
        extra: ROOFING_COVERAGE.rollLength,
      }),
    ],
  ])('throws ROOFING_COVERAGE for %s', (_name, coverage) => {
    expect(failure(() => createRoofing(coverage as never))).toEqual(COVERAGE);
  });

  it('keeps a frozen snapshot: a later change to the supplied record changes nothing', () => {
    const supplied = { ...ROOFING_COVERAGE };
    const calculator = createRoofing(supplied);
    supplied.bundle = quantity(100, ft2);
    const result = calculator.run({});
    expect(result.ok && result.value.shopping[0]?.qty).toBe(45n);
  });
});
