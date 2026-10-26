import { DIMENSION_ORDER, SHAPE_FIELDS, SHAPES, type Shape } from './shapes.ts';

/** The fields shown after the shape fields, whatever the shape (calculator-page › Form controls). */
export const ALWAYS_VISIBLE = ['waste', 'bag', 'bagPrice', 'readyMixPrice'] as const;

/** Every text input of the form: the twelve dimensions, the waste and the two prices. */
export const TEXT_KEYS = [...DIMENSION_ORDER, 'waste', 'bagPrice', 'readyMixPrice'] as const;

export type TextKey = (typeof TEXT_KEYS)[number];

/** The rows the shape area reserves: those of the tallest shape, so no shape shifts the page. */
export const RESERVED_ROWS = Math.max(...SHAPES.map((shape) => SHAPE_FIELDS[shape].length));

/** What a shape shows: its fields in order, the fields every shape shows, and the reserved rows. */
export const layoutOf = (shape: Shape) => ({
  fields: SHAPE_FIELDS[shape],
  tail: ALWAYS_VISIBLE,
  rows: RESERVED_ROWS,
});

/** The ids that tie a field to its parts, shared by the markup and the script. */
export const inputId = (key: string): string => `calc-${key}`;
export const hintId = (key: string): string => `${inputId(key)}-hint`;
export const helpId = (key: string): string => `${inputId(key)}-help`;
export const errorId = (key: string): string => `${inputId(key)}-error`;
