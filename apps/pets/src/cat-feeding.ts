import { Rational } from '@maestro-calc/core';
import { catFood } from '@maestro-calc/pets-core/cat-food';
import { amountText, kcalText } from './format.ts';
import type { PageSource } from './guides.ts';

/** The calorie lines the cat food calculator starts from, and so the cat feeding pages assume. */
export const CAT_DRY_KCAL = '350';
export const CAT_WET_KCAL = '80';

/** The cat pages' review day: the day their figures were last run against the sources. */
export const CAT_FEEDING_CHECKED = '2026-11-10';

/** The sources of the cat feeding pages, each read on `CAT_FEEDING_CHECKED`. */
export const CAT_FEEDING_SOURCES = {
  merck: {
    name: 'Merck Veterinary Manual, Nutritional Requirements of Small Animals (Sanderson, reviewed November 2023)',
    url: 'https://www.merckvetmanual.com/management-and-nutrition/nutrition-small-animals/nutritional-requirements-and-related-diseases-of-small-animals',
  },
  merckTable: {
    name: 'Merck Veterinary Manual, Daily maintenance energy requirements for dogs and cats',
    url: 'https://www.merckvetmanual.com/multimedia/table/daily-maintenance-energy-requirements-for-dogs-and-cats',
  },
  aaha: {
    name: '2021 AAHA Nutrition and Weight Management Guidelines, Box 1: Energy Requirement Calculations',
    url: 'https://www.aaha.org/wp-content/uploads/globalassets/02-guidelines/2021-nutrition-and-weight-management/resourcepdfs/nutritiongl_box1.pdf',
  },
  wsava: {
    name: 'WSAVA Global Nutrition Committee, Calorie Needs for an Average Healthy Adult Cat in Ideal Body Condition (updated July 2020)',
    url: 'https://wsava.org/wp-content/uploads/2020/07/Calorie-Needs-for-Healthy-Adult-Cats-updated-July-2020.pdf',
  },
} as const satisfies Record<string, PageSource>;

/** One cat, as the cat food calculator takes it. */
export interface CatFeeding {
  readonly status: 'neutered' | 'intact' | 'inactive' | 'weight-loss' | 'kitten';
  /** The weight in pounds. */
  readonly weight: number;
  /** The share of the calories that comes from wet food, 0 to 100. */
  readonly wetShare?: number;
}

/** One output of the cat food engine for `cat`: build-time data, so a run that fails throws. */
export const catFigure = (cat: CatFeeding, key: string): Rational => {
  const ran = catFood.run({
    weight: String(cat.weight),
    unit: 'lb',
    status: cat.status,
    dryKcal: CAT_DRY_KCAL,
    wetKcal: CAT_WET_KCAL,
    wetShare: String(cat.wetShare ?? 0),
  });
  if (!ran.ok) throw new Error('a cat feeding row did not run');
  const value = ran.value.outputs.find((output) => output.key === key)?.value;
  if (!(value instanceof Rational)) throw new Error(`no output ${key}`);
  return value;
};

/** Calories a day of `cat`, rounded to a whole kilocalorie. */
export const catKcal = (cat: CatFeeding): string => kcalText(catFigure(cat, 'mer'));

/** An amount of the engine (cups or cans) to two places. */
export const catAmount = (cat: CatFeeding, key: string): string =>
  amountText(catFigure(cat, key), 2);

/** The weights of the cat feeding chart: 4 to 20 lb in steps of 1. */
export const CAT_WEIGHTS: readonly number[] = Array.from({ length: 17 }, (_, index) => index + 4);

/** A row of the cat feeding chart: a neutered adult on dry food, on wet food, and on half of each. */
export const catChartRow = (weight: number): string[] => {
  const dry = { status: 'neutered', weight } as const;
  const wet = { ...dry, wetShare: 100 };
  const half = { ...dry, wetShare: 50 };
  return [
    String(weight),
    catKcal(dry),
    catAmount(dry, 'cups'),
    catAmount(wet, 'cans'),
    catAmount(half, 'cups'),
    catAmount(half, 'cans'),
  ];
};

/** The kitten weights of the growth guide, in pounds. */
export const KITTEN_WEIGHTS: readonly number[] = [2, 3, 4, 5, 6, 7, 8];

/** A row of the growth guide: a kitten’s calories and a neutered adult’s at the same weight. */
export const kittenRow = (weight: number): string[] => [
  String(weight),
  catKcal({ status: 'kitten', weight }),
  catKcal({ status: 'neutered', weight }),
];
