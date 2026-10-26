import { describe, expect, it } from 'vitest';
import { concrete } from '../../lib/concrete.ts';
import { concretePage } from './page.ts';

describe('the concrete page module (calculator-web-core › [CWC2])', () => {
  // spec: calculator-web-core › [CWC2] concrete is module #1
  it('is the module of the concrete calculator', () => {
    expect(concretePage.id).toBe('concrete');
    expect(concretePage.calculator).toBe(concrete);
  });

  it('shows the volume in cubic yards in US units and cubic meters in metric', () => {
    expect(concretePage.primary).toEqual({ imperial: 'volumeYd3', metric: 'volumeM3' });
  });

  it('drives the visible fields from the shape and reserves four rows', () => {
    const [shape, ...rest] = concretePage.choices?.groups ?? [];
    expect(rest).toEqual([]);
    expect(shape?.select).toBe('shape');
    expect(shape?.rows).toBe(4);
  });
});
