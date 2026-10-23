import { describe, expect, it } from 'vitest';
import type { UnitSystem } from '../../calculator/descriptors.ts';
import { findUnit, ft, inch } from '../../units/catalog.ts';
import { quantity, valueIn } from '../../units/quantity.ts';
import { rectangleArea } from './index.ts';

type Raw = Readonly<Record<string, unknown>>;

/** The three areas of a run as canonical text, each in the display unit of its output. */
const areasOf = (raw: Raw, options?: { unitSystem?: UnitSystem }): Record<string, string> => {
  const result = rectangleArea.run(raw, options);
  if (!result.ok) throw new Error(`run failed: ${JSON.stringify(result.errors)}`);
  return Object.fromEntries(
    result.value.outputs.map(({ key, value }) => {
      const display = rectangleArea.outputs.find((output) => output.key === key)?.display;
      const unit = findUnit('area', display?.unit ?? '');
      if (unit === undefined) throw new Error(`no display unit for ${key}`);
      return [key, valueIn(value, unit).toString()];
    }),
  );
};

/** What a run came to: the errors of a failed run, or the value of a successful one. */
const outcomeOf = (raw: Raw, options?: { unitSystem?: UnitSystem }): unknown => {
  const result = rectangleArea.run(raw, options);
  return result.ok ? result.value : result.errors;
};

const areas = (areaFt2: string, areaYd2: string, areaM2: string) => ({
  areaFt2,
  areaYd2,
  areaM2,
});

describe('rectangle-area descriptor (calc-rectangle-area › Descriptor)', () => {
  // spec: Metadata [RA1]
  it('declares the length and width inputs and the three area outputs', () => {
    const input = (key: string, urlKey: string) => ({
      kind: 'length',
      key,
      urlKey,
      default: quantity(120, inch),
      defaultUnit: 'ft',
      metricDefaultUnit: 'm',
      min: quantity(0, inch),
      max: quantity(100000, ft),
    });
    expect(rectangleArea.id).toBe('rectangle-area');
    expect(rectangleArea.inputs).toEqual([input('length', 'l'), input('width', 'w')]);
    expect(rectangleArea.outputs).toEqual([
      {
        key: 'areaFt2',
        measure: 'area',
        role: 'primary',
        display: { unit: 'ft2', format: 'decimal', places: 2 },
      },
      {
        key: 'areaYd2',
        measure: 'area',
        role: 'secondary',
        display: { unit: 'yd2', format: 'decimal', places: 2 },
      },
      {
        key: 'areaM2',
        measure: 'area',
        role: 'secondary',
        display: { unit: 'm2', format: 'decimal', places: 2 },
      },
    ]);
    expect(rectangleArea.warnings).toEqual([]);
    expect(rectangleArea.retiredUrlKeys).toEqual([]);
  });

  // spec: Defaults (case F) [RA4]
  it('computes 100 ft2 for the default 10 ft by 10 ft', () => {
    expect(areasOf({})).toEqual(areas('100', '100/9', '145161/15625'));
  });
});

describe('rectangle-area computation (calc-rectangle-area › Area computation)', () => {
  // spec: Mixed imperial feet-inch-fraction (cases A, B, C) [RA2]
  it.each([
    ['A', { length: "10'", width: '12\' 6"' }, areas('125', '125/9', '145161/12500')],
    ['B', { length: '3\' 6"', width: "2'" }, areas('7', '7/9', '1016127/1562500')],
    ['C', { length: '5\' 3-1/2"', width: "2'" }, areas('127/12', '127/108', '6145149/6250000')],
  ])('case %s is exact', (_name, raw, expected) => {
    expect(areasOf(raw)).toEqual(expected);
  });

  // spec: Metric and mixed units (cases D, E) [RA3]
  it.each([
    ['D', { length: '3 m', width: '2 m' }, areas('3125000/48387', '3125000/435483', '6')],
    ['E', { length: "10'", width: '2 m' }, areas('25000/381', '25000/3429', '762/125')],
  ])('case %s is exact', (_name, raw, expected) => {
    expect(areasOf(raw)).toEqual(expected);
  });

  // spec: Zero dimension (case G) [RA5]
  it('is zero with a zero side', () => {
    expect(areasOf({ length: '0', width: "10'" })).toEqual(areas('0', '0', '0'));
  });

  // spec: Unit-less numbers are feet (imperial) [RA6]
  it('reads bare numbers as feet under the imperial system', () => {
    expect(areasOf({ length: '10', width: '12.5' })['areaFt2']).toBe('125');
  });

  // spec: Unit-less numbers are metres (metric) [RA7]
  it('reads bare numbers as metres under the metric system', () => {
    const metric = { unitSystem: 'metric' } as const;
    expect(areasOf({ length: '3', width: '2' }, metric)).toEqual(
      areas('3125000/48387', '3125000/435483', '6'),
    );
    expect(areasOf({ length: "10'", width: '2' }, metric)).toEqual(
      areas('25000/381', '25000/3429', '762/125'),
    );
  });

  // spec: Maximum bounds (case H) [RA8]
  it('accepts the maximum of 100000 ft on both sides and rejects 100001 ft', () => {
    expect(areasOf({ length: "100000'", width: "100000'" })).toEqual(
      areas('10000000000', '10000000000/9', '929030400'),
    );
    expect(outcomeOf({ length: "100001'" })).toEqual([
      { field: 'length', code: 'ABOVE_MAX', params: { max: '1200000' } },
    ]);
  });
});

describe('rectangle-area invalid inputs (calc-rectangle-area › Invalid inputs)', () => {
  // spec: Invalid inputs [RA9]
  it.each([
    [{ length: '-1' }, 'length', 'BELOW_MIN'],
    [{ width: 'abc' }, 'width', 'MALFORMED'],
    [{ length: '1/0' }, 'length', 'ZERO_DENOMINATOR'],
    [{ width: '5 furlongs' }, 'width', 'UNKNOWN_UNIT'],
    [{ length: '' }, 'length', 'EMPTY'],
    [{ length: '1e9' }, 'length', 'MALFORMED'],
    [{ length: '999999999999999999 ft' }, 'length', 'ABOVE_MAX'],
    [{ width: '10,5' }, 'width', 'DECIMAL_COMMA'],
    [{ length: '10 ft2' }, 'length', 'UNKNOWN_UNIT'],
  ])('%j fails with %s %s and no result', (raw, field, code) => {
    const result = rectangleArea.run(raw);
    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.errors.map((error) => [error.field, error.code])).toEqual([
      [field, code],
    ]);
  });
});
