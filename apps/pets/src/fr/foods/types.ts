import type { GuideQuestion, PageSource } from '../../guides.ts';

/**
 * One food of the French "Mon chien peut-il manger … ?" pages, written in French (vous) for a French
 * reader. The verdict, the USDA record, the piece weight and every threshold come from the English
 * food of the same `id` (`src/foods`), so the facts cannot drift apart: this record holds the words
 * only.
 */
export interface FoodFr {
  /** The id of the English food (`src/foods`). */
  readonly id: string;
  /** The food as a list and a table column name it, capitalized: `Raisin`, `Fromage`, `Fraises`. */
  readonly name: string;
  /**
   * The food with its partitive article, as the question asks it: `des fraises`, `du raisin`,
   * `de la banane`, `de l’ananas`. The pages derive `de fraises` (after an amount) from it.
   */
  readonly some: string;
  /** The answer after the verdict word, a full clause: `le raisin est toxique pour les chiens`. */
  readonly answer: string;
  /** The answer cut short for the title: `Non, toxique`. */
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
   * The piece the page counts in, in French. Its weight is the English food's USDA weight unless
   * `grams` names a unit a French reader buys by (a 100 g bar of chocolate instead of an ounce).
   */
  readonly piece?: {
    /** The piece with its indefinite article, as a sentence starts it: `une fraise moyenne`. */
    readonly a: string;
    readonly one: string;
    readonly many: string;
    readonly grams?: number;
    /** Where the weight comes from, in French: `USDA : 10 grains de raisin = 49 g`. */
    readonly basis: string;
  };
  /**
   * The USDA record's description in French as it follows `100 g`, with its `de`: `de fraises
   * crues`. Without it the page writes `100 g` and `some` with `de`.
   */
  readonly usdaName?: string;
  /** The French words of each threshold of the English food, in the same order. */
  readonly thresholds?: readonly {
    readonly label: string;
    /** The threshold as the lead names it after `Pour un chien de 10 kg,`: `le seuil de Merck`. */
    readonly lead: string;
    /** The French words of the threshold's own unit (teaspoons of avocado), when it has one. */
    readonly unit?: { readonly one: string; readonly many: string };
  }[];
  readonly thresholdNote?: string;
  /** The French name of the compound a threshold counts (xylitol), when the food has one. */
  readonly compound?: string;
  /** The French column label of the English food's ceiling (broccoli), when it has one. */
  readonly ceiling?: string;
  /** The English food's serving table by size, its rows in kilograms and French words. */
  readonly sizeGuide?: {
    readonly note: string;
    readonly rows: readonly (readonly [size: string, amount: string])[];
  };
  readonly questions: readonly GuideQuestion[];
  /**
   * The sources cited beside the English food's own: the French-language ones (`SOURCES_FR`) and,
   * where the text keeps a fact only a German-language source gives, that source (`SOURCES_DE`).
   */
  readonly sources: readonly PageSource[];
}
