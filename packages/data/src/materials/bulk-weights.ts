import { kgM3, lbFt3, lbYd3, quantity, Rational, tonYd3, type Quantity } from '@maestro-calc/core';
import type { MaterialSource } from '../material.ts';
import { GRAVEL_DENSITIES } from '../yields/gravel.ts';

/** The materials of the chart, in its order. */
export type BulkWeightId =
  | 'gravel-compacted'
  | 'gravel-loose'
  | 'gravel'
  | 'pit-run-gravel'
  | 'concrete'
  | 'sand'
  | 'topsoil'
  | 'fill-dirt'
  | 'soil-in-place'
  | 'wood-chips-green'
  | 'wood-chips-dry';

/**
 * What a cubic yard of a bulk material weighs, from low to high (the same figure twice when the
 * source gives one), and the published sources it comes from. The weights are approximate: stone,
 * moisture and compaction move them, and each source states its own condition (the page names it).
 */
export interface BulkWeight {
  readonly id: BulkWeightId;
  readonly low: Quantity<'density'>;
  readonly high: Quantity<'density'>;
  readonly sources: readonly [Required<MaterialSource>, ...Required<MaterialSource>[]];
}

const WISDOT: Required<MaterialSource> = {
  name: 'WisDOT WHRP G22-05, Table E2 (weight-volume conversion factors), December 2023',
  url: 'https://wisconsindot.gov/documents2/research/0092-22-05-final-report.pdf',
  retrieved: '2026-10-28',
};

const NM_EMNRD: Required<MaterialSource> = {
  name: 'New Mexico EMNRD, Mining and Minerals Division, Conversion Factors for Construction Materials and Common Minerals (adapted from BLM Handbook H-3890-1)',
  url: 'https://www.emnrd.nm.gov/mmd/wp-content/uploads/sites/5/ConvFctrs.pdf',
  retrieved: '2026-11-05',
};

const FHWA: Required<MaterialSource> = {
  name: 'FHWA-HRT-05-057, Appendix D, Table 3.5.1-1 (concrete unit weights), October 2006',
  url: 'https://www.fhwa.dot.gov/publications/research/infrastructure/bridge/05057/appd.cfm',
  retrieved: '2026-11-05',
};

const WSDOT: Required<MaterialSource> = {
  name: 'WSDOT Bridge Design Memorandum, Unit Weight of Concrete, June 1, 2010',
  url: 'https://wsdot.wa.gov/eesc/bridge/designmemos/05-2010.htm',
  retrieved: '2026-11-05',
};

const NRCS: Required<MaterialSource> = {
  name: 'USDA NRCS, Soil Quality Indicators: Bulk Density',
  url: 'https://www.nrcs.usda.gov/sites/default/files/2023-01/Soil%20Quality-Indicators-Bulk%20Density.pdf',
  retrieved: '2026-11-05',
};

const EPA: Required<MaterialSource> = {
  name: 'US EPA, Office of Resource Conservation and Recovery, Volume-to-Weight Conversion Factors, April 2016',
  url: 'https://www.epa.gov/sites/production/files/2016-04/documents/volume_to_weight_conversion_factors_memorandum_04192016_508fnl.pdf',
  retrieved: '2026-11-05',
};

/** One weight the source gives as a single figure. */
const one = (
  id: BulkWeightId,
  weight: Quantity<'density'>,
  source: Required<MaterialSource>,
): BulkWeight =>
  Object.freeze<BulkWeight>({ id, low: weight, high: weight, sources: Object.freeze([source]) });

/** A short-ton factor per cubic yard as the New Mexico sheet prints it: `1.42`. */
const tons = (hundredths: number): Quantity<'density'> =>
  quantity(Rational.of(hundredths, 100), tonYd3);

/**
 * The materials of the cubic yard weight chart, in its order. Compacted and loose gravel are the
 * gravel calculator's own densities (the compacted range is the one its midpoint comes from), so
 * the chart and the calculator cannot disagree.
 */
export const BULK_WEIGHTS: readonly [BulkWeight, ...BulkWeight[]] = Object.freeze([
  Object.freeze<BulkWeight>({
    id: 'gravel-compacted',
    low: quantity(Rational.of(180, 100), tonYd3),
    high: quantity(Rational.of(186, 100), tonYd3),
    sources: Object.freeze([WISDOT]),
  }),
  one('gravel-loose', GRAVEL_DENSITIES.loose, WISDOT),
  one('gravel', tons(142), NM_EMNRD),
  one('pit-run-gravel', tons(162), NM_EMNRD),
  Object.freeze<BulkWeight>({
    id: 'concrete',
    low: quantity(145, lbFt3),
    high: quantity(150, lbFt3),
    sources: Object.freeze([FHWA, WSDOT]),
  }),
  one('sand', tons(145), NM_EMNRD),
  one('topsoil', tons(80), NM_EMNRD),
  one('fill-dirt', tons(80), NM_EMNRD),
  one('soil-in-place', quantity(1330, kgM3), NRCS),
  one('wood-chips-green', quantity(473, lbYd3), EPA),
  one('wood-chips-dry', quantity(243, lbYd3), EPA),
]);
