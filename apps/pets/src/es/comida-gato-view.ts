import type { Rational } from '@maestro-calc/core';
import { bowlSvg, kibbleCount } from '../bowl.ts';
import { cupsText, quarterCups } from '../format.ts';
import { figureOf, type Patch, type View } from '../calc/view.ts';
import { amountEs } from './format.ts';

/** A cup, a can or less is singular in Spanish: `1 taza`, `¾ taza`, `1 lata`. */
const isOne = (amount: Rational): boolean => amount.toNumber() < 1.125;

/**
 * The result of the Spanish cat food calculator, the same figures as the English one: the dry food
 * in grams for a label per kilogram (or in cups for a label per cup), the wet food in cans or
 * pouches, both with a decimal comma.
 */
export const catViewEs: View = (figures): Patch => {
  const mer = figureOf(figures, 'mer');
  const cups = figureOf(figures, 'cups');
  const grams = figureOf(figures, 'grams');
  const cans = figureOf(figures, 'cans');
  const byGrams = grams.sign() === 1;
  return {
    text: {
      figure: byGrams ? amountEs(grams, 0) : cupsText(quarterCups(cups.toNumber())),
      unit: byGrams
        ? 'gramos de alimento seco al día'
        : `${isOne(cups) ? 'taza' : 'tazas'} de alimento seco al día`,
      exact: byGrams ? `${amountEs(grams, 1)} g exactos` : `${amountEs(cups, 2)} tazas exactas`,
      canFigure: cupsText(quarterCups(cans.toNumber())),
      canUnit: `${isOne(cans) ? 'lata o sobre' : 'latas o sobres'} de comida húmeda al día`,
      canExact: `${amountEs(cans, 2)} exactamente`,
      kcal: amountEs(mer, 0),
      treats: amountEs(figureOf(figures, 'treats'), 0),
      range: `${amountEs(figureOf(figures, 'low'), 0)} a ${amountEs(figureOf(figures, 'high'), 0)}`,
    },
    html: { bowl: bowlSvg(kibbleCount(mer.toNumber())) },
    // the dry figure shows while any calories come from dry food, the wet one while any come from cans
    show: { dry: cups.sign() === 1 || byGrams, wet: cans.sign() === 1 },
    vars: {},
    flags: {},
  };
};
