import { describe, expect, it } from 'vitest';
import {
  areaLabel,
  CHAR,
  CLAMP,
  clampedRatio,
  dimensionLine,
  fitLabel,
  fitRectangle,
  labelBox,
  rectangleGutters,
  rectanglePlan,
  textWidth,
  type Gutters,
} from './drawing.ts';

const FRAME = { width: 300, height: 200 } as const;
/** Round gutters, so the hand-verified rectangles below are easy to check: 244 by 136 available. */
const GUTTERS: Gutters = { top: 40, right: 6, bottom: 24, left: 50 };
const text = (value: string) => ({ text: value });

describe('the clamped ratio (blueprint-drawing › [BD12], [BD13])', () => {
  it('is the true ratio inside the clamp and the bound outside it', () => {
    expect(CLAMP).toBe(4);
    expect(clampedRatio(20, 10)).toBe(2);
    expect(clampedRatio(10, 20)).toBe(0.5);
    expect(clampedRatio(100, 1)).toBe(4);
    expect(clampedRatio(1, 100)).toBe(0.25);
  });

  it('reads a zero side as an extreme ratio and two zero sides as a square', () => {
    expect(clampedRatio(5, 0)).toBe(4);
    expect(clampedRatio(0, 5)).toBe(0.25);
    expect(clampedRatio(0, 0)).toBe(1);
  });
});

describe('fitRectangle (blueprint-drawing › [BD2], [BD12])', () => {
  // spec: blueprint-drawing › [BD2] square, landscape and portrait, centred with equal margins
  it.each([
    ['a square', 10, 10, { x: 104, y: 40, w: 136, h: 136 }],
    ['twice as wide', 20, 10, { x: 50, y: 47, w: 244, h: 122 }],
    ['twice as tall', 10, 20, { x: 138, y: 40, w: 68, h: 136 }],
    // spec: blueprint-drawing › [BD12] 100 by 1 is drawn at the clamp, 4 to 1
    ['100 by 1, clamped', 100, 1, { x: 50, y: 77.5, w: 244, h: 61 }],
    ['1 by 100, clamped', 1, 100, { x: 155, y: 40, w: 34, h: 136 }],
  ])('draws %s', (_what, length, width, expected) => {
    expect(fitRectangle(FRAME, GUTTERS, length, width)).toEqual(expected);
  });

  it('rounds every coordinate to a tenth', () => {
    expect(fitRectangle(FRAME, { top: 0, right: 0, bottom: 0, left: 0 }, 3, 1)).toEqual({
      x: 0,
      y: 50,
      w: 300,
      h: 100,
    });
    expect(fitRectangle(FRAME, { top: 0.04, right: 0, bottom: 0, left: 0.06 }, 1, 1)).toEqual({
      x: 50.1,
      y: 0,
      w: 200,
      h: 200,
    });
  });
});

describe('dimensionLine (blueprint-drawing › [BD1], design B6)', () => {
  it('draws a top line 14 units out, its dashed extensions, two orange ticks and the label above', () => {
    expect(dimensionLine({ x: 50, y: 47 }, { x: 294, y: 47 }, 'top', text('20 ft'))).toEqual({
      lines: [
        { d: 'M50 33L294 33', tone: 'helper' },
        { d: 'M50 47L50 29M294 47L294 29', tone: 'extension' },
        { d: 'M45 38L55 28M289 38L299 28', tone: 'tick' },
      ],
      labels: [
        { x: 172, y: 16.4, anchor: 'middle', size: 17, tone: 'dimension', label: text('20 ft') },
      ],
    });
  });

  it('draws a left line with the label ending 6 units before it', () => {
    expect(dimensionLine({ x: 50, y: 47 }, { x: 50, y: 169 }, 'left', text('10 ft'))).toEqual({
      lines: [
        { d: 'M36 47L36 169', tone: 'helper' },
        { d: 'M50 47L32 47M50 169L32 169', tone: 'extension' },
        { d: 'M31 52L41 42M31 174L41 164', tone: 'tick' },
      ],
      labels: [{ x: 30, y: 108, anchor: 'end', size: 17, tone: 'dimension', label: text('10 ft') }],
    });
  });

  it('draws a bottom line with the label below it', () => {
    expect(dimensionLine({ x: 10, y: 100 }, { x: 110, y: 100 }, 'bottom', text('7 in'))).toEqual({
      lines: [
        { d: 'M10 114L110 114', tone: 'helper' },
        { d: 'M10 100L10 118M110 100L110 118', tone: 'extension' },
        { d: 'M5 119L15 109M105 119L115 109', tone: 'tick' },
      ],
      labels: [
        { x: 60, y: 130.6, anchor: 'middle', size: 17, tone: 'dimension', label: text('7 in') },
      ],
    });
  });

  it('draws a right line with the label starting 6 units after it', () => {
    expect(dimensionLine({ x: 200, y: 20 }, { x: 200, y: 80 }, 'right', text('11 in'))).toEqual({
      lines: [
        { d: 'M214 20L214 80', tone: 'helper' },
        { d: 'M200 20L218 20M200 80L218 80', tone: 'extension' },
        { d: 'M209 25L219 15M209 85L219 75', tone: 'tick' },
      ],
      labels: [
        { x: 220, y: 50, anchor: 'start', size: 17, tone: 'dimension', label: text('11 in') },
      ],
    });
  });
});

