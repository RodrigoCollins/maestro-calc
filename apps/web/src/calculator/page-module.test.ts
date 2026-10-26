import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import type { ShoppingLine } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { hintedCalculator, pageModuleErrorOf } from '../__testing__/page-fixtures.ts';
import { concrete } from '../lib/concrete.ts';
import {
  definePage,
  PageModuleError,
  primaryOutputOf,
  sentenceNameOf,
  shoppingLinesOf,
  type AnyPageModule,
} from './page-module.ts';

const line = (materialId: string, purchaseUnit = 'bag-80', qty = 1n): ShoppingLine => ({
  materialId,
  purchaseUnit,
  qty,
});

describe('definePage (calculator-web-core › Page-module contract, [CWC2])', () => {
  // spec: calculator-web-core › [CWC2] a module takes its id from the definition
  it('freezes a module whose id is the id of its calculator', () => {
    const module = definePage({ calculator: concrete });
    expect(module.id).toBe('concrete');
    expect(module.calculator).toBe(concrete);
    expect(Object.isFrozen(module)).toBe(true);
    expect(definePage({ calculator: rectangleArea }).id).toBe('rectangle-area');
  });

  // spec: calculator-web-core › [CWC1] a module needs only its definition
  it('declares no slot unless it is given one', () => {
    const module = definePage({ calculator: rectangleArea });
    expect(Object.keys(module).sort()).toEqual(['calculator', 'id']);
  });
});

describe('shoppingLinesOf (calculator-web-core › [CWC3])', () => {
  const concreteMix = line('concrete-mix', 'bag-80', 74n);

  it('returns the engine lines in declared order', () => {
    expect(shoppingLinesOf('x', ['concrete-mix'], [concreteMix])).toEqual([concreteMix]);
  });

  // spec: calculator-web-core › [CWC3] lines are matched by material, not by position
  it('matches a reversed engine order by material', () => {
    const alpha = line('alpha', 'box-a', 1234n);
    const beta = line('beta', 'bag-b', 7n);
    expect(shoppingLinesOf('x', ['alpha', 'beta'], [beta, alpha])).toEqual([alpha, beta]);
  });

  it('returns nothing for no declared line and no engine line', () => {
    expect(shoppingLinesOf('x', [], [])).toEqual([]);
  });

  // spec: calculator-web-core › [CWC3] a declared line the engine does not return fails
  it.each([
    ['an extra engine line', ['a'], [line('a'), line('b')]],
    ['a missing line', ['a', 'b'], [line('a')]],
    ['a line the engine did not return', ['a', 'b'], [line('a'), line('c')]],
    ['a duplicate engine line', ['a', 'b'], [line('a'), line('a')]],
    ['a duplicate declared line', ['a', 'a'], [line('a'), line('b')]],
  ] as const)('throws SHOPPING_LINES for %s', (_what, declared, engine) => {
    const error = pageModuleErrorOf(() => shoppingLinesOf('x', declared, engine));
    expect(error).toBeInstanceOf(PageModuleError);
    expect(error.code).toBe('SHOPPING_LINES');
    expect(error.name).toBe('PageModuleError');
    expect(error.cause).toEqual({ id: 'x' });
  });

  // spec: calculator-web-core › [CWC3] the purchase unit of a line is the declared one
  it('checks the purchase unit when units are given', () => {
    expect(shoppingLinesOf('x', ['concrete-mix'], [concreteMix], ['bag-80'])).toEqual([
      concreteMix,
    ]);
    const error = pageModuleErrorOf(() =>
      shoppingLinesOf('x', ['concrete-mix'], [concreteMix], ['bag-60']),
    );
    expect(error.code).toBe('SHOPPING_LINES');
    expect(error.cause).toEqual({ id: 'x' });
  });
});

describe('primaryOutputOf and sentenceNameOf (calculator-web-core › Page-module contract: primary output)', () => {
  const inch = { unit: 'in', format: 'decimal', places: 2 } as const;
  const calculator = hintedCalculator({ edge: inch });

  it('takes the output the module names for each unit system', () => {
    const module = definePage({ calculator, primary: { imperial: 'span', metric: 'edge' } });
    expect(primaryOutputOf(module, 'imperial').key).toBe('span');
    expect(primaryOutputOf(module, 'metric').key).toBe('edge');
  });

  it('falls back to the output with the primary role when the module names none', () => {
    const module = definePage({ calculator });
    expect(primaryOutputOf(module, 'imperial').key).toBe('span');
    expect(primaryOutputOf(module, 'metric').key).toBe('span');
  });

  it('fails for a unit system whose named output the calculator lacks', () => {
    const drifted: AnyPageModule = {
      id: calculator.id,
      calculator,
      primary: { imperial: 'span', metric: 'nope' },
    };
    expect(primaryOutputOf(drifted, 'imperial').key).toBe('span');
    expect(() => primaryOutputOf(drifted, 'metric')).toThrow(
      new TypeError('missing primary output'),
    );
  });

  it('names the sentence by the measure, with the display unit when the output has one', () => {
    const [span, edge] = calculator.outputs;
    expect(sentenceNameOf(span)).toBe('length');
    expect(sentenceNameOf(edge)).toBe('length.in');
  });
});
