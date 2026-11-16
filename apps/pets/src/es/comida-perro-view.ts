import type { Rational } from '@maestro-calc/core';
import { bowlSvg, kibbleCount } from '../bowl.ts';
import { cupsText, quarterCups } from '../format.ts';
import { figureOf, type Patch, type Raw, type View } from '../calc/view.ts';
import { amountEs } from './format.ts';

/**
 * The words of the amount per label basis, Spanish: the unit of the large figure (singular for a
 * cup or a can or less), and the word after the exact figure.
 */
const BASIS_ES = {
  cup: { one: 'taza al día', many: 'tazas al día', short: 'tazas', exact: 'tazas exactas' },
  kg: { one: 'gramos al día', many: 'gramos al día', short: 'g', exact: 'g exactos' },
  can: { one: 'lata al día', many: 'latas al día', short: 'latas', exact: 'latas exactas' },
} as const;

type Basis = keyof typeof BASIS_ES;

const basisOf = (raw: Raw): Basis => {
  const basis = raw['basis'];
  return basis === 'kg' || basis === 'can' ? basis : 'cup';
};

/** The amount as the page writes it: grams to the gram, cups and cans to the quarter. */
const figureText = (basis: Basis, portion: Rational): string =>
  basis === 'kg' ? amountEs(portion, 0) : cupsText(quarterCups(portion.toNumber()));

/** The result of the Spanish dog food calculator: the same figures as the English one. */
export const dogViewEs: View = (figures, raw): Patch => {
  const basis = basisOf(raw);
  const words = BASIS_ES[basis];
  const portion = figureOf(figures, 'portion');
  const figure = figureText(basis, portion);
  const mer = figureOf(figures, 'mer');
  // a cup, a can or less is singular in Spanish: `1 taza`, `½ taza`
  const one = basis !== 'kg' && portion.toNumber() < 1.125;
  return {
    text: {
      figure,
      unit: one ? words.one : words.many,
      exact: `${amountEs(portion, basis === 'kg' ? 1 : 2)} ${words.exact}`,
      kcal: amountEs(mer, 0),
      treats: amountEs(figureOf(figures, 'treats'), 0),
      range: `${amountEs(figureOf(figures, 'low'), 0)} a ${amountEs(figureOf(figures, 'high'), 0)}`,
      withTreats: `${figureText(basis, figureOf(figures, 'portionWithTreats'))} ${words.short}`,
    },
    html: { bowl: bowlSvg(kibbleCount(mer.toNumber())) },
    show: {},
    vars: {},
    flags: {},
  };
};