describe('label sizes (design B5)', () => {
  it('estimates a text as chars × size × 0.67, rounded to a tenth', () => {
    expect(CHAR).toBe(0.67);
    // 5 × 17 × 0.67 = 56.95, which rounds up to 57
    expect(textWidth('10 ft', 17)).toBe(57);
    expect(textWidth('100.00 ft²', 15)).toBe(100.5);
  });

  it('boxes a label by its anchor, 1.25 sizes tall around its centre line', () => {
    const at = {
      x: 100,
      y: 50,
      size: 17 as const,
      tone: 'dimension' as const,
      label: text('10 ft'),
    };
    expect(labelBox({ ...at, anchor: 'middle' })).toEqual({ x: 71.5, y: 39.4, w: 57, h: 21.3 });
    expect(labelBox({ ...at, anchor: 'start' })).toEqual({ x: 100, y: 39.4, w: 57, h: 21.3 });
    expect(labelBox({ ...at, anchor: 'end' })).toEqual({ x: 43, y: 39.4, w: 57, h: 21.3 });
  });

  it('boxes a message label by the longest text it may hold: none, so zero wide', () => {
    expect(
      labelBox({
        x: 10,
        y: 10,
        size: 15,
        anchor: 'start',
        tone: 'note',
        label: { message: 'm', fills: {} },
      }),
    ).toEqual({ x: 10, y: 0.6, w: 0, h: 18.8 });
  });

  it('moves a centred label inside the frame and leaves one that fits', () => {
    const label = {
      y: 10,
      size: 17 as const,
      anchor: 'middle' as const,
      tone: 'dimension' as const,
      label: text('10 ft'),
    };
    expect(fitLabel({ ...label, x: 10 }, FRAME).x).toBe(28.5);
    expect(fitLabel({ ...label, x: 290 }, FRAME).x).toBe(271.5);
    expect(fitLabel({ ...label, x: 150 }, FRAME).x).toBe(150);
  });

  // spec: blueprint-drawing › [BD11] the fit keeps the room of the longest text the label takes
  it('fits a centred label by the room of a longer text when it is given one', () => {
    const label = {
      y: 10,
      size: 17 as const,
      anchor: 'middle' as const,
      tone: 'dimension' as const,
      label: text('10 ft'),
    };
    // `10.00 m`: 7 × 17 × 0.67 = 79.7, half 39.85
    expect(fitLabel({ ...label, x: 10 }, FRAME, '10.00 m').x).toBe(39.9);
    expect(fitLabel({ ...label, x: 150 }, FRAME, '10.00 m').x).toBe(150);
  });

  it('reserves the top row, the bottom row, a right margin and the width label on the left', () => {
    expect(rectangleGutters('10 ft')).toEqual({ top: 41.3, right: 6, bottom: 27.3, left: 77 });
  });
});

describe('areaLabel (blueprint-drawing › [BD1], [BD2], [BD11])', () => {
  const box = { x: 100, y: 50, w: 120, h: 80 };

  it('centres the note inside a box it fits with 6 units each side', () => {
    // 8 × 15 × 0.67 = 80.4, at most 120 − 12
    expect(areaLabel(FRAME, box, '95.13 m²')).toEqual({
      x: 160,
      y: 90,
      anchor: 'middle',
      size: 15,
      tone: 'note',
      label: text('95.13 m²'),
    });
  });

  // spec: blueprint-drawing › [BD11] the longest text of either system decides inside or below
  it('puts the note below when its room does not fit, even where its own text would', () => {
    // room 12 × 15 × 0.67 = 120.6, over 108: the row below, at 50 + 80 + 6 + 9.375 = 145.375
    expect(areaLabel(FRAME, box, '95.13 m²', '1,024.00 ft²')).toEqual({
      x: 160,
      y: 145.4,
      anchor: 'middle',
      size: 15,
      tone: 'note',
      label: text('95.13 m²'),
    });
  });

  it('puts the note below a box shorter than 29', () => {
    expect(areaLabel(FRAME, { ...box, h: 28 }, 'a').y).toBe(93.4);
  });

  it('keeps the note in the frame by the width of its room', () => {
    // room 10 × 15 × 0.67 = 100.5: x = 300 − 50.25
    expect(areaLabel(FRAME, { x: 280, y: 150, w: 20, h: 10 }, 'a', 'aaaaaaaaaa').x).toBe(249.8);
  });
});

