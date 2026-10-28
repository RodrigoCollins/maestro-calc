import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import ConcreteScript from '../islands/ConcreteScript.astro';
import type { CalculatorPageId } from '../routing/templates.ts';

/**
 * The one script component of each calculator page (design C10, K7). A calculator page without a
 * row here is a type error, and the `pages` test checks that the keys are the page ids.
 */
export const SCRIPTS = {
  // typescript-eslint cannot type a `.astro` import (`astro check` does, in `npm run typecheck`)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  concrete: ConcreteScript,
} as const satisfies Record<CalculatorPageId, AstroComponentFactory>;

/** `rectangle-area` as `RectangleArea`: the name of the island file `<Id>Script.astro`. */
export const pascalOf = (id: string): string =>
  id
    .split('-')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('');
