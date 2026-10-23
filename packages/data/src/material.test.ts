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
  ])('a record with %s', (_name, record, reason, cause) => {
    it(`throws INVALID_MATERIAL ${reason} and names where`, () => {
      expect(failure(record)).toStrictEqual({ code: 'INVALID_MATERIAL', reason, cause });
    });
  });

  // spec: material-data-contract › Empty registry [MD4]
  it('exports defineMaterial and no material record', () => {
    expect(Object.keys(data)).toEqual(['defineMaterial']);
  });
});
