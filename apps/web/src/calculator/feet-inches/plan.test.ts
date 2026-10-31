import { feetInches } from '@maestro-calc/core/calculators/feet-inches';
import { describe, expect, it } from 'vitest';
import type { Ready } from '../page-module.ts';
import { ANSWER, type Plan } from '../slots/drawing.ts';
import { FRAME, MESSAGES, planOf } from './plan.ts';

/** The moment of form strings in a unit system; a failed run fails the test. */
const momentOf = (
  raw: Readonly<Record<string, unknown>>,
  system: 'imperial' | 'metric' = 'imperial',
): Ready<typeof feetInches> => {
  const state = feetInches.validate(raw, { unitSystem: system });
  const result = feetInches.run(raw, { unitSystem: system });
  if (!state.ok || !result.ok) throw new Error('run failed');
  return {
    system,
    choices: { operation: state.value.operation },
    valid: state.value,
    result: result.value,
  };
};

const texts = (plan: Plan | null) =>
  plan?.labels.map(({ label }) => ('text' in label ? label.text : label.message));

const widths = (plan: Plan | null) =>
  plan?.outline.map((shape) => (shape.kind === 'rect' ? shape.w : Number.NaN));

/*
 * Hand-verified layout in the 300 by 200 frame: one row per bar, its label (1.25 × 17 = 21.25 tall)
 * 6 above a 16 tall bar, 12 between rows, so 43.25 a row. Three rows take 3 × 43.25 + 24 = 153.75,
 * centred from y = 23.125. Every bar starts at the 6 margin and the longest spans 288; the default
 * 150 in + 44.25 in = 194.25 in gives 150 / 194.25 × 288 = 222.4 and 44.25 / 194.25 × 288 = 65.6.
 */
describe('the feet and inches plan (blueprint-drawing, calc-feet-inches)', () => {
  it('draws in the 300 by 200 frame, named by the answer, with no message', () => {
    expect(FRAME).toEqual({ width: 300, height: 200 });
    expect(MESSAGES).toEqual([]);
    expect(planOf(momentOf({}))?.name).toBe(ANSWER);
  });

  it('draws a sum as the two lengths and the result, to scale, each labelled above', () => {
    const plan = planOf(momentOf({}));
    expect(plan?.outline).toEqual([
      { kind: 'rect', x: 6, y: 50.4, w: 222.4, h: 16 },
      { kind: 'rect', x: 6, y: 105.6, w: 65.6, h: 16 },
      { kind: 'rect', x: 6, y: 160.9, w: 288, h: 16 },
    ]);
    expect(plan?.labels.map(({ x, y, anchor, size, tone }) => [x, y, anchor, size, tone])).toEqual([
      [6, 33.8, 'start', 17, 'dimension'],
      [6, 89, 'start', 17, 'dimension'],
      [6, 144.3, 'start', 17, 'dimension'],
    ]);
    expect(texts(plan)).toEqual(['12 ft 6 in', '3 ft 8 1/4 in', '16 ft 2 1/4 in']);
    expect(plan?.lines).toEqual([]);
  });

  it('writes the metric texts on the same bars, so the toggle moves nothing', () => {
    const imperial = planOf(momentOf({}));
    const metric = planOf(momentOf({}, 'metric'));
    expect(metric?.outline).toEqual(imperial?.outline);
    expect(texts(metric)?.[2]).toBe('4.934 m');
  });

  it('draws a subtraction whose second length is the longer with the difference last', () => {
    const plan = planOf(momentOf({ operation: 'subtract', first: '10', second: '12.5' }));
    expect(texts(plan)).toEqual(['10 ft', '12 ft 6 in', '2 ft 6 in']);
    // 120 / 150 × 288 = 230.4, the longer 288, the difference 30 / 150 × 288 = 57.6
    expect(widths(plan)).toEqual([230.4, 288, 57.6]);
  });

  it('draws a product as the length and the result split into its parts', () => {
    const plan = planOf(momentOf({ operation: 'multiply' }));
    expect(texts(plan)).toEqual(['12 ft 6 in', '25 ft']);
    expect(widths(plan)).toEqual([144, 288]);
    // two rows: 2 × 43.25 + 12 = 98.5, from y = 50.75; the result bar at 50.75 + 55.25 + 27.25 = 133.25
    expect(plan?.outline[1]).toEqual({ kind: 'rect', x: 6, y: 133.3, w: 288, h: 16 });
    expect(plan?.lines).toEqual([{ d: 'M150 133.3L150 149.3', tone: 'tick' }]);
  });

  it('draws a quotient as the length split into its parts and one part', () => {
    const plan = planOf(momentOf({ operation: 'divide', factor: '3' }));
    expect(texts(plan)).toEqual(['12 ft 6 in', '4 ft 2 in']);
    expect(widths(plan)).toEqual([288, 96]);
    expect(plan?.lines).toEqual([{ d: 'M102 78L102 94M198 78L198 94', tone: 'tick' }]);
  });

  it('splits no bar into more than 16 parts', () => {
    expect(planOf(momentOf({ operation: 'divide', factor: '16' }))?.lines).toHaveLength(1);
    expect(planOf(momentOf({ operation: 'divide', factor: '17' }))?.lines).toEqual([]);
  });

  it('draws nothing when every length is zero', () => {
    expect(planOf(momentOf({ first: '0', second: '0' }))).toBeNull();
  });
});
