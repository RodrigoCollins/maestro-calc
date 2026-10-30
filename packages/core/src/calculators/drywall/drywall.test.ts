import { describe, expect, it } from 'vitest';
import { DRYWALL_FINISHING } from '../../__testing__/drywall-yields.ts';
import { CoreError } from '../../errors.ts';
import { usd } from '../../money/money.ts';
import { Rational } from '../../rational/rational.ts';
import { ft, ft2, gal, inch, m2 } from '../../units/catalog.ts';
import { isQuantity, quantity, valueIn, type Quantity } from '../../units/quantity.ts';
import { createDrywall } from './index.ts';

const drywall = createDrywall(DRYWALL_FINISHING);

/** The run of `raw`; a failed run is a failed test. */
const runOf = (raw: Readonly<Record<string, unknown>>) => {
  const result = drywall.run(raw);
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
  return valueIn(value as Quantity<'area'>, unit as never);
};

/** The quantities of the shopping lines: sheets, pails, rolls. */
const lines = (raw: Readonly<Record<string, unknown>>) =>
  runOf(raw).shopping.map(({ materialId, purchaseUnit, qty }) => [materialId, purchaseUnit, qty]);

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

describe('drywall defaults (calc-drywall › Inputs)', () => {
  // spec: calc-drywall › [DW1] a 12 ft by 12 ft room, 8 ft walls, 1 door, 2 windows, walls and
  // ceiling, 4 by 8 sheets, 10 % extra, no price
  it('reads the defaults', () => {
    const state = drywall.validate({});
    expect(state.ok && state.value).toEqual({
      length: quantity(144, inch),
      width: quantity(144, inch),
      height: quantity(96, inch),
      doors: 1,
      windows: 2,
      surfaces: 'walls-ceiling',
      sheet: '4x8',
      waste: Rational.of(10),
      sheetPrice: usd(0),
    });
  });
});

/*
 * Hand-verified: the walls are 2 × (12 + 12) × 8 = 384 ft², less 1 door (20 ft²) and 2 windows
 * (30 ft²) = 334 ft², plus the 144 ft² ceiling = 478 ft². Sheets: 478 × 1.1 = 525.8 ft², ÷ 32 =
 * 16.43…, so 17 (÷ 48 = 10.95…, so 11 of 4 by 12). Compound: 478 × 9 / 1000 = 2151/500 gal
 * (4.302), ÷ 4.5 = 0.956…, so 1 pail. Tape: 478 × 370 / 1000 = 8843/50 ft (176.86), so 1 roll.
 */
