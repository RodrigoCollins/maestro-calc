import { describe, expect, it } from 'vitest';
import { ENGINES, type CalculatorId } from './view.ts';
import { SIZE_AREAS, sizeTableOf } from './sizes.ts';

describe('sizeTableOf', () => {
  it('runs the calculator at its starting values for each lawn size', () => {
    const lime = sizeTableOf('lawn-lime');
    expect(lime.columns).toEqual(['Lawn area (sq ft)', 'Lime (lb)', 'Bags of 40 lb']);
    // 30 lb CCE per 1,000 sq ft at 100% CCE: 30 x 5 = 150 lb, 150 / 40 = 3.75, 4 bags
    expect(lime.rows[2]).toEqual(['5,000', '150.0', '4']);
  });

  it('gives sod in square feet, pallets of 450 sq ft and slabs', () => {
    // 2,500 sq ft, no waste: 2,500 / 450 = 5.6, 6 pallets; 2,500 / (384 / 144) = 937.5, 938 slabs
    expect(sizeTableOf('sod').rows[1]).toEqual(['2,500', '2,500', '6', '938']);
  });

  it('has a row per size and a value per column for every calculator', () => {
    for (const id of Object.keys(ENGINES) as CalculatorId[]) {
      const table = sizeTableOf(id);
      expect(table.rows).toHaveLength(SIZE_AREAS.length);
      for (const row of table.rows) expect(row).toHaveLength(table.columns.length);
    }
  });
});
