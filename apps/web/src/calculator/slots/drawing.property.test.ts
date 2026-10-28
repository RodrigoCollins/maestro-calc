import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  CLAMP,
  clampedRatio,
  fitRectangle,
  labelBox,
  rectangleGutters,
  rectanglePlan,
  type Box,
} from './drawing.ts';

const RUNS = 1000;
const FRAME = { width: 300, height: 200 } as const;

/** A side in inches: zero, the small, the ordinary and the largest the square footage page accepts. */
const sideArb = fc.oneof(
  fc.constant(0),
  fc.double({ min: 1 / 64, max: 120, noNaN: true }),
  fc.double({ min: 120, max: 1_200_000, noNaN: true }),
);
/** A label text from 1 to 21 characters, the longest a length or an area of the page writes. */
const textArb = fc.string({ minLength: 1, maxLength: 21 });

const inside = ({ x, y, w, h }: Box): boolean =>
  x >= 0 && y >= 0 && x + w <= FRAME.width + 1e-9 && y + h <= FRAME.height + 1e-9;

const intersects = (a: Box, b: Box): boolean =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

describe('the clamp is symmetric and monotone (blueprint-drawing › [BD13])', () => {
  // spec: blueprint-drawing › [BD13] non-decreasing in length over width
  it('never decreases as the length grows against a fixed width', () => {
    fc.assert(
      fc.property(sideArb, sideArb, sideArb, (a, b, width) => {
        const [short, long] = a <= b ? [a, b] : [b, a];
        expect(clampedRatio(short, width)).toBeLessThanOrEqual(clampedRatio(long, width));
      }),
      { numRuns: RUNS },
    );
  });

  // spec: blueprint-drawing › [BD13] the true ratio inside the clamp, the bound outside
  it('equals the true ratio inside [1/4, 4] and the bound outside', () => {
    fc.assert(
      fc.property(sideArb, sideArb, (length, width) => {
        fc.pre(length > 0 && width > 0);
        const ratio = length / width;
        const expected = ratio > CLAMP ? CLAMP : ratio < 1 / CLAMP ? 1 / CLAMP : ratio;
        expect(clampedRatio(length, width)).toBeCloseTo(expected, 12);
      }),
      { numRuns: RUNS },
    );
  });

  // spec: blueprint-drawing › [BD13] swaps exactly when length and width swap
  it('gives exactly the inverse ratio when the sides swap', () => {
    fc.assert(
      fc.property(sideArb, sideArb, (a, b) => {
        const [short, long] = a <= b ? [a, b] : [b, a];
        expect(clampedRatio(short, long)).toBe(1 / clampedRatio(long, short));
      }),
      { numRuns: RUNS },
    );
  });

  // spec: blueprint-drawing › [BD13] the outline never leaves the frame
  it('keeps the rectangle inside the frame, at the clamped ratio within rounding', () => {
    fc.assert(
      fc.property(sideArb, sideArb, textArb, (length, width, widthText) => {
        const rect = fitRectangle(FRAME, rectangleGutters(widthText), length, width);
        expect(inside(rect)).toBe(true);
        expect(rect.w / rect.h).toBeCloseTo(clampedRatio(length, width), 1);
      }),
      { numRuns: RUNS },
    );
  });
});

describe('labels never collide (blueprint-drawing › [BD12], [BD14] estimate half)', () => {
  // spec: blueprint-drawing › [BD12] the estimated label boxes stay in the frame and apart
  it('keeps every estimated label box inside the frame and clear of the others', () => {
    fc.assert(
      fc.property(
        sideArb,
        sideArb,
        textArb,
        textArb,
        textArb,
        (length, width, lengthText, widthText, area) => {
          const plan = rectanglePlan(FRAME, {
            length,
            width,
            texts: { length: lengthText, width: widthText, area },
            name: { text: 'plan' },
          });
          const boxes = plan.labels.map(labelBox);
          for (const box of boxes) expect(inside(box), JSON.stringify(box)).toBe(true);
          for (const [index, box] of boxes.entries()) {
            for (const other of boxes.slice(index + 1)) {
              expect(intersects(box, other), JSON.stringify([box, other])).toBe(false);
            }
          }
        },
      ),
      { numRuns: RUNS },
    );
  });
});
