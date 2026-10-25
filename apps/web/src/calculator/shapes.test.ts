import { describe, expect, it } from 'vitest';
import { concrete } from '../lib/concrete.ts';
import { DIMENSION_ORDER, SHAPE_FIELDS } from './shapes.ts';

describe('visible fields per shape (calculator-page › Form controls, [CP11])', () => {
  // spec: calculator-page › [CP11] the table of visible fields, in order
  it('lists the fields of each shape in the order of the spec', () => {
    expect(SHAPE_FIELDS).toEqual({
      slab: ['length', 'width', 'thickness'],
      footing: ['length', 'footingWidth', 'footingDepth', 'count'],
      column: ['diameter', 'height', 'count'],
      steps: ['stepWidth', 'rise', 'run', 'stepCount'],
    });
  });

  it('names only inputs of the calculator, one group per option of the shape select', () => {
    const keys = concrete.inputs.map(({ key }) => key);
    const shape = concrete.inputs.find(({ key }) => key === 'shape');
    expect(shape?.kind === 'select' && Object.keys(SHAPE_FIELDS)).toEqual(
      shape?.kind === 'select' ? [...shape.options] : [],
    );
    for (const fields of Object.values(SHAPE_FIELDS)) {
      for (const key of fields) expect(keys, key).toContain(key);
    }
  });

  it('shows every dimension of the calculator in some shape', () => {
    const shown = new Set(Object.values(SHAPE_FIELDS).flat());
    const always = ['shape', 'waste', 'bag', 'bagPrice', 'readyMixPrice'];
    expect(
      concrete.inputs
        .map(({ key }) => key)
        .filter((key) => !always.includes(key))
        .sort(),
    ).toEqual([...shown].sort());
  });

  // One list of inputs serves all four shapes: each shape's fields keep their order inside it, so
  // hiding the other fields shows the order of the spec (calculator-page › [CP11]).
  it('keeps the fields of every shape in the order of the one input list', () => {
    expect([...DIMENSION_ORDER].sort()).toEqual(
      [...new Set(Object.values(SHAPE_FIELDS).flat())].sort(),
    );
    for (const [shape, fields] of Object.entries(SHAPE_FIELDS)) {
      const positions = fields.map((field) => DIMENSION_ORDER.indexOf(field));
      expect(
        positions.every((position) => position >= 0),
        shape,
      ).toBe(true);
      expect(positions, shape).toEqual([...positions].sort((a, b) => a - b));
    }
  });
});
