/*
 * The live side view of the pool volume page (plans/pool/PLAN.md §5, design v2.1 "depth marker"):
 * the water from wall to wall, the floor from the shallow end down to the deep end, and a depth
 * marker at each wall, as a pool's own markers read ("3½ FT", "8 FT"). Pure and DOM-free: the page
 * renders it for the defaults, the client script redraws it from each valid edit.
 *
 * The drawing is schematic, not to scale: the profile (a flat shallow run, a slope, a flat deep run)
 * keeps the same proportions for every length, and the depths are scaled to the deeper end. A round
 * or oval pool uses the same view: cut along its length, its walls are as straight as a
 * rectangle's, so only the depths change the picture.
 */

import type { Units } from '@maestro-calc/pool-core/units';

/** The viewBox of the drawing, the same in every state, so the box never moves. */
export const SIDE_VIEW = { width: 330, height: 170 } as const;

const LEFT = 8;
const RIGHT = 322;
/** The top of the walls (the coping) and the waterline. */
const COPING = 26;
const WATERLINE = 34;
/** Where the shallow run ends and where the slope reaches the deep run. */
const BREAK = 190;
const TOE = 250;
/** The depth of the deeper end, and the least depth drawn, which still holds a marker. */
const FULL = 116;
const LEAST = 30;
/** The marker boxes: their inset from the wall, and the width of a character of their text. */
const INSET = 6;
const PAD = 10;
const CHAR = 7;

/** One depth marker: its box (left edge and width) and the centre of its text. */
export interface Marker {
  readonly x: number;
  readonly width: number;
  readonly center: number;
  readonly text: string;
}

/** What the page draws: the water, the walls and floor, the length, the two markers, the name. */
export interface SideView {
  readonly water: string;
  readonly wall: string;
  readonly length: string;
  readonly markers: readonly [Marker, Marker];
  readonly name: string;
}

/** Inches in a metre: 5000 / 127, the exact international inch. */
const INCHES_PER_METRE = 5000 / 127;

/**
 * A length in inches as a depth marker reads it, to the nearest inch: `8 FT`, `3½ FT`,
 * `3 FT 7 IN`; in metric to the centimetre, as an Australian marker reads it: `1.07 M`, `2 M`.
 */
export const depthText = (inches: number, units: Units = 'us'): string => {
  if (units === 'metric') {
    return `${String(Math.round((inches / INCHES_PER_METRE) * 100) / 100)} M`;
  }
  const total = Math.round(inches);
  const feet = Math.floor(total / 12);
  const rest = total % 12;
  if (rest === 0) return `${String(feet)} FT`;
  if (rest === 6) return `${feet === 0 ? '' : String(feet)}½ FT`;
  return feet === 0 ? `${String(rest)} IN` : `${String(feet)} FT ${String(rest)} IN`;
};

const tenth = (value: number): number => Math.round(value * 10) / 10;

/** The floor under the waterline for a depth, scaled to the deeper end. */
const floorOf = (depth: number, deepest: number): number =>
  tenth(WATERLINE + Math.max(LEAST, deepest > 0 ? (depth / deepest) * FULL : 0));

const markerAt = (text: string, side: 'left' | 'right'): Marker => {
  const width = PAD + CHAR * text.length;
  const x = side === 'left' ? LEFT + INSET : RIGHT - INSET - width;
  return { x, width, center: x + width / 2, text };
};

/** The side view of a pool of `length`, `shallow` and `deep`, all in inches, named in `lang`. */
export const sideViewOf = (
  {
    length,
    shallow,
    deep,
  }: {
    readonly length: number;
    readonly shallow: number;
    readonly deep: number;
  },
  lang: 'en' | 'es' = 'en',
  units: Units = 'us',
): SideView => {
  const deepest = Math.max(shallow, deep);
  const left = String(floorOf(shallow, deepest));
  const right = String(floorOf(deep, deepest));
  const floor = `V${left}H${String(BREAK)}L${String(TOE)} ${right}H${String(RIGHT)}`;
  const [long, low, high] = [length, shallow, deep].map((inches) => depthText(inches, units));
  const texts = [long, low, high].map((text) => text?.toLowerCase());
  return {
    water: `M${String(LEFT)} ${String(WATERLINE)}${floor}V${String(WATERLINE)}Z`,
    wall: `M${String(LEFT)} ${String(COPING)}${floor}V${String(COPING)}`,
    length: long ?? '',
    markers: [markerAt(low ?? '', 'left'), markerAt(high ?? '', 'right')],
    name:
      lang === 'en'
        ? `Side view of the pool, not to scale: ${texts[0] ?? ''} long, ${texts[1] ?? ''} deep at the shallow end and ${texts[2] ?? ''} at the deep end`
        : `Vista lateral de la piscina, sin escala: ${texts[0] ?? ''} de largo, ${texts[1] ?? ''} de profundidad en la parte baja y ${texts[2] ?? ''} en la parte honda`,
  };
};
