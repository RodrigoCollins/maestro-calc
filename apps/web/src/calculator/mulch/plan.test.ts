import { mulch } from '@maestro-calc/core/calculators/mulch';
import { describe, expect, it } from 'vitest';
import type { Ready } from '../page-module.ts';
import { ANSWER, type Plan } from '../slots/drawing.ts';
import { FRAME, MESSAGES, planOf } from './plan.ts';

/** The moment of form strings in a unit system; a failed run fails the test. */
const momentOf = (
  raw: Readonly<Record<string, unknown>>,
  system: 'imperial' | 'metric' = 'imperial',
): Ready<typeof mulch> => {
  const state = mulch.validate(raw, { unitSystem: system });
  const result = mulch.run(raw, { unitSystem: system });
  if (!state.ok || !result.ok) throw new Error('run failed');
  return { system, choices: { bag: state.value.bag }, valid: state.value, result: result.value };
};

const labels = (plan: Plan) =>
  plan.labels.map(({ x, y, anchor, label }) => [
    x,
    y,
    anchor,
    'text' in label ? label.text : label.message,
  ]);

/*
 * Hand-verified in the 300 by 200 frame: the left gutter holds `1.22 m` (6 × 17 × 0.67 = 68.3), so
 * 88.3, leaving 205.7 across and 131.4 down. The default bed, 20 ft by 4 ft, is 5:1, drawn 4:1:
 * 205.7 by 51.4 at y = 41.3 + (131.4 − 51.425) / 2 = 81.3. The depth note is centred on the frame,
 * 6 + 9.4 under the bed.
 */
describe('the mulch plan (blueprint-drawing, calc-mulch)', () => {
  it('draws in the 300 by 200 frame, named by the answer, with the depth note as its one message', () => {
    expect(FRAME).toEqual({ width: 300, height: 200 });
    expect(MESSAGES).toEqual(['drawing.note']);
    expect(planOf(momentOf({})).name).toBe(ANSWER);
  });

  it('draws the default bed at the clamped 4:1 with its sides and the depth note', () => {
    const plan = planOf(momentOf({}));
    expect(plan.outline).toEqual([{ kind: 'rect', x: 88.3, y: 81.3, w: 205.7, h: 51.4 }]);
    expect(labels(plan)).toEqual([
      [191.2, 50.7, 'middle', '20 ft'],
      [68.3, 107, 'end', '4 ft'],
      [150, 148.1, 'middle', 'drawing.note'],
    ]);
    expect(plan.labels[2]?.label).toEqual({ message: 'drawing.note', fills: { depth: '3 in' } });
  });

  it('relabels in metric and keeps every coordinate; the bag size does not change the plan', () => {
    const us = planOf(momentOf({}));
    const metric = planOf(momentOf({}, 'metric'));
    expect(metric.outline).toEqual(us.outline);
    expect(labels(metric).map(([x, y]) => [x, y])).toEqual(labels(us).map(([x, y]) => [x, y]));
    expect(planOf(momentOf({ bag: '3' }))).toEqual(us);
  });
});
