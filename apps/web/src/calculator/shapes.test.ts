import { describe, expect, it } from 'vitest';
import { concrete } from '../lib/concrete.ts';
import { SHAPE_FIELDS } from './shapes.ts';

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
});
