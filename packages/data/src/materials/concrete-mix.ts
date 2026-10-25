import { defineMaterial } from '../material.ts';
import { CONCRETE_MIX_YIELDS } from '../yields/concrete-mix.ts';

/**
 * Portland-cement concrete mix sold in bags. The sizes are the manufacturer's approximate yields
 * per bag (0.30, 0.45 and 0.60 cubic feet), shared with the yields-only module so the two cannot
 * drift. A generic estimate of a 4000 psi mix, not a claim about every brand.
 */
export const concreteMix = defineMaterial({
  id: 'concrete-mix',
  nameKey: 'material.concrete-mix.name',
  purchaseUnits: [
    {
      id: 'bag-40',
      nameKey: 'material.concrete-mix.units.bag-40',
      size: CONCRETE_MIX_YIELDS['bag-40'],
    },
    {
      id: 'bag-60',
      nameKey: 'material.concrete-mix.units.bag-60',
      size: CONCRETE_MIX_YIELDS['bag-60'],
    },
    {
      id: 'bag-80',
      nameKey: 'material.concrete-mix.units.bag-80',
      size: CONCRETE_MIX_YIELDS['bag-80'],
    },
  ],
  source: {
    name: 'QUIKRETE Concrete Mix No. 1101 data sheet (product nos. 1101-40, 1101-60, 1101-80), revised October 2022',
    url: 'https://www.quikrete.com/PDFs/DATA_SHEET-Concrete%20Mix%201101.pdf',
    retrieved: '2026-10-25',
  },
});
