import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { describe, expect, it } from 'vitest';
import type { Ready } from '../page-module.ts';
import { CHAR } from '../slots/drawing.ts';
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
 * both unit systems (`10 ft` and `3.05 m`: 6 × 17 × 0.67 = 68.3), so a unit toggle moves nothing:
 * left 14 + 6 + 68.3 = 88.3, top 14 + 6 + 21.25 = 41.3, bottom 6 + 21.25 = 27.3, right 6 (label
 * boxes are 1.25 sizes tall). That leaves 205.7 across and 131.4 down.
 */
describe('the square footage plan (blueprint-drawing › [BD1], [BD2], [BD11], [BD12])', () => {
  it('draws in the 300 by 200 frame', () => {
    expect(FRAME).toEqual({ width: 300, height: 200 });
  });

  // spec: blueprint-drawing › [BD1] the default: a 131.4 square at x = 88.3 + (205.7 − 131.4) / 2 = 125.45
  it('draws the default 10 ft by 10 ft as a square with its labels and its name', () => {
    expect(planOf(momentOf({}))).toEqual({
      name: {
        message: 'drawing',
        fills: { length: '10 ft', width: '10 ft', area: '100.00 ft²' },
      },
      outline: [{ kind: 'rect', x: 125.5, y: 41.3, w: 131.4, h: 131.4 }],
      lines: [
        { d: 'M125.5 27.3L256.9 27.3', tone: 'helper' },
        { d: 'M125.5 41.3L125.5 23.3M256.9 41.3L256.9 23.3', tone: 'extension' },
        { d: 'M120.5 32.3L130.5 22.3M251.9 32.3L261.9 22.3', tone: 'tick' },
        { d: 'M111.5 41.3L111.5 172.7', tone: 'helper' },
        { d: 'M125.5 41.3L107.5 41.3M125.5 172.7L107.5 172.7', tone: 'extension' },
        { d: 'M106.5 46.3L116.5 36.3M106.5 177.7L116.5 167.7', tone: 'tick' },
      ],
      labels: [
        { x: 191.2, y: 10.7, anchor: 'middle', size: 17, label: { text: '10 ft' } },
        { x: 105.5, y: 107, anchor: 'end', size: 17, label: { text: '10 ft' } },
        { x: 191.2, y: 107, anchor: 'middle', size: 15, label: { text: '100.00 ft²' } },
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

  // spec: blueprint-drawing › [BD2] 20 by 10: 205.7 by 102.85, y = 41.3 + (131.4 − 102.85) / 2 = 55.575
  it('draws 20 ft by 10 ft twice as wide as tall', () => {
    expect(planOf(momentOf({ length: '20' })).outline).toEqual([
      { kind: 'rect', x: 88.3, y: 55.6, w: 205.7, h: 102.9 },
    ]);
  });

  // spec: blueprint-drawing › [BD2] 10 by 20: 65.7 by 131.4, x = 88.3 + (205.7 − 65.7) / 2; the area goes below
  it('draws 10 ft by 20 ft twice as tall as wide, with the area in the bottom row', () => {
    const plan = planOf(momentOf({ width: '20' }));
    expect(plan.outline).toEqual([{ kind: 'rect', x: 158.3, y: 41.3, w: 65.7, h: 131.4 }]);
    // centred at 158.3 + 65.7 / 2 = 191.15, which rounds up
    expect(plan.labels[2]).toEqual({
      x: 191.2,
      y: 188.1,
      anchor: 'middle',
      size: 15,
      label: { text: '200.00 ft²' },
    });
  });

  // spec: blueprint-drawing › [BD12] 100 by 1 at the clamp: `30.48 cm` widens the gutter to
  // 20 + 8 × 17 × 0.67 = 111.1, so 182.9 across and 182.9 / 4 = 45.725 down
  it('draws 100 ft by 1 ft at the 4 to 1 clamp with the true labels', () => {
    const moment = momentOf({ length: '100', width: '1' });
    expect(planOf(moment).outline).toEqual([
      { kind: 'rect', x: 111.1, y: 84.1, w: 182.9, h: 45.7 },
    ]);
    expect(texts(moment)).toEqual(['100 ft', '1 ft', '100.00 ft²']);
  });

  // spec: blueprint-drawing › [BD9] unit half: 12 ft 6 in by 10 ft is 125.00 ft², drawn 1.25 to 1:
  // 131.4 × 1.25 = 164.25, which is 164.2499… in binary floating point, so 164.2
  it('labels 12 ft 6 in by 10 ft and draws it 164.2 by 131.4', () => {
    const moment = momentOf({ length: '12\' 6"' });
    expect(texts(moment)).toEqual(['12 ft 6 in', '10 ft', '125.00 ft²']);
    expect(planOf(moment).outline).toEqual([{ kind: 'rect', x: 109, y: 41.3, w: 164.2, h: 131.4 }]);
  });
});

/*
 * The advance widths, in 2048ths of an em, of the glyphs the labels use, in the widest common
 * fallback the font stack can reach (DejaVu Sans Bold, the Linux `sans-serif` when neither Barlow
 * Condensed nor Arial loads) and in Liberation Sans Bold, which is metric-equal to Arial Bold.
 * Measured in Chromium with canvas `measureText` at 2048 px from the font files (DejaVu 2.37,
 * Liberation 2.1.5).
 */
const DIGITS = Array.from({ length: 10 }, (_, digit) => String(digit));
const FALLBACKS: Readonly<Record<string, Readonly<Record<string, number>>>> = {
  'DejaVu Sans Bold': {
    ...Object.fromEntries(DIGITS.map((digit) => [digit, 1425])),
    ',': 778,
    '.': 778,
    ' ': 713,
    f: 891,
    t: 979,
    i: 702,
    n: 1458,
    m: 2134,
    c: 1214,
    '/': 748,
    '²': 897,
    '<': 1716,
  },
  'Liberation Sans Bold': {
    ...Object.fromEntries(DIGITS.map((digit) => [digit, 1139])),
    ',': 569,
    '.': 569,
    ' ': 569,
    f: 682,
    t: 682,
    i: 569,
    n: 1251,
    m: 1821,
    c: 1139,
    '/': 569,
    '²': 682,
    '<': 1196,
  },
};

/** Sides typed in each unit system, from zero and the tiny texts to the longest the fields accept. */
const SIDES = {
  imperial: ['0', '0.0001', '0.5', '1', '10', '12\' 6"', '1000', '99999\' 11 63/64"'],
  metric: ['0', '0.00001', '0.003', '0.3', '1', '3.05', '1000', '30479.97'],
} as const;

describe('the label estimate covers the fallback fonts (blueprint-drawing › [BD14])', () => {
  it.each(Object.keys(FALLBACKS))('never underestimates a label set in %s', (font) => {
    const advances = FALLBACKS[font] ?? {};
    const labels = (['imperial', 'metric'] as const).flatMap((system) =>
      SIDES[system].flatMap((side) =>
        planOf(momentOf({ length: side, width: side }, system)).labels.flatMap(({ label }) =>
          'text' in label ? [label.text] : [],
        ),
      ),
    );
    expect(labels).toContain('<1/64 in');
    expect(labels).toContain('<0.01 cm');
    expect(labels).toContain('99,999 ft 11 63/64 in');
    const over = labels.filter((text) => {
      const width = Array.from(text).reduce((sum, glyph) => {
        const advance = advances[glyph];
        if (advance === undefined) throw new Error(`no advance for "${glyph}" in ${font}`);
        return sum + advance;
      }, 0);
      return width / 2048 > text.length * CHAR;
    });
    expect(over).toEqual([]);
  });
});
