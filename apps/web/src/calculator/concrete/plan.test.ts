import { describe, expect, it } from 'vitest';
import { concrete } from '../../lib/concrete.ts';
import type { Ready } from '../page-module.ts';
import { ANSWER, type Plan, type PlanLabel } from '../slots/drawing.ts';
import { FRAME, MESSAGES, planOf } from './plan.ts';

/** The moment of form strings in a unit system; a failed run fails the test. */
const momentOf = (
  raw: Readonly<Record<string, unknown>>,
  system: 'imperial' | 'metric' = 'imperial',
): Ready<typeof concrete> => {
  const state = concrete.validate(raw, { unitSystem: system });
  const result = concrete.run(raw, { unitSystem: system });
  if (!state.ok || !result.ok) throw new Error('run failed');
  const { shape, bag } = state.value;
  return { system, choices: { shape, bag }, valid: state.value, result: result.value };
};

const drawn = (moment: Ready<typeof concrete>): Plan => {
  const plan = planOf(moment);
  if (plan === null) throw new Error('no plan');
  return plan;
};

/** Each label as `[x, y, anchor, text or message]`. */
const labels = (plan: Plan): [number, number, PlanLabel['anchor'], string][] =>
  plan.labels.map(({ x, y, anchor, label }) => [
    x,
    y,
    anchor,
    'text' in label ? label.text : label.message,
  ]);

/*
 * Hand-verified layout in the 300 by 200 frame (label boxes 1.25 sizes tall, 0.67 sizes a
 * character). A rectangle plan's gutters: top 14 + 6 + 21.25 = 41.3, bottom 6 + 21.25 = 27.3,
 * right 6, left 14 + 6 + the widest width label of both unit systems; 131.4 down is left.
 */
// A note is centred on the frame, not on its shape: its words are filled later and differ by
// language and unit system, and at most 300 wide (the longest is 29 characters, 291) it fits there
// whatever its text, so a toggle never moves it.
describe('the concrete plans (blueprint-drawing › [BD4], [BD5], [BD6])', () => {
  // spec: blueprint-drawing › [BD15] the answer sentence names each plan: it names the shape and its
  // dimensions already, so the only words of a plan are its note
  it('draws in the 300 by 200 frame, named by the answer, with one note message per shape', () => {
    expect(FRAME).toEqual({ width: 300, height: 200 });
    expect(MESSAGES).toEqual([
      'drawing.slab.note',
      'drawing.footing.note',
      'drawing.column.note',
      'drawing.steps.note',
    ]);
    for (const shape of ['slab', 'footing', 'column', 'steps'])
      expect(drawn(momentOf({ shape })).name).toBe(ANSWER);
  });

  // spec: blueprint-drawing › [BD4] the default slab, 12 ft by 10 ft: the left gutter holds `3.05 m`
  // (6 × 17 × 0.67 = 68.3), so 88.3; across 205.7, so the 12:10 box is 157.7 by 131.4 at
  // x = 88.3 + (205.7 − 157.7) / 2 = 112.3
  it('draws the default slab at 12:10 with its sides, the thickness note and no count', () => {
    const plan = drawn(momentOf({}));
    expect(plan.outline).toEqual([{ kind: 'rect', x: 112.3, y: 41.3, w: 157.7, h: 131.4 }]);
    expect(plan.lines[0]).toEqual({ d: 'M112.3 27.3L270 27.3', tone: 'helper' });
    expect(plan.lines[3]).toEqual({ d: 'M98.3 41.3L98.3 172.7', tone: 'helper' });
    expect(labels(plan)).toEqual([
      [191.2, 10.7, 'middle', '12 ft'],
      [92.3, 107, 'end', '10 ft'],
      [150, 188.1, 'middle', 'drawing.slab.note'],
    ]);
    expect(plan.labels[2]?.label).toEqual({
      message: 'drawing.slab.note',
      fills: { thickness: '4 in' },
    });
  });

  // spec: blueprint-drawing › [BD4] the slab has no count field, so even a count in the link is not drawn
  it('never marks a count on a slab, whose volume does not use it', () => {
    expect(drawn(momentOf({ count: '3' })).labels).toHaveLength(3);
  });

  it('relabels the slab in metric and keeps every coordinate', () => {
    const us = drawn(momentOf({}));
    const metric = drawn(momentOf({}, 'metric'));
    expect(metric.outline).toEqual(us.outline);
    expect(metric.lines).toEqual(us.lines);
    expect(labels(metric).map(([x, y]) => [x, y])).toEqual(labels(us).map(([x, y]) => [x, y]));
  });

  // spec: blueprint-drawing › [BD5] `?sh=footing&l=216&n=3`: 18 ft by 16 in is 13.5:1, drawn 4:1.
  // The left gutter holds `1 ft 4 in` (9 × 17 × 0.67 = 102.5), so 122.5; across 171.5, so the box
  // is 171.5 by 42.9 at y = 41.3 + (131.4 − 42.875) / 2 = 85.6
  it('draws the footing link at the clamped ratio with the depth note and the count mark inside', () => {
    const plan = drawn(momentOf({ shape: 'footing', length: '18 ft', count: '3' }));
    expect(plan.outline).toEqual([{ kind: 'rect', x: 122.5, y: 85.6, w: 171.5, h: 42.9 }]);
    expect(labels(plan)).toEqual([
      [208.3, 55, 'middle', '18 ft'],
      [102.5, 107.1, 'end', '1 ft 4 in'],
      [150, 143.9, 'middle', 'drawing.footing.note'],
      [208.3, 107.1, 'middle', '× 3'],
    ]);
    expect(plan.labels[2]?.label).toEqual({
      message: 'drawing.footing.note',
      fills: { depth: '8 in' },
    });
  });

  it('marks no count on a single footing', () => {
    const plan = drawn(momentOf({ shape: 'footing' }));
    expect(labels(plan).map(([, , , text]) => text)).toEqual([
      '12 ft',
      '1 ft 4 in',
      'drawing.footing.note',
    ]);
  });

  // spec: blueprint-drawing › [BD5] a count mark that does not fit inside goes to the top left corner:
  // 1 ft by 64 in is drawn 1:4, 32.9 wide, too narrow for `× 12` (4 × 17 × 0.67 = 45.6) and 12
  it('moves the count mark to the top left corner when the footing is too narrow for it', () => {
    const plan = drawn(
      momentOf({ shape: 'footing', length: '1 ft', footingWidth: '64 in', count: '12' }),
    );
    expect(labels(plan).at(-1)).toEqual([0, 10.6, 'start', '× 12']);
  });

  // spec: blueprint-drawing › [BD6] a column of 12 in, 8 ft high, 2 of them: a circle of radius 60
  // centred at x = 150 and y = (200 − 6 − 18.75) / 2 = 87.6, the diameter across its centre with
  // its label 6 + 10.6 above, the count in the lower half of its inscribed square and the height
  // note 6 + 9.4 under the circle
  it('draws a column as a circle of fixed radius with its diameter, the height note and the count', () => {
    const plan = drawn(momentOf({ shape: 'column', count: '2' }));
    expect(plan.outline).toEqual([{ kind: 'circle', cx: 150, cy: 87.6, r: 60 }]);
    expect(plan.lines).toEqual([
      { d: 'M90 87.6L210 87.6', tone: 'helper' },
      { d: 'M85 92.6L95 82.6M205 92.6L215 82.6', tone: 'tick' },
    ]);
    expect(labels(plan)).toEqual([
      [150, 71, 'middle', '1 ft'],
      [150, 163, 'middle', 'drawing.column.note'],
      [150, 108.8, 'middle', '× 2'],
    ]);
    expect(plan.labels[1]?.label).toEqual({
      message: 'drawing.column.note',
      fills: { height: '8 ft' },
    });
  });

  it('draws every column at the same size, whatever its diameter', () => {
    const small = drawn(momentOf({ shape: 'column', diameter: '6' }));
    const large = drawn(momentOf({ shape: 'column', diameter: '48' }));
    expect(large.outline).toEqual(small.outline);
    expect(labels(large)[0]?.[3]).toBe('4 ft');
  });
});

