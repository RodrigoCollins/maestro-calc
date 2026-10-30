import { describe, expect, it } from 'vitest';
import { PAINT_COVERAGE } from '../../__testing__/paint-yields.ts';
import { CoreError } from '../../errors.ts';
import { usd } from '../../money/money.ts';
import { Rational } from '../../rational/rational.ts';
import { ft, ft2, ft3, gal, inch, liter } from '../../units/catalog.ts';
import { isQuantity, quantity, valueIn, type Quantity } from '../../units/quantity.ts';
import { createPaint } from './index.ts';

const paint = createPaint(PAINT_COVERAGE);

/** The run of `raw`; a failed run is a failed test. */
const runOf = (raw: Readonly<Record<string, unknown>>) => {
  const result = paint.run(raw);
  if (!result.ok) throw new Error(`run failed: ${JSON.stringify(result.errors)}`);
  return result.value;
};

const outputs = (raw: Readonly<Record<string, unknown>>) =>
  Object.fromEntries(runOf(raw).outputs.map(({ key, value }) => [key, value]));

/** The exact value of an output in a unit. */
const exact = (
  raw: Readonly<Record<string, unknown>>,
  key: string,
  unit: Parameters<typeof valueIn>[1],
) => {
  const value = outputs(raw)[key];
  if (!isQuantity(value)) throw new Error(`${key} is not a quantity`);
  return valueIn(value as Quantity<'volume'> & Quantity<'area'>, unit as never);
};

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

describe('paint defaults (calc-paint › Inputs)', () => {
  // spec: calc-paint › [PA1] a 12 ft by 12 ft room, 8 ft walls, 1 door, 2 windows, 2 coats, no price
  it('reads the defaults', () => {
    const state = paint.validate({});
    expect(state.ok && state.value).toEqual({
      length: quantity(144, inch),
      width: quantity(144, inch),
      height: quantity(96, inch),
      doors: 1,
      windows: 2,
      coats: 2,
      gallonPrice: usd(0),
    });
  });
});

/*
 * Hand-verified: the walls of a 12 ft × 12 ft room are 2 × (12 + 12) × 8 = 384 ft². One door
 * (20 ft²) and two windows (2 × 15 ft²) leave 334 ft². Two coats are 668 ft², and at 350 ft² a
 * gallon that is 668/350 = 334/175 gal (1.908…), so 2 gallon cans. 334/175 gal × 231 in³ =
 * 77154/175 in³ = 7.2247… L.
 */
describe('paint area and gallons (calc-paint › Area and gallons)', () => {
  // spec: calc-paint › [PA2] the default room
  it('measures the walls, leaves out the openings and gives the gallons', () => {
    expect(exact({}, 'wallArea', ft2)).toEqual(Rational.of(384));
    expect(exact({}, 'paintArea', ft2)).toEqual(Rational.of(334));
    expect(exact({}, 'gallons', gal)).toEqual(Rational.of(334, 175));
    expect(exact({}, 'liters', gal)).toEqual(Rational.of(334, 175));
    expect(runOf({}).shopping).toEqual([{ materialId: 'paint', purchaseUnit: 'gallon', qty: 2n }]);
  });

  it('shows the hand-verified figures to two places', () => {
    const round = (value: Rational) => Number(value.toNumber().toFixed(2));
    expect(round(exact({}, 'gallons', gal))).toBe(1.91);
    expect(round(exact({}, 'liters', liter))).toBe(7.22);
  });

  // spec: calc-paint › [PA3] three coats: 1002/350 = 2.86 gal, 3 cans; no openings: 768/350 = 2.19 gal
  it('scales with the coats and keeps the walls whole without openings', () => {
    expect(exact({ coats: '3' }, 'gallons', gal)).toEqual(Rational.of(501, 175));
    expect(runOf({ coats: '3' }).shopping[0]?.qty).toBe(3n);
    expect(exact({ doors: '0', windows: '0' }, 'gallons', gal)).toEqual(Rational.of(384, 175));
    expect(runOf({ doors: '0', windows: '0' }).shopping[0]?.qty).toBe(3n);
  });

  // spec: calc-paint › [PA4] openings larger than the walls paint nothing, never a negative amount
  it('paints nothing when the openings cover the walls', () => {
    const tiny = { length: '1', width: '1', height: '1' };
    expect(exact(tiny, 'wallArea', ft2)).toEqual(Rational.of(4));
    expect(exact(tiny, 'paintArea', ft2)).toEqual(Rational.ZERO);
    expect(exact(tiny, 'gallons', gal)).toEqual(Rational.ZERO);
    expect(runOf(tiny).shopping[0]?.qty).toBe(0n);
  });

  // spec: calc-paint › [PA5] $40 a gallon × 2 cans = $80.00
  it('costs the price per gallon times the whole cans', () => {
    expect(outputs({ gallonPrice: '40' })['cost']).toEqual(usd(80));
    expect(outputs({})['cost']).toEqual(usd(0));
  });
});

describe('createPaint coverage validation (calc-paint › Injected coverage)', () => {
  const COVERAGE = {
    code: 'INVALID_DEFINITION',
    reason: 'PAINT_COVERAGE',
    cause: { id: 'paint', reason: 'PAINT_COVERAGE' },
  };

  // spec: calc-paint › [PA6] bad coverage
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['a number', 350],
    ['no key', {}],
    ['an extra key', { ...PAINT_COVERAGE, perQuart: PAINT_COVERAGE.perGallon }],
    ['a zero area', { perGallon: quantity(0, ft2) }],
    ['a negative area', { perGallon: quantity(-1, ft2) }],
    ['a length', { perGallon: quantity(1, ft) }],
    ['a volume', { perGallon: quantity(1, ft3) }],
    ['a plain number', { perGallon: 350 }],
    [
      'an inherited key and an own extra',
      Object.assign(Object.create({ perGallon: PAINT_COVERAGE.perGallon }) as object, {
        perQuart: PAINT_COVERAGE.perGallon,
      }),
    ],
  ])('throws PAINT_COVERAGE for %s', (_name, coverage) => {
    expect(failure(() => createPaint(coverage as never))).toStrictEqual(COVERAGE);
  });

  it('keeps a snapshot, so a coverage the caller changes later is not seen', () => {
    const coverage = { ...PAINT_COVERAGE };
    const own = createPaint(coverage);
    coverage.perGallon = quantity(1, ft2);
    const result = own.run({});
    const gallons = result.ok
      ? result.value.outputs.find(({ key }) => key === 'gallons')?.value
      : undefined;
    expect(isQuantity(gallons) && valueIn(gallons as Quantity<'volume'>, gal)).toEqual(
      Rational.of(334, 175),
    );
  });
});
