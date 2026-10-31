import type { CalculatorPageId } from './templates.ts';

/*
 * The guides (guides): Markdown pages of the trust template under `/guides` and `/es/guias`, each
 * tied to the calculator it ends with a link to. A guide id is also its `ROUTES` id and its entry
 * in the `pages` collection.
 */

export interface Guide {
  /** The calculator page the guide sends its reader to. */
  readonly calculator: CalculatorPageId;
}

export const GUIDES = {
  'guide-concrete-bags-or-truck': { calculator: 'concrete' },
} as const satisfies Record<string, Guide>;

export type GuideId = keyof typeof GUIDES;

/** The guide a page id is, or `undefined` for any other page. */
export const guideOf = (id: string): Guide | undefined => {
  const table: Readonly<Record<string, Guide>> = GUIDES;
  return Object.hasOwn(table, id) ? table[id] : undefined;
};
