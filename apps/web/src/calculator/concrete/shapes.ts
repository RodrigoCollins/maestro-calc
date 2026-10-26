/** The shapes, in the order the select offers them. */
export const SHAPES = ['slab', 'footing', 'column', 'steps'] as const;

export type Shape = (typeof SHAPES)[number];

/**
 * The dimension fields each shape shows, in the order of the form (calculator-page › Form
 * controls). The engine reads the same fields (`concrete.ts`); the page shows them by shape. The
 * form holds each input once, in the definition's order (`form-layout.ts`), so each shape's fields
 * are a subsequence of that order.
 */
export const SHAPE_FIELDS = {
  slab: ['length', 'width', 'thickness'],
  footing: ['length', 'footingWidth', 'footingDepth', 'count'],
  column: ['diameter', 'height', 'count'],
  steps: ['stepWidth', 'rise', 'run', 'stepCount'],
} as const satisfies Record<Shape, readonly string[]>;
