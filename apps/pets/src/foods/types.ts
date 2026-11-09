import type { Rational } from '@maestro-calc/core';
import type { Verdict } from '@maestro-calc/pets-core/food-safety';
import type { GuideQuestion, PageSource } from '../guides.ts';

/** One USDA FoodData Central record: the food as served, its energy and the weight of one piece. */
export interface UsdaFood {
  /** The FDC id of the SR Legacy record. */
  readonly fdc: number;
  /** The record's own description. */
  readonly description: string;
  readonly kcalPer100g: number;
  /** Sodium in mg per 100 g, given only where salt is part of the verdict. */
  readonly sodiumPer100g?: number;
}

/** The piece a page counts in, with the USDA measure its weight comes from. */
export interface Piece {
  readonly grams: number;
  readonly one: string;
  readonly many: string;
  /** Where the weight comes from: `USDA: 1 medium (1-1/4 in) = 12 g`. */
  readonly basis: string;
}

/**
 * A line a source draws, worked at each dog weight: an amount of the food per kilogram (or per 10
 * pounds) of the dog's body weight, where the source reports harm or sets a limit.
 */
export interface Threshold {
  /** The table column: `PetMD and AKC: 0.5% of body weight`. */
  readonly label: string;
  /** How the lead names it, after "reaches": `the 0.5% of body weight where PetMD says …`. */
  readonly lead: string;
  /** Grams of the food (or of the compound, see `Food.compound`) per kg of the dog. */
  readonly gramsPerKg?: Rational;
  /** Pieces per 10 lb of the dog, for a source that counts (one grape per 10 lb). */
  readonly piecesPer10Lb?: Rational;
  /** What `piecesPer10Lb` counts, when it is not the food’s piece (teaspoons of avocado). */
  readonly unit?: { readonly one: string; readonly many: string };
}

/** A serving table a veterinary source publishes by dog size, copied as the source gives it. */
export interface SizeGuide {
  readonly by: string;
  readonly note: string;
  readonly rows: readonly (readonly [size: string, amount: string])[];
}

/** One food of the "can dogs eat" pages: the verdict and everything the page says, each part sourced. */
export interface Food {
  /** The slug after `/can-dogs-eat-`. */
  readonly id: string;
  /** Lower case, as a sentence names it: `grapes`, `peanut butter`. */
  readonly name: string;
  /** Other names for the same food (UK and Australian spellings), each with the answer for it. */
  readonly alternates: readonly { readonly name: string; readonly answer: string }[];
  readonly verdict: Verdict;
  /** The answer after the verdict word: `grapes are toxic to dogs`. Short: it is the title. */
  readonly answer: string;
  /** One or two sentences for the hub and the description. */
  readonly summary: string;
  /** Why the verdict, attributed to its sources. */
  readonly why: readonly string[];
  /** How to give it (safe, moderation), or what to do if the dog ate it (avoid, toxic). */
  readonly serve: readonly string[];
  /** The parts and forms never to give. */
  readonly never: readonly string[];
  /** The signs to watch for and when they start, where a source gives them. */
  readonly signs?: readonly string[];
  /** Where the sources disagree. */
  readonly disagree?: readonly string[];
  readonly usda?: UsdaFood;
  readonly piece?: Piece;
  /** The lines of harm or limit the sources give, worked at each weight. */
  readonly thresholds?: readonly Threshold[];
  /** What the thresholds table says first: whose figures they are and what they are not. */
  readonly thresholdNote?: string;
  /**
   * For a threshold of a compound inside the food (xylitol in gum): the grams of it in one piece,
   * as a range a source gives, the most first.
   */
  readonly compound?: { readonly name: string; readonly perPiece: readonly [Rational, Rational] };
  /** A share of the day's calories past which a source calls the food harmful (broccoli). */
  readonly ceiling?: { readonly share: Rational; readonly label: string };
  readonly sizeGuide?: SizeGuide;
  readonly questions: readonly GuideQuestion[];
  /** Route ids of the calculators and pages the food links, besides the hub. */
  readonly links?: readonly string[];
  readonly sources: readonly PageSource[];
}
