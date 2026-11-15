import type { GuideQuestion, PageSource } from '../../guides.ts';

/**
 * One food of the Spanish "¿Los perros pueden comer …?" pages, written in neutral Spanish (tú) for
 * a reader in Mexico, Spain or South America. The verdict, the USDA record, the piece weight and
 * every threshold come from the English food of the same `id` (`src/foods`), so the facts cannot
 * drift apart: this record holds the words only.
 */
export interface FoodEs {
  /** The id of the English food (`src/foods`). */
  readonly id: string;
  /**
   * The food as a list and a table column name it, capitalized, with the other regional name in
   * parentheses where the countries differ: `Fresas`, `Papa (patata)`.
   */
  readonly name: string;
  /**
   * The food as the question asks it, lower case, with no article: `fresas`, `plátano`, `uvas`.
   * The pages write `de fresas` after an amount and `¿Los perros pueden comer fresas?` from it.
   */
  readonly food: string;
  /** The answer after the verdict word, a full clause: `las uvas son tóxicas para los perros`. */
  readonly answer: string;
  /** The answer cut short for the title: `No, son tóxicas`, `Sí, con moderación`. */
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
   * The piece the page counts in, in Spanish. Its weight is the English food's USDA weight unless
   * `grams` names a unit a Spanish-speaking reader buys by (a 100 g bar of chocolate).
   */
  readonly piece?: {
    /** The piece with its indefinite article, as a sentence starts it: `una fresa mediana`. */
    readonly a: string;
    readonly one: string;
    readonly many: string;
    readonly grams?: number;
    /** Where the weight comes from, in Spanish: `USDA: 10 uvas = 49 g`. */
    readonly basis: string;
  };
  /**
   * The USDA record's description in Spanish as it follows `100 g`, with its `de`: `de fresas
   * crudas`. Without it the page writes `100 g de` and `food`.
   */
  readonly usdaName?: string;
  /** The Spanish words of each threshold of the English food, in the same order. */
  readonly thresholds?: readonly {
    readonly label: string;
    /** The threshold as the lead names it after `Para un perro de 10 kg,`: `el límite de Merck`. */
    readonly lead: string;
    /** The Spanish words of the threshold's own unit (teaspoons of avocado), when it has one. */
    readonly unit?: { readonly one: string; readonly many: string };
  }[];
  readonly thresholdNote?: string;
  /** The Spanish name of the compound a threshold counts (xilitol), when the food has one. */
  readonly compound?: string;
  /** The Spanish column label of the English food's ceiling (broccoli), when it has one. */
  readonly ceiling?: string;
  /** The English food's serving table by size, its rows in kilograms and Spanish words. */
  readonly sizeGuide?: {
    readonly note: string;
    readonly rows: readonly (readonly [size: string, amount: string])[];
  };
  readonly questions: readonly GuideQuestion[];
  /**
   * The sources cited beside the English food's own: the Spanish-language ones (`SOURCES_ES`) and,
   * where the text keeps a fact only a German-language source gives, that source (`SOURCES_DE`).
   */
  readonly sources: readonly PageSource[];
}
