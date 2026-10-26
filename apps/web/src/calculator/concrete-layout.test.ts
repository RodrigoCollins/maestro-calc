import { describe, expect, it } from 'vitest';
import { concrete } from '../lib/concrete.ts';
import { ALWAYS_VISIBLE, RESERVED_ROWS, TEXT_KEYS, layoutOf } from './concrete-layout.ts';
import { DIMENSION_ORDER, SHAPES } from './concrete/shapes.ts';

describe('layout (calculator-page › Form controls, [CP11] data, [CP14] logic)', () => {
  // spec: calculator-page › [CP11] the visible fields per shape, in the order of the table
  it.each([
    ['slab', ['length', 'width', 'thickness']],
    ['footing', ['length', 'footingWidth', 'footingDepth', 'count']],
    ['column', ['diameter', 'height', 'count']],
    ['steps', ['stepWidth', 'rise', 'run', 'stepCount']],
  ] as const)('shows the %s fields in the order of the table', (shape, fields) => {
    expect(layoutOf(shape).fields).toEqual(fields);
  });

  // spec: calculator-page › Form controls: always visible after the shape fields
  it('shows the waste, the bag size and the two prices after every shape', () => {
    expect(ALWAYS_VISIBLE).toEqual(['waste', 'bag', 'bagPrice', 'readyMixPrice']);
    for (const shape of SHAPES) {
      expect(layoutOf(shape).tail).toEqual(['waste', 'bag', 'bagPrice', 'readyMixPrice']);
    }
  });

  // spec: calculator-page › [CP14] the shape area reserves the tallest shape, for every shape
  it('reserves four rows for all four shapes', () => {
    expect(RESERVED_ROWS).toBe(4);
    for (const shape of SHAPES) expect(layoutOf(shape).rows).toBe(4);
  });

  it('keeps the fields of each shape in the one order of the form', () => {
    for (const shape of SHAPES) {
      const positions = layoutOf(shape).fields.map((key) => DIMENSION_ORDER.indexOf(key));
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
    }
  });

  it('lists every text field of the engine once: the dimensions, the waste and the two prices', () => {
    const textual = concrete.inputs
      .filter((input) => input.kind !== 'select')
      .map((input) => input.key)
      .sort();
    expect([...TEXT_KEYS].sort()).toEqual(textual);
    expect(new Set(TEXT_KEYS).size).toBe(TEXT_KEYS.length);
  });
});
