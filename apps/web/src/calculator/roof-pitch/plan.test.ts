import { roofPitch } from '@maestro-calc/core/calculators/roof-pitch';
import { describe, expect, it } from 'vitest';
import type { Ready } from '../page-module.ts';
import { ANSWER, type Plan } from '../slots/drawing.ts';
import { FRAME, MESSAGES, planOf } from './plan.ts';

/** The moment of form strings in a unit system; a failed run fails the test. */
const momentOf = (
  raw: Readonly<Record<string, unknown>>,
  system: 'imperial' | 'metric' = 'imperial',
): Ready<typeof roofPitch> => {
  const state = roofPitch.validate(raw, { unitSystem: system });
  const result = roofPitch.run(raw, { unitSystem: system });
  if (!state.ok || !result.ok) throw new Error('run failed');
  return {
    system,
    choices: { covering: state.value.covering },
    valid: state.value,
    result: result.value,
  };
};

const labels = (plan: Plan | null) =>
  plan?.labels.map(({ x, y, anchor, label }) => [
    x,
    y,
    anchor,
    'text' in label ? label.text : `${label.message} ${JSON.stringify(label.fills)}`,
  ]);

/*
 * Hand-verified layout in the 300 by 200 frame: the right gutter holds the longer rise text,
 * `15.24 cm` (8 × 17 × 0.67 = 91.1), so 14 + 6 + 91.1 = 111.1; the top row 6 + 1.25 × 15 = 24.8;
 * the bottom row 14 + 6 + 1.25 × 17 = 41.3; the left margin 6. That leaves 182.9 across and 133.9
 * down. The default 6 in over 1 ft is drawn 2:1, so 182.9 by 91.5 (91.45 rounded up) at y = 24.8 + (133.9 − 91.45) / 2
 * = 46. The run is measured under the triangle, the rise on its right, the pitch note above it.
 */
describe('the roof pitch plan (blueprint-drawing, calc-roof-pitch)', () => {
  it('draws in the 300 by 200 frame, named by the answer, with the pitch as its one message', () => {
    expect(FRAME).toEqual({ width: 300, height: 200 });
    expect(MESSAGES).toEqual(['pitch']);
    expect(planOf(momentOf({}))?.name).toBe(ANSWER);
  });

  it('draws the default slope as a right triangle rising to the right, 2:1', () => {
    const plan = planOf(momentOf({}));
    expect(plan?.outline).toEqual([{ kind: 'path', d: 'M6 137.5L188.9 137.5L188.9 46Z' }]);
    expect(labels(plan)).toEqual([
      [97.5, 168.1, 'middle', '1 ft'],
      [208.9, 91.8, 'start', '6 in'],
      [150, 30.6, 'middle', 'pitch {"value":"6.00"}'],
    ]);
  });

  it('draws the same outline in the metric system, so the toggle moves nothing', () => {
    const imperial = planOf(momentOf({}));
    const metric = planOf(momentOf({}, 'metric'));
    expect(metric?.outline).toEqual(imperial?.outline);
    expect(labels(metric)?.map((label) => label.slice(0, 3))).toEqual(
      labels(imperial)?.map((label) => label.slice(0, 3)),
    );
    expect(labels(metric)?.map((label) => label[3])).toEqual([
      '30.48 cm',
      '15.24 cm',
      'pitch {"value":"6.00"}',
    ]);
  });

  it('clamps a low slope to 4:1 and a steep one to 1:4, with true labels', () => {
    const low = planOf(momentOf({ rise: '1' }));
    expect(low?.labels[1]?.label).toEqual({ text: '1 in' });
    const box = (plan: Plan | null) => {
      const numbers = (plan?.outline[0]?.kind === 'path' ? plan.outline[0].d : '')
        .match(/[\d.]+/g)
        ?.map(Number);
      const [x1 = 0, y1 = 0, x2 = 0, , , y3 = 0] = numbers ?? [];
      return (x2 - x1) / (y1 - y3);
    };
    expect(box(low)).toBeCloseTo(4, 1);
    expect(box(planOf(momentOf({ rise: '96' })))).toBeCloseTo(1 / 4, 1);
  });

  it('draws nothing for a flat roof: a zero rise has no slope to show', () => {
    expect(planOf(momentOf({ rise: '0' }))).toBeNull();
  });
});
