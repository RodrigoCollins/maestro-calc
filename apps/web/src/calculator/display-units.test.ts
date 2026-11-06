import { findUnit, ft2, ft3, type DimensionName, type OutputDescriptor } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { calculators } from '../lib/calculators.ts';
import { DISPLAY_UNITS, displayUnitOf } from './display-units.ts';

/** Every `[dimension, unit id]` a decimal display hint of a registry calculator names, once each. */
const hinted = (): readonly (readonly [DimensionName, string])[] => {
  const outputs = calculators.flatMap(
    (calculator): readonly OutputDescriptor[] => calculator.outputs,
  );
  const pairs = outputs.flatMap(({ measure, display }) =>
    display?.format === 'decimal' &&
    measure !== 'money' &&
    measure !== 'hours' &&
    measure !== 'number'
      ? [[measure, display.unit] as const]
      : [],
  );
  return [...new Map(pairs.map((pair) => [pair.join(':'), pair])).values()];
};

describe('the display units (a page script reads its figures in them, not in the whole catalog)', () => {
  it('resolves every decimal hint of the registry to the unit of core', () => {
    for (const [dimension, id] of hinted()) {
      expect(displayUnitOf(dimension, id), `${dimension} ${id}`).toBe(findUnit(dimension, id));
    }
  });

  it('holds exactly the units those hints name, each once', () => {
    const named = hinted().map(([dimension, id]) => `${dimension}:${id}`);
    const held = DISPLAY_UNITS.map(({ dimension, id }) => `${dimension}:${id}`);
    expect([...held].sort()).toEqual([...named].sort());
    expect(new Set(held).size).toBe(held.length);
  });

  it('answers undefined for a unit of another dimension and for one no figure is written in', () => {
    expect(displayUnitOf('area', ft2.id)).toBe(ft2);
    expect(displayUnitOf('area', ft3.id)).toBeUndefined();
    expect(displayUnitOf('volume', 'in3')).toBeUndefined();
  });
});
