import { describe, expect, it } from 'vitest';
import { paint } from '../../lib/paint.ts';
import type { Ready } from '../page-module.ts';
import { ANSWER, type Plan } from '../slots/drawing.ts';
import { FRAME, MESSAGES, planOf } from './plan.ts';

/** The moment of form strings in a unit system; a failed run fails the test. */
const momentOf = (
  raw: Readonly<Record<string, unknown>>,
  system: 'imperial' | 'metric' = 'imperial',
): Ready<typeof paint> => {
  const state = paint.validate(raw, { unitSystem: system });
  const result = paint.run(raw, { unitSystem: system });
  if (!state.ok || !result.ok) throw new Error('run failed');
  return { system, choices: {}, valid: state.value, result: result.value };
};

const labels = (plan: Plan) =>
  plan.labels.map(({ x, y, anchor, label }) => [
    x,
    y,
    anchor,
    'text' in label ? label.text : label.message,
  ]);

/*
 * Hand-verified in the 300 by 200 frame: the default 12 ft by 12 ft room is the square footage
 * default layout (the side texts `12 ft` and `3.66 m` are as wide as topsoil's `10 ft` and
 * `3.05 m`). The left gutter holds `3.66 m` (68.3), so 88.3; 205.7 across, 131.4 down, so a 131.4
 * square at x = 88.3 + (205.7 − 131.4) / 2 = 125.5. The wall note is centred on the frame, 6 + 9.4
 * under the square.
 */
describe('the paint plan (blueprint-drawing, calc-paint)', () => {
  it('draws in the 300 by 200 frame, named by the answer, with the wall note as its one message', () => {
    expect(FRAME).toEqual({ width: 300, height: 200 });
    expect(MESSAGES).toEqual(['drawing.note']);
    expect(planOf(momentOf({})).name).toBe(ANSWER);
  });

  it('draws the default room with its sides and the wall height note', () => {
    const plan = planOf(momentOf({}));
    expect(plan.outline).toEqual([{ kind: 'rect', x: 125.5, y: 41.3, w: 131.4, h: 131.4 }]);
    expect(labels(plan)).toEqual([
      [191.2, 10.7, 'middle', '12 ft'],
      [105.5, 107, 'end', '12 ft'],
      [150, 188.1, 'middle', 'drawing.note'],
    ]);
    expect(plan.labels[2]?.label).toEqual({ message: 'drawing.note', fills: { height: '8 ft' } });
  });

  it('relabels in metric and keeps every coordinate; the openings and coats do not change the plan', () => {
    const us = planOf(momentOf({}));
    const metric = planOf(momentOf({}, 'metric'));
    expect(metric.outline).toEqual(us.outline);
    expect(labels(metric).map(([x, y]) => [x, y])).toEqual(labels(us).map(([x, y]) => [x, y]));
    expect(planOf(momentOf({ doors: '3', windows: '0', coats: '1' }))).toEqual(us);
  });
});
