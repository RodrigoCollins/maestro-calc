import type { MaterialSource } from '@maestro-calc/data';

/*
 * A section a job page adds after its table (AdSense audit 2026-11-08): what only that size can
 * say, worked out by the engine of its calculator or from a cited data sheet, so two pages of one
 * family differ in their figures and not only in their title. The labels are the family's own
 * `site.job.<family>.*` keys; the values are the page's figures.
 */

export interface ExtraFact {
  readonly label: string;
  readonly value: string;
}

export interface ExtraTable {
  readonly columns: readonly string[];
  readonly rows: readonly { readonly label: string; readonly cells: readonly string[] }[];
}

export interface ExtraSection {
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly facts: readonly ExtraFact[];
  readonly table?: ExtraTable | undefined;
  /** A second table after the first, with the paragraph that leads into it and its short name. */
  readonly more?: { readonly lead: string; readonly label: string; readonly table: ExtraTable };
  /** The data sheets the section rests on, each with the day it was read. */
  readonly sources: readonly Required<MaterialSource>[];
}
