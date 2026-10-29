import { describe, expect, it } from 'vitest';
import { gravel } from '../../lib/gravel.ts';
import type { Ready } from '../page-module.ts';
import { ANSWER, type Plan } from '../slots/drawing.ts';
import { FRAME, MESSAGES, planOf } from './plan.ts';

/** The moment of form strings in a unit system; a failed run fails the test. */
const momentOf = (
  raw: Readonly<Record<string, unknown>>,
  system: 'imperial' | 'metric' = 'imperial',
): Ready<typeof gravel> => {
  const state = gravel.validate(raw, { unitSystem: system });
  const result = gravel.run(raw, { unitSystem: system });
  if (!state.ok || !result.ok) throw new Error('run failed');
  return {
    system,
    choices: { placement: state.value.placement },
    valid: state.value,
    result: result.value,
  };
};

const labels = (plan: Plan) =>
  plan.labels.map(({ x, y, anchor, label }) => [
    x,
    y,
    anchor,
    'text' in label ? label.text : label.message,
  ]);

/*
 * Hand-verified layout in the 300 by 200 frame, the rectangle plan of the square footage page: the
 * left gutter holds `3.05 m` (6 × 17 × 0.67 = 68.3), so 88.3; 205.7 across and 131.4 down. The
 * default 20 ft by 10 ft is 2:1, so 205.7 by 102.9 at y = 41.3 + (131.4 − 102.85) / 2 = 55.6. The
 * depth note is centred on the frame, 6 + 9.4 under the rectangle.
 */
describe('the gravel plan (blueprint-drawing, calc-gravel)', () => {
  it('draws in the 300 by 200 frame, named by the answer, with the depth note as its one message', () => {
    expect(FRAME).toEqual({ width: 300, height: 200 });
    expect(MESSAGES).toEqual(['drawing.note']);
    expect(planOf(momentOf({})).name).toBe(ANSWER);
  });

  it('draws the default area at 2:1 with its sides and the depth note', () => {
    const plan = planOf(momentOf({}));
    expect(plan.outline).toEqual([{ kind: 'rect', x: 88.3, y: 55.6, w: 205.7, h: 102.9 }]);
    expect(labels(plan)).toEqual([
      [191.2, 25, 'middle', '20 ft'],
      [68.3, 107.1, 'end', '10 ft'],
      [150, 173.9, 'middle', 'drawing.note'],
    ]);
    expect(plan.labels[2]?.label).toEqual({ message: 'drawing.note', fills: { depth: '4 in' } });
  });

  it('relabels in metric and keeps every coordinate', () => {
    const us = planOf(momentOf({}));
    const metric = planOf(momentOf({}, 'metric'));
    expect(metric.outline).toEqual(us.outline);
    expect(labels(metric).map(([x, y]) => [x, y])).toEqual(labels(us).map(([x, y]) => [x, y]));
    expect(metric.labels.map(({ label }) => ('text' in label ? label.text : label.fills))).toEqual([
      '6.10 m',
      '3.05 m',
      { depth: '10.16 cm' },
    ]);
  });

  it('draws a loose layer the same way: the placement changes the weight, not the plan', () => {
    expect(planOf(momentOf({ placement: 'loose' }))).toEqual(planOf(momentOf({})));
  });
});
