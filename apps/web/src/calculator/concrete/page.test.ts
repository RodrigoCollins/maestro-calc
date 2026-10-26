import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { unwrap } from '../../__testing__/page-fixtures.ts';
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

  // spec: calculator-web-core › [CWC2] one stepper on waste with step 5
  it('steps the waste by five points', () => {
    expect(concretePage.steppers?.keys).toEqual(['waste']);
    expect(concretePage.steppers?.next('waste', Rational.of(10), 'more')).toEqual(Rational.of(15));
  });

  // spec: calculator-web-core › [CWC2] a shopping list of one line, the bag line
  it('declares one shopping line for the concrete mix bag', () => {
    const [line, ...rest] = concretePage.shopping?.lines ?? [];
    expect(rest).toEqual([]);
    expect(line).toMatchObject({
      material: 'concrete-mix',
      label: 'shoppingLine',
      fill: 'bagLb',
      note: { key: 'bagYield', fill: 'yield' },
    });
  });

  it('shows 74 bags of 80 lb for the default slab', () => {
    const moment = {
      system: 'imperial',
      choices: { shape: 'slab', bag: '80' },
      valid: unwrap(concrete.validate({})),
      result: unwrap(concrete.run({})),
    } as const;
    expect(concretePage.shopping?.view(moment)).toEqual([
      {
        material: 'concrete-mix',
        unit: 'bag-80',
        qty: '74',
        fills: { bagLb: '80', yield: '0.60' },
      },
    ]);
  });

  // spec: calculator-web-core › [CWC2] cost rows bagCost and readyMixCost
  it('declares the two cost rows', () => {
    expect(concretePage.costs?.rows).toEqual([
      { output: 'bagCost', price: 'bagPrice' },
      { output: 'readyMixCost', price: 'readyMixPrice' },
    ]);
    expect(concretePage.costs?.hint).toBe('priceHint');
    expect(concretePage.costs?.note).toBe('readyMixNote');
  });
});
