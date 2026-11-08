import { describe, expect, it } from 'vitest';
import { ENGINES, viewOf, type CalculatorId } from './view.ts';

// Each figure below is worked by hand from the engine's own cases (packages/lawn-core).
describe('viewOf', () => {
  it('writes the fertilizer defaults: 20.8 lb, two bags of 15 lb, 4.2 lb per 1,000 sq ft', () => {
    expect(viewOf('lawn-fertilizer')).toEqual({
      values: {
        pounds: '20.8',
        perThousand: '4.2',
        // 15 lb / (25/6 lb per 1,000 sq ft) x 1,000 = 3,600 sq ft
        coverage: '3,600',
        bags: '2',
        bagsUnit: 'bags',
        nitrogenPounds: '5.0',
        phosphatePounds: '0.0',
        potashPounds: '1.3',
        bagPounds: '15',
      },
      warnings: [],
    });
  });

  it('says one bag in the singular, and carries the warning of a run', () => {
    const view = viewOf('lawn-fertilizer', { area: '1000', target: '1.5' });
    expect(view?.values['bags']).toBe('1');
    expect(view?.values['bagsUnit']).toBe('bag');
    expect(view?.warnings).toEqual(['overLimit']);
  });

  it('writes the seed defaults as ranges: 10.0 to 15.0 lb, 2 to 3 bags, half each way', () => {
    expect(viewOf('grass-seed')).toEqual({
      values: {
        pounds: '10.0–15.0',
        perPass: '5.0–7.5',
        bags: '2–3',
        bagsUnit: 'bags',
        bagPounds: '5',
      },
      warnings: [],
    });
  });

  it('writes the sod defaults: 1,000 sq ft, three pallets, 375 slabs', () => {
    expect(viewOf('sod')).toEqual({
      values: {
        order: '1,000',
        extra: '0',
        pallets: '3',
        palletsUnit: 'pallets',
        slabs: '375',
        slabsUnit: 'slabs',
        palletSize: '450',
      },
      warnings: [],
    });
    expect(viewOf('sod', { area: '400', pallet: '400' })?.values['palletsUnit']).toBe('pallet');
  });

  it('writes the lime defaults: 150.0 lb, four bags of 40 lb', () => {
    expect(viewOf('lawn-lime')).toEqual({
      values: {
        pounds: '150.0',
        perThousand: '30.0',
        bags: '4',
        bagsUnit: 'bags',
        bagPounds: '40',
      },
      warnings: [],
    });
  });

  it('gives nothing for an input it cannot read', () => {
    expect(viewOf('lawn-fertilizer', { nitrogen: '' })).toBeUndefined();
    expect(viewOf('sod', { pallet: 'x' })).toBeUndefined();
  });

  it('has an engine whose id is its key', () => {
    for (const id of Object.keys(ENGINES) as CalculatorId[]) expect(ENGINES[id].id).toBe(id);
  });
});
