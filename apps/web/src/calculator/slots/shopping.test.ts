import { describe, expect, it } from 'vitest';
import { pageModuleErrorOf, shoppingCalculator, unwrap } from '../../__testing__/page-fixtures.ts';
import { DASH } from '../present.ts';
import type { Moment } from '../page-module.ts';
import { shoppingSlot } from './shopping.ts';

type Fixture = typeof shoppingCalculator;

const momentOf = (size: number | undefined, run = true): Moment<Fixture> => {
  const raw = size === undefined ? {} : { size: String(size) };
  return {
    system: 'imperial',
    choices: {},
    valid: unwrap(shoppingCalculator.validate(raw)),
    result: run ? unwrap(shoppingCalculator.run(raw)) : undefined,
  };
};

const slot = (units = { alpha: 'box-a', beta: 'bag-b' }) =>
  shoppingSlot(shoppingCalculator, [
    {
      material: 'alpha',
      label: 'alphaLine',
      fill: 'unit',
      note: { key: 'alphaNote', fill: 'size' },
      parts: () => ({ unit: units.alpha, fills: { unit: 'box', size: '12' } }),
    },
    {
      material: 'beta',
      label: 'betaLine',
      fill: 'unit',
      parts: () => ({ unit: units.beta, fills: {} }),
    },
  ]);

describe('shoppingSlot (calculator-web-core › [CWC3] shopping is a list)', () => {
  // spec: calculator-web-core › [CWC3] declared order, matched by material
  it('shows the lines in declared order, each matched to its engine line by material', () => {
    expect(slot().view(momentOf(undefined))).toEqual([
      { material: 'alpha', unit: 'box-a', qty: '1,234', fills: { unit: 'box', size: '12' } },
      { material: 'beta', unit: 'bag-b', qty: '7', fills: {} },
    ]);
  });

  it('keeps the declared lines, with a dash for each quantity, without a result', () => {
    const lines = slot().view(momentOf(undefined, false));
    expect(lines.map(({ material, unit, qty }) => [material, unit, qty])).toEqual([
      ['alpha', 'box-a', DASH],
      ['beta', 'bag-b', DASH],
    ]);
  });

  it('exposes the declared lines', () => {
    expect(slot().lines.map(({ material }) => material)).toEqual(['alpha', 'beta']);
  });

  // spec: calculator-web-core › [CWC3] a drifting engine fails (M-4)
  it('throws SHOPPING_LINES when the engine lines differ from the declared materials', () => {
    const error = pageModuleErrorOf(() => slot().view(momentOf(2)));
    expect(error.code).toBe('SHOPPING_LINES');
    expect(error.cause).toEqual({ id: 'shopping-fixture' });
  });

  it('throws SHOPPING_LINES when a purchase unit differs from the declared one', () => {
    const error = pageModuleErrorOf(() =>
      slot({ alpha: 'box-a', beta: 'bag-x' }).view(momentOf(undefined)),
    );
    expect(error.code).toBe('SHOPPING_LINES');
  });
});
