import type { CalculatorPageId } from './templates.ts';

/*
 * The guides (guides): Markdown pages of the trust template under `/guides` and `/es/guias`, each
 * tied to the calculator it ends with a link to, or to none (it ends in the home, where every
 * calculator is listed). A guide id is also its `ROUTES` id and its entry in the `pages` collection.
 */

export interface Guide {
  /** The calculator page the guide sends its reader to, or `null` for the home's directory. */
  readonly calculator: CalculatorPageId | null;
}

export const GUIDES = {
  'guide-concrete-bags-or-truck': { calculator: 'concrete' },
  'guide-tape-measure-fractions': { calculator: 'feet-inches' },
  'guide-square-footage': { calculator: 'rectangle-area' },
  'guide-drywall-estimate': { calculator: 'drywall' },
  'guide-roof-pitch': { calculator: 'roof-pitch' },
  'guide-concrete-quote': { calculator: 'concrete' },
  'guide-contractor-license': { calculator: null },
} as const satisfies Record<string, Guide>;

export type GuideId = keyof typeof GUIDES;

/** The guide a page id is, or `undefined` for any other page. */
export const guideOf = (id: string): Guide | undefined => {
  const table: Readonly<Record<string, Guide>> = GUIDES;
  return Object.hasOwn(table, id) ? table[id] : undefined;
};

const isGuideId = (id: string): id is GuideId => Object.hasOwn(GUIDES, id);

/** The guides that end in a calculator page, in table order: the page links back to each. */
export const guidesOf = (calculator: CalculatorPageId): GuideId[] =>
  Object.keys(GUIDES)
    .filter(isGuideId)
    .filter((id) => GUIDES[id].calculator === calculator);