describe('rectanglePlan (blueprint-drawing › [BD1], [BD2], [BD12])', () => {
  const name = { message: 'drawing', fills: { length: '10 ft' } };

  // spec: blueprint-drawing › [BD1] hand-verified: left 14 + 6 + 57 = 77, so 217 by 131.4 available,
  // a 131.4 square at x = 77 + (217 − 131.4) / 2 = 119.8
  it('draws the default square with the length on top, the width on the left and the area inside', () => {
    const plan = rectanglePlan(FRAME, {
      length: 10,
      width: 10,
      texts: { length: '10 ft', width: '10 ft', area: '100.00 ft²' },
      name,
    });
    expect(plan).toEqual({
      name,
      outline: [{ kind: 'rect', x: 119.8, y: 41.3, w: 131.4, h: 131.4 }],
      lines: [
        { d: 'M119.8 27.3L251.2 27.3', tone: 'helper' },
        { d: 'M119.8 41.3L119.8 23.3M251.2 41.3L251.2 23.3', tone: 'extension' },
        { d: 'M114.8 32.3L124.8 22.3M246.2 32.3L256.2 22.3', tone: 'tick' },
        { d: 'M105.8 41.3L105.8 172.7', tone: 'helper' },
        { d: 'M119.8 41.3L101.8 41.3M119.8 172.7L101.8 172.7', tone: 'extension' },
        { d: 'M100.8 46.3L110.8 36.3M100.8 177.7L110.8 167.7', tone: 'tick' },
      ],
      labels: [
        { x: 185.5, y: 10.7, anchor: 'middle', size: 17, tone: 'dimension', label: text('10 ft') },
        { x: 99.8, y: 107, anchor: 'end', size: 17, tone: 'dimension', label: text('10 ft') },
        { x: 185.5, y: 107, anchor: 'middle', size: 15, tone: 'note', label: text('100.00 ft²') },
      ],
    });
  });

  // spec: blueprint-drawing › [BD2] a portrait rectangle too narrow for the area puts it in the bottom row
  it('puts the area in the bottom row when it does not fit inside', () => {
    const plan = rectanglePlan(FRAME, {
      length: 10,
      width: 20,
      texts: { length: '10 ft', width: '20 ft', area: '200.00 ft²' },
      name,
    });
    expect(plan.outline).toEqual([{ kind: 'rect', x: 152.7, y: 41.3, w: 65.7, h: 131.4 }]);
    // centred at 152.7 + 65.7 / 2 = 185.55, which is 185.5499… in floating point
    expect(plan.labels[2]).toEqual({
      x: 185.5,
      y: 188.1,
      anchor: 'middle',
      size: 15,
      tone: 'note',
      label: text('200.00 ft²'),
    });
  });

  it('puts the area in the bottom row when the rectangle is too short for it', () => {
    const plan = rectanglePlan(
      { width: 300, height: 95 },
      { length: 4, width: 1, texts: { length: 'a', width: 'b', area: 'c' }, name },
    );
    expect(plan.outline[0]).toMatchObject({ y: 41.3, h: 26.4 });
    expect(plan.labels[2]?.y).toBe(83.1);
  });

  // spec: blueprint-drawing › [BD12] 100 by 1 is drawn at the clamp and its labels carry the true values
  it('draws 100 ft by 1 ft at the clamp with the true labels', () => {
    const plan = rectanglePlan(FRAME, {
      length: 100,
      width: 1,
      texts: { length: '100 ft', width: '1 ft', area: '100.00 ft²' },
      name,
    });
    // left 14 + 6 + 4 × 17 × 0.67 = 65.6: 228.4 across, 228.4 / 4 = 57.1 down
    expect(plan.outline).toEqual([{ kind: 'rect', x: 65.6, y: 78.4, w: 228.4, h: 57.1 }]);
    expect(plan.labels.map(({ label }) => label)).toEqual([
      text('100 ft'),
      text('1 ft'),
      text('100.00 ft²'),
    ]);
  });

  it('keeps a long length label inside the frame over a narrow rectangle', () => {
    const plan = rectanglePlan(FRAME, {
      length: 1,
      width: 100,
      texts: { length: '99,999 ft 11 63/64 in', width: '1 ft', area: '1.00 ft²' },
      name,
    });
    // the rectangle is 32.8 wide at x = 163.4, so the label centred over it (179.8) would end at
    // 179.8 + 21 × 17 × 0.67 / 2 = 299.4: inside, so it stays centred over the rectangle
    expect(plan.outline[0]).toMatchObject({ x: 163.4, w: 32.8 });
    expect(plan.labels[0]?.x).toBe(179.8);
  });
});