describe('drywall area and materials (calc-drywall › Area and materials)', () => {
  // spec: calc-drywall › [DW2] the default room
  it('measures the walls and the ceiling, less the openings, and gives the materials', () => {
    expect(exact({}, 'areaFt2', ft2)).toEqual(Rational.of(478));
    expect(exact({}, 'areaM2', ft2)).toEqual(Rational.of(478));
    expect(exact({}, 'compound', gal)).toEqual(Rational.of(2151, 500));
    expect(exact({}, 'tape', ft)).toEqual(Rational.of(8843, 50));
    expect(lines({})).toEqual([
      ['drywall', 'sheet-4x8', 17n],
      ['joint-compound', 'pail', 1n],
      ['joint-tape', 'roll', 1n],
    ]);
  });

  it('shows the hand-verified area in square meters to two places', () => {
    expect(Number(exact({}, 'areaM2', m2).toNumber().toFixed(2))).toBe(44.41);
  });

  // spec: calc-drywall › [DW3] 4 by 12 sheets, walls only, no extra
  it('counts the sheets by size, leaves the ceiling out and takes the extra from the sheets only', () => {
    expect(lines({ sheet: '4x12' })[0]).toEqual(['drywall', 'sheet-4x12', 11n]);
    expect(exact({ surfaces: 'walls' }, 'areaFt2', ft2)).toEqual(Rational.of(334));
    expect(lines({ surfaces: 'walls' })[0]).toEqual(['drywall', 'sheet-4x8', 12n]);
    expect(lines({ waste: '0' })[0]).toEqual(['drywall', 'sheet-4x8', 15n]);
    expect(exact({ waste: '0' }, 'compound', gal)).toEqual(Rational.of(2151, 500));
  });

  // spec: calc-drywall › [DW4] a large room: 3,640 ft², 126 sheets, 8 pails, 3 rolls
  it('scales the pails and the rolls with the area', () => {
    const hall = { length: '50', width: '40', height: '10', doors: '2', windows: '8' };
    expect(exact(hall, 'areaFt2', ft2)).toEqual(Rational.of(3640));
    expect(lines(hall).map(([, , qty]) => qty)).toEqual([126n, 8n, 3n]);
  });

  // spec: calc-drywall › [DW5] openings larger than the walls cover nothing, never a negative area
  it('covers only the ceiling when the openings cover the walls', () => {
    const tiny = { length: '1', width: '1', height: '1' };
    expect(exact(tiny, 'areaFt2', ft2)).toEqual(Rational.of(1));
    expect(exact({ ...tiny, surfaces: 'walls' }, 'areaFt2', ft2)).toEqual(Rational.ZERO);
    expect(lines({ ...tiny, surfaces: 'walls' }).map(([, , qty]) => qty)).toEqual([0n, 0n, 0n]);
  });

  // spec: calc-drywall › [DW6] $12 a sheet × 17 sheets = $204.00
  it('costs the price per sheet times the sheets', () => {
    expect(outputs({ sheetPrice: '12' })['cost']).toEqual(usd(204));
    expect(outputs({})['cost']).toEqual(usd(0));
  });
});

describe('createDrywall finishing validation (calc-drywall › Injected finishing rates)', () => {
  const FINISHING = {
    code: 'INVALID_DEFINITION',
    reason: 'DRYWALL_FINISHING',
    cause: { id: 'drywall', reason: 'DRYWALL_FINISHING' },
  };

  // spec: calc-drywall › [DW7] bad finishing rates
  it.each([
    ['null', null],
    ['a number', 9],
    ['a missing tape', { per: DRYWALL_FINISHING.per, compound: DRYWALL_FINISHING.compound }],
    ['an extra key', { ...DRYWALL_FINISHING, screws: DRYWALL_FINISHING.tape }],
    ['a zero area', { ...DRYWALL_FINISHING, per: quantity(0, ft2) }],
    ['a negative compound', { ...DRYWALL_FINISHING, compound: quantity(-1, gal) }],
    ['a length for compound', { ...DRYWALL_FINISHING, compound: quantity(9, ft) }],
    ['an area for tape', { ...DRYWALL_FINISHING, tape: quantity(370, ft2) }],
    ['a plain number', { ...DRYWALL_FINISHING, tape: 370 }],
    [
      'an inherited key and an own extra',
      Object.assign(Object.create({ tape: DRYWALL_FINISHING.tape }) as object, {
        per: DRYWALL_FINISHING.per,
        compound: DRYWALL_FINISHING.compound,
        screws: DRYWALL_FINISHING.tape,
      }),
    ],
  ])('throws DRYWALL_FINISHING for %s', (_name, finishing) => {
    expect(failure(() => createDrywall(finishing as never))).toStrictEqual(FINISHING);
  });

  it('keeps a snapshot, so a rate the caller changes later is not seen', () => {
    const finishing = { ...DRYWALL_FINISHING };
    const own = createDrywall(finishing);
    finishing.compound = quantity(1, gal);
    const result = own.run({});
    const compound = result.ok
      ? result.value.outputs.find(({ key }) => key === 'compound')?.value
      : undefined;
    expect(isQuantity(compound) && valueIn(compound as Quantity<'volume'>, gal)).toEqual(
      Rational.of(2151, 500),
    );
  });
});
