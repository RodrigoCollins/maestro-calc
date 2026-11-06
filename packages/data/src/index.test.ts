import { describe, expect, it } from 'vitest';
import * as data from './index.ts';
import { BULK_WEIGHTS } from './materials/bulk-weights.ts';
import { concreteMix } from './materials/concrete-mix.ts';
import { defineMaterial } from './material.ts';

describe('data entry point (material-data-contract › Shipped materials, minimal surface)', () => {
  // spec: material-data-contract › [MDC1] Exports
  it('exports BULK_WEIGHTS, concreteMix and defineMaterial as its only values', () => {
    expect(Object.keys(data).sort()).toEqual(['BULK_WEIGHTS', 'concreteMix', 'defineMaterial']);
    expect(data.BULK_WEIGHTS).toBe(BULK_WEIGHTS);
    expect(data.concreteMix).toBe(concreteMix);
    expect(data.defineMaterial).toBe(defineMaterial);
  });
});
