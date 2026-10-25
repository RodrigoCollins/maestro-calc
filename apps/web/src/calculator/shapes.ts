/** The shapes, in the order the select offers them. */
export const SHAPES = ['slab', 'footing', 'column', 'steps'] as const;

export type Shape = (typeof SHAPES)[number];

/**
 * The dimension fields each shape shows, in the order of the form (calculator-page › Form
 * controls). The engine reads the same fields (`concrete.ts`); the page shows them by shape.
 */
export const SHAPE_FIELDS = {
  slab: ['length', 'width', 'thickness'],
  footing: ['length', 'footingWidth', 'footingDepth', 'count'],
  column: ['diameter', 'height', 'count'],
  steps: ['stepWidth', 'rise', 'run', 'stepCount'],
} as const satisfies Record<Shape, readonly string[]>;

/**
 * The one order of the dimension inputs in the form: the page holds each input once and shows the
 * ones a shape uses, so each shape's fields appear in this order (a subsequence of it).
 */
export const DIMENSION_ORDER = [
  'length',
  'width',
  'thickness',
  'footingWidth',
  'footingDepth',
  'diameter',
  'height',
  'stepWidth',
  'rise',
  'run',
  'stepCount',
  'count',
] as const;