// spec: blueprint-drawing › [BD7] 4 steps, rise 7 in, run 11 in: the profile is 44 by 28 (11:7). Gutters:
// top 6 + 18.75 = 24.8 (the note row), bottom 14 + 6 + 21.25 = 41.3, right 6, left 14 + 6 + `17.78 cm`
// (8 × 17 × 0.67 = 91.1) = 111.1. Across 182.9 sets the width, so the height is 182.9 × 7 / 11 =
// 116.4 at y = 24.8 + (133.9 − 116.4) / 2 = 33.6: treads of 45.7, risers of 29.1, ground at 150
describe('the concrete steps profile (blueprint-drawing › [BD7], [BD8])', () => {
  const steps = { shape: 'steps', rise: '7 in', run: '11 in', stepCount: '4' };

  it('draws 4 treads rising to the right with the rise, the run and the step count', () => {
    const plan = drawn(momentOf(steps));
    expect(plan.outline).toEqual([
      {
        kind: 'path',
        d: 'M111.1 150L111.1 120.9L156.8 120.9L156.8 91.8L202.6 91.8L202.6 62.7L248.3 62.7L248.3 33.6L294 33.6L294 150Z',
      },
    ]);
    expect(plan.lines[0]).toEqual({ d: 'M97.1 150L97.1 120.9', tone: 'helper' });
    expect(plan.lines[3]).toEqual({ d: 'M111.1 164L156.8 164', tone: 'helper' });
    expect(labels(plan)).toEqual([
      [91.1, 135.5, 'end', '7 in'],
      [134, 180.6, 'middle', '11 in'],
      [150, 18.2, 'middle', 'drawing.steps.note'],
    ]);
    expect(plan.labels[2]?.label).toEqual({
      message: 'drawing.steps.note',
      fills: { count: '4' },
    });
  });

  it('relabels the steps in metric and keeps every coordinate', () => {
    const us = drawn(momentOf(steps));
    const metric = drawn(momentOf(steps, 'metric'));
    expect(metric.outline).toEqual(us.outline);
    expect(labels(metric).map(([x, y]) => [x, y])).toEqual(labels(us).map(([x, y]) => [x, y]));
    expect(
      labels(metric)
        .slice(0, 2)
        .map(([, , , text]) => text),
    ).toEqual(['17.78 cm', '27.94 cm']);
  });

  it('keeps 50 steps and their labels inside the frame', () => {
    const plan = drawn(momentOf({ ...steps, stepCount: '50' }));
    const corners = (plan.outline[0] as { d: string }).d.match(/[\d.]+/g)?.map(Number) ?? [];
    expect(corners.length).toBe(2 + 50 * 4 + 2);
    expect(Math.min(...corners)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...corners)).toBeLessThanOrEqual(300);
    for (const { x } of plan.labels) expect(x).toBeGreaterThanOrEqual(0);
  });

  it('draws nothing for no steps: there is no profile to show', () => {
    expect(planOf(momentOf({ ...steps, stepCount: '0' }))).toBeNull();
  });

  // spec: blueprint-drawing › [BD8] the unit half: every shape the select offers has a plan
  it.each(['slab', 'footing', 'column', 'steps'])('has a plan for the %s default', (shape) => {
    expect(planOf(momentOf({ shape }))).not.toBeNull();
  });
});
