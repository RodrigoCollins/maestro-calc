import type { GuideQuestion, PageSource } from '../../guides.ts';

/**
 * One food of the German "Dürfen Hunde … essen?" pages, written in German for a German reader.
 * The verdict, the USDA record, the piece weight and every threshold come from the English food of
 * the same `id` (`src/foods`), so the facts cannot drift apart: this record holds the words only.
 */
export interface FoodDe {
  /** The id of the English food (`src/foods`). */
  readonly id: string;
  /** The food as the question names it: `Weintrauben`, `Käse`, `Paprika`. */
  readonly name: string;
  /** The answer after the verdict word, a full clause: `Weintrauben sind für Hunde giftig`. */
  readonly answer: string;
  /** The answer cut short for the title: `Nein, giftig`. */
  readonly short: string;
  /** One or two sentences for the hub and the description. */
  readonly summary: string;
  /** Why the verdict, attributed to its sources. */
  readonly why: readonly string[];
  /** How to give it (safe, moderation), or what to do if the dog ate it (avoid, toxic). */
  readonly serve: readonly string[];
  /** The parts and forms never to give. */
  readonly never: readonly string[];
  readonly signs?: readonly string[];
  readonly disagree?: readonly string[];
  /**
   * The piece the page counts in, in German. Its weight is the English food's USDA weight unless
   * `grams` names a unit a German reader buys by (a 100 g bar of chocolate instead of an ounce).
   */
  readonly piece?: {
    /** The piece with its indefinite article, as a sentence starts it: `eine mittelgroße Erdbeere`. */
    readonly a: string;
    readonly one: string;
    readonly many: string;
    readonly grams?: number;
    /** Where the weight comes from, in German: `USDA: 10 Weintrauben = 49 g`. */
    readonly basis: string;
  };
  /** The USDA record's description in German, for the sentence that cites it. */
  readonly usdaName?: string;
  /** The German words of each threshold of the English food, in the same order. */
  readonly thresholds?: readonly {
    readonly label: string;
    readonly lead: string;
    /** The German words of the threshold's own unit (teaspoons of avocado), when it has one. */
    readonly unit?: { readonly one: string; readonly many: string };
  }[];
  readonly thresholdNote?: string;
  /** The German name of the compound a threshold counts (xylitol), when the food has one. */
  readonly compound?: string;
  /** The German column label of the English food's ceiling (broccoli), when it has one. */
  readonly ceiling?: string;
  /** The English food's serving table by size, its rows in kilograms and German words. */
  readonly sizeGuide?: {
    readonly note: string;
    readonly rows: readonly (readonly [size: string, amount: string])[];
  };
  readonly questions: readonly GuideQuestion[];
  /** German-language sources, cited beside the English food's own. */
  readonly sources: readonly PageSource[];
}
