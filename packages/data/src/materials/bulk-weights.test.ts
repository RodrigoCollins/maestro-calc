import { kgM3, lbFt3, lbYd3, Rational, tonYd3, valueIn } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { GRAVEL_DENSITIES } from '../yields/gravel.ts';
import { BULK_WEIGHTS } from './bulk-weights.ts';

const WISDOT = 'https://wisconsindot.gov/documents2/research/0092-22-05-final-report.pdf';
const NM_EMNRD = 'https://www.emnrd.nm.gov/mmd/wp-content/uploads/sites/5/ConvFctrs.pdf';
const FHWA = 'https://www.fhwa.dot.gov/publications/research/infrastructure/bridge/05057/appd.cfm';
const WSDOT = 'https://wsdot.wa.gov/eesc/bridge/designmemos/05-2010.htm';
const NRCS =
  'https://www.nrcs.usda.gov/sites/default/files/2023-01/Soil%20Quality-Indicators-Bulk%20Density.pdf';
const EPA =
  'https://www.epa.gov/sites/production/files/2016-04/documents/volume_to_weight_conversion_factors_memorandum_04192016_508fnl.pdf';

const byId = (id: string) => {
  const found = BULK_WEIGHTS.find((each) => each.id === id);
  if (found === undefined) throw new Error(`no ${id}`);
  return found;
};

/** The low and the high weight of a material in `unit`, as exact numbers. */
const rangeIn = (id: string, unit: typeof lbYd3) => {
  const { low, high } = byId(id);
  return [valueIn(low, unit), valueIn(high, unit)];
};

describe('BULK_WEIGHTS (the weight of a cubic yard of common bulk materials)', () => {
  it('holds the materials of the chart, in its order', () => {
    expect(BULK_WEIGHTS.map(({ id }) => id)).toEqual([
      'gravel-compacted',
      'gravel-loose',
      'gravel',
      'pit-run-gravel',
      'concrete',
      'sand',
      'topsoil',
      'fill-dirt',
      'soil-in-place',
      'wood-chips-green',
      'wood-chips-dry',
    ]);
  });

  // WisDOT WHRP G22-05, Table E2, Dense Graded Base 3/4-inch: 1.80 to 1.86 tons per cubic yard
  // compacted; the gravel calculator uses the midpoints, compacted and loose
  it('holds compacted gravel as the WisDOT range, whose midpoint the gravel calculator uses', () => {
    expect(rangeIn('gravel-compacted', tonYd3)).toEqual([Rational.of(9, 5), Rational.of(93, 50)]);
    const [low = Rational.of(0), high = Rational.of(0)] = rangeIn('gravel-compacted', lbYd3);
    expect(low.add(high).div(Rational.of(2))).toEqual(valueIn(GRAVEL_DENSITIES.compacted, lbYd3));
    expect(byId('gravel-loose').low).toBe(GRAVEL_DENSITIES.loose);
    expect(byId('gravel-loose').high).toBe(GRAVEL_DENSITIES.loose);
    for (const id of ['gravel-compacted', 'gravel-loose']) {
      expect(byId(id).sources.map(({ url }) => url)).toEqual([WISDOT]);
    }
  });

  // New Mexico EMNRD conversion factors, cubic yards to short tons: Gravel 1/4"-2" 1.42, Pit run
  // 1.62, Sand 1.45, Top Soil 0.8, Fill Dirt 0.8
  it.each([
    ['gravel', Rational.of(71, 50)],
    ['pit-run-gravel', Rational.of(81, 50)],
    ['sand', Rational.of(29, 20)],
    ['topsoil', Rational.of(4, 5)],
    ['fill-dirt', Rational.of(4, 5)],
  ] as const)('holds %s as the New Mexico EMNRD factor in tons per cubic yard', (id, tons) => {
    expect(rangeIn(id, tonYd3)).toEqual([tons, tons]);
    expect(byId(id).sources.map(({ url }) => url)).toEqual([NM_EMNRD]);
  });

  // FHWA-HRT-05-057, Table 3.5.1-1: normal weight, f'c at most 5.0 ksi, 0.145 kcf; WSDOT Bridge
  // Design Memorandum of June 1, 2010: plain concrete 150 pcf. 145 × 27 = 3,915, 150 × 27 = 4,050
  it('holds plain normal-weight concrete from 145 to 150 lb per cubic foot', () => {
    expect(rangeIn('concrete', lbFt3)).toEqual([Rational.of(145), Rational.of(150)]);
    expect(rangeIn('concrete', lbYd3)).toEqual([Rational.of(3915), Rational.of(4050)]);
    expect(byId('concrete').sources.map(({ url }) => url)).toEqual([FHWA, WSDOT]);
  });

  // USDA NRCS, Soil Quality Indicators: Bulk Density: a medium textured soil with about 50 percent
  // pore space has a dry bulk density of 1.33 g/cm³
  it('holds soil in place as the NRCS dry bulk density of a medium textured soil', () => {
    expect(rangeIn('soil-in-place', kgM3)).toEqual([Rational.of(1330), Rational.of(1330)]);
    expect(byId('soil-in-place').sources.map(({ url }) => url)).toEqual([NRCS]);
  });

  // US EPA, Volume-to-Weight Conversion Factors (April 2016): wood chips, green, 473 lb per cubic
  // yard; dry, 243
  it.each([
    ['wood-chips-green', 473],
    ['wood-chips-dry', 243],
  ] as const)('holds %s as the EPA factor in pounds per cubic yard', (id, pounds) => {
    expect(rangeIn(id, lbYd3)).toEqual([Rational.of(pounds), Rational.of(pounds)]);
    expect(byId(id).sources.map(({ url }) => url)).toEqual([EPA]);
  });

  it('gives every material a low no higher than its high, and dated sources, all frozen', () => {
    expect(Object.isFrozen(BULK_WEIGHTS)).toBe(true);
    for (const weight of BULK_WEIGHTS) {
      expect(Object.isFrozen(weight), weight.id).toBe(true);
      const [low = Rational.of(0), high = Rational.of(0)] = rangeIn(weight.id, lbYd3);
      expect(low.compare(high) <= 0, weight.id).toBe(true);
      expect(low.compare(Rational.of(0)) > 0, weight.id).toBe(true);
      for (const source of weight.sources) {
        expect(source.retrieved, weight.id).toMatch(/^2026-\d{2}-\d{2}$/);
        expect(source.url, weight.id).toMatch(/^https:\/\//);
        expect(source.name, weight.id).toMatch(/\S/);
      }
    }
  });
});
