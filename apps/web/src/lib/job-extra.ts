import type { MaterialSource } from '@maestro-calc/data';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import type { SiteText } from './site-text.ts';

type SiteKey = keyof typeof enSite;

const isSiteKey = (key: string): key is SiteKey => Object.hasOwn(enSite, key);

/** Fragment `index` of the sentence `base`, a key the catalog must hold. */
const fragment = (text: SiteText, base: string, index: number): string => {
  const key = `${base}.${String(index)}`;
  if (!isSiteKey(key)) throw new Error(`no sentence fragment ${key}`);
  return text(key);
};

/**
 * A sentence of the page's own figures: the site catalog holds no placeholders, so the sentence is
 * kept as its fragments `<base>.0` … `<base>.<n>` and each value goes between two of them, with no
 * space before a fragment that opens with punctuation.
 */
export const sentence = (
  text: SiteText,
  base: string,
  values: readonly (string | number | bigint)[],
): string =>
  values.reduce<string>(
    (out, value, index) => {
      const next = fragment(text, base, index + 1);
      return `${out} ${String(value)}${/^[,.;:/)]/.test(next) ? '' : ' '}${next}`;
    },
    fragment(text, base, 0),
  );

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
