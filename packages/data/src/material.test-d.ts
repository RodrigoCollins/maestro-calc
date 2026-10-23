import { ft2, quantity } from '@maestro-calc/core';
import { describe, expectTypeOf, it } from 'vitest';
import { defineMaterial, type MaterialRecord } from './material.ts';

describe('MaterialRecord (material-data-contract › No float amounts)', () => {
  // spec: material-data-contract › No float amounts [MD3]
  it('rejects a plain number as the size of a purchase unit', () => {
    defineMaterial({
      id: 'plywood-sheet',
      nameKey: 'material.plywood-sheet.name',
      purchaseUnits: [
        {
          id: 'sheet',
          nameKey: 'material.plywood-sheet.units.sheet',
          // @ts-expect-error a size is an exact Quantity, never a JavaScript number
          size: 32,
        },
      ],
      source: { name: 'Manufacturer catalog', retrieved: '2026-10-22' },
    });
  });

  it('ties the name keys to the ids and keeps the id literal', () => {
    const material = defineMaterial({
      id: 'plywood-sheet',
      nameKey: 'material.plywood-sheet.name',
      purchaseUnits: [
        { id: 'sheet', nameKey: 'material.plywood-sheet.units.sheet', size: quantity(32, ft2) },
      ],
      source: { name: 'Manufacturer catalog', retrieved: '2026-10-22' },
    });
    expectTypeOf(material.id).toEqualTypeOf<'plywood-sheet'>();
    expectTypeOf(material.nameKey).toEqualTypeOf<'material.plywood-sheet.name'>();
    expectTypeOf(material).toExtend<MaterialRecord>();
    defineMaterial({
      id: 'plywood-sheet',
      // @ts-expect-error the name key must be `material.<id>.name`
      nameKey: 'plywood.name',
      purchaseUnits: [
        { id: 'sheet', nameKey: 'material.plywood-sheet.units.sheet', size: quantity(32, ft2) },
      ],
      source: { name: 'Manufacturer catalog', retrieved: '2026-10-22' },
    });
  });

  it('requires at least one purchase unit', () => {
    defineMaterial({
      id: 'plywood-sheet',
      nameKey: 'material.plywood-sheet.name',
      // @ts-expect-error the list of purchase units is non-empty
      purchaseUnits: [],
      source: { name: 'Manufacturer catalog', retrieved: '2026-10-22' },
    });
  });
});
