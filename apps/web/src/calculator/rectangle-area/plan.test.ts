import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { describe, expect, it } from 'vitest';
import type { Ready } from '../page-module.ts';
import { FRAME, planOf } from './plan.ts';

/** The moment of form strings in a unit system; a failed run fails the test. */
const momentOf = (
  raw: Readonly<Record<string, unknown>>,
  system: 'imperial' | 'metric' = 'imperial',
): Ready<typeof rectangleArea> => {
  const state = rectangleArea.validate(raw, { unitSystem: system });
  const result = rectangleArea.run(raw, { unitSystem: system });
  if (!state.ok || !result.ok) throw new Error('run failed');
  return { system, choices: {}, valid: state.value, result: result.value };
};

const texts = (moment: Ready<typeof rectangleArea>) =>
  planOf(moment).labels.map(({ label }) => ('text' in label ? label.text : label.message));

/*
 * Hand-verified layout in the 300 by 200 frame. The left gutter holds the widest width label of
 * both unit systems (`10 ft` and `3.05 m`: 6 × 17 × 0.56 = 57.1), so a unit toggle moves nothing:
 * left 14 + 6 + 57.1 = 77.1, top 14 + 6 + 20.4 = 40.4, bottom 6 + 20.4 = 26.4, right 6. That
 * leaves 216.9 across and 133.2 down.
 */
describe('the square footage plan (blueprint-drawing › [BD1], [BD2], [BD11], [BD12])', () => {
  it('draws in the 300 by 200 frame', () => {
    expect(FRAME).toEqual({ width: 300, height: 200 });
  });

  // spec: blueprint-drawing › [BD1] the default: a 133.2 square at x = 77.1 + (216.9 − 133.2) / 2 = 119
  it('draws the default 10 ft by 10 ft as a square with its labels and its name', () => {
    expect(planOf(momentOf({}))).toEqual({
      name: {
        message: 'drawing',
        fills: { length: '10 ft', width: '10 ft', area: '100.00 ft²' },
      },
      outline: [{ kind: 'rect', x: 119, y: 40.4, w: 133.2, h: 133.2 }],
      lines: [
        { d: 'M119 26.4L252.2 26.4', tone: 'helper' },
        { d: 'M119 40.4L119 22.4M252.2 40.4L252.2 22.4', tone: 'extension' },
        { d: 'M114 31.4L124 21.4M247.2 31.4L257.2 21.4', tone: 'tick' },
        { d: 'M105 40.4L105 173.6', tone: 'helper' },
        { d: 'M119 40.4L101 40.4M119 173.6L101 173.6', tone: 'extension' },
        { d: 'M100 45.4L110 35.4M100 178.6L110 168.6', tone: 'tick' },
      ],
      labels: [
        { x: 185.6, y: 10.2, anchor: 'middle', size: 17, label: { text: '10 ft' } },
        { x: 99, y: 107, anchor: 'end', size: 17, label: { text: '10 ft' } },
        { x: 185.6, y: 107, anchor: 'middle', size: 15, label: { text: '100.00 ft²' } },
      ],
    });
  });

  // spec: blueprint-drawing › [BD11] metric relabels with `3.05 m` and `9.29 m²`; the coordinates stay
  it('relabels the default in metric and keeps every coordinate', () => {
    const us = planOf(momentOf({}));
    const metric = planOf(momentOf({}, 'metric'));
    expect(metric.outline).toEqual(us.outline);
    expect(metric.lines).toEqual(us.lines);
    expect(metric.labels.map(({ x, y }) => [x, y])).toEqual(us.labels.map(({ x, y }) => [x, y]));
    expect(texts(momentOf({}, 'metric'))).toEqual(['3.05 m', '3.05 m', '9.29 m²']);
    expect(metric.name).toEqual({
      message: 'drawing',
      fills: { length: '3.05 m', width: '3.05 m', area: '9.29 m²' },
    });
  });

  // spec: blueprint-drawing › [BD2] 20 by 10: 216.9 by 108.45, y = 40.4 + (133.2 − 108.45) / 2
  it('draws 20 ft by 10 ft twice as wide as tall', () => {
    expect(planOf(momentOf({ length: '20' })).outline).toEqual([
      { kind: 'rect', x: 77.1, y: 52.8, w: 216.9, h: 108.5 },
    ]);
  });

  // spec: blueprint-drawing › [BD2] 10 by 20: 66.6 by 133.2, x = 77.1 + (216.9 − 66.6) / 2; the area goes below
  it('draws 10 ft by 20 ft twice as tall as wide, with the area in the bottom row', () => {
    const plan = planOf(momentOf({ width: '20' }));
    expect(plan.outline).toEqual([{ kind: 'rect', x: 152.3, y: 40.4, w: 66.6, h: 133.2 }]);
    expect(plan.labels[2]).toEqual({
      x: 185.6,
      y: 188.6,
      anchor: 'middle',
      size: 15,
      label: { text: '200.00 ft²' },
    });
  });

  // spec: blueprint-drawing › [BD12] 100 by 1 at the clamp: `30.48 cm` widens the gutter to 96.2,
  // so 197.8 across and 197.8 / 4 = 49.45 down
  it('draws 100 ft by 1 ft at the 4 to 1 clamp with the true labels', () => {
    const moment = momentOf({ length: '100', width: '1' });
    expect(planOf(moment).outline).toEqual([{ kind: 'rect', x: 96.2, y: 82.3, w: 197.8, h: 49.5 }]);
    expect(texts(moment)).toEqual(['100 ft', '1 ft', '100.00 ft²']);
  });

  // spec: blueprint-drawing › [BD9] unit half: 12 ft 6 in by 10 ft is 125.00 ft², drawn 1.25 to 1
  it('labels 12 ft 6 in by 10 ft and draws it 166.5 by 133.2', () => {
    const moment = momentOf({ length: '12\' 6"' });
    expect(texts(moment)).toEqual(['12 ft 6 in', '10 ft', '125.00 ft²']);
    expect(planOf(moment).outline).toEqual([
      { kind: 'rect', x: 102.3, y: 40.4, w: 166.5, h: 133.2 },
    ]);
  });
});
