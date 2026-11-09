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
        bagUnit: 'lb',
        massUnit: 'lb',
        passUnit: 'lb',
        areaUnit: 'sq ft',
        lengthUnit: 'ft',
        rate: '2–3',
        rateUnit: 'lb per 1,000 sq ft',
      },
      warnings: [],
    });
  });

  // 1 lb per 1,000 sq ft = 453.59237 g / 92.90304 m² = 4.8824 g/m²: 2 to 3 lb is 9.765 to 14.647
  it('writes a metric seed run in kilograms and grams: 100 m² of bluegrass, 5 kg bags', () => {
    expect(viewOf('grass-seed', { area: '100' }, 'metric')).toEqual({
      values: {
        // 9.765 to 14.647 g/m² x 100 m² = 0.976 to 1.465 kg
        pounds: '0.98–1.46',
        massUnit: 'kg',
        // half each way, 488 to 732 g: under 1 kg the view counts grams
        perPass: '488–732',
        passUnit: 'g',
        bags: '1',
        bagsUnit: 'bag',
        bagPounds: '5',
        bagUnit: 'kg',
        areaUnit: 'm²',
        lengthUnit: 'm',
        rate: '9.8–14.6',
        rateUnit: 'g/m²',
      },
      warnings: [],
    });
  });

  it('counts a small metric lawn in grams: 20 m² of bluegrass is 195 to 293 g', () => {
    const view = viewOf('grass-seed', { area: '20' }, 'metric');
    expect(view?.values['pounds']).toBe('195–293');
    expect(view?.values['massUnit']).toBe('g');
  });

  it('gives nothing for a metric field it cannot read', () => {
    expect(viewOf('grass-seed', { area: 'abc' }, 'metric')).toBeUndefined();
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
