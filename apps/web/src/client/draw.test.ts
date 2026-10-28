import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ResolvedPlan } from '../calculator/slots/drawing.ts';
import { contrast } from '../contract/contrast.ts';
import { fromRoot } from '../contract/root.ts';
import { COLOURS, gridOf, nodesOf } from './draw.ts';

/** A plan of every kind of outline, line and label, as the controller hands it to the writer. */
const PLAN: ResolvedPlan = {
  frame: { width: 48, height: 32 },
  name: 'Plan: 10 ft by 10 ft, 100.00 ft²',
  outline: [
    { kind: 'rect', x: 10, y: 20, w: 30, h: 40 },
    { kind: 'circle', cx: 5, cy: 6, r: 7 },
    { kind: 'path', d: 'M0 0L1 1' },
  ],
  lines: [
    { d: 'M1 2L3 4', tone: 'helper' },
    { d: 'M5 6L7 8', tone: 'extension' },
    { d: 'M9 9L10 10', tone: 'tick' },
  ],
  labels: [
    { x: 1, y: 2, anchor: 'middle', size: 17, tone: 'dimension', text: '10 ft' },
    { x: 3, y: 4.5, anchor: 'end', size: 15, tone: 'note', text: '100.00 ft²' },
    // the colour follows the tone, not the size
    { x: 5, y: 6, anchor: 'start', size: 15, tone: 'dimension', text: '7 in' },
  ],
};

const SHAPE = { fill: '#FFFFFF', 'fill-opacity': '0.08', stroke: '#FFFFFF', 'stroke-width': '2' };

describe('the nodes of a plan (blueprint-drawing › [BD19], [BD24]; design B6, B7)', () => {
  // spec: blueprint-drawing › [BD19] the grid, the white outline, the lines and the labels, in that order
  it('lists the grid, the outline, the lines and the labels with their presentation attributes', () => {
    expect(nodesOf(PLAN)).toEqual([
      {
        tag: 'path',
        attrs: {
          d: 'M16 0V32M32 0V32M0 16H48',
          fill: 'none',
          stroke: '#FFFFFF',
          'stroke-opacity': '0.07',
          'stroke-width': '1',
        },
      },
      { tag: 'rect', attrs: { x: '10', y: '20', width: '30', height: '40', ...SHAPE } },
      { tag: 'circle', attrs: { cx: '5', cy: '6', r: '7', ...SHAPE } },
      { tag: 'path', attrs: { d: 'M0 0L1 1', ...SHAPE } },
      {
        tag: 'path',
        attrs: { d: 'M1 2L3 4', fill: 'none', stroke: '#B9C6DA', 'stroke-width': '1.2' },
      },
      {
        tag: 'path',
        attrs: {
          d: 'M5 6L7 8',
          fill: 'none',
          stroke: '#B9C6DA',
          'stroke-width': '1',
          'stroke-dasharray': '2 3',
        },
      },
      {
        tag: 'path',
        attrs: { d: 'M9 9L10 10', fill: 'none', stroke: '#F06A1D', 'stroke-width': '2' },
      },
      {
        tag: 'text',
        attrs: {
          x: '1',
          y: '2',
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          'font-size': '17',
          fill: '#FFFFFF',
        },
        text: '10 ft',
      },
      {
        tag: 'text',
        attrs: {
          x: '3',
          y: '4.5',
          'text-anchor': 'end',
          'dominant-baseline': 'central',
          'font-size': '15',
          fill: '#B9C6DA',
        },
        text: '100.00 ft²',
      },
      {
        tag: 'text',
        attrs: {
          x: '5',
          y: '6',
          'text-anchor': 'start',
          'dominant-baseline': 'central',
          'font-size': '15',
          fill: '#FFFFFF',
        },
        text: '7 in',
      },
    ]);
  });

  it('draws the 16-unit grid over the whole frame, inner lines only', () => {
    expect(gridOf({ width: 300, height: 200 })).toBe(
      `${Array.from({ length: 18 }, (_, i) => `M${String(16 * (i + 1))} 0V200`).join('')}${Array.from({ length: 12 }, (_, i) => `M0 ${String(16 * (i + 1))}H300`).join('')}`,
    );
    expect(gridOf({ width: 16, height: 16 })).toBe('');
  });

  // spec: blueprint-drawing › [BD24] no namespace literal: the writer takes it from the box
  it('holds no namespace or other URL in its nodes or its source', () => {
    expect(JSON.stringify(nodesOf(PLAN))).not.toMatch(/https?:|w3\.org/);
    expect(readFileSync(fromRoot('apps/web/src/client/draw.ts'), 'utf8')).not.toMatch(
      /https?:|w3\.org/,
    );
  });
});

/** The hex of a row of the token table of `docs/design/direction.md`. */
const swatch = (name: string): string => {
  const direction = readFileSync(fromRoot('docs/design/direction.md'), 'utf8');
  const row = new RegExp(`^\\| ${name} \\| \`(#[0-9A-F]{6})\` \\|`, 'm').exec(direction);
  if (row?.[1] === undefined) throw new Error(`no ${name} row in direction.md`);
  return row[1];
};

describe('the colours of the drawing (blueprint-drawing › [BD18])', () => {
  // spec: blueprint-drawing › [BD18] each constant is its swatch of the direction table
  it('takes white, safety orange and the helper line from the direction table', () => {
    expect(COLOURS).toEqual({
      white: swatch('Sheet white'),
      orange: swatch('Safety orange'),
      helper: swatch('Helper line'),
    });
  });

  // spec: blueprint-drawing › [BD18] text contrast on Blueprint ink
  it.each(['white', 'orange', 'helper'] as const)(
    'puts %s on Blueprint ink at 4.5:1 or more',
    (name) => {
      expect(contrast(COLOURS[name], swatch('Blueprint ink'))).toBeGreaterThanOrEqual(4.5);
    },
  );
});
