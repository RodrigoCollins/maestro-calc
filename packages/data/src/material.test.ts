import { CoreError, ft2, in2, quantity, Rational, valueIn } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import * as data from './index.ts';
import { defineMaterial, type MaterialRecord } from './material.ts';

/** The plywood sheet of the spec: one purchase unit of 32 ft2 (4 ft x 8 ft). */
const plywood = (): MaterialRecord<'plywood-sheet'> => ({
  id: 'plywood-sheet',
  nameKey: 'material.plywood-sheet.name',
  purchaseUnits: [
    {
      id: 'sheet',
      nameKey: 'material.plywood-sheet.units.sheet',
      size: quantity(32, ft2),
    },
  ],
  source: { name: 'Manufacturer catalog', retrieved: '2026-10-22' },
});

/** What a failed definition reports: the code, the reason and the locus carried as the cause. */
const failure = (record: unknown): { code: string; reason?: string; cause?: unknown } => {
  try {
    defineMaterial(record as MaterialRecord);
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
  return { code: 'NONE' };
};

const withSource = (retrieved: string): MaterialRecord<'plywood-sheet'> => ({
  ...plywood(),
  source: { name: 'Manufacturer catalog', retrieved },
});

describe('defineMaterial (material-data-contract › Material record shape)', () => {
  // spec: material-data-contract › Valid plywood sheet [MD1]
  it('returns the record with equal content and 4608 in2 for 32 ft2', () => {
    const material = defineMaterial(plywood());
    expect(material).toEqual(plywood());
    expect(valueIn(material.purchaseUnits[0].size, in2)).toEqual(Rational.of(4608));
  });

  it('keeps an optional source url and several purchase units', () => {
    const record = {
      ...plywood(),
      purchaseUnits: [
        ...plywood().purchaseUnits,
        {
          id: 'half-sheet',
          nameKey: 'material.plywood-sheet.units.half-sheet',
          size: quantity(16, ft2),
        },
      ],
      source: { name: 'Catalog', retrieved: '2026-10-22', url: 'https://example.com/plywood' },
    } as const;
    const material = defineMaterial(record);
    expect(material.purchaseUnits.map(({ id }) => id)).toEqual(['sheet', 'half-sheet']);
    expect(material.source.url).toBe('https://example.com/plywood');
  });

  it('freezes the record, the purchase units, each unit and the source', () => {
    const material = defineMaterial(plywood());
    expect([
      Object.isFrozen(material),
      Object.isFrozen(material.purchaseUnits),
      Object.isFrozen(material.purchaseUnits[0]),
      Object.isFrozen(material.source),
    ]).toEqual([true, true, true, true]);
    const mutable = material as { id: string; source: { name: string } };
    expect(() => {
      mutable.id = 'other';
    }).toThrow(TypeError);
    expect(() => {
      mutable.source.name = 'other';
    }).toThrow(TypeError);
    expect(material.id).toBe('plywood-sheet');
  });

  // spec: material-data-contract › Rejections [MD2]
  describe.each([
    ['an id with a capital', { ...plywood(), id: 'Plywood' }, 'INVALID_ID', { id: 'Plywood' }],
    ['an empty id', { ...plywood(), id: '' }, 'INVALID_ID', { id: '' }],
    [
      'an id with an underscore',
      { ...plywood(), id: 'ply_wood' },
      'INVALID_ID',
      { id: 'ply_wood' },
    ],
    [
      'an id with a trailing hyphen',
      { ...plywood(), id: 'plywood-' },
      'INVALID_ID',
      { id: 'plywood-' },
    ],
    [
      'an id with a double hyphen',
      { ...plywood(), id: 'ply--wood' },
      'INVALID_ID',
      { id: 'ply--wood' },
    ],
    ['an id starting with a digit', { ...plywood(), id: '2x4' }, 'INVALID_ID', { id: '2x4' }],
    [
      'a name key without the material prefix',
      { ...plywood(), nameKey: 'plywood.name' },
      'INVALID_NAME_KEY',
      { id: 'plywood-sheet' },
    ],
    [
      'a name key of another material',
      { ...plywood(), nameKey: 'material.oak.name' },
      'INVALID_NAME_KEY',
      { id: 'plywood-sheet' },
    ],
    [
      'no purchase units',
      { ...plywood(), purchaseUnits: [] },
      'NO_PURCHASE_UNITS',
      { id: 'plywood-sheet' },
    ],
    [
      'a unit id with a capital',
      { ...plywood(), purchaseUnits: [{ ...plywood().purchaseUnits[0], id: 'Sheet' }] },
      'INVALID_UNIT_ID',
      { id: 'plywood-sheet', unit: 'Sheet' },
    ],
    [
      'a unit name key of another unit',
      {
        ...plywood(),
        purchaseUnits: [
          { ...plywood().purchaseUnits[0], nameKey: 'material.plywood-sheet.units.board' },
        ],
      },
      'INVALID_UNIT_NAME_KEY',
      { id: 'plywood-sheet', unit: 'sheet' },
    ],
    [
      'a unit name key without the units segment',
      {
        ...plywood(),
        purchaseUnits: [{ ...plywood().purchaseUnits[0], nameKey: 'material.plywood-sheet.sheet' }],
      },
      'INVALID_UNIT_NAME_KEY',
      { id: 'plywood-sheet', unit: 'sheet' },
    ],
    [
      'two units sharing an id',
      {
        ...plywood(),
        purchaseUnits: [plywood().purchaseUnits[0], plywood().purchaseUnits[0]],
      },
      'DUPLICATE_UNIT_ID',
      { id: 'plywood-sheet', unit: 'sheet' },
    ],
    [
      'a size of zero',
      { ...plywood(), purchaseUnits: [{ ...plywood().purchaseUnits[0], size: quantity(0, ft2) }] },
      'NON_POSITIVE_SIZE',
      { id: 'plywood-sheet', unit: 'sheet' },
    ],
    [
      'a negative size',
      { ...plywood(), purchaseUnits: [{ ...plywood().purchaseUnits[0], size: quantity(-1, ft2) }] },
      'NON_POSITIVE_SIZE',
      { id: 'plywood-sheet', unit: 'sheet' },
    ],
    [
      'purchase units that are missing',
      { ...plywood(), purchaseUnits: undefined },
      'NO_PURCHASE_UNITS',
      { id: 'plywood-sheet' },
    ],
    [
      'purchase units that are text',
      { ...plywood(), purchaseUnits: 'sheet' },
      'NO_PURCHASE_UNITS',
      { id: 'plywood-sheet' },
    ],
    [
      'a purchase unit that is null',
      { ...plywood(), purchaseUnits: [null] },
      'INVALID_UNIT_ID',
      { id: 'plywood-sheet' },
    ],
    [
      'a purchase unit that is text',
      { ...plywood(), purchaseUnits: ['sheet'] },
      'INVALID_UNIT_ID',
      { id: 'plywood-sheet' },
    ],
    [
      'a purchase unit whose id is a number',
      { ...plywood(), purchaseUnits: [{ ...plywood().purchaseUnits[0], id: 7 }] },
      'INVALID_UNIT_ID',
      { id: 'plywood-sheet' },
    ],
    [
      'a size that is a plain number',
      { ...plywood(), purchaseUnits: [{ ...plywood().purchaseUnits[0], size: 32 }] },
      'NON_POSITIVE_SIZE',
      { id: 'plywood-sheet', unit: 'sheet' },
    ],
    [
      'a size that only looks like a quantity',
      {
        ...plywood(),
        purchaseUnits: [
          {
            ...plywood().purchaseUnits[0],
            size: { exponents: { length: 2, mass: 0 }, canonical: Rational.of(4608) },
          },
        ],
      },
      'NON_POSITIVE_SIZE',
      { id: 'plywood-sheet', unit: 'sheet' },
    ],
    ['no source', { ...plywood(), source: undefined }, 'MISSING_SOURCE', { id: 'plywood-sheet' }],
    ['a null source', { ...plywood(), source: null }, 'MISSING_SOURCE', { id: 'plywood-sheet' }],
    [
      'a source with an empty name',
      { ...plywood(), source: { name: '', retrieved: '2026-10-22' } },
      'MISSING_SOURCE',
      { id: 'plywood-sheet' },
    ],
    [
      'a source whose name is only spaces',
      { ...plywood(), source: { name: '   ', retrieved: '2026-10-22' } },
      'MISSING_SOURCE',
      { id: 'plywood-sheet' },
    ],
    [
      'a source whose name is only a tab and a newline',
      { ...plywood(), source: { name: '\t\n', retrieved: '2026-10-22' } },
      'MISSING_SOURCE',
      { id: 'plywood-sheet' },
    ],
    [
      'a source whose name is not text',
      { ...plywood(), source: { name: 7, retrieved: '2026-10-22' } },
      'MISSING_SOURCE',
      { id: 'plywood-sheet' },
    ],
  ])('a record with %s', (_name, record, reason, cause) => {
    it(`throws INVALID_MATERIAL ${reason} and names where`, () => {
      expect(failure(record)).toStrictEqual({ code: 'INVALID_MATERIAL', reason, cause });
    });
  });

  // spec: material-data-contract › Rejections [MD2]
  describe('the retrieved date', () => {
    // each month's last day is valid and the day after is not; February by the leap-year rule
    const monthEnds = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const pad = (n: number): string => String(n).padStart(2, '0');

    it.each(monthEnds.map((last, index) => [index + 1, last] as const))(
      'accepts the last day of month %i and rejects the next',
      (month, last) => {
        expect(failure(withSource(`2026-${pad(month)}-${pad(last)}`)).code).toBe('NONE');
        expect(failure(withSource(`2026-${pad(month)}-${pad(last + 1)}`)).reason).toBe(
          'INVALID_SOURCE_DATE',
        );
      },
    );

    // a leap year does not move the end of any month but February
    it.each(['2024-02-29', '2000-02-29', '2024-03-31', '2024-12-31', '2026-01-01', '0001-01-01'])(
      'accepts %s',
      (date) => {
        expect(failure(withSource(date)).code).toBe('NONE');
      },
    );

    it.each([
      '2026-02-30',
      '2026-02-29',
      '2100-02-29',
      '1900-02-29',
      '2026-13-01',
      '2026-00-10',
      '2026-10-00',
      '22/10/2026',
      '2026-1-5',
      '2026-10-22T00:00',
      ' 2026-10-22',
      '2026-10-22 ',
      '2026/10/22',
      '٢٠٢٦-١٠-٢٢',
      '',
    ])('rejects %j', (date) => {
      expect(failure(withSource(date))).toStrictEqual({
        code: 'INVALID_MATERIAL',
        reason: 'INVALID_SOURCE_DATE',
        cause: { id: 'plywood-sheet' },
      });
    });
  });

  // spec: material-data-contract › Empty registry [MD4]
  it('exports defineMaterial and no material record', () => {
    expect(Object.keys(data)).toEqual(['defineMaterial']);
  });
});
